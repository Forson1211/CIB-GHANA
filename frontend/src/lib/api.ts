import { EventItem, Registration, DigitalTicket, CreateRegistrationRequest, Speaker, Sponsor } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiClient {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: options?.signal || AbortSignal.timeout(6000),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || `Request failed with status ${response.status}`);
      }
      return json;
    } catch (error) {
      console.warn(`[ApiClient] Failed to reach ${url}:`, error);
      throw error;
    }
  }

  // Health check
  static async checkHealth(): Promise<{ status: string; service: string; version: string; uptime: number }> {
    return this.request('/health');
  }

  // Events
  static async getEvents(params?: { category?: string; search?: string; status?: string }): Promise<{
    success: boolean;
    data: EventItem[];
  }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/events${qs}`);
  }

  static async getEvent(slugOrId: string): Promise<{ success: boolean; data: EventItem }> {
    return this.request(`/events/${encodeURIComponent(slugOrId)}`);
  }

  static async createEvent(eventData: Partial<EventItem>): Promise<{ success: boolean; data: EventItem }> {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  static async updateEvent(id: string, updates: Partial<EventItem>): Promise<{ success: boolean; data: EventItem }> {
    return this.request(`/events/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteEvent(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/events/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // Registrations & Digital Passes
  static async getRegistrations(params?: {
    event_id?: string;
    search?: string;
    status?: string;
    payment_status?: string;
    membership_category?: string;
  }): Promise<{
    success: boolean;
    count: number;
    data: Registration[];
  }> {
    const query = new URLSearchParams();
    if (params?.event_id) query.append('event_id', params.event_id);
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.payment_status) query.append('payment_status', params.payment_status);
    if (params?.membership_category) query.append('membership_category', params.membership_category);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/registrations${qs}`);
  }

  static async createRegistration(payload: CreateRegistrationRequest): Promise<{
    success: boolean;
    data: {
      registration: Registration;
      ticket: DigitalTicket;
    };
  }> {
    return this.request('/registrations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async getRegistration(identifier: string): Promise<{
    success: boolean;
    data: {
      registration: Registration;
      ticket?: DigitalTicket;
    };
  }> {
    return this.request(`/registrations/${encodeURIComponent(identifier)}`);
  }

  static async sendEmail(payload: {
    to: string;
    subject?: string;
    template?: string;
    data: Record<string, any>;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    return this.request('/send-email', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async resendConfirmationEmail(identifier: string, payload?: Record<string, any>): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return this.request(`/registrations/${encodeURIComponent(identifier)}/resend-confirmation`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  static async getTicket(identifier: string): Promise<{ success: boolean; data: DigitalTicket }> {
    return this.request(`/tickets/${encodeURIComponent(identifier)}`);
  }

  static async verifyQrPass(qrData: string, eventId?: string): Promise<{
    success: boolean;
    valid: boolean;
    data: DigitalTicket;
    message?: string;
  }> {
    return this.request('/tickets/verify-qr', {
      method: 'POST',
      body: JSON.stringify({ qr_data: qrData, event_id: eventId }),
    });
  }

  static async checkInAttendee(ticketIdentifier: string): Promise<{
    success: boolean;
    message: string;
    data?: DigitalTicket;
  }> {
    return this.request(`/tickets/${encodeURIComponent(ticketIdentifier)}/check-in`, {
      method: 'POST',
    });
  }

  // Payments (Access Bank Ghana WebPay)
  static async initializePayment(params: {
    registration_id: string;
    email: string;
    amount: number;
    channels?: ('card' | 'mobile_money')[];
    callback_url?: string;
  }): Promise<{
    success: boolean;
    data: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  }> {
    return this.request('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  static async verifyPayment(reference: string): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    return this.request(`/payments/verify/${encodeURIComponent(reference)}`);
  }

  // Payments (Access Bank WebPay – hosted checkout)
  static async getPaymentConfig(): Promise<{
    success: boolean;
    data: { provider: 'ACCESS_WEBPAY'; enabled: boolean; environment: 'sandbox' | 'live'; currency: string };
  }> {
    return this.request('/payments/config');
  }

  static async initializeWebpayCheckout(payload: Record<string, unknown>): Promise<{
    success: boolean;
    message?: string;
    data: {
      checkout_url: string;
      reference: string;
      registration_number: string;
      amount: number;
      currency: string;
    };
  }> {
    return this.request('/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async verifyWebpayPayment(reference: string): Promise<{
    success: boolean;
    message?: string;
    data: {
      status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
      reference: string;
      amount?: number;
      currency?: string;
      channel?: string;
      payment_method?: string;
      amount_mismatch?: boolean;
      registration: Registration;
      ticket?: any;
      gateway?: any;
    };
  }> {
    return this.request(`/payments/verify/${encodeURIComponent(reference)}`);
  }

  // Admin stats
  static async getAdminStats(): Promise<{
    success: boolean;
    data: {
      total_events: number;
      active_events: number;
      total_registrations: number;
      paid_registrations: number;
      total_revenue_ghs: number;
      checked_in_attendees: number;
    };
  }> {
    return this.request('/admin/stats');
  }

  // Speakers & Photos
  static async uploadSpeakerPhoto(image: string, speakerId: string): Promise<{ success: boolean; url: string }> {
    return this.request('/speakers/upload', {
      method: 'POST',
      body: JSON.stringify({ image, speakerId }),
    });
  }

  static async getSpeakers(): Promise<{ success: boolean; data: Speaker[] }> {
    return this.request('/speakers');
  }

  static async saveSpeaker(speaker: Partial<Speaker>): Promise<{ success: boolean; data: Speaker }> {
    return this.request('/speakers', {
      method: 'POST',
      body: JSON.stringify(speaker),
    });
  }

  static async deleteSpeaker(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/speakers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // Sponsors & Corporate Members
  static async uploadSponsorLogo(image: string, sponsorId: string): Promise<{ success: boolean; url: string }> {
    return this.request('/sponsors/upload', {
      method: 'POST',
      body: JSON.stringify({ image, sponsorId }),
    });
  }

  static async getSponsors(): Promise<{ success: boolean; data: Sponsor[] }> {
    return this.request('/sponsors');
  }

  static async saveSponsor(sponsor: Partial<Sponsor>): Promise<{ success: boolean; data: Sponsor }> {
    return this.request('/sponsors', {
      method: 'POST',
      body: JSON.stringify(sponsor),
    });
  }

  static async deleteSponsor(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/sponsors/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}
