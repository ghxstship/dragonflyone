-- Migration: Timekeeping & Labor Management System
-- Description: Tables for time entries, labor tracking, and payroll integration

-- Time entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  crew_member_id UUID REFERENCES crew_members(id),
  employee_id UUID REFERENCES employees(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  task_id UUID,
  task_description TEXT,
  role TEXT,
  department TEXT,
  cost_code TEXT,
  clock_in_time TIMESTAMPTZ NOT NULL,
  clock_out_time TIMESTAMPTZ,
  break_duration_minutes INT DEFAULT 0,
  total_hours NUMERIC(6,2),
  regular_hours NUMERIC(6,2),
  overtime_hours NUMERIC(6,2),
  double_time_hours NUMERIC(6,2),
  hourly_rate NUMERIC(10,2),
  overtime_rate NUMERIC(10,2),
  double_time_rate NUMERIC(10,2),
  regular_pay NUMERIC(10,2),
  overtime_pay NUMERIC(10,2),
  double_time_pay NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  location TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  clock_in_method TEXT CHECK (clock_in_method IN ('manual', 'mobile', 'kiosk', 'biometric', 'badge')),
  clock_out_method TEXT CHECK (clock_out_method IN ('manual', 'mobile', 'kiosk', 'biometric', 'badge')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected', 'paid', 'voided')),
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id),
  approval_notes TEXT,
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES platform_users(id),
  rejection_reason TEXT,
  payroll_run_id UUID REFERENCES payroll_runs(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (crew_member_id IS NOT NULL OR employee_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_time_entries_org ON time_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_crew ON time_entries(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_event ON time_entries(event_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(clock_in_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_payroll ON time_entries(payroll_run_id);

-- Labor rates table
CREATE TABLE IF NOT EXISTS labor_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  role TEXT NOT NULL,
  department TEXT,
  rate_type TEXT NOT NULL CHECK (rate_type IN ('hourly', 'daily', 'weekly', 'flat')),
  regular_rate NUMERIC(10,2) NOT NULL,
  overtime_multiplier NUMERIC(4,2) DEFAULT 1.5,
  double_time_multiplier NUMERIC(4,2) DEFAULT 2.0,
  holiday_multiplier NUMERIC(4,2) DEFAULT 1.5,
  night_differential NUMERIC(10,2) DEFAULT 0,
  per_diem NUMERIC(10,2) DEFAULT 0,
  effective_date DATE NOT NULL,
  expiration_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, role, department, effective_date)
);

CREATE INDEX IF NOT EXISTS idx_labor_rates_org ON labor_rates(organization_id);
CREATE INDEX IF NOT EXISTS idx_labor_rates_role ON labor_rates(role);

-- Labor rules table
CREATE TABLE IF NOT EXISTS labor_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('overtime', 'break', 'meal', 'rest', 'weekly_limit', 'daily_limit', 'consecutive_days')),
  threshold_hours NUMERIC(5,2),
  threshold_days INT,
  required_break_minutes INT,
  penalty_multiplier NUMERIC(4,2),
  penalty_amount NUMERIC(10,2),
  applies_to TEXT[] DEFAULT ARRAY['all'],
  jurisdiction TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_labor_rules_org ON labor_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_labor_rules_type ON labor_rules(rule_type);

-- Time entry adjustments table
CREATE TABLE IF NOT EXISTS time_entry_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id UUID NOT NULL REFERENCES time_entries(id),
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('correction', 'addition', 'deduction', 'bonus', 'penalty')),
  hours_adjusted NUMERIC(6,2),
  amount_adjusted NUMERIC(10,2),
  reason TEXT NOT NULL,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_entry_adjustments_entry ON time_entry_adjustments(time_entry_id);

-- Shift schedules table
CREATE TABLE IF NOT EXISTS shift_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  crew_member_id UUID REFERENCES crew_members(id),
  employee_id UUID REFERENCES employees(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INT DEFAULT 0,
  role TEXT,
  department TEXT,
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shift_schedules_org ON shift_schedules(organization_id);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_crew ON shift_schedules(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_employee ON shift_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_date ON shift_schedules(shift_date);

-- Function to calculate time entry hours and pay
CREATE OR REPLACE FUNCTION calculate_time_entry_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_minutes NUMERIC;
  v_work_hours NUMERIC;
  v_rate RECORD;
BEGIN
  IF NEW.clock_out_time IS NOT NULL THEN
    -- Calculate total work minutes
    v_total_minutes := EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 60 - COALESCE(NEW.break_duration_minutes, 0);
    v_work_hours := v_total_minutes / 60;
    
    NEW.total_hours := ROUND(v_work_hours::NUMERIC, 2);
    
    -- Calculate regular, overtime, and double time hours
    IF v_work_hours <= 8 THEN
      NEW.regular_hours := ROUND(v_work_hours::NUMERIC, 2);
      NEW.overtime_hours := 0;
      NEW.double_time_hours := 0;
    ELSIF v_work_hours <= 12 THEN
      NEW.regular_hours := 8;
      NEW.overtime_hours := ROUND((v_work_hours - 8)::NUMERIC, 2);
      NEW.double_time_hours := 0;
    ELSE
      NEW.regular_hours := 8;
      NEW.overtime_hours := 4;
      NEW.double_time_hours := ROUND((v_work_hours - 12)::NUMERIC, 2);
    END IF;
    
    -- Calculate pay if hourly rate is set
    IF NEW.hourly_rate IS NOT NULL THEN
      NEW.overtime_rate := COALESCE(NEW.overtime_rate, NEW.hourly_rate * 1.5);
      NEW.double_time_rate := COALESCE(NEW.double_time_rate, NEW.hourly_rate * 2);
      
      NEW.regular_pay := NEW.regular_hours * NEW.hourly_rate;
      NEW.overtime_pay := NEW.overtime_hours * NEW.overtime_rate;
      NEW.double_time_pay := NEW.double_time_hours * NEW.double_time_rate;
      NEW.total_cost := NEW.regular_pay + NEW.overtime_pay + NEW.double_time_pay;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS time_entry_calculate_trigger ON time_entries;
CREATE TRIGGER time_entry_calculate_trigger
  BEFORE INSERT OR UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_time_entry_totals();

-- Function to get labor summary for a period
CREATE OR REPLACE FUNCTION get_labor_summary(
  p_org_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_project_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_entries INT,
  total_hours NUMERIC,
  regular_hours NUMERIC,
  overtime_hours NUMERIC,
  double_time_hours NUMERIC,
  total_cost NUMERIC,
  by_status JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INT AS total_entries,
    COALESCE(SUM(te.total_hours), 0) AS total_hours,
    COALESCE(SUM(te.regular_hours), 0) AS regular_hours,
    COALESCE(SUM(te.overtime_hours), 0) AS overtime_hours,
    COALESCE(SUM(te.double_time_hours), 0) AS double_time_hours,
    COALESCE(SUM(te.total_cost), 0) AS total_cost,
    jsonb_build_object(
      'pending', COUNT(*) FILTER (WHERE te.status = 'pending'),
      'approved', COUNT(*) FILTER (WHERE te.status = 'approved'),
      'rejected', COUNT(*) FILTER (WHERE te.status = 'rejected'),
      'paid', COUNT(*) FILTER (WHERE te.status = 'paid')
    ) AS by_status
  FROM time_entries te
  WHERE te.organization_id = p_org_id
    AND te.clock_in_time::DATE BETWEEN p_start_date AND p_end_date
    AND (p_project_id IS NULL OR te.project_id = p_project_id);
END;
$$;

-- RLS policies
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entry_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_schedules ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON labor_rates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON labor_rules TO authenticated;
GRANT SELECT, INSERT ON time_entry_adjustments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON shift_schedules TO authenticated;
GRANT EXECUTE ON FUNCTION get_labor_summary(UUID, DATE, DATE, UUID) TO authenticated;
