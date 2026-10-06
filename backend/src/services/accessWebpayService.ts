import { config } from '../config/index.js';

export interface AccessWebpayInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface AccessWebpayVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: 'success' | 'failed' | 'abandoned' | 'pending';
    reference: string;
    amount: number;
    currency: string;
    paid_at?: string;
    channel?: string;
    customer?: {
      email: string;
    };
  };
}

export class AccessWebpayService {
  private static isTestOrDemo(apiKey: string): boolean {
    return (
      !apiKey ||
      apiKey.startsWith('demo_') ||
      apiKey.startsWith('test_') ||
      apiKey.includes('your_') ||
      apiKey.length < 10
    );
  }

  /**
   * Initializes a payment on Access Bank Ghana WebPay (or mock if in demo/pending API key mode)
   */
  static async initializePayment(params: {
    email: string;
    amount: number; // in GHS
    reference: string;
    callbackUrl?: string;
    channels?: ('card' | 'mobile_money')[];
  }): Promise<AccessWebpayInitResponse> {
    const { email, amount, reference, callbackUrl, channels } = params;

    const apiKey = config.accessWebpay.apiKey;
    const merchantId = config.accessWebpay.merchantId;
    const gatewayUrl = config.accessWebpay.gatewayUrl;

    // While awaiting bank live API keys, seamlessly use test simulation mode
    if (this.isTestOrDemo(apiKey)) {
      return {
        status: true,
        message: 'Access Bank WebPay checkout initialized (Test/Demo Mode)',
        data: {
          authorization_url: `${config.clientUrl}/ticket/${reference}?status=success&gateway=access_webpay`,
          access_code: `awp_acc_${Date.now()}`,
          reference,
        },
      };
    }

    // Call live Access Bank Ghana WebPay Gateway
    try {
      const response = await fetch(`${gatewayUrl}/checkout/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'X-Merchant-ID': merchantId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchant_id: merchantId,
          email,
          amount,
          reference,
          currency: 'GHS',
          callback_url: callbackUrl || `${config.clientUrl}/payment/callback`,
          channels: channels || ['card', 'mobile_money'],
        }),
      });

      const data = (await response.json()) as AccessWebpayInitResponse;
      return data;
    } catch (error) {
      console.error('[Access WebPay] Gateway initialization error:', error);
      throw new Error('Failed to initialize Access Bank WebPay gateway transaction');
    }
  }

  /**
   * Verifies an Access Bank Ghana WebPay payment reference
   */
  static async verifyPayment(reference: string): Promise<AccessWebpayVerifyResponse> {
    const apiKey = config.accessWebpay.apiKey;
    const merchantId = config.accessWebpay.merchantId;
    const gatewayUrl = config.accessWebpay.gatewayUrl;

    if (this.isTestOrDemo(apiKey)) {
      // Simulation mode: auto-verify references
      return {
        status: true,
        message: 'Verification successful (Access Bank WebPay Test Mode)',
        data: {
          status: 'success',
          reference,
          amount: 50000,
          currency: 'GHS',
          paid_at: new Date().toISOString(),
          channel: 'card',
          customer: {
            email: 'attendee@cibghana.org',
          },
        },
      };
    }

    try {
      const response = await fetch(`${gatewayUrl}/checkout/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'X-Merchant-ID': merchantId,
        },
      });

      const data = (await response.json()) as AccessWebpayVerifyResponse;
      return data;
    } catch (error) {
      console.error('[Access WebPay] Verification error:', error);
      throw new Error('Failed to verify payment reference with Access Bank WebPay');
    }
  }
}
