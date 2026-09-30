// @ts-nocheck
// =========================================================
// SUPABASE EDGE FUNCTION: send-ticket-email
// Dispatches instant digital ticket passes with QR codes
// Triggered on new registrations or invoked directly via API.
// =========================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "events@cibghana.org";

interface RegistrationPayload {
  record?: {
    id: string;
    registration_number: string;
    first_name: string;
    last_name: string;
    email: string;
    organization?: string;
    attendance_type?: string;
    membership_category?: string;
    total_amount?: number;
    payment_status?: string;
    event_id: string;
    special_assistance?: string;
  };
  event_title?: string;
  event_venue?: string;
  event_date?: string;
  ticket_url?: string;
}

serve(async (req: Request) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const payload: any = await req.json();
    const reg: any = payload.record || payload;

    const email = reg.email;
    const name = `${reg.first_name || ""} ${reg.last_name || ""}`.trim() || "Esteemed Delegate";
    const regNumber = reg.registration_number || "CIB-CONF-2026";
    const eventTitle = payload.event_title || "30th National Banking & Ethics Conference 2026";
    const eventVenue = payload.event_venue || "Aqua Safari Resort, Ada Foah";
    const eventDate = payload.event_date || "November 9 - 10, 2026";
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(regNumber)}`;
    const ticketUrl = payload.ticket_url || `https://cibghana-events.com/events/30th-national-banking-ethics-conference-2026/ticket/${regNumber}`;

    if (!email) {
      return new Response(JSON.stringify({ error: "Missing recipient email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Event Pass - Chartered Institute of Bankers, Ghana</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 0px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.06); overflow: hidden; }
          .header { background: #1B7E3E; color: #ffffff; padding: 36px 28px; text-align: center; }
          .badge { display: inline-block; padding: 4px 14px; background: rgba(255,255,255,0.18); color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px; }
          .title { font-size: 24px; font-weight: 900; margin: 0; line-height: 1.25; }
          .subtitle { font-size: 13px; opacity: 0.9; margin: 8px 0 0 0; }
          .content { padding: 32px 28px; }
          .ticket-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #1B7E3E; padding: 20px; margin: 24px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
          .row:last-child { margin-bottom: 0; }
          .label { color: #64748b; font-weight: 600; }
          .val { font-weight: 800; color: #0f172a; text-align: right; }
          .qr-wrapper { text-align: center; padding: 24px; background: #ffffff; border: 1px dashed #cbd5e1; margin: 24px 0; }
          .qr-img { width: 170px; height: 170px; display: block; margin: 0 auto; }
          .cta-btn { display: block; width: fit-content; margin: 28px auto 0 auto; background: #1B7E3E; color: #ffffff !important; padding: 14px 32px; font-size: 14px; font-weight: 800; text-decoration: none; letter-spacing: 0.5px; text-transform: uppercase; }
          .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="badge">Official Digital Pass</div>
            <h1 class="title">${eventTitle}</h1>
            <p class="subtitle">Chartered Institute of Bankers, Ghana</p>
          </div>
          <div class="content">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Your registration for the <strong>${eventTitle}</strong> is successfully confirmed. Please keep this email and present your digital QR code upon arrival at Aqua Safari Resort for instant accreditation.</p>
            
            <div class="ticket-box">
              <div class="row">
                <span class="label">Pass Number:</span>
                <span class="val" style="color: #1B7E3E; font-family: monospace; font-size: 16px;">${regNumber}</span>
              </div>
              <div class="row">
                <span class="label">Attendee:</span>
                <span class="val">${name}</span>
              </div>
              <div class="row">
                <span class="label">Organization:</span>
                <span class="val">${reg.organization || "Chartered Banking Delegate"}</span>
              </div>
              <div class="row">
                <span class="label">Dates:</span>
                <span class="val">${eventDate}</span>
              </div>
              <div class="row">
                <span class="label">Venue:</span>
                <span class="val">${eventVenue}</span>
              </div>
            </div>

            <div class="qr-wrapper">
              <img src="${qrCodeUrl}" alt="Digital Pass QR Code" class="qr-img" />
              <p style="font-size: 12px; color: #64748b; margin: 12px 0 0 0; font-weight: 600;">Scan at event registration desk for instant accreditation</p>
            </div>

            <a href="${ticketUrl}" class="cta-btn">View Live Ticket Pass</a>
          </div>
          <div class="footer">
            <p>Chartered Institute of Bankers, Ghana &bull; Okponglo-East Legon, Trinity Avenue, Accra</p>
            <p style="margin-top: 4px;">Inquiries: info@cibgh.org | +233 (0) 302 543 456</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Dispatch via Resend API if API Key is configured
    if (RESEND_API_KEY && !RESEND_API_KEY.includes("your_resend")) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: email,
          subject: `Pass Confirmed: ${eventTitle} (Ref: ${regNumber})`,
          html: emailHtml,
        }),
      });

      const resendData = await resendRes.json();
      return new Response(JSON.stringify({ success: true, resend: resendData }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // In local/test mode, return simulation success
    console.log(`[Edge Function send-ticket-email] Instant email prepared for: ${email} (${regNumber})`);
    return new Response(
      JSON.stringify({
        success: true,
        simulated: true,
        message: `Instant email pass generated for ${email}`,
        registration_number: regNumber,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to process email" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
