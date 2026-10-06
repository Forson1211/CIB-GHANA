import { Request, Response, NextFunction } from 'express';
import { AccessWebpayService } from '../services/accessWebpayService.js';
import { DataService } from '../services/dataService.js';
import { EmailService } from '../services/emailService.js';
import { config } from '../config/index.js';

const PRICE_TABLE = {
  member: { SINGLE: 5600, DOUBLE: 4000, CONFERENCE_ONLY: 2000 },
  nonMember: { SINGLE: 6000, DOUBLE: 4600, CONFERENCE_ONLY: 2500 },
};

function computePrice(pkg: string, membershipCategory: string): number {
  const isMember = (membershipCategory || 'Non-Member') !== 'Non-Member';
  const table = isMember ? PRICE_TABLE.member : PRICE_TABLE.nonMember;
  const key = pkg as keyof typeof table;
  return table[key] || 5600;
}

export class PaymentController {
  static async getConfig(req: Request, res: Response) {
    res.json({
      success: true,
      data: {
        provider: 'ACCESS_WEBPAY',
        service: config.accessWebpay.merchantService,
        enabled: true,
        environment: config.accessWebpay.isTest ? 'test' : 'live',
        currency: 'GHS',
      },
    });
  }

  static async initializePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const clientUrl = config.clientUrl || `${req.protocol}://${req.get('host')}`;

      // Mode A: Hosted checkout initiated from Register page (creates pending registration)
      if (body.package && body.first_name && body.email) {
        const pkg = String(body.package).toUpperCase();
        const membershipCategory = body.membership_category || 'Non-Member';
        const amount = computePrice(pkg, membershipCategory);
        const reference = `AWP_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
        const regNumber = `CIB-${Date.now().toString(36).toUpperCase()}`;

        const regData: any = {
          registration_number: regNumber,
          event_id: body.event_id || 'e1111111-1111-1111-1111-111111111111',
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
          currency: 'GHS',
          payment_status: 'PENDING',
          payment_reference: reference,
          payment_method: 'ACCESS_WEBPAY',
          check_in_status: 'REGISTERED',
        };

        const created = await DataService.createRegistration(regData);
        const createdReg = created.registration;

        const callbackUrl =
          body.callback_url || `${clientUrl}/payment/callback?referenceId=${encodeURIComponent(reference)}`;

        const webpayRes = await AccessWebpayService.initializePayment({
          email: regData.email,
          amount,
          reference,
          callbackUrl,
          paymentMethod: body.payment_method || '',
          narration: `${body.event_title || 'CIB Ghana Conference'} - ${pkg}`,
        });

        return res.json({
          success: true,
          data: {
            checkout_url: webpayRes.data.checkoutUrl,
            checkoutUrl: webpayRes.data.checkoutUrl,
            authorization_url: webpayRes.data.checkoutUrl,
            reference,
            registration_number: regNumber,
            registration_id: createdReg.id,
            amount,
            currency: 'GHS',
          },
        });
      }

      // Mode B: Existing registration checkout (from Modal or direct ID)
      const { registration_id, email, amount, callback_url, channels, payment_method, narration } = body;

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
      const fullCallbackUrl =
        callback_url || `${clientUrl}/payment/callback?referenceId=${encodeURIComponent(reference)}`;

      const webpayRes = await AccessWebpayService.initializePayment({
        email,
        amount,
        reference,
        callbackUrl: fullCallbackUrl,
        paymentMethod: payment_method || '',
        narration: narration || `Registration for ${registration.event_title || 'CIB Ghana Conference'}`,
        channels,
      });

      // Update registration with the payment reference
      await DataService.updatePaymentStatus(registration_id, 'PROCESSING', reference);

      return res.json({
        success: true,
        data: {
          ...webpayRes.data,
          reference,
          registration_number: registration.registration_number,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const reference = req.params.reference || (req.query.reference as string) || (req.query.referenceId as string);

      if (!reference) {
        return res.status(400).json({
          success: false,
          message: 'Reference is required for payment verification',
        });
      }

      const verification = await AccessWebpayService.verifyPayment(reference);

      if (verification.data && verification.data.status === 'success') {
        // Look up ticket and registration by reference
        let registration = await DataService.getRegistrationByPaymentReference(reference);
        let ticket = await DataService.getTicket(reference);

        if (registration) {
          await DataService.updatePaymentStatus(registration.id, 'SUCCESSFUL', reference);
          if (!ticket) {
            ticket = await DataService.getTicket(registration.registration_number);
          }

          if (ticket) {
            try {
              await EmailService.sendPaymentConfirmation({
                registration,
                ticket,
                eventTitle: registration.event_title || '30th National Banking & Ethics Conference',
              });
            } catch (e) {
              console.error('[PaymentController] Email dispatch notice:', e);
            }
          }

          // Fetch fresh registration
          registration = await DataService.getRegistrationById(registration.id);
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
          data: {
            status: 'SUCCESSFUL',
            reference,
            amount: verification.data.amount,
            registration,
            ticket,
            gateway: verification.data,
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Access Bank WebPay verification failed or status not successful',
          data: {
            status: 'FAILED',
            reference,
            gateway: verification.data,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    const event = req.body;
    console.log(`[Access WebPay Webhook] Received notification:`, event);

    const reference =
      event?.ReferenceId ||
      event?.referenceId ||
      event?.reference ||
      event?.data?.reference ||
      event?.result?.transaction?.MerchantExtRef;

    if (reference) {
      const ticket = await DataService.getTicket(reference);
      const registration = await DataService.getRegistrationByPaymentReference(reference);
      if (registration) {
        await DataService.updatePaymentStatus(registration.id, 'SUCCESSFUL', reference);
        if (ticket) {
          EmailService.sendPaymentConfirmation({
            registration,
            ticket,
            eventTitle: registration.event_title || '30th National Banking & Ethics Conference',
          }).catch((e) => console.error('[Access WebPay Webhook] Email notice:', e));
        }
      } else if (ticket) {
        await DataService.updatePaymentStatus(ticket.registration_id, 'SUCCESSFUL', reference);
        EmailService.sendTicketConfirmation(ticket).catch((e) => console.error(e));
      }
    }

    res.status(200).send('Webhook processed');
  }
}
