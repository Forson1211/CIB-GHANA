import { Request, Response, NextFunction } from 'express';
import { PaystackService } from '../services/paystackService.js';
import { DataService } from '../services/dataService.js';
import { EmailService } from '../services/emailService.js';

export class PaymentController {
  static async initializePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { registration_id, email, amount, callback_url, channels } = req.body;

      if (!registration_id || !email || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters (registration_id, email, amount)',
        });
      }

      const registration = await DataService.getRegistrationById(registration_id);
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration record not found',
        });
      }

      const reference = `T${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const paystackRes = await PaystackService.initializePayment({
        email,
        amount,
        reference,
        callbackUrl: callback_url,
        channels,
      });

      // Update registration with the payment reference
      await DataService.updatePaymentStatus(registration_id, 'PROCESSING', reference);

      res.json({
        success: true,
        data: paystackRes.data,
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { reference } = req.params;

      if (!reference) {
        return res.status(400).json({
          success: false,
          message: 'Reference is required for payment verification',
        });
      }

      const verification = await PaystackService.verifyPayment(reference);

      if (verification.data && verification.data.status === 'success') {
        // Look up ticket and registration by reference
        const ticket = await DataService.getTicket(reference);
        const registration = await DataService.getRegistrationByPaymentReference(reference);

        if (registration && ticket) {
          await DataService.updatePaymentStatus(registration.id, 'SUCCESSFUL', reference);
          try {
            await EmailService.sendPaymentConfirmation({
              registration,
              ticket,
              eventTitle: registration.event_title || ticket.event_title,
            });
          } catch (e) {
            console.error('[PaymentController] Email dispatch notice:', e);
          }
        } else if (ticket) {
          await DataService.updatePaymentStatus(ticket.registration_id, 'SUCCESSFUL', reference);
          try {
            await EmailService.sendTicketConfirmation(ticket);
          } catch (e) {
            console.error(e);
          }
        }

        return res.json({
          success: true,
          message: 'Payment successfully verified and confirmation receipt issued',
          data: verification.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed or status not successful',
          data: verification.data,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    // Acknowledge Paystack webhook immediately
    const event = req.body;
    console.log(`[Paystack Webhook] Received event: ${event?.event}`);

    if (event?.event === 'charge.success') {
      const reference = event.data?.reference;
      if (reference) {
        const ticket = await DataService.getTicket(reference);
        const registration = await DataService.getRegistrationByPaymentReference(reference);
        if (registration && ticket) {
          await DataService.updatePaymentStatus(registration.id, 'SUCCESSFUL', reference);
          EmailService.sendPaymentConfirmation({
            registration,
            ticket,
            eventTitle: registration.event_title || ticket.event_title,
          }).catch((e) => console.error('[Paystack Webhook] Email dispatch notice:', e));
        } else if (ticket) {
          await DataService.updatePaymentStatus(ticket.registration_id, 'SUCCESSFUL', reference);
          EmailService.sendTicketConfirmation(ticket).catch((e) => console.error(e));
        }
      }
    }

    res.status(200).send('Webhook processed');
  }
}
