-- Migration: Crew Calls & Change Orders System
-- Description: Tables for crew call sheets, change orders, and production management

-- Crew calls table
CREATE TABLE IF NOT EXISTS crew_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id),
  call_number TEXT,
  call_date DATE NOT NULL,
  call_time TIME NOT NULL,
  end_time TIME,
  location TEXT NOT NULL,
  venue_id UUID REFERENCES venues(id),
  address TEXT,
  parking_info TEXT,
  load_in_time TIME,
  sound_check_time TIME,
  doors_time TIME,
  show_time TIME,
  notes TEXT,
  special_instructions TEXT,
  weather_contingency TEXT,
  catering_info TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_calls_project ON crew_calls(project_id);
CREATE INDEX IF NOT EXISTS idx_crew_calls_date ON crew_calls(call_date);
CREATE INDEX IF NOT EXISTS idx_crew_calls_status ON crew_calls(status);

-- Crew call assignments table
CREATE TABLE IF NOT EXISTS crew_call_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_call_id UUID NOT NULL REFERENCES crew_calls(id) ON DELETE CASCADE,
  crew_id UUID NOT NULL REFERENCES platform_users(id),
  role TEXT NOT NULL,
  department TEXT,
  call_time TIME NOT NULL,
  end_time TIME,
  rate NUMERIC(10,2),
  rate_type TEXT DEFAULT 'hourly' CHECK (rate_type IN ('hourly', 'daily', 'flat')),
  notes TEXT,
  checked_in BOOLEAN DEFAULT false,
  check_in_time TIMESTAMPTZ,
  checked_out BOOLEAN DEFAULT false,
  check_out_time TIMESTAMPTZ,
  hours_worked NUMERIC(5,2),
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'declined', 'no_show', 'completed')),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crew_call_id, crew_id)
);

CREATE INDEX IF NOT EXISTS idx_crew_call_assignments_call ON crew_call_assignments(crew_call_id);
CREATE INDEX IF NOT EXISTS idx_crew_call_assignments_crew ON crew_call_assignments(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_call_assignments_status ON crew_call_assignments(status);

-- Change orders table
CREATE TABLE IF NOT EXISTS change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  co_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reason TEXT NOT NULL,
  reason_category TEXT CHECK (reason_category IN ('scope_change', 'design_change', 'unforeseen_conditions', 'client_request', 'regulatory', 'value_engineering', 'error_correction', 'other')),
  cost_impact NUMERIC(15,2) DEFAULT 0,
  original_cost NUMERIC(15,2),
  revised_cost NUMERIC(15,2),
  schedule_impact_days INT DEFAULT 0,
  original_end_date DATE,
  revised_end_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  affected_areas TEXT[],
  affected_departments TEXT[],
  attachments TEXT[],
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'under_review', 'approved', 'rejected', 'cancelled', 'implemented')),
  requested_by UUID NOT NULL REFERENCES platform_users(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES platform_users(id),
  reviewed_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  implementation_notes TEXT,
  implemented_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, co_number)
);

CREATE INDEX IF NOT EXISTS idx_change_orders_project ON change_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON change_orders(status);
CREATE INDEX IF NOT EXISTS idx_change_orders_requested_by ON change_orders(requested_by);
CREATE INDEX IF NOT EXISTS idx_change_orders_priority ON change_orders(priority);

-- Change order line items
CREATE TABLE IF NOT EXISTS change_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_order_id UUID NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('labor', 'material', 'equipment', 'subcontractor', 'other')),
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit TEXT,
  unit_cost NUMERIC(10,2),
  total_cost NUMERIC(15,2),
  markup_percent NUMERIC(5,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_change_order_items_co ON change_order_items(change_order_id);

-- Change order approvals (for multi-level approval)
CREATE TABLE IF NOT EXISTS change_order_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  change_order_id UUID NOT NULL REFERENCES change_orders(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES platform_users(id),
  approval_level INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
  comments TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_change_order_approvals_co ON change_order_approvals(change_order_id);
CREATE INDEX IF NOT EXISTS idx_change_order_approvals_approver ON change_order_approvals(approver_id);

-- Daily production reports
CREATE TABLE IF NOT EXISTS daily_production_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  weather_conditions TEXT,
  temperature_high INT,
  temperature_low INT,
  work_performed TEXT,
  issues_encountered TEXT,
  delays TEXT,
  safety_incidents TEXT,
  visitors TEXT[],
  equipment_on_site TEXT[],
  materials_delivered TEXT,
  crew_count INT,
  total_hours NUMERIC(10,2),
  photos TEXT[],
  notes TEXT,
  submitted_by UUID REFERENCES platform_users(id),
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, report_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_production_reports_project ON daily_production_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_production_reports_date ON daily_production_reports(report_date);

-- Function to generate change order number
CREATE OR REPLACE FUNCTION generate_change_order_number(p_project_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM change_orders WHERE project_id = p_project_id;
  
  RETURN 'CO-' || LPAD(v_count::TEXT, 4, '0');
END;
$$;

-- Function to calculate crew call hours
CREATE OR REPLACE FUNCTION calculate_crew_hours()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.check_in_time IS NOT NULL AND NEW.check_out_time IS NOT NULL THEN
    NEW.hours_worked := EXTRACT(EPOCH FROM (NEW.check_out_time - NEW.check_in_time)) / 3600;
    IF NEW.hours_worked > 8 THEN
      NEW.overtime_hours := NEW.hours_worked - 8;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS crew_hours_trigger ON crew_call_assignments;
CREATE TRIGGER crew_hours_trigger
  BEFORE UPDATE ON crew_call_assignments
  FOR EACH ROW
  EXECUTE FUNCTION calculate_crew_hours();

-- Function to update project budget on CO approval
CREATE OR REPLACE FUNCTION update_project_on_change_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Update project budget
    UPDATE projects SET
      budget = budget + COALESCE(NEW.cost_impact, 0),
      updated_at = NOW()
    WHERE id = NEW.project_id;
    
    -- Update end date if schedule impact
    IF NEW.schedule_impact_days > 0 THEN
      UPDATE projects SET
        end_date = end_date + (NEW.schedule_impact_days || ' days')::INTERVAL
      WHERE id = NEW.project_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS change_order_approval_trigger ON change_orders;
CREATE TRIGGER change_order_approval_trigger
  AFTER UPDATE ON change_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_project_on_change_order();

-- RLS policies
ALTER TABLE crew_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_call_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_order_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_production_reports ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON crew_calls TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON crew_call_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON change_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON change_order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON change_order_approvals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON daily_production_reports TO authenticated;
GRANT EXECUTE ON FUNCTION generate_change_order_number(UUID) TO authenticated;
