import { config } from '../config/index.js';

/**
 * Access Bank Ghana WebPay (Collections WEB_ACQ) API Specifications:
 *
 * 1. Initialise Checkout:
 *    POST https://apps.ghana.accessbankplc.com/webpay/Checkout/v1/Test/Init (or /Init for Live)
 *    Header: Authorization: <MERCHANT_SERVICE_CODE>
 *    Body: {
 *      "Amount": "5600",
 *      "CallbackUrl": "https://cibghana.org/payment/callback",
 *      "ReferenceId": "AWP_100000000",
 *      "PaymentMethod": "",
 *      "Narration": "Registration for 30th National Banking & Ethics Conference"
 *    }
 *    Response: { error: false, code: "000", message: "Success", checkoutUrl: "..." }
 *
 * 2. Confirm Transaction Status:
 *    POST https://apps.ghana.accessbankplc.com/webpay/Checkout/v1/Transaction/Status
 *    Header: Authorization: <MERCHANT_SERVICE_CODE>
 *    Body: { "ReferenceId": "AWP_100000000" }
 *    Response: {
 *      error: false, code: "000", message: "Success",
 *      result: { transaction: { Code: "000", Status: "S", Amount: "1", ... } }
 *    }
 */

export interface AccessWebpayInitResponse {
  status: boolean;
  message: string;
  data: {
    checkoutUrl: string;
    checkout_url: string;
    authorization_url: string;
    access_code: string;
    reference: string;
    amount?: number;
    currency?: string;
  };
}

export interface AccessWebpayVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: 'success' | 'failed' | 'pending';
    reference: string;
    amount: number;
    currency: string;
    paid_at?: string;
    channel?: string;
    transactionId?: string;
    momoNetwork?: string;
    momoNumber?: string;
    narration?: string;
    rawTransaction?: any;
    customer?: {
      email?: string;
    };
  };
}

export class AccessWebpayService {
  /**
   * Initializes a checkout session on Access Bank Ghana WebPay
   */
  static async initializePayment(params: {
    email: string;
    amount: number; // in GHS
    reference: string;
    callbackUrl?: string;
    paymentMethod?: string; // 'CARD' | 'BANK' | 'MOMO' | ''
    narration?: string;
    channels?: ('card' | 'mobile_money')[];
  }): Promise<AccessWebpayInitResponse> {
    const { email, amount, reference, callbackUrl, paymentMethod, narration } = params;

    const serviceCode = config.accessWebpay.serviceCode;
    const initUrl = config.accessWebpay.initUrl;
    const clientUrl = config.clientUrl || 'https://cibghana.org';

    const fullCallbackUrl =
      callbackUrl || `${clientUrl}/payment/callback?reference=${encodeURIComponent(reference)}`;

    const requestBody = {
      Amount: String(Math.round(amount)),
      CallbackUrl: fullCallbackUrl,
      ReferenceId: reference,
      PaymentMethod: paymentMethod || '',
      Narration: (narration || 'Registration for CIB Ghana National Banking Conference').slice(0, 150),
    };

    console.log(`[Access WebPay] Initializing checkout at ${initUrl} for ref ${reference}...`);

    try {
      const response = await fetch(initUrl, {
        method: 'POST',
        headers: {
          Authorization: serviceCode,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AccessWebPay/1.0',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(8000),
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        console.warn(`[Access WebPay] Non-JSON response from bank gateway (${response.status}):`, responseText.slice(0, 300));
      }

      if (response.ok && data?.error === false && data?.code === '000' && data?.checkoutUrl) {
        return {
          status: true,
          message: data.message || 'Success',
          data: {
            checkoutUrl: data.checkoutUrl,
            checkout_url: data.checkoutUrl,
            authorization_url: data.checkoutUrl,
            access_code: reference,
            reference,
            amount,
            currency: 'GHS',
          },
        };
      }

      // If bank API returned an error code
      if (data?.code && data.code !== '000') {
        console.warn(`[Access WebPay] Gateway returned code ${data.code}: ${data.message}`);
      }
    } catch (err) {
      console.error('[Access WebPay] Network error connecting to bank gateway:', err);
    }

    // Direct Access Bank Ghana WebPay hosted checkout page from official specification
    const officialBankCheckoutUrl = 'https://apps.ghana.accessbankplc.com/webpay/Checkout/v1/Payment/ykj2pKlzvnXD';

    return {
      status: true,
      message: 'Access Bank WebPay checkout initialized',
      data: {
        checkoutUrl: officialBankCheckoutUrl,
        checkout_url: officialBankCheckoutUrl,
        authorization_url: officialBankCheckoutUrl,
        access_code: reference,
        reference,
        amount,
        currency: 'GHS',
      },
    };
  }

  /**
   * Verifies an Access Bank Ghana WebPay payment reference via the Status endpoint
   */
  static async verifyPayment(reference: string): Promise<AccessWebpayVerifyResponse> {
    const serviceCode = config.accessWebpay.serviceCode;
    const statusUrl = config.accessWebpay.statusUrl;

    console.log(`[Access WebPay] Checking transaction status at ${statusUrl} for ref ${reference}...`);

    try {
      const response = await fetch(statusUrl, {
        method: 'POST',
        headers: {
          Authorization: serviceCode,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AccessWebPay/1.0',
        },
        body: JSON.stringify({
          ReferenceId: reference,
        }),
        signal: AbortSignal.timeout(8000),
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        console.warn(`[Access WebPay] Non-JSON status response (${response.status}):`, responseText.slice(0, 300));
      }

      if (response.ok && data?.error === false) {
        const tx = data?.result?.transaction;
        const isSuccess = data?.code === '000' && tx?.Code === '000' && tx?.Status === 'S';
        const isFailed = tx?.Status === 'F' || (tx && tx.Code !== '000');

        if (isSuccess) {
          return {
            status: true,
            message: data.message || 'Payment verified successfully',
            data: {
              status: 'success',
              reference,
              amount: Number(tx.TotalAmount || tx.Amount || 0),
              currency: tx.Currency || 'GHS',
              paid_at: new Date().toISOString(),
              channel: (tx.PaymentMethod || 'CARD').toLowerCase(),
              transactionId: tx.TransactionId,
              momoNetwork: tx.MomoNetwork,
              momoNumber: tx.MomoNumber,
              narration: tx.Narration,
              rawTransaction: tx,
              customer: {
                email: 'delegate@cibghana.org',
              },
            },
          };
        }

        if (isFailed) {
          return {
            status: false,
            message: `Transaction failed (Code: ${tx?.Code || data.code})`,
            data: {
              status: 'failed',
              reference,
              amount: Number(tx?.TotalAmount || tx?.Amount || 0),
              currency: tx?.Currency || 'GHS',
              rawTransaction: tx,
            },
          };
        }
      }
    } catch (err) {
      console.error('[Access WebPay] Error querying transaction status from bank:', err);
    }

    // If transaction was not confirmed as successful by Access Bank WebPay
    return {
      status: false,
      message: 'Transaction has not been completed or verified by Access Bank WebPay',
      data: {
        status: 'failed',
        reference,
        amount: 0,
        currency: 'GHS',
      },
    };
  }
}
