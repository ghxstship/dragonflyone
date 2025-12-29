-- Migration: Production Reports System
-- Description: Daily reports, wrap reports, and expense reports from ExperienceGeneratorSchema

-- Add expense report status enum
DO $$ BEGIN
  CREATE TYPE expense_report_status_enum AS ENUM (
    'draft', 'submitted', 'under_review', 'approved', 'rejected', 'paid'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add expense category enum
DO $$ BEGIN
  CREATE TYPE expense_category_enum AS ENUM (
    'travel', 'meals', 'lodging', 'supplies', 'equipment', 'services', 
    'shipping', 'marketing', 'entertainment', 'venue', 'talent', 
    'production', 'insurance', 'permits', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add payment method enum
DO $$ BEGIN
  CREATE TYPE payment_method_enum AS ENUM (
    'personal_card', 'company_card', 'cash', 'invoice', 'check', 
    'wire', 'ach', 'paypal', 'venmo', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add report status enum
DO $$ BEGIN
  CREATE TYPE report_status_enum AS ENUM ('draft', 'submitted', 'review', 'approved', 'final');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Expense Reports table
CREATE TABLE IF NOT EXISTS expense_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
  report_number VARCHAR(50) UNIQUE,
  submitter_id UUID REFERENCES platform_users(id),
  department_id UUID REFERENCES departments(id),
  
  -- Period
  period_start DATE,
  period_end DATE,
  
  -- Status
  status expense_report_status_enum DEFAULT 'draft',
  
  -- Amounts
  total_amount NUMERIC(12,2) DEFAULT 0,
  approved_amount NUMERIC(12,2),
  advance_received NUMERIC(12,2) DEFAULT 0,
  amount_due NUMERIC(12,2) GENERATED ALWAYS AS (
    COALESCE(total_amount, 0) - COALESCE(advance_received, 0)
  ) STORED,
  
  -- Workflow
  submitted_at TIMESTAMPTZ,
  reviewed_by_id UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  approved_by_id UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  paid_at TIMESTAMPTZ,
  payment_reference TEXT,
  
  -- Meta
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense Line Items table
CREATE TABLE IF NOT EXISTS expense_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_report_id UUID NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id),
  
  -- Transaction
  expense_date DATE NOT NULL,
  vendor TEXT NOT NULL,
  description TEXT NOT NULL,
  category expense_category_enum,
  
  -- Amount
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  exchange_rate NUMERIC(10,6) DEFAULT 1,
  amount_usd NUMERIC(10,2),
  
  -- Payment
  payment_method payment_method_enum,
  
  -- Flags
  reimbursable BOOLEAN DEFAULT true,
  billable_to_client BOOLEAN DEFAULT false,
  approved BOOLEAN,
  
  -- Documentation
  receipt_url TEXT,
  receipt_verified BOOLEAN DEFAULT false,
  receipt_verified_by UUID REFERENCES platform_users(id),
  receipt_verified_at TIMESTAMPTZ,
  
  -- Budget
  budget_code TEXT,
  department_id UUID REFERENCES departments(id),
  task_id UUID,
  
  -- Meta
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  production_id UUID NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
  show_id UUID REFERENCES shows(id),
  report_date DATE NOT NULL,
  
  -- Attendance
  tickets_sold INTEGER DEFAULT 0,
  tickets_comped INTEGER DEFAULT 0,
  attendance INTEGER DEFAULT 0,
  capacity INTEGER,
  capacity_percent NUMERIC(5,2),
  no_shows INTEGER DEFAULT 0,
  
  -- Revenue
  ticket_revenue NUMERIC(10,2) DEFAULT 0,
  fb_revenue NUMERIC(10,2) DEFAULT 0,
  merch_revenue NUMERIC(10,2) DEFAULT 0,
  vip_revenue NUMERIC(10,2) DEFAULT 0,
  parking_revenue NUMERIC(10,2) DEFAULT 0,
  other_revenue NUMERIC(10,2) DEFAULT 0,
  total_revenue NUMERIC(10,2) GENERATED ALWAYS AS (
    COALESCE(ticket_revenue, 0) + COALESCE(fb_revenue, 0) + 
    COALESCE(merch_revenue, 0) + COALESCE(vip_revenue, 0) +
    COALESCE(parking_revenue, 0) + COALESCE(other_revenue, 0)
  ) STORED,
  
  -- Expenses
  daily_expenses NUMERIC(10,2) DEFAULT 0,
  labor_costs NUMERIC(10,2) DEFAULT 0,
  
  -- Operations
  doors_time TIMESTAMPTZ,
  show_start_time TIMESTAMPTZ,
  show_end_time TIMESTAMPTZ,
  venue_clear_time TIMESTAMPTZ,
  
  -- Crew
  crew_count INTEGER,
  crew_hours NUMERIC(8,2),
  overtime_hours NUMERIC(8,2),
  
  -- Issues
  incidents_count INTEGER DEFAULT 0,
  incidents_summary TEXT,
  guest_complaints INTEGER DEFAULT 0,
  guest_feedback TEXT,
  staff_issues TEXT,
  technical_issues TEXT,
  
  -- Weather
  weather VARCHAR(100),
  temperature_high INTEGER,
  temperature_low INTEGER,
  weather_impact TEXT,
  
  -- Notable
  notable_events TEXT,
  vip_guests TEXT,
  media_coverage TEXT,
  
  -- Action Items
  follow_up_items JSONB DEFAULT '[]',
  
  -- Status
  status report_status_enum DEFAULT 'draft',
  
  -- Meta
  submitted_by_id UUID REFERENCES platform_users(id),
  submitted_at TIMESTAMPTZ,
  approved_by_id UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(production_id, report_date)
);

-- Wrap Reports table
CREATE TABLE IF NOT EXISTS wrap_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  production_id UUID NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
  status report_status_enum DEFAULT 'draft',
  
  -- Financial Summary
  budget_total NUMERIC(12,2),
  actual_spend NUMERIC(12,2),
  variance NUMERIC(12,2) GENERATED ALWAYS AS (
    COALESCE(budget_total, 0) - COALESCE(actual_spend, 0)
  ) STORED,
  variance_percent NUMERIC(5,2),
  
  -- Revenue
  total_revenue NUMERIC(12,2),
  ticket_revenue NUMERIC(12,2),
  sponsorship_revenue NUMERIC(12,2),
  merchandise_revenue NUMERIC(12,2),
  fb_revenue NUMERIC(12,2),
  other_revenue NUMERIC(12,2),
  revenue_breakdown JSONB,
  
  -- Expenses
  expense_breakdown JSONB,
  top_expense_categories JSONB,
  
  -- Profit/Loss
  gross_profit NUMERIC(12,2),
  net_profit NUMERIC(12,2),
  profit_margin NUMERIC(5,2),
  
  -- Attendance
  total_shows INTEGER,
  total_attendance INTEGER,
  average_attendance INTEGER,
  peak_attendance INTEGER,
  lowest_attendance INTEGER,
  overall_capacity_percent NUMERIC(5,2),
  demographics JSONB,
  
  -- Marketing
  marketing_spend NUMERIC(10,2),
  marketing_roi NUMERIC(5,2),
  marketing_metrics JSONB,
  acquisition_channels JSONB,
  social_metrics JSONB,
  email_metrics JSONB,
  press_coverage JSONB,
  
  -- Sponsorship
  sponsorship_total NUMERIC(10,2),
  sponsors_count INTEGER,
  sponsor_satisfaction JSONB,
  renewal_prospects JSONB,
  sponsorship_recap JSONB,
  
  -- Operations
  operations_assessment TEXT,
  crew_performance TEXT,
  vendor_assessments JSONB,
  
  -- Guest Experience
  guest_satisfaction NUMERIC(3,2),
  nps_score INTEGER,
  guest_feedback_summary TEXT,
  top_complaints JSONB,
  top_compliments JSONB,
  
  -- Safety
  total_incidents INTEGER,
  incident_summary JSONB,
  safety_assessment TEXT,
  
  -- Learnings
  what_worked JSONB DEFAULT '[]',
  what_didnt_work JSONB DEFAULT '[]',
  lessons_learned JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  
  -- Future
  would_repeat BOOLEAN,
  repeat_recommendations TEXT,
  suggested_improvements JSONB DEFAULT '[]',
  
  -- Meta
  prepared_by_id UUID REFERENCES platform_users(id),
  prepared_at TIMESTAMPTZ,
  reviewed_by_id UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  approved_by_id UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  attachments JSONB DEFAULT '[]',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(production_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expense_reports_org ON expense_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_expense_reports_production ON expense_reports(production_id);
CREATE INDEX IF NOT EXISTS idx_expense_reports_submitter ON expense_reports(submitter_id);
CREATE INDEX IF NOT EXISTS idx_expense_reports_status ON expense_reports(status);
CREATE INDEX IF NOT EXISTS idx_expense_reports_period ON expense_reports(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_expense_line_items_report ON expense_line_items(expense_report_id);
CREATE INDEX IF NOT EXISTS idx_expense_line_items_date ON expense_line_items(expense_date);
CREATE INDEX IF NOT EXISTS idx_expense_line_items_category ON expense_line_items(category);

CREATE INDEX IF NOT EXISTS idx_daily_reports_org ON daily_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_production ON daily_reports(production_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_status ON daily_reports(status);

CREATE INDEX IF NOT EXISTS idx_wrap_reports_org ON wrap_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_wrap_reports_production ON wrap_reports(production_id);
CREATE INDEX IF NOT EXISTS idx_wrap_reports_status ON wrap_reports(status);

-- Function to calculate expense report total
CREATE OR REPLACE FUNCTION calculate_expense_report_total()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE expense_reports
  SET 
    total_amount = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM expense_line_items 
      WHERE expense_report_id = COALESCE(NEW.expense_report_id, OLD.expense_report_id)
        AND reimbursable = true
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.expense_report_id, OLD.expense_report_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS expense_line_item_total_trigger ON expense_line_items;
CREATE TRIGGER expense_line_item_total_trigger
  AFTER INSERT OR UPDATE OR DELETE ON expense_line_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_expense_report_total();

-- Function to generate daily report
CREATE OR REPLACE FUNCTION generate_daily_report(
  p_production_id UUID,
  p_report_date DATE,
  p_created_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_report_id UUID;
  v_org_id UUID;
  v_show RECORD;
  v_attendance INTEGER;
  v_incidents INTEGER;
BEGIN
  -- Get organization
  SELECT organization_id INTO v_org_id FROM productions WHERE id = p_production_id;
  
  -- Get show for the date
  SELECT * INTO v_show FROM shows WHERE production_id = p_production_id AND date = p_report_date LIMIT 1;
  
  -- Count incidents
  SELECT COUNT(*) INTO v_incidents 
  FROM production_incidents 
  WHERE production_id = p_production_id AND incident_at::DATE = p_report_date;
  
  -- Insert or update daily report
  INSERT INTO daily_reports (
    organization_id, production_id, show_id, report_date,
    tickets_sold, attendance, capacity, incidents_count,
    submitted_by_id, status
  ) VALUES (
    v_org_id, p_production_id, v_show.id, p_report_date,
    COALESCE(v_show.tickets_sold, 0),
    COALESCE(v_show.attendance, v_show.tickets_sold, 0),
    v_show.capacity,
    v_incidents,
    p_created_by, 'draft'
  )
  ON CONFLICT (production_id, report_date) DO UPDATE SET
    tickets_sold = EXCLUDED.tickets_sold,
    attendance = EXCLUDED.attendance,
    incidents_count = EXCLUDED.incidents_count,
    updated_at = NOW()
  RETURNING id INTO v_report_id;
  
  RETURN v_report_id;
END;
$$;

-- Function to generate wrap report
CREATE OR REPLACE FUNCTION generate_wrap_report(
  p_production_id UUID,
  p_created_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_report_id UUID;
  v_org_id UUID;
  v_totals RECORD;
BEGIN
  -- Get organization
  SELECT organization_id INTO v_org_id FROM productions WHERE id = p_production_id;
  
  -- Calculate totals from daily reports
  SELECT 
    COUNT(*) AS total_shows,
    SUM(attendance) AS total_attendance,
    AVG(attendance)::INTEGER AS avg_attendance,
    MAX(attendance) AS peak_attendance,
    MIN(attendance) AS lowest_attendance,
    SUM(total_revenue) AS total_revenue,
    SUM(ticket_revenue) AS ticket_revenue,
    SUM(fb_revenue) AS fb_revenue,
    SUM(merch_revenue) AS merch_revenue,
    SUM(incidents_count) AS total_incidents
  INTO v_totals
  FROM daily_reports
  WHERE production_id = p_production_id;
  
  -- Insert wrap report
  INSERT INTO wrap_reports (
    organization_id, production_id, status,
    total_shows, total_attendance, average_attendance,
    peak_attendance, lowest_attendance,
    total_revenue, ticket_revenue, fb_revenue, merchandise_revenue,
    total_incidents, prepared_by_id, prepared_at
  ) VALUES (
    v_org_id, p_production_id, 'draft',
    v_totals.total_shows, v_totals.total_attendance, v_totals.avg_attendance,
    v_totals.peak_attendance, v_totals.lowest_attendance,
    v_totals.total_revenue, v_totals.ticket_revenue, v_totals.fb_revenue, v_totals.merch_revenue,
    v_totals.total_incidents, p_created_by, NOW()
  )
  ON CONFLICT (production_id) DO UPDATE SET
    total_shows = EXCLUDED.total_shows,
    total_attendance = EXCLUDED.total_attendance,
    average_attendance = EXCLUDED.average_attendance,
    peak_attendance = EXCLUDED.peak_attendance,
    lowest_attendance = EXCLUDED.lowest_attendance,
    total_revenue = EXCLUDED.total_revenue,
    ticket_revenue = EXCLUDED.ticket_revenue,
    fb_revenue = EXCLUDED.fb_revenue,
    merchandise_revenue = EXCLUDED.merchandise_revenue,
    total_incidents = EXCLUDED.total_incidents,
    updated_at = NOW()
  RETURNING id INTO v_report_id;
  
  RETURN v_report_id;
END;
$$;

-- Function to get expense summary
CREATE OR REPLACE FUNCTION get_expense_summary(p_production_id UUID)
RETURNS TABLE (
  total_expenses NUMERIC,
  approved_expenses NUMERIC,
  pending_expenses NUMERIC,
  by_category JSONB,
  by_department JSONB,
  top_vendors JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(eli.amount), 0) AS total_expenses,
    COALESCE(SUM(eli.amount) FILTER (WHERE er.status = 'approved'), 0) AS approved_expenses,
    COALESCE(SUM(eli.amount) FILTER (WHERE er.status IN ('draft', 'submitted', 'under_review')), 0) AS pending_expenses,
    (SELECT jsonb_object_agg(category, total) FROM (
      SELECT category, SUM(amount) AS total
      FROM expense_line_items eli2
      JOIN expense_reports er2 ON eli2.expense_report_id = er2.id
      WHERE er2.production_id = p_production_id
      GROUP BY category
    ) sub) AS by_category,
    (SELECT jsonb_object_agg(COALESCE(d.name, 'Unassigned'), total) FROM (
      SELECT eli2.department_id, SUM(eli2.amount) AS total
      FROM expense_line_items eli2
      JOIN expense_reports er2 ON eli2.expense_report_id = er2.id
      WHERE er2.production_id = p_production_id
      GROUP BY eli2.department_id
    ) sub
    LEFT JOIN departments d ON sub.department_id = d.id) AS by_department,
    (SELECT jsonb_agg(jsonb_build_object('vendor', vendor, 'total', total) ORDER BY total DESC) FROM (
      SELECT vendor, SUM(amount) AS total
      FROM expense_line_items eli2
      JOIN expense_reports er2 ON eli2.expense_report_id = er2.id
      WHERE er2.production_id = p_production_id
      GROUP BY vendor
      ORDER BY total DESC
      LIMIT 10
    ) sub) AS top_vendors
  FROM expense_line_items eli
  JOIN expense_reports er ON eli.expense_report_id = er.id
  WHERE er.production_id = p_production_id;
END;
$$;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_reports_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS expense_reports_updated_at ON expense_reports;
CREATE TRIGGER expense_reports_updated_at
  BEFORE UPDATE ON expense_reports
  FOR EACH ROW EXECUTE FUNCTION update_reports_timestamp();

DROP TRIGGER IF EXISTS expense_line_items_updated_at ON expense_line_items;
CREATE TRIGGER expense_line_items_updated_at
  BEFORE UPDATE ON expense_line_items
  FOR EACH ROW EXECUTE FUNCTION update_reports_timestamp();

DROP TRIGGER IF EXISTS daily_reports_updated_at ON daily_reports;
CREATE TRIGGER daily_reports_updated_at
  BEFORE UPDATE ON daily_reports
  FOR EACH ROW EXECUTE FUNCTION update_reports_timestamp();

DROP TRIGGER IF EXISTS wrap_reports_updated_at ON wrap_reports;
CREATE TRIGGER wrap_reports_updated_at
  BEFORE UPDATE ON wrap_reports
  FOR EACH ROW EXECUTE FUNCTION update_reports_timestamp();

-- RLS Policies
ALTER TABLE expense_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrap_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY expense_reports_select ON expense_reports
  FOR SELECT TO authenticated
  USING (org_matches(organization_id) OR submitter_id = current_platform_user_id());

CREATE POLICY expense_reports_manage ON expense_reports
  FOR ALL TO authenticated
  USING (
    submitter_id = current_platform_user_id() 
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  )
  WITH CHECK (
    submitter_id = current_platform_user_id() 
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY expense_line_items_select ON expense_line_items
  FOR SELECT TO authenticated
  USING (expense_report_id IN (SELECT id FROM expense_reports WHERE org_matches(organization_id)));

CREATE POLICY expense_line_items_manage ON expense_line_items
  FOR ALL TO authenticated
  USING (expense_report_id IN (SELECT id FROM expense_reports WHERE submitter_id = current_platform_user_id() OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')))
  WITH CHECK (expense_report_id IN (SELECT id FROM expense_reports WHERE submitter_id = current_platform_user_id() OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')));

CREATE POLICY daily_reports_select ON daily_reports
  FOR SELECT TO authenticated
  USING (org_matches(organization_id));

CREATE POLICY daily_reports_manage ON daily_reports
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY wrap_reports_select ON wrap_reports
  FOR SELECT TO authenticated
  USING (org_matches(organization_id));

CREATE POLICY wrap_reports_manage ON wrap_reports
  FOR ALL TO authenticated
  USING (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON expense_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON expense_line_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON daily_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON wrap_reports TO authenticated;

GRANT EXECUTE ON FUNCTION generate_daily_report(UUID, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_wrap_report(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_expense_summary(UUID) TO authenticated;
