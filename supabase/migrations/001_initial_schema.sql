-- Migration 001: Initial Schema for SFIC Healthcare Navigation Platform
-- Compatible with PostgreSQL 14+ and Supabase

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles (Staff and Admin users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('patient', 'staff', 'admin')),
    preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'te')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Hospitals
CREATE TABLE IF NOT EXISTS hospitals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    hospital_type TEXT NOT NULL,
    address TEXT NOT NULL,
    locality TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Telangana',
    postal_code TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    phone TEXT,
    email TEXT,
    website TEXT,
    operating_hours TEXT,
    emergency_information TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'needs_review', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_hospitals_verification_status ON hospitals(verification_status);
CREATE INDEX IF NOT EXISTS idx_hospitals_is_active ON hospitals(is_active);

-- 3. Departments
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    hospital_id TEXT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    contact_information TEXT,
    operating_hours TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'needs_review', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_departments_hospital_id ON departments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);

-- 4. Services
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    service_category TEXT NOT NULL,
    eligibility_notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'needs_review', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_services_department_id ON services(department_id);

-- 5. Information Sources
CREATE TABLE IF NOT EXISTS information_sources (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    hospital_id TEXT REFERENCES hospitals(id) ON DELETE CASCADE,
    department_id TEXT REFERENCES departments(id) ON DELETE CASCADE,
    service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('field_visit', 'official_directory', 'phone_verification', 'hospital_desk', 'public_record')),
    source_reference TEXT NOT NULL,
    notes TEXT,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Verification Records (Immutable Verification Audit Trail)
CREATE TABLE IF NOT EXISTS verification_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('hospital', 'department', 'service')),
    entity_id TEXT NOT NULL,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    verification_notes TEXT NOT NULL,
    verified_by TEXT NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_verification_records_entity ON verification_records(entity_type, entity_id);

-- 7. Citizen & Patient Feedback
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category TEXT NOT NULL CHECK (category IN ('general', 'navigation', 'data_accuracy', 'accessibility', 'language')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    message TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'te')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Notification Logs (SMS & IVR audit log)
CREATE TABLE IF NOT EXISTS notification_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('sms', 'ivr_call')),
    recipient_reference TEXT NOT NULL,
    message_preview TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('mock', 'twilio')),
    mode TEXT NOT NULL CHECK (mode IN ('simulated', 'delivered', 'failed')),
    status TEXT NOT NULL CHECK (status IN ('sent', 'pending', 'failed')),
    error_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Anonymized Usage Events (Telemetry for impact dashboard)
CREATE TABLE IF NOT EXISTS usage_events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_type TEXT NOT NULL,
    page_name TEXT NOT NULL,
    anonymised_session_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_usage_events_type ON usage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at);

-- 10. Audit Logs (Administrative actions)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    actor_user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    safe_metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
