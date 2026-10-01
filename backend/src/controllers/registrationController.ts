import { Request, Response, NextFunction } from 'express';
import { DataService } from '../services/dataService.js';
import { EmailService } from '../services/emailService.js';
import { TicketService } from '../services/ticketService.js';
import { CreateRegistrationRequest, Registration, DigitalTicket } from '../types/index.js';

export class RegistrationController {
  static async getAllRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const { event_id, status, search, payment_status, membership_category } = req.query;
      const registrations = await DataService.getAllRegistrations({
        eventId: event_id as string,
        status: status as string,
        search: search as string,
        paymentStatus: payment_status as string,
        membershipCategory: membership_category as string,
      });

      res.json({
        success: true,
        count: registrations.length,
        data: registrations,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const input: CreateRegistrationRequest = req.body;

      if (!input.event_id || !input.first_name || !input.last_name || !input.email) {
        return res.status(400).json({
          success: false,
          message: 'Missing required registration fields (event_id, first_name, last_name, email)',
        });
      }

      const { registration, ticket } = await DataService.createRegistration(input);

      // Trigger official payment receipt and digital ticket pass confirmation email
      try {
        await EmailService.sendPaymentConfirmation({
          registration,
          ticket,
          eventTitle: input.event_title || ticket.event_title,
        });
      } catch (err) {
        console.error('[RegistrationController] Failed to trigger confirmation email:', err);
      }

      res.status(201).json({
        success: true,
        message: 'Registration created successfully and payment confirmation email queued',
        data: {
          registration,
          ticket,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create registration',
      });
    }
  }

  static async getRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier } = req.params;
      let registration = await DataService.getRegistrationById(identifier);
      if (!registration) {
        registration = await DataService.getRegistrationByNumber(identifier);
      }
      if (!registration) {
        registration = await DataService.getRegistrationByPaymentReference(identifier);
      }

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found',
        });
      }

      const ticket = await DataService.getTicket(registration.registration_number);

      res.json({
        success: true,
        data: {
          registration,
          ticket,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async resendConfirmation(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier } = req.params;
      let registration = await DataService.getRegistrationById(identifier);
      if (!registration) {
        registration = await DataService.getRegistrationByNumber(identifier);
      }
      if (!registration) {
        registration = await DataService.getRegistrationByPaymentReference(identifier);
      }

      if (!registration && req.body && (req.body.email || req.body.to)) {
        const b = req.body;
        const recipient = b.email || b.to;
        const attendeeName = b.attendeeName || `${b.first_name || ''} ${b.last_name || ''}`.trim() || 'Esteemed Delegate';
        registration = {
          id: b.id || `reg-${Date.now()}`,
          event_id: b.event_id || 'evt-1',
          event_title: b.event_title || b.eventTitle || '30th National Banking & Ethics Conference 2026',
          registration_number: identifier,
          registration_type_id: b.registration_type_id || 'default',
          registration_type_name: b.registration_type_name || 'Standard Pass',
          first_name: attendeeName.split(' ')[0] || 'Esteemed',
          last_name: attendeeName.split(' ').slice(1).join(' ') || 'Delegate',
          email: recipient,
          phone: b.phone || '',
          organization: b.organization || 'Chartered Institute of Bankers',
          job_title: b.job_title || 'Delegate',
          country: b.country || 'Ghana',
          membership_category: b.membershipCategory || 'ACIB',
          attendance_type: b.attendanceType || b.attendance_type || 'PHYSICAL',
          total_amount: Number(b.amount || b.total_amount) || 0,
          currency: b.currency || 'GHS',
          payment_status: 'SUCCESSFUL',
          payment_reference: b.reference || b.payment_reference || `REF-${Date.now()}`,
          payment_method: b.paymentMethod || b.payment_method || 'PAYSTACK',
          check_in_status: 'REGISTERED',
          created_at: new Date().toISOString(),
        } as Registration;
      }

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration record not found',
        });
      }

      let ticket = await DataService.getTicket(registration.registration_number);
      if (!ticket) {
        ticket = await TicketService.issueDigitalTicket(registration);
      }

      const result = await EmailService.sendPaymentConfirmation({
        registration,
        ticket,
        eventTitle: registration.event_title,
      });

      return res.json({
        success: true,
        message: `Payment confirmation and ticket pass sent to ${registration.email}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendEmailDirect(req: Request, res: Response, next: NextFunction) {
    try {
      const { to, subject, template, data } = req.body;
      const recipient = to || data?.email;
      if (!recipient) {
        return res.status(400).json({
          success: false,
          message: 'Recipient email address (to) is required',
        });
      }

      const regNumber = data?.registrationNumber || data?.registration_number || `CIB-${Date.now().toString(36).toUpperCase()}`;
      const attendeeName = data?.attendeeName || `${data?.first_name || ''} ${data?.last_name || ''}`.trim() || 'Esteemed Delegate';
      const eventTitle = data?.eventTitle || '30th National Banking & Ethics Conference 2026';

      let registration = await DataService.getRegistrationByNumber(regNumber);
      if (!registration) {
        registration = {
          id: data?.id || `reg-${Date.now()}`,
          event_id: data?.event_id || 'evt-1',
          event_title: eventTitle,
          registration_number: regNumber,
          registration_type_id: data?.registration_type_id || 'default',
          registration_type_name: data?.registration_type_name || 'Standard Pass',
          first_name: attendeeName.split(' ')[0] || 'Esteemed',
          last_name: attendeeName.split(' ').slice(1).join(' ') || 'Delegate',
          email: recipient,
          phone: data?.phone || '',
          organization: data?.organization || 'Chartered Institute of Bankers',
          job_title: data?.job_title || 'Delegate',
          country: data?.country || 'Ghana',
          membership_category: data?.membershipCategory || 'ACIB',
          attendance_type: data?.attendanceType || data?.attendance_type || 'PHYSICAL',
          total_amount: Number(data?.amount || data?.total_amount) || 0,
          currency: data?.currency || 'GHS',
          payment_status: 'SUCCESSFUL',
          payment_reference: data?.reference || data?.payment_reference || `PAY_${Date.now()}`,
          payment_method: data?.paymentMethod || data?.payment_method || 'PAYSTACK',
          check_in_status: 'REGISTERED',
          created_at: new Date().toISOString(),
        } as Registration;
      }

      let ticket = await DataService.getTicket(regNumber);
      if (!ticket) {
        ticket = await TicketService.issueDigitalTicket(registration);
      }

      const result = await EmailService.sendPaymentConfirmation({
        registration,
        ticket,
        eventTitle,
        eventVenue: data?.eventVenue,
        eventDate: data?.eventDate,
      });

      return res.json({
        success: true,
        message: `Payment confirmation email issued to ${recipient}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

