/**
 * Supabase Database Entity Definitions and Domain Types
 * Matches the required schema for hospitals, departments, services,
 * information sources, verifications, feedback, notifications, usage, and audit logs.
 */

export type UserRole = 'patient' | 'staff' | 'admin';

export type VerificationStatus = 'unverified' | 'verified' | 'needs_review' | 'inactive';

export type HospitalType =
  | 'General Hospital'
  | 'Community Health Centre'
  | 'Area Hospital'
  | 'Specialty Centre'
  | 'Teaching Hospital'
  | 'Primary Health Centre';

export interface Profile {
  id: string; // references auth.users
  full_name: string;
  role: UserRole;
  preferred_language: 'en' | 'te';
  created_at: string;
  updated_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  slug: string;
  description: string;
  hospital_type: HospitalType;
  address: string;
  locality: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  operating_hours: string | null;
  emergency_information: string | null;
  is_active: boolean;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
  // Joined or enriched fields
  departments?: Department[];
  information_sources?: InformationSource[];
}

export interface Department {
  id: string;
  hospital_id: string;
  name: string;
  description: string;
  contact_information: string | null;
  operating_hours: string | null;
  is_active: boolean;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
  // Joined
  services?: Service[];
  hospital_name?: string;
}

export interface Service {
  id: string;
  department_id: string;
  name: string;
  description: string;
  service_category: string;
  eligibility_notes: string | null;
  is_active: boolean;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface InformationSource {
  id: string;
  hospital_id: string | null;
  department_id: string | null;
  service_id: string | null;
  source_name: string;
  source_type: 'field_visit' | 'official_directory' | 'phone_verification' | 'hospital_desk' | 'public_record';
  source_reference: string;
  notes: string | null;
  checked_at: string;
  created_by: string | null;
  created_at: string;
}

export interface VerificationRecord {
  id: string;
  entity_type: 'hospital' | 'department' | 'service';
  entity_id: string;
  previous_status: VerificationStatus;
  new_status: VerificationStatus;
  verification_notes: string;
  verified_by: string;
  verified_at: string;
}

export interface Feedback {
  id: string;
  category: 'general' | 'navigation' | 'data_accuracy' | 'accessibility' | 'language';
  rating: number; // 1 to 5
  message: string | null;
  preferred_language: 'en' | 'te';
  created_at: string;
}

export interface NotificationLog {
  id: string;
  notification_type: 'sms' | 'ivr_call';
  recipient_reference: string; // masked or hashed identifier
  message_preview: string;
  provider: 'mock' | 'twilio';
  mode: 'simulated' | 'delivered' | 'failed';
  status: 'sent' | 'pending' | 'failed';
  error_code: string | null;
  created_at: string;
}

export interface UsageEvent {
  id: string;
  event_type: 'page_view' | 'search_hospital' | 'search_department' | 'filter_applied' | 'tts_played' | 'assistant_query';
  page_name: string;
  anonymised_session_id: string | null;
  metadata: Record<string, string | number | boolean> | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  safe_metadata: Record<string, string | number | boolean> | null;
  created_at: string;
}
