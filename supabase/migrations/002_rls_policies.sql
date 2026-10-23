-- Migration 002: Row Level Security (RLS) Policies
-- Enforces least-privilege access for public, staff, and administrators

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE information_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user has staff or admin role
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('staff', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles
-- Users can read their own profile; admins can read all profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Prevent users from modifying their own role during profile updates
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Privilege escalation rejected: only administrators can change roles.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Hospitals
-- Public read-only for active hospitals
DROP POLICY IF EXISTS "Public can read active hospitals" ON hospitals;
CREATE POLICY "Public can read active hospitals"
  ON hospitals FOR SELECT
  USING (is_active = true OR public.is_staff_or_admin());

-- Staff & Admin can insert/update/delete hospitals
DROP POLICY IF EXISTS "Staff can insert hospitals" ON hospitals;
CREATE POLICY "Staff can insert hospitals"
  ON hospitals FOR INSERT
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff can update hospitals" ON hospitals;
CREATE POLICY "Staff can update hospitals"
  ON hospitals FOR UPDATE
  USING (public.is_staff_or_admin());

-- 3. Departments
DROP POLICY IF EXISTS "Public can read active departments" ON departments;
CREATE POLICY "Public can read active departments"
  ON departments FOR SELECT
  USING (is_active = true OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff can manage departments" ON departments;
CREATE POLICY "Staff can manage departments"
  ON departments FOR ALL
  USING (public.is_staff_or_admin());

-- 4. Services
DROP POLICY IF EXISTS "Public can read active services" ON services;
CREATE POLICY "Public can read active services"
  ON services FOR SELECT
  USING (is_active = true OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff can manage services" ON services;
CREATE POLICY "Staff can manage services"
  ON services FOR ALL
  USING (public.is_staff_or_admin());

-- 5. Information Sources
DROP POLICY IF EXISTS "Public can view verified sources" ON information_sources;
CREATE POLICY "Public can view verified sources"
  ON information_sources FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Staff can manage sources" ON information_sources;
CREATE POLICY "Staff can manage sources"
  ON information_sources FOR ALL
  USING (public.is_staff_or_admin());

-- 6. Verification Records
DROP POLICY IF EXISTS "Public can view verification status history" ON verification_records;
CREATE POLICY "Public can view verification status history"
  ON verification_records FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Staff can insert verification records" ON verification_records;
CREATE POLICY "Staff can insert verification records"
  ON verification_records FOR INSERT
  WITH CHECK (public.is_staff_or_admin());

-- 7. Feedback
-- Anyone can insert feedback (public submission)
DROP POLICY IF EXISTS "Public can submit feedback" ON feedback;
CREATE POLICY "Public can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

-- Only staff/admin can read feedback
DROP POLICY IF EXISTS "Staff can read feedback" ON feedback;
CREATE POLICY "Staff can read feedback"
  ON feedback FOR SELECT
  USING (public.is_staff_or_admin());

-- 8. Notification Logs
DROP POLICY IF EXISTS "Staff can read and insert notification logs" ON notification_logs;
CREATE POLICY "Staff can read and insert notification logs"
  ON notification_logs FOR ALL
  USING (public.is_staff_or_admin());

-- 9. Usage Events
DROP POLICY IF EXISTS "Public can insert telemetry events" ON usage_events;
CREATE POLICY "Public can insert telemetry events"
  ON usage_events FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can view telemetry events" ON usage_events;
CREATE POLICY "Staff can view telemetry events"
  ON usage_events FOR SELECT
  USING (public.is_staff_or_admin());

-- 10. Audit Logs
DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;
CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "System/Staff can insert audit logs" ON audit_logs;
CREATE POLICY "System/Staff can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (public.is_staff_or_admin());
