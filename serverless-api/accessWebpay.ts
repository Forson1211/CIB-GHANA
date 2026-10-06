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
  enabledFlag: env('ACCESS_WEBPAY_ENABLED', 'false').toLowerCase() === 'true',
  environment: env('ACCESS_WEBPAY_ENV', 'sandbox').toLowerCase() === 'live' ? 'live' : 'sandbox',
  baseUrl: env('ACCESS_WEBPAY_BASE_URL').replace(/\/+$/, ''),
  merchantId: env('ACCESS_WEBPAY_MERCHANT_ID'),
  apiKey: env('ACCESS_WEBPAY_API_KEY'),
  secretKey: env('ACCESS_WEBPAY_SECRET_KEY'),
  initPath: env('ACCESS_WEBPAY_INIT_PATH', '/api/v1/checkout/initialize'),
  verifyPath: env('ACCESS_WEBPAY_VERIFY_PATH', '/api/v1/checkout/verify/{reference}'),
  authScheme: env('ACCESS_WEBPAY_AUTH_SCHEME', 'bearer').toLowerCase(),
  authHeader: env('ACCESS_WEBPAY_AUTH_HEADER', 'X-Api-Key'),
  amountUnit: env('ACCESS_WEBPAY_AMOUNT_UNIT', 'major').toLowerCase() === 'minor' ? 'minor' : 'major',
  signRequests: env('ACCESS_WEBPAY_SIGN_REQUESTS', 'false').toLowerCase() === 'true',
  webhookSignatureHeader: env('ACCESS_WEBPAY_WEBHOOK_SIGNATURE_HEADER', 'x-webpay-signature').toLowerCase(),
  currency: env('ACCESS_WEBPAY_CURRENCY', 'GHS'),
  siteUrl: (env('PUBLIC_SITE_URL') || env('URL') || 'https://cibghana.org').replace(/\/+$/, ''),
};

export function isWebpayEnabled(): boolean {
  const c = WEBPAY_CONFIG;
  return Boolean(c.enabledFlag && c.baseUrl && c.merchantId && c.apiKey);
}

function missingConfigKeys(): string[] {
  const c = WEBPAY_CONFIG;
  const missing: string[] = [];
  if (!c.enabledFlag) missing.push('ACCESS_WEBPAY_ENABLED');
  if (!c.baseUrl) missing.push('ACCESS_WEBPAY_BASE_URL');
  if (!c.merchantId) missing.push('ACCESS_WEBPAY_MERCHANT_ID');
  if (!c.apiKey) missing.push('ACCESS_WEBPAY_API_KEY');
  return missing;
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
// GATEWAY ADAPTER  (adjust this section once Access Bank shares the API spec)
// ---------------------------------------------------------------------------
export type GatewayStatus = 'SUCCESSFUL' | 'FAILED' | 'PENDING';

function authHeaders(): Record<string, string> {
  const c = WEBPAY_CONFIG;
  if (c.authScheme === 'basic') {
    return { Authorization: `Basic ${Buffer.from(`${c.merchantId}:${c.apiKey}`).toString('base64')}` };
  }
  if (c.authScheme === 'header') {
    return { [c.authHeader]: c.apiKey };
  }
  return { Authorization: `Bearer ${c.apiKey}` };
}

function signPayload(payload: string): string {
  return crypto.createHmac('sha512', WEBPAY_CONFIG.secretKey || WEBPAY_CONFIG.apiKey).update(payload).digest('hex');
}

function toGatewayAmount(amountGhs: number): number {
  return WEBPAY_CONFIG.amountUnit === 'minor' ? Math.round(amountGhs * 100) : Number(amountGhs.toFixed(2));
}

function fromGatewayAmount(raw: unknown): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return WEBPAY_CONFIG.amountUnit === 'minor' ? n / 100 : n;
}

/** Look up the first defined value among several candidate (possibly nested) keys. */
function pick(obj: any, paths: string[]): any {
  for (const p of paths) {
    const val = p.split('.').reduce((acc: any, k) => (acc == null ? undefined : acc[k]), obj);
    if (val !== undefined && val !== null && val !== '') return val;
  }
  return undefined;
}

async function gatewayFetch(path: string, init: { method: 'GET' | 'POST'; body?: Record<string, unknown> }) {
  const url = `${WEBPAY_CONFIG.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const bodyStr = init.body ? JSON.stringify(init.body) : undefined;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Merchant-Id': WEBPAY_CONFIG.merchantId,
    ...authHeaders(),
  };
  if (WEBPAY_CONFIG.signRequests && bodyStr) headers['X-Signature'] = signPayload(bodyStr);

  const res = await fetch(url, { method: init.method, headers, body: bodyStr });
  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
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
    merchant_id: WEBPAY_CONFIG.merchantId,
    reference: params.reference,
    amount: toGatewayAmount(params.amount),
    currency: WEBPAY_CONFIG.currency,
    description: params.description,
    customer: {
      email: params.email,
      name: params.customerName,
      phone: params.phone || '',
    },
    return_url: params.returnUrl,
    callback_url: params.returnUrl,
    notification_url: params.webhookUrl,
  };

  const { ok, status, json } = await gatewayFetch(WEBPAY_CONFIG.initPath, { method: 'POST', body });
  const checkoutUrl = pick(json, [
    'checkout_url', 'checkoutUrl', 'payment_url', 'paymentUrl', 'redirect_url', 'redirectUrl',
    'authorization_url', 'url',
    'data.checkout_url', 'data.checkoutUrl', 'data.payment_url', 'data.paymentUrl',
    'data.redirect_url', 'data.redirectUrl', 'data.authorization_url', 'data.url',
  ]);

  if (!ok || !checkoutUrl) {
    const msg = pick(json, ['message', 'error', 'errorMessage', 'data.message']) || `HTTP ${status}`;
    throw new Error(`Access WebPay initialization failed: ${msg}`);
  }

  return {
    checkoutUrl: String(checkoutUrl),
    gatewayReference: pick(json, ['transaction_id', 'transactionId', 'data.transaction_id', 'data.transactionId', 'data.reference']),
    raw: json,
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
  const path = WEBPAY_CONFIG.verifyPath.replace('{reference}', encodeURIComponent(reference));
  const { ok, status, json } = await gatewayFetch(path, { method: 'GET' });
  if (!ok) {
    const msg = pick(json, ['message', 'error', 'errorMessage']) || `HTTP ${status}`;
    throw new Error(`Access WebPay verification failed: ${msg}`);
  }

  const rawStatus = String(
    pick(json, ['status', 'transaction_status', 'transactionStatus', 'data.status', 'data.transaction_status',
      'data.transactionStatus', 'responseCode', 'response_code', 'data.responseCode', 'data.response_code']) ?? ''
  ).toUpperCase();

  let mapped: GatewayStatus = 'PENDING';
  if (['SUCCESS', 'SUCCESSFUL', 'APPROVED', 'PAID', 'COMPLETED', 'CAPTURED', '00', '000'].includes(rawStatus)) mapped = 'SUCCESSFUL';
  else if (['FAILED', 'FAILURE', 'DECLINED', 'CANCELLED', 'CANCELED', 'REVERSED', 'EXPIRED', 'ERROR', 'ABANDONED'].includes(rawStatus)) mapped = 'FAILED';

  return {
    status: mapped,
    amount: fromGatewayAmount(pick(json, ['amount', 'data.amount', 'data.transaction_amount', 'transaction_amount'])),
    currency: pick(json, ['currency', 'data.currency']),
    channel: pick(json, ['channel', 'payment_method', 'data.channel', 'data.payment_method']),
    gatewayReference: pick(json, ['transaction_id', 'transactionId', 'data.transaction_id', 'data.transactionId']),
    raw: json,
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
