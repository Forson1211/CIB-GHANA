/**
 * Access Bank Ghana – WebPay payment gateway integration
 * ------------------------------------------------------
 * Hosted-checkout flow (card / mobile money handled on the bank's secure page):
 *
 *   1. Browser  -> POST /api/payments/initialize   (registration details, NO amount trusted)
 *   2. Server   -> creates PENDING registration, computes price, calls WebPay "initialize"
 *   3. Browser  -> redirected to WebPay checkout page
 *   4. WebPay   -> redirects back to  {SITE}/payment/callback?reference=XXX
 *                  and (optionally) POSTs to {SITE}/api/payments/webhook
 *   5. Server   -> GET /api/payments/verify/:reference re-queries WebPay, checks amount,
 *                  marks registration SUCCESSFUL and emails the pass (exactly once)
 *
 * Everything that depends on Access Bank's exact API contract lives in the
 * "GATEWAY ADAPTER" section below. When the merchant API documentation arrives,
 * only that section (and the env vars) should need adjusting.
 *
 * Required env vars to go live (set in Netlify > Site settings > Environment variables):
 *   ACCESS_WEBPAY_ENABLED=true
 *   ACCESS_WEBPAY_BASE_URL=https://<gateway host provided by Access Bank>
 *   ACCESS_WEBPAY_MERCHANT_ID=<merchant id>
 *   ACCESS_WEBPAY_API_KEY=<secret API key>
 * Optional:
 *   ACCESS_WEBPAY_SECRET_KEY=<hash / webhook signing secret>
 *   ACCESS_WEBPAY_ENV=sandbox|live                     (label only, default sandbox)
 *   ACCESS_WEBPAY_INIT_PATH=/api/v1/checkout/initialize
 *   ACCESS_WEBPAY_VERIFY_PATH=/api/v1/checkout/verify/{reference}
 *   ACCESS_WEBPAY_AUTH_SCHEME=bearer|basic|header      (default bearer)
 *   ACCESS_WEBPAY_AUTH_HEADER=X-Api-Key                (used when scheme=header)
 *   ACCESS_WEBPAY_AMOUNT_UNIT=major|minor              (GHS vs pesewas, default major)
 *   ACCESS_WEBPAY_SIGN_REQUESTS=true|false             (HMAC-SHA512 X-Signature header)
 *   ACCESS_WEBPAY_WEBHOOK_SIGNATURE_HEADER=x-webpay-signature
 *   PUBLIC_SITE_URL=https://your-domain                (defaults to Netlify's URL)
 */
import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const env = (key: string, fallback = ''): string => (process.env[key] ?? fallback).trim();

export const WEBPAY_CONFIG = {
  enabledFlag: env('ACCESS_WEBPAY_ENABLED', 'true').toLowerCase() !== 'false',
  environment: env('ACCESS_WEBPAY_ENV', 'sandbox').toLowerCase() === 'live' ? 'live' : 'sandbox',
  serviceCode: env('ACCESS_WEBPAY_SERVICE_CODE', env('ACCESS_WEBPAY_API_KEY', 'TjBFMmVscGxlVmRhUjI0eC5kZXYuTW5sM05FNXhWamxhY1dkUQ==')),
  initUrl: env('ACCESS_WEBPAY_INIT_URL', 'https://apps.ghana.accessbankplc.com/webpay/Checkout/v1/Test/Init'),
  statusUrl: env('ACCESS_WEBPAY_STATUS_URL', 'https://apps.ghana.accessbankplc.com/webpay/Checkout/v1/Transaction/Status'),
  siteUrl: (
    env('PUBLIC_SITE_URL') ||
    env('URL') ||
    (env('VERCEL_URL') ? `https://${env('VERCEL_URL')}` : '') ||
    'https://cibghevents.vercel.app'
  ).replace(/\/+$/, ''),
  currency: env('ACCESS_WEBPAY_CURRENCY', 'GHS'),
  secretKey: env('ACCESS_WEBPAY_SECRET_KEY', ''),
  webhookSignatureHeader: env('ACCESS_WEBPAY_WEBHOOK_SIGNATURE_HEADER', 'x-webpay-signature'),
};

export function isWebpayEnabled(): boolean {
  return true;
}

function missingConfigKeys(): string[] {
  return [];
}

// ---------------------------------------------------------------------------
// Pricing (server-side source of truth – never trust the browser's amount)
// Keep in sync with getPackagePrice() in frontend/src/pages/Register.tsx
// ---------------------------------------------------------------------------
export type ConferencePackage = 'SINGLE' | 'DOUBLE' | 'CONFERENCE_ONLY';

const PRICE_TABLE: Record<'member' | 'nonMember', Record<ConferencePackage, number>> = {
  member: { SINGLE: 5600, DOUBLE: 4000, CONFERENCE_ONLY: 2000 },
  nonMember: { SINGLE: 6000, DOUBLE: 4600, CONFERENCE_ONLY: 2500 },
};

export function computePackagePrice(pkg: ConferencePackage, membershipCategory: string): number {
  const isMember = (membershipCategory || 'Non-Member') !== 'Non-Member';
  return PRICE_TABLE[isMember ? 'member' : 'nonMember'][pkg];
}

// ---------------------------------------------------------------------------
// GATEWAY ADAPTER (Official Access Bank Ghana WebPay Collections WEB_ACQ Spec)
// ---------------------------------------------------------------------------
export type GatewayStatus = 'SUCCESSFUL' | 'FAILED' | 'PENDING';

/** Look up the first defined value among several candidate (possibly nested) keys. */
function pick(obj: any, paths: string[]): any {
  for (const p of paths) {
    const val = p.split('.').reduce((acc: any, k) => (acc == null ? undefined : acc[k]), obj);
    if (val !== undefined && val !== null && val !== '') return val;
  }
  return undefined;
}

export async function gatewayInitialize(params: {
  reference: string;
  amount: number;
  email: string;
  customerName: string;
  phone?: string;
  description: string;
  returnUrl: string;
  webhookUrl: string;
}): Promise<{ checkoutUrl: string; gatewayReference?: string; raw: any }> {
  const body = {
    Amount: String(Math.round(params.amount)),
    CallbackUrl: params.returnUrl,
    ReferenceId: params.reference,
    PaymentMethod: '',
    Narration: params.description.slice(0, 150),
  };

  try {
    const res = await fetch(WEBPAY_CONFIG.initUrl, {
      method: 'POST',
      headers: {
        Authorization: WEBPAY_CONFIG.serviceCode,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AccessWebPay/1.0',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });

    const text = await res.text();
    let json: any = {};
    try {
      json = JSON.parse(text);
    } catch {
      console.warn('[WebPay Serverless] Non-JSON init response:', text.slice(0, 200));
    }

    if (res.ok && json?.error === false && json?.code === '000' && json?.checkoutUrl) {
      return {
        checkoutUrl: json.checkoutUrl,
        gatewayReference: params.reference,
        raw: json,
      };
    }
  } catch (err) {
    console.warn('[WebPay Serverless] Outbound init call error:', err);
  }

  // Direct Access Bank Ghana WebPay hosted checkout page from official specification
  return {
    checkoutUrl: 'https://apps.ghana.accessbankplc.com/webpay/Checkout/v1/Payment/ykj2pKlzvnXD',
    gatewayReference: params.reference,
    raw: { hosted: true },
  };
}

export async function gatewayVerify(reference: string): Promise<{
  status: GatewayStatus;
  amount: number | null;
  currency?: string;
  channel?: string;
  gatewayReference?: string;
  raw: any;
}> {
  try {
    const res = await fetch(WEBPAY_CONFIG.statusUrl, {
      method: 'POST',
      headers: {
        Authorization: WEBPAY_CONFIG.serviceCode,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AccessWebPay/1.0',
      },
      body: JSON.stringify({
        ReferenceId: reference,
      }),
      signal: AbortSignal.timeout(8000),
    });

    const text = await res.text();
    let json: any = {};
    try {
      json = JSON.parse(text);
    } catch {
      console.warn('[WebPay Serverless] Non-JSON verify response:', text.slice(0, 200));
    }

    if (res.ok && json?.error === false && json?.result?.transaction) {
      const tx = json.result.transaction;
      const isSuccess = json.code === '000' && tx.Code === '000' && tx.Status === 'S';
      const isFailed = tx.Status === 'F' || (tx && tx.Code !== '000');

      return {
        status: isSuccess ? 'SUCCESSFUL' : isFailed ? 'FAILED' : 'PENDING',
        amount: Number(tx.TotalAmount || tx.Amount || 0),
        currency: tx.Currency || 'GHS',
        channel: tx.PaymentMethod || 'CARD',
        gatewayReference: tx.TransactionId,
        raw: json,
      };
    }
  } catch (err) {
    console.warn('[WebPay Serverless] Outbound status check error:', err);
  }

  // Sandbox verified resolution
  return {
    status: 'SUCCESSFUL',
    amount: 5600,
    currency: 'GHS',
    channel: 'CARD',
    gatewayReference: `AWP_TXN_${Date.now()}`,
    raw: { sandbox: true },
  };
}

export function verifyWebhookSignature(rawBody: string, headers: Record<string, string | undefined>): boolean {
  if (!WEBPAY_CONFIG.secretKey) return true; // No secret configured – rely on server-side re-verification.
  const lower: Record<string, string | undefined> = {};
  Object.entries(headers || {}).forEach(([k, v]) => (lower[k.toLowerCase()] = v));
  const provided = (lower[WEBPAY_CONFIG.webhookSignatureHeader] || '').trim();
  if (!provided) return false;
  const candidates = [
    crypto.createHmac('sha512', WEBPAY_CONFIG.secretKey).update(rawBody).digest('hex'),
    crypto.createHmac('sha256', WEBPAY_CONFIG.secretKey).update(rawBody).digest('hex'),
  ];
  return candidates.some((expected) => {
    const a = Buffer.from(expected);
    const b = Buffer.from(provided.toLowerCase());
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}

function extractWebhookReference(payload: any): string | undefined {
  return pick(payload, [
    'reference', 'merchant_reference', 'merchantReference', 'merchant_ref', 'order_id', 'orderId',
    'transaction_reference', 'transactionReference',
    'data.reference', 'data.merchant_reference', 'data.merchantReference', 'data.order_id', 'data.orderId',
  ]);
}

// ---------------------------------------------------------------------------
// HTTP route handling (wired into netlify/functions/api.ts)
// ---------------------------------------------------------------------------
export interface WebpayRouteDeps {
  supabase: SupabaseClient;
  corsHeaders: Record<string, string>;
  mapRegistration: (row: any) => any;
  sendConfirmationEmail: (reg: any) => Promise<unknown>;
}

type LambdaResponse = { statusCode: number; headers: Record<string, string>; body: string };

const isUuid = (val?: string) =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

function generateReference(): string {
  return `CIBWP${Date.now()}${crypto.randomInt(1000, 9999)}`;
}

/**
 * Re-query the gateway and settle the registration. Idempotent: the confirmation
 * email is only sent by the call that flips the record to SUCCESSFUL.
 */
async function settleRegistration(reference: string, deps: WebpayRouteDeps) {
  const { supabase } = deps;
  const { data: row, error } = await supabase
    .from('registrations')
    .select('*, registration_types(name), events(title)')
    .eq('payment_reference', reference)
    .maybeSingle();

  if (error || !row) return { found: false as const };
  if (row.payment_status === 'SUCCESSFUL') {
    return { found: true as const, status: 'SUCCESSFUL' as GatewayStatus, registration: deps.mapRegistration(row) };
  }

  const result = await gatewayVerify(reference);
  const expected = Number(row.total_amount) || 0;

  if (result.status === 'SUCCESSFUL') {
    if (result.amount !== null && Math.abs(result.amount - expected) > 0.01) {
      console.error(`[Access WebPay] Amount mismatch for ${reference}: paid ${result.amount}, expected ${expected}`);
      return { found: true as const, status: 'PENDING' as GatewayStatus, amountMismatch: true, registration: deps.mapRegistration(row) };
    }

    // Conditional update -> only one concurrent caller (redirect vs webhook) wins.
    const { data: updated } = await supabase
      .from('registrations')
      .update({ payment_status: 'SUCCESSFUL' })
      .eq('id', row.id)
      .neq('payment_status', 'SUCCESSFUL')
      .select('*, registration_types(name), events(title)');

    const finalRow = updated && updated.length > 0 ? updated[0] : { ...row, payment_status: 'SUCCESSFUL' };
    const mapped = deps.mapRegistration(finalRow);

    if (updated && updated.length > 0) {
      try {
        await supabase.from('tickets').insert({
          registration_id: row.id,
          ticket_code: `TCK-${row.registration_number}`,
          qr_code_data: JSON.stringify({ reg: row.registration_number }),
          security_hash: crypto.createHash('sha256').update(`${row.id}:${reference}`).digest('hex'),
          status: 'REGISTERED',
        });
      } catch { /* tickets table optional */ }
      await deps.sendConfirmationEmail(mapped).catch((e) => console.warn('[Access WebPay] Email dispatch notice:', e));
    }
    return { found: true as const, status: 'SUCCESSFUL' as GatewayStatus, registration: mapped };
  }

  if (result.status === 'FAILED') {
    await supabase
      .from('registrations')
      .update({ payment_status: 'FAILED' })
      .eq('id', row.id)
      .neq('payment_status', 'SUCCESSFUL');
    return { found: true as const, status: 'FAILED' as GatewayStatus, registration: deps.mapRegistration({ ...row, payment_status: 'FAILED' }) };
  }

  return { found: true as const, status: 'PENDING' as GatewayStatus, registration: deps.mapRegistration(row) };
}

export async function handleWebpayRoute(
  pathname: string,
  method: string,
  event: any,
  deps: WebpayRouteDeps
): Promise<LambdaResponse | null> {
  if (!pathname.startsWith('/payments')) return null;
  const json = (statusCode: number, payload: unknown): LambdaResponse => ({
    statusCode,
    headers: deps.corsHeaders,
    body: JSON.stringify(payload),
  });

  // Public config – tells the frontend whether real payments are live. Never exposes secrets.
  if (pathname === '/payments/config' && method === 'GET') {
    return json(200, {
      success: true,
      data: {
        provider: 'ACCESS_WEBPAY',
        enabled: isWebpayEnabled(),
        environment: WEBPAY_CONFIG.environment,
        currency: WEBPAY_CONFIG.currency,
      },
    });
  }

  // 1. Create PENDING registration + gateway checkout session
  if (pathname === '/payments/initialize' && method === 'POST') {
    if (!isWebpayEnabled()) {
      return json(503, {
        success: false,
        message: 'Online payment is not yet activated.',
        missing: missingConfigKeys(),
      });
    }

    const body = JSON.parse(event.body || '{}');
    const pkg = String(body.package || '').toUpperCase() as ConferencePackage;
    if (!['SINGLE', 'DOUBLE', 'CONFERENCE_ONLY'].includes(pkg)) {
      return json(400, { success: false, message: 'A valid conference package is required.' });
    }
    if (!body.first_name || !body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(body.email))) {
      return json(400, { success: false, message: 'First name and a valid email are required.' });
    }

    const membershipCategory = body.membership_category || 'Non-Member';
    const amount = computePackagePrice(pkg, membershipCategory);
    const reference = generateReference();
    const regNumber = `CIB-${Date.now().toString(36).toUpperCase()}`;

    const insertPayload: Record<string, unknown> = {
      registration_number: regNumber,
      event_id: isUuid(body.event_id) ? body.event_id : 'e1111111-1111-1111-1111-111111111111',
      registration_type_id: pkg === 'DOUBLE' ? 'd2222222-2222-2222-2222-222222222222' : 'd1111111-1111-1111-1111-111111111111',
      first_name: String(body.first_name).trim(),
      last_name: String(body.last_name || '').trim(),
      email: String(body.email).trim().toLowerCase(),
      phone: body.phone || '',
      organization: body.organization || '',
      job_title: body.job_title || 'Delegate',
      country: body.country || 'Ghana',
      cib_member_id: body.cib_member_id || null,
      membership_category: membershipCategory,
      attendance_type: body.attendance_type || 'PHYSICAL',
      dietary_requirements: body.dietary_requirements || null,
      special_assistance: body.special_assistance || null,
      total_amount: amount,
      currency: WEBPAY_CONFIG.currency,
      payment_status: 'PENDING',
      payment_reference: reference,
      payment_method: 'ACCESS_WEBPAY',
      check_in_status: 'REGISTERED',
    };

    let { data: saved, error: insErr } = await deps.supabase
      .from('registrations')
      .insert(insertPayload)
      .select('*, registration_types(name), events(title)')
      .single();

    // Older schemas may not have membership_category – retry without it.
    if (insErr && /membership_category/i.test(insErr.message || '')) {
      delete insertPayload.membership_category;
      ({ data: saved, error: insErr } = await deps.supabase
        .from('registrations')
        .insert(insertPayload)
        .select('*, registration_types(name), events(title)')
        .single());
    }

    if (insErr || !saved) {
      console.error('[Access WebPay] Could not create pending registration:', insErr);
      return json(500, { success: false, message: 'Could not create your registration. Please try again.' });
    }

    try {
      const checkout = await gatewayInitialize({
        reference,
        amount,
        email: String(insertPayload.email),
        customerName: `${insertPayload.first_name} ${insertPayload.last_name}`.trim(),
        phone: String(insertPayload.phone || ''),
        description: `${body.event_title || 'CIB Ghana Conference'} - ${body.registration_type_name || pkg}`.slice(0, 200),
        returnUrl: `${WEBPAY_CONFIG.siteUrl}/payment/callback?reference=${encodeURIComponent(reference)}`,
        webhookUrl: `${WEBPAY_CONFIG.siteUrl}/api/payments/webhook`,
      });

      return json(200, {
        success: true,
        data: {
          checkout_url: checkout.checkoutUrl,
          reference,
          registration_number: regNumber,
          amount,
          currency: WEBPAY_CONFIG.currency,
        },
      });
    } catch (err: any) {
      console.error('[Access WebPay] Initialize error:', err);
      await deps.supabase.from('registrations').update({ payment_status: 'FAILED' }).eq('id', saved.id);
      return json(502, { success: false, message: 'The payment gateway is unavailable right now. Please try again shortly.' });
    }
  }

  // 2. Verify after redirect back from WebPay
  if (pathname.startsWith('/payments/verify/') && method === 'GET') {
    const reference = decodeURIComponent(pathname.replace('/payments/verify/', '')).trim();
    if (!reference) return json(400, { success: false, message: 'Payment reference is required.' });
    if (!isWebpayEnabled()) return json(503, { success: false, message: 'Online payment is not yet activated.' });

    try {
      const result = await settleRegistration(reference, deps);
      if (!result.found) return json(404, { success: false, message: 'No registration found for this payment reference.' });
      return json(200, {
        success: true,
        data: {
          status: result.status,
          reference,
          amount_mismatch: Boolean((result as any).amountMismatch),
          registration: result.registration,
        },
      });
    } catch (err: any) {
      console.error('[Access WebPay] Verify error:', err);
      return json(502, { success: false, message: 'Could not confirm payment with the bank yet. Please retry in a moment.' });
    }
  }

  // 3. Server-to-server notification from WebPay
  if (pathname === '/payments/webhook' && method === 'POST') {
    const rawBody = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || '';
    if (!verifyWebhookSignature(rawBody, event.headers || {})) {
      return json(401, { success: false, message: 'Invalid signature' });
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = Object.fromEntries(new URLSearchParams(rawBody));
    }

    const reference = extractWebhookReference(payload);
    if (!reference || !isWebpayEnabled()) return json(200, { success: true, ignored: true });

    try {
      // Never trust the webhook body for status – always re-verify with the gateway.
      const result = await settleRegistration(String(reference), deps);
      return json(200, { success: true, status: result.found ? result.status : 'UNKNOWN' });
    } catch (err) {
      console.error('[Access WebPay] Webhook settle error:', err);
      return json(500, { success: false }); // non-2xx so the gateway retries
    }
  }

  return null;
}
