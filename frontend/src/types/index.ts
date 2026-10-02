export type UserRole = 'SUPER_ADMIN' | 'EVENT_ADMIN' | 'STAFF' | 'ATTENDEE';

export type EventStatus = 
  | 'DRAFT' 
  | 'UPCOMING' 
  | 'OPEN_FOR_REGISTRATION' 
  | 'REGISTRATION_CLOSED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type AttendanceType = 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';

export type CheckInStatus = 'REGISTERED' | 'CHECKED_IN' | 'CANCELLED';

export type SponsorType = 'SPONSOR' | 'CORPORATE_MEMBER' | 'PARTNER';
export type SponsorTier = 'SPONSOR' | 'CORPORATE_MEMBER' | 'PARTNER' | 'PLATINUM' | 'GOLD' | 'SILVER' | 'ACADEMIC';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  organization?: string;
  job_title?: string;
  country?: string;
  cib_member_id?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
}

export type SpeakerType = 'KEYNOTE' | 'PANEL';

export interface Speaker {
  id: string;
  name: string;
  slug: string;
  position: string;
  organization: string;
  country: string;
  photo_url: string;
  biography: string;
  expertise: string[];
  is_keynote?: boolean;
  speaker_type?: SpeakerType;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
}

export interface AgendaSession {
  id: string;
  event_id: string;
  day_number: number;
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  description?: string;
  session_type: 'KEYNOTE' | 'PANEL' | 'WORKSHOP' | 'BREAKOUT' | 'NETWORKING' | 'CEREMONY' | 'MASTERCLASS';
  room: string;
  track?: string;
  speaker_ids: string[];
}

export interface Sponsor {
  id: string;
  dbId?: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  type: SponsorType;
  categoryOrRole?: string;
  description?: string;
  tier?: SponsorTier;
}

export interface RegistrationType {
  id: string;
  event_id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  description: string;
  eligibility?: string;
  capacity?: number;
  spots_left?: number;
  benefits: string[];
}

export interface EventGalleryItem {
  id: string;
  event_id: string;
  image_url: string;
  caption: string;
  year?: number;
}

export interface EventResource {
  id: string;
  event_id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: 'PDF' | 'PPT' | 'DOC' | 'ZIP';
  file_size: string;
  category: 'BROCHURE' | 'PRESENTATION' | 'REPORT' | 'PRESS';
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  short_description: string;
  category: string;
  category_id: string;
  featured_image: string;
  banner_image?: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  venue: string;
  venue_address?: string;
  virtual_link?: string;
  event_type: AttendanceType;
  registration_fee: number;
  currency: string;
  capacity: number;
  registered_count: number;
  registration_deadline: string;
  status: EventStatus;
  is_featured: boolean;
  is_past?: boolean;
  themes?: string[];
  why_attend?: { title: string; description: string }[];
  speakers: Speaker[];
  agenda: AgendaSession[];
  sponsors: Sponsor[];
  registration_types: RegistrationType[];
  resources: EventResource[];
  gallery: EventGalleryItem[];
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  event_title: string;
  user_id?: string;
  registration_number: string;
  registration_type_id: string;
  registration_type_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  organization: string;
  job_title: string;
  country: string;
  cib_member_id?: string;
  membership_category?: string;
  attendance_type: AttendanceType;
  dietary_requirements?: string;
  special_assistance?: string;
  total_amount: number;
  currency: string;
  payment_status: PaymentStatus;
  payment_reference?: string;
  payment_method?: 'PAYSTACK_CARD' | 'PAYSTACK_MOMO' | 'BANK_TRANSFER' | 'COMPLIMENTARY';
  check_in_status: CheckInStatus;
  check_in_time?: string;
  created_at: string;
}

export interface DigitalTicket {
  id: string;
  registration_id: string;
  registration_number: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_venue: string;
  attendee_name: string;
  attendee_email: string;
  organization: string;
  registration_tier: string;
  attendance_type: AttendanceType;
  qr_code_data: string;
  security_hash: string;
  issue_date: string;
  check_in_status: CheckInStatus;
}

export interface Certificate {
  id: string;
  certificate_number: string;
  event_id: string;
  event_title: string;
  event_date: string;
  recipient_name: string;
  issue_date: string;
  verification_url: string;
  qr_code_data: string;
}

export interface WaitlistEntry {
  id: string;
  event_id: string;
  event_title: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  status: 'PENDING' | 'INVITED' | 'CANCELLED';
}

export interface CreateRegistrationRequest {
  event_id: string;
  registration_type_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  organization: string;
  job_title: string;
  country?: string;
  cib_member_id?: string;
  membership_category?: string;
  attendance_type: AttendanceType;
  dietary_requirements?: string;
  special_assistance?: string;
  // Optional registration & payment metadata
  id?: string;
  registration_number?: string;
  event_title?: string;
  registration_type_name?: string;
  total_amount?: number;
  currency?: string;
  payment_status?: PaymentStatus;
  payment_reference?: string;
  payment_method?: 'PAYSTACK_CARD' | 'PAYSTACK_MOMO' | 'BANK_TRANSFER' | 'COMPLIMENTARY';
  check_in_status?: CheckInStatus;
}

