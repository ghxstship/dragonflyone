-- Migration: Extended Workforce Tables
-- Description: Tables for emergency contacts, labor compliance, and availability

-- Emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES platform_users(id),
  name VARCHAR(200) NOT NULL,
  relationship VARCHAR(100) NOT NULL,
  phone_primary VARCHAR(20) NOT NULL,
  phone_secondary VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency notifications table
CREATE TABLE IF NOT EXISTS emergency_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(30) NOT NULL CHECK (type IN ('emergency', 'incident', 'weather', 'security', 'general')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  affected_departments UUID[],
  affected_locations TEXT[],
  notify_emergency_contacts BOOLEAN DEFAULT FALSE,
  sent_by UUID REFERENCES platform_users(id),
  status VARCHAR(20) DEFAULT 'sent',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification recipients table
CREATE TABLE IF NOT EXISTS notification_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES emergency_notifications(id),
  employee_id UUID REFERENCES platform_users(id),
  emergency_contact_id UUID REFERENCES emergency_contacts(id),
  delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('email', 'sms', 'push', 'in_app')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Labor violations table
CREATE TABLE IF NOT EXISTS labor_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES platform_users(id),
  violation_type VARCHAR(50) NOT NULL,
  violation_date TIMESTAMPTZ NOT NULL,
  state VARCHAR(2) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  timesheet_id UUID,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'waived')),
  resolution_notes TEXT,
  resolved_by UUID REFERENCES platform_users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timesheet breaks table
CREATE TABLE IF NOT EXISTS timesheet_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('meal', 'rest')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability schedules table
CREATE TABLE IF NOT EXISTS availability_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES platform_users(id),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  recurring BOOLEAN DEFAULT TRUE,
  effective_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blackout dates table
CREATE TABLE IF NOT EXISTS blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES platform_users(id),
  department_id UUID REFERENCES departments(id),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  reason VARCHAR(30) NOT NULL CHECK (reason IN ('holiday', 'company_event', 'maintenance', 'personal', 'vacation', 'other')),
  description TEXT,
  is_company_wide BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add work_state to platform_users if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'platform_users' AND column_name = 'work_state') THEN
    ALTER TABLE platform_users ADD COLUMN work_state VARCHAR(2);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_employee ON emergency_contacts(employee_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_primary ON emergency_contacts(is_primary);
CREATE INDEX IF NOT EXISTS idx_emergency_notifications_type ON emergency_notifications(type);
CREATE INDEX IF NOT EXISTS idx_emergency_notifications_severity ON emergency_notifications(severity);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification ON notification_recipients(notification_id);
CREATE INDEX IF NOT EXISTS idx_labor_violations_employee ON labor_violations(employee_id);
CREATE INDEX IF NOT EXISTS idx_labor_violations_date ON labor_violations(violation_date);
CREATE INDEX IF NOT EXISTS idx_labor_violations_state ON labor_violations(state);
CREATE INDEX IF NOT EXISTS idx_timesheet_breaks_timesheet ON timesheet_breaks(timesheet_id);
CREATE INDEX IF NOT EXISTS idx_availability_schedules_employee ON availability_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_availability_schedules_day ON availability_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_blackout_dates_employee ON blackout_dates(employee_id);
CREATE INDEX IF NOT EXISTS idx_blackout_dates_department ON blackout_dates(department_id);
CREATE INDEX IF NOT EXISTS idx_blackout_dates_range ON blackout_dates(start_date, end_date);

-- RLS Policies
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE blackout_dates ENABLE ROW LEVEL SECURITY;

-- View policies
CREATE POLICY emergency_contacts_view ON emergency_contacts FOR SELECT USING (
  employee_id = auth.uid() OR
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY emergency_notifications_view ON emergency_notifications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY labor_violations_view ON labor_violations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY availability_schedules_view ON availability_schedules FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY blackout_dates_view ON blackout_dates FOR SELECT USING (auth.uid() IS NOT NULL);

-- Manage policies
CREATE POLICY emergency_contacts_manage ON emergency_contacts FOR ALL USING (
  employee_id = auth.uid() OR
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY availability_schedules_manage ON availability_schedules FOR ALL USING (
  employee_id = auth.uid() OR
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY blackout_dates_manage ON blackout_dates FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY labor_violations_manage ON labor_violations FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

-- Function to check employee availability
CREATE OR REPLACE FUNCTION check_employee_availability(
  p_employee_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS TABLE (
  is_available BOOLEAN,
  conflict_type VARCHAR,
  conflict_details TEXT
) AS $$
DECLARE
  v_day_of_week INTEGER;
  v_has_blackout BOOLEAN;
  v_has_pto BOOLEAN;
  v_in_schedule BOOLEAN;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date);

  -- Check blackouts
  SELECT EXISTS (
    SELECT 1 FROM blackout_dates
    WHERE (employee_id = p_employee_id OR is_company_wide = TRUE)
      AND p_date BETWEEN start_date::DATE AND end_date::DATE
  ) INTO v_has_blackout;

  IF v_has_blackout THEN
    RETURN QUERY SELECT FALSE, 'blackout'::VARCHAR, 'Employee has blackout date'::TEXT;
    RETURN;
  END IF;

  -- Check PTO
  SELECT EXISTS (
    SELECT 1 FROM time_off_requests
    WHERE employee_id = p_employee_id
      AND status = 'approved'
      AND p_date BETWEEN start_date::DATE AND end_date::DATE
  ) INTO v_has_pto;

  IF v_has_pto THEN
    RETURN QUERY SELECT FALSE, 'time_off'::VARCHAR, 'Employee has approved time off'::TEXT;
    RETURN;
  END IF;

  -- Check availability schedule
  SELECT EXISTS (
    SELECT 1 FROM availability_schedules
    WHERE employee_id = p_employee_id
      AND day_of_week = v_day_of_week
      AND is_available = TRUE
      AND status = 'active'
      AND p_start_time >= start_time
      AND p_end_time <= end_time
  ) INTO v_in_schedule;

  IF NOT v_in_schedule THEN
    RETURN QUERY SELECT FALSE, 'schedule'::VARCHAR, 'Outside regular availability'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, NULL::VARCHAR, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;
