import QRCode from 'qrcode';
import crypto from 'crypto';
import { DigitalTicket, Registration, EventItem } from '../types/index.js';

export class TicketService {
  /**
   * Generates a unique CIB registration code (e.g. CIB-2026-A8F29)
   */
  static generateRegistrationNumber(prefix = 'CIB-2026'): string {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${randomHex}`;
  }

  /**
   * Generates a tamper-proof digital security hash
   */
  static generateSecurityHash(registrationNumber: string, email: string): string {
    return crypto
      .createHash('sha256')
      .update(`${registrationNumber}:${email}:CIB_GHANA_SECRET_KEY`)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase();
  }

  /**
   * Creates a high-resolution QR code data URL containing verification payload
   */
  static async generateQrCodeDataUrl(payload: object): Promise<string> {
    const dataString = JSON.stringify(payload);
    try {
      return await QRCode.toDataURL(dataString, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
        color: {
          dark: '#03254C', // CIB primary navy
          light: '#FFFFFF',
        },
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
      return '';
    }
  }

  /**
   * Builds a DigitalTicket object from registration and event details
   */
  static async issueDigitalTicket(
    registration: Registration,
    event?: EventItem
  ): Promise<DigitalTicket> {
    const eventTitle = event?.title || registration.event_title || '30th National Banking & Ethics Conference 2026';
    const eventVenue = event?.venue || event?.location || 'Aqua Safari Resort Convention Pavilion, Ada Foah';
    const eventDate = event?.start_date
      ? (event.end_date && event.end_date !== event.start_date ? `${event.start_date} to ${event.end_date}` : event.start_date)
      : 'November 9 - 10, 2026';
    const eventId = event?.id || registration.event_id || 'evt-1';

    const securityHash = this.generateSecurityHash(
      registration.registration_number,
      registration.email
    );

    const qrPayload = {
      reg_num: registration.registration_number,
      reg_id: registration.id,
      event_id: eventId,
      attendee: `${registration.first_name} ${registration.last_name}`,
      org: registration.organization,
      tier: registration.registration_type_name,
      hash: securityHash,
      issued_at: new Date().toISOString(),
    };

    const qrCodeDataUrl = await this.generateQrCodeDataUrl(qrPayload);

    const ticket: DigitalTicket = {
      id: `tkt-${registration.id}`,
      registration_id: registration.id,
      registration_number: registration.registration_number,
      event_id: eventId,
      event_title: eventTitle,
      event_date: eventDate,
      event_venue: eventVenue,
      attendee_name: `${registration.first_name} ${registration.last_name}`,
      attendee_email: registration.email,
      organization: registration.organization,
      registration_tier: registration.registration_type_name,
      attendance_type: registration.attendance_type,
      qr_code_data: qrCodeDataUrl,
      security_hash: securityHash,
      issue_date: new Date().toISOString(),
      check_in_status: registration.check_in_status,
    };

    return ticket;
  }
}
