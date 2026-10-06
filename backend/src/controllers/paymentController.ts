import { Request, Response, NextFunction } from 'express';
import { AccessWebpayService } from '../services/accessWebpayService.js';
import { DataService } from '../services/dataService.js';
import { EmailService } from '../services/emailService.js';

export class PaymentController {
  static async getConfig(req: Request, res: Response) {
    const apiKey = (process.env.ACCESS_WEBPAY_API_KEY || '').trim();
    const isLive = Boolean(
      apiKey &&
      !apiKey.startsWith('demo_') &&
      !apiKey.startsWith('test_') &&
      apiKey.length > 10
    );
    res.json({
      success: true,
      data: {
        provider: 'ACCESS_WEBPAY',
        enabled: isLive,
        environment: isLive ? 'live' : 'sandbox',
        currency: 'GHS',
      },
    });
  }

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

      const reference = `AWP_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const webpayRes = await AccessWebpayService.initializePayment({
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
        data: webpayRes.data,
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

      const verification = await AccessWebpayService.verifyPayment(reference);

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
          message: 'Access Bank WebPay payment verified and confirmation receipt issued',
          data: verification.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Access Bank WebPay verification failed or status not successful',
          data: verification.data,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    // Acknowledge Access Bank WebPay webhook immediately
    const event = req.body;
    console.log(`[Access WebPay Webhook] Received event:`, event?.event || event?.status);

    if (event?.event === 'charge.success' || event?.status === 'SUCCESSFUL' || event?.status === 'success') {
      const reference = event.data?.reference || event.reference;
      if (reference) {
        const ticket = await DataService.getTicket(reference);
        const registration = await DataService.getRegistrationByPaymentReference(reference);
        if (registration && ticket) {
          await DataService.updatePaymentStatus(registration.id, 'SUCCESSFUL', reference);
          EmailService.sendPaymentConfirmation({
            registration,
            ticket,
            eventTitle: registration.event_title || ticket.event_title,
          }).catch((e) => console.error('[Access WebPay Webhook] Email dispatch notice:', e));
        } else if (ticket) {
          await DataService.updatePaymentStatus(ticket.registration_id, 'SUCCESSFUL', reference);
          EmailService.sendTicketConfirmation(ticket).catch((e) => console.error(e));
        }
      }
    }

    res.status(200).send('Webhook processed');
  }
}
