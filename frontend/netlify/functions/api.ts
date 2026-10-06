import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { handleWebpayRoute, WEBPAY_CONFIG } from './_shared/accessWebpay';

// Configuration
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: (process.env.SMTP_SECURE || 'true') === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};
const SMTP_FROM = process.env.SMTP_FROM || 'Chartered Institute of Bankers, Ghana <events@cibgh.org>';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_TEST_RECIPIENT = process.env.RESEND_TEST_RECIPIENT || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'CIB Ghana <cibghevent@resend.dev>';
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || 'events@cibgh.org';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ijfjuezgvroyhtwcnlrx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZmp1ZXpndnJveWh0d2NubHJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDMyMjM3NCwiZXhwIjoyMTA1ODk4Mzc0fQ.LKsElhVQb7kY4Xek5SvoTwTpZ1rsuWbjSBX7-SlMP9k';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

function formatGHS(amount: number | string): string {
  return `GHS ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function stringToUuid(str: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;

  const hash = crypto.createHash('md5').update(str).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16),
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.substring(18, 20),
    hash.substring(20, 32),
  ].join('-');
}

function mapDbRegistration(r: any) {
  const typeName = r.registration_types?.name || r.registration_type_name || 'Standard Delegate Pass';
  const eventTitle = r.events?.title || r.event_title || '30th National Banking & Ethics Conference 2026';
  const memId = (r.cib_member_id || '').toUpperCase();
  let cat = r.membership_category || 'Non-Member';
  if (!cat || !['ACIB', 'FCIB', 'Student', 'Non-Member'].includes(cat)) {
    if (memId.startsWith('FCIB') || typeName.toLowerCase().includes('fellow')) cat = 'FCIB';
    else if (memId.startsWith('ACIB') || typeName.toLowerCase().includes('associate') || typeName.toLowerCase().includes('chartered') || typeName.toLowerCase().includes('member')) cat = 'ACIB';
    else if (memId.startsWith('STU') || typeName.toLowerCase().includes('student')) cat = 'Student';
  }

  return {
    id: r.id,
    event_id: r.event_id,
    event_title: eventTitle,
    registration_number: r.registration_number,
    registration_type_id: r.registration_type_id,
    registration_type_name: typeName,
    first_name: r.first_name,
    last_name: r.last_name,
    email: r.email,
    phone: r.phone || '',
    organization: r.organization || '',
    job_title: r.job_title || 'Delegate',
    country: r.country || 'Ghana',
    cib_member_id: r.cib_member_id,
    membership_category: cat,
    attendance_type: r.attendance_type || 'PHYSICAL',
    dietary_requirements: r.dietary_requirements,
    special_assistance: r.special_assistance,
    total_amount: Number(r.total_amount) || 0,
    currency: r.currency || 'GHS',
    payment_status: r.payment_status || 'PENDING',
    payment_reference: r.payment_reference,
    payment_method: r.payment_method,
    check_in_status: r.check_in_status || 'REGISTERED',
    check_in_time: r.check_in_time,
    created_at: r.created_at || new Date().toISOString(),
  };
}

function buildConfirmationHtml(params: {
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  regNumber: string;
  amount: number | string;
  reference: string;
  paymentMethod: string;
  ticketUrl: string;
  qrImageUrl: string;
  sandboxNotice?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Payment Receipt & Accreditation Pass - CIB Ghana</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 12px; color: #1e293b; line-height: 1.6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    ${params.sandboxNotice || ''}
    <!-- Header -->
    <div style="background-color: #0A5C36; color: #ffffff; padding: 36px 28px 28px 28px; text-align: center;">
      <p style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #D4AF37; margin: 0 0 10px 0;">Chartered Institute of Bankers, Ghana</p>
      <h1 style="font-size: 21px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.3px; color: #ffffff; line-height: 1.3;">${params.eventTitle}</h1>
      <p style="margin: 0; font-size: 13px; color: #DCF0E5; font-weight: 400; line-height: 1.4;">Official Payment Receipt &amp; Digital Accreditation Pass &bull; Established under Act 991</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px 28px;">
      <p style="font-size: 15px; margin-top: 0; color: #0f172a;">Dear <strong>${params.attendeeName}</strong>,</p>
      <p style="font-size: 14px; color: #334155; margin-bottom: 24px;">
        Thank you for registering. We are pleased to confirm that your payment has been processed successfully. Below is your official tax receipt and delegate accreditation pass.
      </p>

      <!-- Amount Banner -->
      <div style="background-color: #F0F9F4; padding: 22px 20px; text-align: center; margin-bottom: 28px;">
        <div style="font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #0A5C36; margin-bottom: 4px;">Payment Verified &amp; Confirmed</div>
        <div style="font-size: 30px; font-weight: 800; color: #0A5C36; margin: 4px 0 6px 0; letter-spacing: -0.5px;">${formatGHS(params.amount)}</div>
        <p style="margin: 0; font-size: 12px; color: #475569;">
          Transaction Reference: <strong style="font-family: 'Courier New', Courier, monospace; color: #0f172a;">${params.reference}</strong>
        </p>
      </div>

      <!-- Summary Details -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 13px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 500; width: 42%;">Event:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0f172a; text-align: right;">${params.eventTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Registration ID:</td>
          <td style="padding: 8px 0; font-family: 'Courier New', Courier, monospace; color: #0A5C36; font-weight: 700; text-align: right;">${params.regNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Dates:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0f172a; text-align: right;">${params.eventDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Venue:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0f172a; text-align: right;">${params.eventVenue}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Payment Method:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0f172a; text-align: right;">${params.paymentMethod}</td>
        </tr>
      </table>

      <!-- Digital Pass & QR -->
      <div style="text-align: center; padding: 28px 20px; background-color: #f8fafc; margin: 28px 0;">
        <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #0f172a;">Official Digital Entry Pass</h3>
        <p style="margin: 0 0 18px 0; font-size: 12px; color: #64748b;">Present this scannable QR code at the registration desk for priority accreditation</p>
        <img src="${params.qrImageUrl}" alt="Accreditation QR Pass" width="160" height="160" style="width: 160px; height: 160px; display: block; margin: 0 auto; border: none; background: #ffffff;" />
        <p style="margin: 14px 0 0 0; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700; color: #0A5C36;">${params.regNumber}</p>
        <a href="${params.ticketUrl}" style="display: inline-block; margin-top: 18px; background-color: #0A5C36; color: #ffffff !important; padding: 13px 28px; font-weight: 700; font-size: 13px; text-decoration: none; letter-spacing: 0.5px; text-transform: uppercase;">
          View &amp; Download Live Ticket Pass
        </a>
      </div>

      <div style="background-color: #f8fafc; padding: 16px 20px; font-size: 13px; color: #334155; line-height: 1.6; margin: 24px 0;">
        <strong>Check-in Notice:</strong> Delegate accreditation and registration will take place upon arrival. Please keep this digital pass accessible on your mobile device for priority check-in.
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; line-height: 1.6;">
      <p style="margin: 4px 0;"><strong>Chartered Institute of Bankers, Ghana</strong></p>
      <p style="margin: 4px 0;">Okponglo-East Legon, Trinity Avenue, P.O. Box AN 14455, Accra, Ghana</p>
      <p style="margin: 4px 0;">Tel: +233 (0) 302 543 456 &bull; Email: events@cibghana.org</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function dispatchEmailViaResend(options: {
  recipient: string;
  subject: string;
  htmlContent: string;
  plainText: string;
}): Promise<{ success: boolean; deliveredTo: string; messageId?: string; isSandboxFallback?: boolean; error?: string }> {
  let fromAddress = FROM_EMAIL;
  if (!fromAddress.includes('<')) {
    fromAddress = `CIB Ghana <${fromAddress}>`;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        reply_to: REPLY_TO_EMAIL,
        to: options.recipient,
        subject: options.subject,
        text: options.plainText,
        html: options.htmlContent,
      }),
    });

    const data: any = await res.json();
    if (res.ok) {
      return { success: true, deliveredTo: options.recipient, messageId: data?.id };
    }

    // Handle Sandbox 403 restriction (when attendee email is not the verified account)
    if (res.status === 403 && (data?.message?.includes('own email address') || data?.message?.includes('verify a domain'))) {
      const sandboxNotice = `
        <div style="background-color: #FEF9C3; border: 1px solid #FDE047; padding: 14px 18px; margin-bottom: 20px; font-size: 13px; color: #854D0E; font-family: sans-serif; line-height: 1.5;">
          <strong>Sandbox Testing Notice:</strong> This official accreditation pass &amp; receipt was generated for delegate <strong>${options.recipient}</strong>. Delivered to registered developer address (<strong>${RESEND_TEST_RECIPIENT}</strong>) because custom domain verification is pending at <a href="https://resend.com/domains" style="color: #854D0E; font-weight: bold;">resend.com/domains</a>.
        </div>
      `;

      const fallbackRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          reply_to: REPLY_TO_EMAIL,
          to: RESEND_TEST_RECIPIENT,
          subject: `[ATTENDEE PASS: ${options.recipient}] ${options.subject}`,
          text: `[Originally for ${options.recipient}]\n\n${options.plainText}`,
          html: sandboxNotice + options.htmlContent,
        }),
      });

      const fallbackData: any = await fallbackRes.json();
      if (fallbackRes.ok) {
        return {
          success: true,
          deliveredTo: RESEND_TEST_RECIPIENT,
          messageId: fallbackData?.id,
          isSandboxFallback: true,
        };
      }
      return { success: false, deliveredTo: options.recipient, error: fallbackData?.message || 'Resend sandbox fallback failed' };
    }

    return { success: false, deliveredTo: options.recipient, error: data?.message || 'Resend API rejected request' };
  } catch (err: any) {
    return { success: false, deliveredTo: options.recipient, error: err?.message || 'Network fetch to Resend failed' };
  }
}

async function dispatchEmail(options: {
  recipient: string;
  subject: string;
  htmlContent: string;
  plainText: string;
}): Promise<{ success: boolean; deliveredTo: string; messageId?: string; isSandboxFallback?: boolean; error?: string }> {
  if (SMTP_CONFIG.auth.user && SMTP_CONFIG.auth.pass) {
    try {
      const transporter = nodemailer.createTransport(SMTP_CONFIG);
      const info = await transporter.sendMail({
        from: SMTP_FROM,
        replyTo: REPLY_TO_EMAIL,
        to: options.recipient,
        subject: options.subject,
        text: options.plainText,
        html: options.htmlContent,
      });
      return { success: true, deliveredTo: options.recipient, messageId: info.messageId };
    } catch (smtpErr: any) {
      console.warn('[Netlify Function] SMTP error, trying Resend fallback:', smtpErr.message);
    }
  }
  return dispatchEmailViaResend(options);
}

export const handler = async (event: any, _context?: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  // Strip function and API prefixes
  let pathname = (event.path || '')
    .replace(/^\/\.netlify\/functions\/api/, '')
    .replace(/^\/api/, '');
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;

  const method = event.httpMethod;

  try {
    // -------------------------------------------------------------
    // 1. Health check
    // -------------------------------------------------------------
    if (pathname === '/health' || pathname === '') {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          status: 'UP',
          service: 'CIB Ghana Netlify Serverless API',
          timestamp: new Date().toISOString(),
        }),
      };
    }

    // -------------------------------------------------------------
    // 1b. Access Bank WebPay payments (/payments/config|initialize|verify|webhook)
    // -------------------------------------------------------------
    const webpayResponse = await handleWebpayRoute(pathname, method, event, {
      supabase,
      corsHeaders: CORS_HEADERS,
      mapRegistration: mapDbRegistration,
      sendConfirmationEmail: (reg: any) => {
        const regNumber = reg.registration_number;
        const eventTitle = reg.event_title || '30th National Banking & Ethics Conference 2026';
        return dispatchEmail({
          recipient: reg.email,
          subject: `Payment Confirmed & Pass Issued: ${eventTitle} (Ref: ${regNumber})`,
          htmlContent: buildConfirmationHtml({
            attendeeName: `${reg.first_name} ${reg.last_name || ''}`.trim(),
            eventTitle,
            eventDate: 'November 9 - 10, 2026',
            eventVenue: 'Aqua Safari Resort Convention Pavilion, Ada Foah',
            regNumber,
            amount: reg.total_amount,
            reference: reg.payment_reference,
            paymentMethod: 'Access Bank WebPay (Card / Mobile Money)',
            ticketUrl: `${WEBPAY_CONFIG.siteUrl}/ticket/${regNumber}`,
            qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=6&data=${encodeURIComponent(regNumber)}`,
          }),
          plainText: `Payment confirmed for ${reg.first_name}. Registration Number: ${regNumber}. Reference: ${reg.payment_reference}`,
        });
      },
    });
    if (webpayResponse) return webpayResponse;

    // -------------------------------------------------------------
    // 2. Admin Authentication & Stats
    // -------------------------------------------------------------
    if (pathname === '/admin/login' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (body.password && body.password.trim() === 'cibghana') {
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            message: 'Admin authentication successful',
            token: 'cib_admin_token_active',
            user: { role: 'SUPER_ADMIN', email: 'admin@cibgh.org', name: 'CIB Administrator' },
          }),
        };
      }
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, message: 'Invalid administrator password' }),
      };
    }

    if (pathname === '/admin/stats' && method === 'GET') {
      const [{ data: eventsData }, { data: regsData }] = await Promise.all([
        supabase.from('events').select('id, status'),
        supabase.from('registrations').select('id, payment_status, total_amount, check_in_status, membership_category'),
      ]);

      const allEvents = eventsData || [];
      const allRegs = regsData || [];

      const totalRegistrations = allRegs.length;
      const paidRegistrations = allRegs.filter((r) => r.payment_status === 'SUCCESSFUL');
      const totalRevenue = paidRegistrations.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
      const checkedInCount = allRegs.filter((r) => r.check_in_status === 'CHECKED_IN').length;

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          data: {
            total_events: allEvents.length,
            active_events: allEvents.filter((e) => e.status === 'OPEN_FOR_REGISTRATION').length,
            total_registrations: totalRegistrations,
            paid_registrations: paidRegistrations.length,
            total_revenue_ghs: totalRevenue,
            checked_in_attendees: checkedInCount,
          },
        }),
      };
    }

    // -------------------------------------------------------------
    // 3. Speakers CRUD & Upload
    // -------------------------------------------------------------
    if (pathname === '/speakers/upload' && method === 'POST') {
      const { image, speakerId = 'spk' } = JSON.parse(event.body || '{}');
      if (!image) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: 'Image data is required' }),
        };
      }

      let buffer: Buffer;
      let mimeType = 'image/jpeg';
      let ext = 'jpg';

      if (image.startsWith('data:')) {
        const parts = image.split(',');
        const match = parts[0].match(/:(.*?);/);
        if (match) mimeType = match[1];
        if (mimeType.includes('png')) ext = 'png';
        else if (mimeType.includes('webp')) ext = 'webp';
        else if (mimeType.includes('gif')) ext = 'gif';
        buffer = Buffer.from(parts[1], 'base64');
      } else {
        buffer = Buffer.from(image, 'base64');
      }

      const cleanId = String(speakerId).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uploadPath = `speakers/${cleanId}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('speaker-photos')
        .upload(uploadPath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: uploadError.message }),
        };
      }

      const { data: pubData } = supabase.storage.from('speaker-photos').getPublicUrl(uploadPath);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, url: pubData.publicUrl, path: uploadPath }),
      };
    }

    if (pathname === '/speakers' && method === 'GET') {
      const { data, error } = await supabase
        .from('speakers')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: error.message }),
        };
      }
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, data: data || [] }),
      };
    }

    if (pathname === '/speakers' && method === 'POST') {
      const speaker = JSON.parse(event.body || '{}');
      if (!speaker || !speaker.name) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: 'Speaker name is required' }),
        };
      }

      const rawId = speaker.id || `sp-${Date.now()}`;
      const uuid = stringToUuid(rawId);
      const slug = speaker.slug || speaker.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const row = {
        id: uuid,
        name: speaker.name,
        slug,
        position: speaker.position || '',
        organization: speaker.organization || '',
        country: speaker.country || 'Ghana',
        photo_url: speaker.photo_url || '',
        biography: speaker.biography || '',
        expertise: Array.isArray(speaker.expertise) ? speaker.expertise : [],
        is_keynote: Boolean(speaker.is_keynote),
        linkedin_url: speaker.linkedin_url || null,
        twitter_url: speaker.twitter_url || null,
        website_url: speaker.website_url || null,
      };

      const { data, error } = await supabase.from('speakers').upsert(row).select().single();
      if (error) {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: error.message }),
        };
      }
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, data }),
      };
    }

    if (pathname.startsWith('/speakers/') && method === 'DELETE') {
      const speakerId = pathname.replace('/speakers/', '');
      const uuid = stringToUuid(speakerId);
      const { error } = await supabase.from('speakers').delete().eq('id', uuid);

      if (error) {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: error.message }),
        };
      }
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, message: 'Speaker deleted successfully' }),
      };
    }

    // -------------------------------------------------------------
    // 3b. Sponsors & Corporate Members CRUD & Logo Upload
    // -------------------------------------------------------------
    if (pathname === '/sponsors/upload' && method === 'POST') {
      try {
        const body = JSON.parse(event.body || '{}');
        const { image, sponsorId } = body;
        if (!image) {
          return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: false, message: 'Image base64 data required' }),
          };
        }

        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(image, 'base64');
        const mimeType = matches ? matches[1] : 'image/png';
        const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';

        const cleanId = String(sponsorId || 'sp').replace(/[^a-zA-Z0-9_-]/g, '_');
        const filePath = `sponsors/${cleanId}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('speaker-photos')
          .upload(filePath, buffer, { contentType: mimeType, upsert: true });

        if (uploadError) {
          return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: false, message: uploadError.message }),
          };
        }

        const { data } = supabase.storage.from('speaker-photos').getPublicUrl(filePath);
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, url: data.publicUrl }),
        };
      } catch (err: any) {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: err.message }),
        };
      }
    }

    if (pathname === '/sponsors' && method === 'GET') {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: error.message }),
        };
      }

      const mapped = (data || []).map((row: any) => {
        let meta: any = {};
        try {
          if (row.description && row.description.startsWith('{')) {
            meta = JSON.parse(row.description);
          }
        } catch {}

        const isMember = row.tier === 'PARTNER' || meta.type === 'CORPORATE_MEMBER';
        return {
          id: row.id,
          name: row.name,
          logo_url: row.logo_url || '',
          website_url: row.website_url || '',
          tier: isMember ? 'CORPORATE_MEMBER' : row.tier,
          type: isMember ? 'CORPORATE_MEMBER' : 'SPONSOR',
          categoryOrRole: meta.role || row.description || (isMember ? 'Licensed Commercial Bank' : 'Corporate Sponsor'),
          description: meta.desc || (row.description && !row.description.startsWith('{') ? row.description : ''),
        };
      });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, data: mapped }),
      };
    }

    if (pathname === '/sponsors' && method === 'POST') {
      const sp = JSON.parse(event.body || '{}');
      if (!sp || !sp.name) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: 'Entity name is required' }),
        };
      }

      const rawId = sp.id || `sp-${Date.now()}`;
      const uuid = stringToUuid(rawId);
      const isMember = sp.type === 'CORPORATE_MEMBER' || sp.tier === 'CORPORATE_MEMBER';
      const validTiers = ['PARTNER', 'PLATINUM', 'GOLD', 'SILVER', 'ACADEMIC'];
      const tier = isMember ? 'PARTNER' : (validTiers.includes(sp.tier) ? sp.tier : 'PLATINUM');

      const descJson = JSON.stringify({
        role: sp.categoryOrRole || '',
        desc: sp.description || '',
        type: isMember ? 'CORPORATE_MEMBER' : 'SPONSOR',
        originalId: sp.id || '',
      });

      const row = {
        id: uuid,
        name: sp.name.trim(),
        logo_url: sp.logo_url || '',
        website_url: sp.website_url || null,
        tier: tier,
        description: descJson,
      };

      const { data, error } = await supabase.from('sponsors').upsert(row).select().single();
      if (error) {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: error.message }),
        };
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, data }),
      };
    }

    if (pathname.startsWith('/sponsors/') && method === 'DELETE') {
      const sponsorId = pathname.replace('/sponsors/', '');
      const uuid = stringToUuid(sponsorId);
      const { error } = await supabase.from('sponsors').delete().eq('id', uuid);

      if (error) {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: error.message }),
        };
      }
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, message: 'Entity deleted successfully' }),
      };
    }

    // -------------------------------------------------------------
    // 4. Events CRUD
    // -------------------------------------------------------------
    if (pathname === '/events' && method === 'GET') {
      const queryParams = event.queryStringParameters || {};
      let query = supabase.from('events').select('*, registration_types(*)').order('start_date', { ascending: true });

      if (queryParams.status && queryParams.status !== 'ALL') {
        query = query.eq('status', queryParams.status);
      }

      const { data, error } = await query;
      if (error) {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: error.message }),
        };
      }

      let eventsList = (data || []);
      if (queryParams.category && queryParams.category !== 'ALL') {
        eventsList = eventsList.filter((e: any) => e.category?.toLowerCase() === queryParams.category?.toLowerCase());
      }
      if (queryParams.search) {
        const q = queryParams.search.toLowerCase().trim();
        eventsList = eventsList.filter((e: any) => (e.title && e.title.toLowerCase().includes(q)) || (e.location && e.location.toLowerCase().includes(q)));
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, count: eventsList.length, data: eventsList }),
      };
    }

    if (pathname.startsWith('/events/') && method === 'GET') {
      const slugOrId = decodeURIComponent(pathname.replace('/events/', ''));
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
      let query = supabase.from('events').select('*, registration_types(*)');

      if (isUuid) {
        query = query.eq('id', slugOrId);
      } else {
        query = query.or(`id.eq.${slugOrId},slug.eq.${slugOrId}`);
      }

      const { data, error } = await query.maybeSingle();
      if (error || !data) {
        return {
          statusCode: 404,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: 'Event not found' }),
        };
      }
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, data }),
      };
    }

    // -------------------------------------------------------------
    // 5. Registrations CRUD & Resend
    // -------------------------------------------------------------
    if (pathname === '/registrations' && method === 'GET') {
      const queryParams = event.queryStringParameters || {};
      let query = supabase
        .from('registrations')
        .select('*, registration_types(name), events(title)')
        .order('created_at', { ascending: false });

      if (queryParams.event_id && queryParams.event_id !== 'ALL') {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryParams.event_id);
        if (isUuid) query = query.eq('event_id', queryParams.event_id);
      }
      if (queryParams.status && queryParams.status !== 'ALL') query = query.eq('check_in_status', queryParams.status);
      if (queryParams.payment_status && queryParams.payment_status !== 'ALL') query = query.eq('payment_status', queryParams.payment_status);

      const { data, error } = await query;
      if (error) {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: error.message }),
        };
      }

      let list = (data || []).map(mapDbRegistration);
      if (queryParams.membership_category && queryParams.membership_category !== 'ALL') {
        list = list.filter((r) => r.membership_category === queryParams.membership_category);
      }
      if (queryParams.search) {
        const q = queryParams.search.toLowerCase().trim();
        list = list.filter(
          (r) =>
            r.registration_number.toLowerCase().includes(q) ||
            r.first_name.toLowerCase().includes(q) ||
            r.last_name.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q) ||
            (r.cib_member_id && r.cib_member_id.toLowerCase().includes(q)) ||
            (r.organization && r.organization.toLowerCase().includes(q)) ||
            (r.payment_reference && r.payment_reference.toLowerCase().includes(q))
        );
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, count: list.length, data: list }),
      };
    }

    if (pathname.includes('/resend-confirmation') && method === 'POST') {
      const parts = pathname.split('/');
      const identifier = parts[parts.indexOf('registrations') + 1] || 'CIB-DELEGATE';
      const body = JSON.parse(event.body || '{}');
      const recipient = body.to || body.email || body.data?.email || RESEND_TEST_RECIPIENT;

      const d = body.data || body;
      const attendeeName = d.attendeeName || `${d.first_name || ''} ${d.last_name || ''}`.trim() || 'Esteemed Delegate';
      const eventTitle = d.eventTitle || d.event_title || '30th National Banking & Ethics Conference 2026';
      const eventDate = d.eventDate || 'November 9 - 10, 2026';
      const eventVenue = d.eventVenue || 'Aqua Safari Resort Convention Pavilion, Ada Foah';
      const amount = d.amount || d.total_amount || 4000;
      const reference = d.reference || d.payment_reference || `PAY_${Date.now()}`;
      const paymentMethod = d.paymentMethod || d.payment_method || 'Paystack Electronic Settlement (Cards & Mobile Money)';
      const ticketUrl = d.ticketUrl || `https://cibghana.org/events/30th-national-banking-ethics-conference-2026/ticket/${identifier}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=6&data=${encodeURIComponent(identifier)}`;

      const htmlContent = d.html || buildConfirmationHtml({
        attendeeName,
        eventTitle,
        eventDate,
        eventVenue,
        regNumber: identifier,
        amount,
        reference,
        paymentMethod,
        ticketUrl,
        qrImageUrl,
      });

      const subject = `Payment Confirmed & Pass Issued: ${eventTitle} (Ref: ${identifier})`;
      const plainText = `
Payment Confirmation & Accreditation Pass
Event: ${eventTitle}
Registration Number: ${identifier}
Delegate: ${attendeeName}
Amount: ${formatGHS(amount)}
Reference: ${reference}
View Ticket: ${ticketUrl}
      `.trim();

      const dispatchResult = await dispatchEmail({
        recipient,
        subject,
        htmlContent,
        plainText,
      });

      return {
        statusCode: dispatchResult.success ? 200 : 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: dispatchResult.success,
          message: dispatchResult.success
            ? `Confirmation email issued for pass ${identifier}`
            : `Failed: ${dispatchResult.error}`,
          data: dispatchResult,
        }),
      };
    }

    if (pathname.startsWith('/registrations/') && method === 'GET') {
      const identifier = decodeURIComponent(pathname.replace('/registrations/', ''));
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

      let query = supabase
        .from('registrations')
        .select('*, registration_types(name), events(title)');

      if (isUuid) {
        query = query.eq('id', identifier);
      } else {
        query = query.or(`registration_number.ilike.${identifier},payment_reference.ilike.${identifier}`);
      }

      const { data, error } = await query.maybeSingle();
      if (error || !data) {
        return {
          statusCode: 404,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: 'Registration not found' }),
        };
      }

      const mapped = mapDbRegistration(data);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          data: {
            registration: mapped,
            ticket: {
              id: `tck-${mapped.registration_number}`,
              ticket_code: `TCK-${mapped.registration_number}`,
              registration_id: mapped.id,
              registration_number: mapped.registration_number,
              attendee_name: `${mapped.first_name} ${mapped.last_name}`.trim(),
              attendee_email: mapped.email,
              event_id: mapped.event_id,
              event_title: mapped.event_title,
              venue: 'Aqua Safari Resort Convention Pavilion, Ada Foah',
              dates: 'November 9 - 10, 2026',
              registration_tier: mapped.registration_type_name,
              amount_paid: mapped.total_amount,
              payment_status: mapped.payment_status,
              check_in_status: mapped.check_in_status,
              qr_code_data: JSON.stringify({ reg: mapped.registration_number }),
            },
          },
        }),
      };
    }

    if (pathname === '/registrations' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (!body.first_name || !body.email) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: 'First name and email are required' }),
        };
      }

      const regNumber = body.registration_number || `CIB-${Date.now().toString(36).toUpperCase()}`;

      // Insert into Supabase registrations
      const isUuid = (val?: string) => Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));
      const dbId = isUuid(body.id) ? body.id : undefined;
      let dbEventId = isUuid(body.event_id) ? body.event_id : undefined;
      if (!dbEventId && (body.event_id === 'evt-1' || body.event_id?.includes('30th') || body.event_id?.includes('national-banking'))) {
        dbEventId = 'e1111111-1111-1111-1111-111111111111';
      }

      let dbRegTypeId = isUuid(body.registration_type_id) ? body.registration_type_id : undefined;
      if (!dbRegTypeId) {
        if (body.registration_type_id?.includes('single')) {
          dbRegTypeId = 'd1111111-1111-1111-1111-111111111111';
        } else if (body.registration_type_id?.includes('double')) {
          dbRegTypeId = 'd2222222-2222-2222-2222-222222222222';
        } else if (body.registration_type_id?.includes('member')) {
          dbRegTypeId = 'd3333333-3333-3333-3333-333333333333';
        } else {
          dbRegTypeId = 'd1111111-1111-1111-1111-111111111111';
        }
      }

      const insertPayload: any = {
        registration_number: regNumber,
        first_name: body.first_name,
        last_name: body.last_name || '',
        email: body.email,
        phone: body.phone || '',
        organization: body.organization || '',
        job_title: body.job_title || 'Delegate',
        country: body.country || 'Ghana',
        cib_member_id: body.cib_member_id,
        membership_category: body.membership_category || 'Non-Member',
        attendance_type: body.attendance_type || 'PHYSICAL',
        dietary_requirements: body.dietary_requirements,
        special_assistance: body.special_assistance,
        total_amount: Number(body.total_amount) || 0,
        currency: body.currency || 'GHS',
        payment_status: body.payment_status || 'SUCCESSFUL',
        payment_reference: body.payment_reference || `PAY_${Date.now()}`,
        payment_method: body.payment_method || 'PAYSTACK_CARD',
        check_in_status: body.check_in_status || 'REGISTERED',
      };
      if (dbId) insertPayload.id = dbId;
      if (dbEventId) insertPayload.event_id = dbEventId;
      if (dbRegTypeId) insertPayload.registration_type_id = dbRegTypeId;

      const { data: savedDbReg, error: insErr } = await supabase
        .from('registrations')
        .insert(insertPayload)
        .select('*, registration_types(name), events(title)')
        .single();

      if (insErr) {
        console.error('[Netlify Function] Insert error:', insErr);
      }

      const finalReg = savedDbReg ? mapDbRegistration(savedDbReg) : { ...insertPayload, id: `reg-${Date.now()}` };

      // Try inserting digital ticket
      if (savedDbReg?.id) {
        try {
          await supabase.from('tickets').insert({
            registration_id: savedDbReg.id,
            ticket_code: 'TCK-' + regNumber,
            qr_code_data: JSON.stringify({ reg: regNumber }),
            security_hash: 'hash_' + Date.now(),
            status: finalReg.check_in_status || 'REGISTERED',
          });
        } catch { /* ticket table optional */ }
      }

      // Also trigger confirmation email asynchronously
      dispatchEmail({
        recipient: body.email,
        subject: `Payment Confirmed & Pass Issued: ${body.event_title || '30th National Banking & Ethics Conference 2026'} (Ref: ${regNumber})`,
        htmlContent: buildConfirmationHtml({
          attendeeName: `${body.first_name} ${body.last_name || ''}`.trim(),
          eventTitle: body.event_title || '30th National Banking & Ethics Conference 2026',
          eventDate: 'November 9 - 10, 2026',
          eventVenue: 'Aqua Safari Resort Convention Pavilion, Ada Foah',
          regNumber,
          amount: body.total_amount || 4000,
          reference: body.payment_reference || `PAY_${Date.now()}`,
          paymentMethod: body.payment_method || 'Paystack Electronic Settlement (Cards & Mobile Money)',
          ticketUrl: `https://cibghana.org/events/30th-national-banking-ethics-conference-2026/ticket/${regNumber}`,
          qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=6&data=${encodeURIComponent(regNumber)}`,
        }),
        plainText: `Payment confirmed for ${body.first_name}. Registration Number: ${regNumber}`,
      }).catch((e) => console.warn('Netlify function email dispatch notice:', e));

      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          message: 'Registration created and confirmation email dispatched',
          data: {
            registration: finalReg,
            ticket: {
              id: `tck-${regNumber}`,
              ticket_code: `TCK-${regNumber}`,
              registration_id: finalReg.id,
              registration_number: regNumber,
              attendee_name: `${finalReg.first_name} ${finalReg.last_name}`.trim(),
              attendee_email: finalReg.email,
              event_id: finalReg.event_id,
              event_title: finalReg.event_title,
              venue: 'Aqua Safari Resort Convention Pavilion, Ada Foah',
              dates: 'November 9 - 10, 2026',
              registration_tier: finalReg.registration_type_name,
              amount_paid: finalReg.total_amount,
              payment_status: finalReg.payment_status,
              check_in_status: finalReg.check_in_status,
              qr_code_data: JSON.stringify({ reg: regNumber }),
            },
          },
        }),
      };
    }

    // -------------------------------------------------------------
    // 6. Direct Send Email: /send-email
    // -------------------------------------------------------------
    if (pathname === '/send-email' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const recipient = body.to || body.data?.email;
      if (!recipient) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: 'Recipient email is required' }),
        };
      }

      const d = body.data || {};
      const regNumber = d.registrationNumber || d.registration_number || `CIB-${Date.now().toString(36).toUpperCase()}`;
      const attendeeName = d.attendeeName || `${d.first_name || ''} ${d.last_name || ''}`.trim() || 'Esteemed Delegate';
      const eventTitle = d.eventTitle || '30th National Banking & Ethics Conference 2026';
      const eventDate = d.eventDate || 'November 9 - 10, 2026';
      const eventVenue = d.eventVenue || 'Aqua Safari Resort Convention Pavilion, Ada Foah';
      const amount = d.amount || 4000;
      const reference = d.reference || `PAY_${Date.now()}`;
      const paymentMethod = d.paymentMethod || 'Paystack Electronic Settlement (Cards & Mobile Money)';
      const ticketUrl = d.ticketUrl || `https://cibghana.org/events/30th-national-banking-ethics-conference-2026/ticket/${regNumber}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=6&data=${encodeURIComponent(regNumber)}`;

      const htmlContent = d.html || buildConfirmationHtml({
        attendeeName,
        eventTitle,
        eventDate,
        eventVenue,
        regNumber,
        amount,
        reference,
        paymentMethod,
        ticketUrl,
        qrImageUrl,
      });

      const subject = body.subject || `Payment Confirmed & Pass Issued: ${eventTitle} (Ref: ${regNumber})`;
      const plainText = `
Payment Confirmation & Accreditation Pass
Event: ${eventTitle}
Registration Number: ${regNumber}
Delegate: ${attendeeName}
Amount: ${formatGHS(amount)}
Reference: ${reference}
View Ticket: ${ticketUrl}
      `.trim();

      const dispatchResult = await dispatchEmail({
        recipient,
        subject,
        htmlContent,
        plainText,
      });

      return {
        statusCode: dispatchResult.success ? 200 : 502,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: dispatchResult.success,
          message: dispatchResult.success
            ? `Confirmation email dispatched to ${recipient}`
            : `Email delivery issue: ${dispatchResult.error}`,
          data: dispatchResult,
        }),
      };
    }

    // -------------------------------------------------------------
    // 7. Tickets & Check-In
    // -------------------------------------------------------------
    if (pathname.startsWith('/tickets/') && pathname.endsWith('/check-in') && method === 'POST') {
      const parts = pathname.split('/');
      const identifier = parts[parts.indexOf('tickets') + 1];
      const now = new Date().toISOString();

      await supabase
        .from('registrations')
        .update({ check_in_status: 'CHECKED_IN', check_in_time: now })
        .or(`registration_number.ilike.${identifier},id.eq.${identifier}`);

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          message: `Successfully checked in attendee ${identifier}`,
        }),
      };
    }

    if (pathname.startsWith('/tickets/') && method === 'GET') {
      const identifier = decodeURIComponent(pathname.replace('/tickets/', ''));
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

      let query = supabase.from('registrations').select('*, registration_types(name), events(title)');
      if (isUuid) {
        query = query.eq('id', identifier);
      } else {
        query = query.or(`registration_number.ilike.${identifier},payment_reference.ilike.${identifier}`);
      }

      const { data, error } = await query.maybeSingle();
      if (error || !data) {
        return {
          statusCode: 404,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: false, message: 'Ticket not found' }),
        };
      }

      const mapped = mapDbRegistration(data);
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          success: true,
          data: {
            id: `tck-${mapped.registration_number}`,
            ticket_code: `TCK-${mapped.registration_number}`,
            registration_id: mapped.id,
            registration_number: mapped.registration_number,
            attendee_name: `${mapped.first_name} ${mapped.last_name}`.trim(),
            attendee_email: mapped.email,
            event_id: mapped.event_id,
            event_title: mapped.event_title,
            venue: 'Aqua Safari Resort Convention Pavilion, Ada Foah',
            dates: 'November 9 - 10, 2026',
            registration_tier: mapped.registration_type_name,
            amount_paid: mapped.total_amount,
            payment_status: mapped.payment_status,
            check_in_status: mapped.check_in_status,
            qr_code_data: JSON.stringify({ reg: mapped.registration_number }),
          },
        }),
      };
    }

    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, message: `Route not found: ${method} ${pathname}` }),
    };
  } catch (err: any) {
    console.error('[Netlify Function Exception]:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ success: false, message: err?.message || 'Internal server error' }),
    };
  }
};
