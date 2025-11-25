-- Migration: HR & Timesheets System
-- Description: Tables and functions for timesheets, benefits, and HR management

-- Timesheets table
CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  work_date DATE NOT NULL,
  project_id UUID REFERENCES projects(id),
  department_id UUID REFERENCES departments(id),
  clock_in TIME NOT NULL,
  clock_out TIME,
  break_minutes INT DEFAULT 0,
  regular_hours NUMERIC(5,2) DEFAULT 0,
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  total_hours NUMERIC(5,2) DEFAULT 0,
  task_description TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id),
  approval_notes TEXT,
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES platform_users(id),
  rejection_reason TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, work_date)
);

CREATE INDEX IF NOT EXISTS idx_timesheets_employee ON timesheets(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_work_date ON timesheets(work_date);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);
CREATE INDEX IF NOT EXISTS idx_timesheets_project ON timesheets(project_id);

-- Timesheet activity log
CREATE TABLE IF NOT EXISTS timesheet_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timesheet_id UUID NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  user_id UUID REFERENCES platform_users(id),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timesheet_activity_log_timesheet ON timesheet_activity_log(timesheet_id);

-- Benefit plans table
CREATE TABLE IF NOT EXISTS benefit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('health', 'dental', 'vision', 'life', 'disability', 'retirement', 'pto', 'other')),
  provider TEXT,
  description TEXT,
  cost_employee_monthly NUMERIC(10,2) DEFAULT 0,
  cost_employer_monthly NUMERIC(10,2) DEFAULT 0,
  coverage_details JSONB,
  eligibility_criteria JSONB,
  active BOOLEAN DEFAULT true,
  effective_date DATE,
  termination_date DATE,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_benefit_plans_org ON benefit_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_benefit_plans_type ON benefit_plans(type);
CREATE INDEX IF NOT EXISTS idx_benefit_plans_active ON benefit_plans(active);

-- Benefit enrollments table
CREATE TABLE IF NOT EXISTS benefit_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  benefit_plan_id UUID NOT NULL REFERENCES benefit_plans(id),
  coverage_type TEXT NOT NULL CHECK (coverage_type IN ('individual', 'family', 'spouse', 'dependents')),
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'terminated', 'declined')),
  dependents JSONB,
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  enrolled_by UUID REFERENCES platform_users(id),
  termination_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_benefit_enrollments_employee ON benefit_enrollments(employee_id);
CREATE INDEX IF NOT EXISTS idx_benefit_enrollments_plan ON benefit_enrollments(benefit_plan_id);
CREATE INDEX IF NOT EXISTS idx_benefit_enrollments_status ON benefit_enrollments(status);

-- Time off requests table
CREATE TABLE IF NOT EXISTS time_off_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  request_type TEXT NOT NULL CHECK (request_type IN ('vacation', 'sick', 'personal', 'bereavement', 'jury_duty', 'military', 'unpaid', 'other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  hours_requested NUMERIC(5,2) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_off_requests_employee ON time_off_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_status ON time_off_requests(status);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_dates ON time_off_requests(start_date, end_date);

-- PTO balances table
CREATE TABLE IF NOT EXISTS pto_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  year INT NOT NULL,
  pto_type TEXT NOT NULL CHECK (pto_type IN ('vacation', 'sick', 'personal', 'floating_holiday')),
  accrued_hours NUMERIC(6,2) DEFAULT 0,
  used_hours NUMERIC(6,2) DEFAULT 0,
  pending_hours NUMERIC(6,2) DEFAULT 0,
  available_hours NUMERIC(6,2) GENERATED ALWAYS AS (accrued_hours - used_hours - pending_hours) STORED,
  carryover_hours NUMERIC(6,2) DEFAULT 0,
  max_carryover NUMERIC(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, year, pto_type)
);

CREATE INDEX IF NOT EXISTS idx_pto_balances_employee ON pto_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_pto_balances_year ON pto_balances(year);

-- Function to calculate timesheet hours
CREATE OR REPLACE FUNCTION calculate_timesheet_hours()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_mins INT;
  work_hours NUMERIC;
BEGIN
  IF NEW.clock_out IS NOT NULL THEN
    total_mins := EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 60 - COALESCE(NEW.break_minutes, 0);
    work_hours := GREATEST(0, total_mins::NUMERIC / 60);
    
    IF work_hours <= 8 THEN
      NEW.regular_hours := work_hours;
      NEW.overtime_hours := 0;
    ELSE
      NEW.regular_hours := 8;
      NEW.overtime_hours := work_hours - 8;
    END IF;
    
    NEW.total_hours := work_hours;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS timesheet_hours_trigger ON timesheets;
CREATE TRIGGER timesheet_hours_trigger
  BEFORE INSERT OR UPDATE ON timesheets
  FOR EACH ROW
  EXECUTE FUNCTION calculate_timesheet_hours();

-- Function to update PTO balance on time off approval
CREATE OR REPLACE FUNCTION update_pto_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Move hours from pending to used
    UPDATE pto_balances
    SET 
      pending_hours = pending_hours - NEW.hours_requested,
      used_hours = used_hours + NEW.hours_requested,
      updated_at = NOW()
    WHERE employee_id = NEW.employee_id
      AND year = EXTRACT(YEAR FROM NEW.start_date)
      AND pto_type = NEW.request_type;
  ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    -- Release pending hours
    UPDATE pto_balances
    SET 
      pending_hours = pending_hours - NEW.hours_requested,
      updated_at = NOW()
    WHERE employee_id = NEW.employee_id
      AND year = EXTRACT(YEAR FROM NEW.start_date)
      AND pto_type = NEW.request_type;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pto_approval_trigger ON time_off_requests;
CREATE TRIGGER pto_approval_trigger
  AFTER UPDATE ON time_off_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_pto_on_approval();

-- RLS policies
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pto_balances ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON timesheets TO authenticated;
GRANT SELECT, INSERT ON timesheet_activity_log TO authenticated;
GRANT SELECT ON benefit_plans TO authenticated;
GRANT SELECT ON benefit_enrollments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON time_off_requests TO authenticated;
GRANT SELECT ON pto_balances TO authenticated;
