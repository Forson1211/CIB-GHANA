import nodemailer from 'nodemailer';

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
const FROM_EMAIL = process.env.FROM_EMAIL || 'Chartered Institute of Bankers, Ghana <events@cibgh.org>';
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || 'events@cibgh.org';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ijfjuezgvroyhtwcnlrx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

function formatGHS(amount: number | string): string {
  return `GHS ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
      console.log(`[Netlify Function] Delivered via Gmail SMTP to ${options.recipient} (ID: ${info.messageId})`);
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

  // Strip prefixes
  let pathname = event.path
    .replace(/^\/\.netlify\/functions\/api/, '')
    .replace(/^\/api/, '');
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;

  // 1. Health check
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

  // 2. Direct Send Email
  if (pathname === '/send-email' && event.httpMethod === 'POST') {
    try {
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
            ? (dispatchResult.isSandboxFallback
                ? `Pass generated for ${recipient}; delivered to developer inbox (${dispatchResult.deliveredTo}) in Resend sandbox mode.`
                : `Confirmation email dispatched to ${recipient}`)
            : `Email delivery issue: ${dispatchResult.error}`,
          data: dispatchResult,
        }),
      };
    } catch (e: any) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, message: e?.message || 'Internal server error' }),
      };
    }
  }

  // 3. Resend Confirmation Email: /registrations/:identifier/resend-confirmation
  if (pathname.includes('/resend-confirmation') && event.httpMethod === 'POST') {
    try {
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
    } catch (e: any) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, message: e?.message || 'Internal server error' }),
      };
    }
  }

  // 4. Save Registration to Supabase directly: /registrations
  if (pathname === '/registrations' && event.httpMethod === 'POST') {
    try {
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
      const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/registrations`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          registration_number: regNumber,
          first_name: body.first_name,
          last_name: body.last_name || '',
          email: body.email,
          phone: body.phone || '',
          organization: body.organization || '',
          job_title: body.job_title || 'Delegate',
          country: body.country || 'Ghana',
          cib_member_id: body.cib_member_id,
          attendance_type: body.attendance_type || 'PHYSICAL',
          dietary_requirements: body.dietary_requirements,
          special_assistance: body.special_assistance,
          total_amount: body.total_amount || 0,
          currency: body.currency || 'GHS',
          payment_status: body.payment_status || 'SUCCESSFUL',
          payment_reference: body.payment_reference || `PAY_${Date.now()}`,
          payment_method: body.payment_method || 'PAYSTACK_CARD',
          check_in_status: body.check_in_status || 'REGISTERED',
          event_id: body.event_id || 'e1111111-1111-1111-1111-111111111111',
          registration_type_id: body.registration_type_id || 'd1111111-1111-1111-1111-111111111111',
        }),
      });

      const sbData: any = await sbRes.json();
      const savedReg = Array.isArray(sbData) ? sbData[0] : sbData;

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
            registration: savedReg || body,
          },
        }),
      };
    } catch (e: any) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: false, message: e?.message || 'Internal server error' }),
      };
    }
  }

  return {
    statusCode: 404,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: false, message: `Route not found: ${event.httpMethod} ${event.path}` }),
  };
};
