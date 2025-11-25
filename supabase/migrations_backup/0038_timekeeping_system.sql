-- =====================================================
-- TIMEKEEPING SYSTEM
-- =====================================================
-- Tracks crew time, labor hours, overtime, and payroll data
-- Critical for COMPVSS production operations

-- =====================================================
-- TIME ENTRIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Worker details
  crew_member_id UUID REFERENCES crew_members(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE, -- For internal employees
  
  -- Work assignment
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  event_id UUID,
  task_description TEXT,
  role TEXT, -- What role they worked
  
  -- Time tracking
  clock_in_time TIMESTAMPTZ NOT NULL,
  clock_out_time TIMESTAMPTZ,
  break_duration_minutes INTEGER DEFAULT 0,
  
  -- Calculated durations (in hours)
  regular_hours NUMERIC(5, 2) DEFAULT 0,
  overtime_hours NUMERIC(5, 2) DEFAULT 0,
  double_time_hours NUMERIC(5, 2) DEFAULT 0,
  total_hours NUMERIC(5, 2) GENERATED ALWAYS AS (
    regular_hours + overtime_hours + double_time_hours
  ) STORED,
  
  -- Location tracking (optional geofencing)
  clock_in_location POINT,
  clock_out_location POINT,
  clock_in_address TEXT,
  clock_out_address TEXT,
  
  -- Rates and costs
  hourly_rate NUMERIC(8, 2),
  overtime_rate NUMERIC(8, 2),
  double_time_rate NUMERIC(8, 2),
  total_cost NUMERIC(10, 2) GENERATED ALWAYS AS (
    (regular_hours * COALESCE(hourly_rate, 0)) +
    (overtime_hours * COALESCE(overtime_rate, 0)) +
    (double_time_hours * COALESCE(double_time_rate, 0))
  ) STORED,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'paid', 'disputed'
  )),
  
  -- Approval workflow
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id),
  approval_notes TEXT,
  
  -- Payroll integration
  payroll_batch_id UUID,
  paid_at TIMESTAMPTZ,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  
  notes TEXT,
  attachments TEXT[] -- Photos, signatures, etc.
);

-- =====================================================
-- TIMESHEET PERIODS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS timesheet_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Period details
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_name TEXT, -- "Week 45 2024", "November 2024"
  
  -- Status
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open', 'locked', 'processing', 'completed'
  )),
  
  -- Deadline
  submission_deadline TIMESTAMPTZ NOT NULL,
  approval_deadline TIMESTAMPTZ,
  
  -- Summary
  total_entries INTEGER DEFAULT 0,
  total_hours NUMERIC(10, 2) DEFAULT 0,
  total_cost NUMERIC(12, 2) DEFAULT 0,
  
  -- Payroll
  payroll_run_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  
  CONSTRAINT unique_period UNIQUE (organization_id, period_start, period_end)
);

-- =====================================================
-- LABOR RULES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS labor_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Rule details
  rule_name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL, -- State, country
  effective_date DATE NOT NULL,
  
  -- Hours thresholds
  daily_overtime_threshold NUMERIC(4, 2) DEFAULT 8.0, -- Hours before OT kicks in
  weekly_overtime_threshold NUMERIC(4, 2) DEFAULT 40.0,
  daily_double_time_threshold NUMERIC(4, 2) DEFAULT 12.0,
  
  -- Rates (multipliers)
  overtime_multiplier NUMERIC(3, 2) DEFAULT 1.5, -- 1.5x = time and a half
  double_time_multiplier NUMERIC(3, 2) DEFAULT 2.0, -- 2x
  
  -- Break requirements
  meal_break_after_hours NUMERIC(3, 1) DEFAULT 5.0,
  meal_break_duration_minutes INTEGER DEFAULT 30,
  rest_break_frequency_hours NUMERIC(3, 1) DEFAULT 4.0,
  rest_break_duration_minutes INTEGER DEFAULT 10,
  
  -- Special rates
  weekend_multiplier NUMERIC(3, 2) DEFAULT 1.0,
  holiday_multiplier NUMERIC(3, 2) DEFAULT 2.0,
  night_shift_multiplier NUMERIC(3, 2) DEFAULT 1.0,
  night_shift_start_time TIME DEFAULT '22:00:00',
  night_shift_end_time TIME DEFAULT '06:00:00',
  
  -- Union/contract specific
  union_id UUID,
  minimum_call_hours NUMERIC(3, 1) DEFAULT 4.0, -- Minimum hours per call
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_time_entries_org ON time_entries(organization_id);
CREATE INDEX idx_time_entries_crew ON time_entries(crew_member_id);
CREATE INDEX idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX idx_time_entries_project ON time_entries(project_id);
CREATE INDEX idx_time_entries_status ON time_entries(status);
CREATE INDEX idx_time_entries_dates ON time_entries(clock_in_time, clock_out_time);
CREATE INDEX idx_time_entries_payroll ON time_entries(payroll_batch_id) WHERE payroll_batch_id IS NOT NULL;

CREATE INDEX idx_timesheet_periods_org ON timesheet_periods(organization_id);
CREATE INDEX idx_timesheet_periods_dates ON timesheet_periods(period_start, period_end);
CREATE INDEX idx_timesheet_periods_status ON timesheet_periods(status);

CREATE INDEX idx_labor_rules_org ON labor_rules(organization_id);
CREATE INDEX idx_labor_rules_jurisdiction ON labor_rules(jurisdiction);
CREATE INDEX idx_labor_rules_active ON labor_rules(is_active) WHERE is_active = true;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor_rules ENABLE ROW LEVEL SECURITY;

-- Time entries policies
CREATE POLICY "Users can view time entries in their organization"
  ON time_entries FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM platform_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Crew members can create their own time entries"
  ON time_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    crew_member_id IN (
      SELECT id FROM crew_members WHERE user_id = auth.uid()
    )
    OR employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own pending time entries"
  ON time_entries FOR UPDATE
  TO authenticated
  USING (
    status = 'pending'
    AND (
      crew_member_id IN (
        SELECT id FROM crew_members WHERE user_id = auth.uid()
      )
      OR employee_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage all time entries"
  ON time_entries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND organization_id = time_entries.organization_id
      AND role IN ('COMPVSS_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
    )
  );

-- Timesheet periods policies
CREATE POLICY "Users can view periods in their organization"
  ON timesheet_periods FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM platform_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage timesheet periods"
  ON timesheet_periods FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND organization_id = timesheet_periods.organization_id
      AND role IN ('COMPVSS_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
    )
  );

-- Labor rules policies
CREATE POLICY "Users can view labor rules"
  ON labor_rules FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM platform_users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage labor rules"
  ON labor_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND organization_id = labor_rules.organization_id
      AND role IN ('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate OT/DT hours based on labor rules
CREATE OR REPLACE FUNCTION calculate_time_entry_hours(
  entry_id UUID,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  break_minutes INTEGER,
  rule_id UUID
)
RETURNS TABLE (
  regular_hours NUMERIC,
  overtime_hours NUMERIC,
  double_time_hours NUMERIC
) AS $$
DECLARE
  total_minutes INTEGER;
  work_hours NUMERIC;
  daily_ot_threshold NUMERIC;
  daily_dt_threshold NUMERIC;
BEGIN
  -- Calculate total work time
  total_minutes := EXTRACT(EPOCH FROM (clock_out - clock_in)) / 60 - break_minutes;
  work_hours := total_minutes / 60.0;
  
  -- Get labor rule thresholds
  SELECT lr.daily_overtime_threshold, lr.daily_double_time_threshold
  INTO daily_ot_threshold, daily_dt_threshold
  FROM labor_rules lr
  WHERE lr.id = rule_id;
  
  -- Default thresholds if no rule
  daily_ot_threshold := COALESCE(daily_ot_threshold, 8.0);
  daily_dt_threshold := COALESCE(daily_dt_threshold, 12.0);
  
  -- Calculate hour distribution
  IF work_hours <= daily_ot_threshold THEN
    -- All regular time
    regular_hours := work_hours;
    overtime_hours := 0;
    double_time_hours := 0;
  ELSIF work_hours <= daily_dt_threshold THEN
    -- Regular + OT
    regular_hours := daily_ot_threshold;
    overtime_hours := work_hours - daily_ot_threshold;
    double_time_hours := 0;
  ELSE
    -- Regular + OT + DT
    regular_hours := daily_ot_threshold;
    overtime_hours := daily_dt_threshold - daily_ot_threshold;
    double_time_hours := work_hours - daily_dt_threshold;
  END IF;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to update period summary
CREATE OR REPLACE FUNCTION update_timesheet_period_summary(period_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE timesheet_periods tp
  SET 
    total_entries = (
      SELECT COUNT(*)
      FROM time_entries te
      WHERE te.clock_in_time::DATE >= tp.period_start
        AND te.clock_in_time::DATE <= tp.period_end
        AND te.organization_id = tp.organization_id
    ),
    total_hours = (
      SELECT COALESCE(SUM(te.total_hours), 0)
      FROM time_entries te
      WHERE te.clock_in_time::DATE >= tp.period_start
        AND te.clock_in_time::DATE <= tp.period_end
        AND te.organization_id = tp.organization_id
    ),
    total_cost = (
      SELECT COALESCE(SUM(te.total_cost), 0)
      FROM time_entries te
      WHERE te.clock_in_time::DATE >= tp.period_start
        AND te.clock_in_time::DATE <= tp.period_end
        AND te.organization_id = tp.organization_id
    ),
    updated_at = NOW()
  WHERE tp.id = period_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamps
CREATE TRIGGER update_time_entries_timestamp
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

-- Update period summary when time entries change
CREATE OR REPLACE FUNCTION trigger_update_period_summary()
RETURNS TRIGGER AS $$
DECLARE
  affected_period_id UUID;
BEGIN
  -- Find the timesheet period this entry belongs to
  SELECT id INTO affected_period_id
  FROM timesheet_periods
  WHERE organization_id = COALESCE(NEW.organization_id, OLD.organization_id)
    AND period_start <= COALESCE(NEW.clock_in_time, OLD.clock_in_time)::DATE
    AND period_end >= COALESCE(NEW.clock_in_time, OLD.clock_in_time)::DATE;
  
  IF affected_period_id IS NOT NULL THEN
    PERFORM update_timesheet_period_summary(affected_period_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_period_on_entry_change
  AFTER INSERT OR UPDATE OR DELETE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_period_summary();

COMMENT ON TABLE time_entries IS 'Tracks crew and employee work hours for payroll and labor management';
COMMENT ON TABLE timesheet_periods IS 'Defines payroll periods and submission deadlines';
COMMENT ON TABLE labor_rules IS 'Configurable labor rules for overtime, breaks, and compliance';
