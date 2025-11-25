-- Migration: Advanced Analytics and Procurement Automation
-- Description: Tables for custom dashboards, budget variance, asset maintenance, and RFP/RFQ automation

-- Analytics dashboards
CREATE TABLE IF NOT EXISTS analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  refresh_interval INT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_user ON analytics_dashboards(created_by);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_default ON analytics_dashboards(is_default);

-- Dashboard widgets
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  title TEXT NOT NULL,
  data_source TEXT NOT NULL,
  metrics TEXT[],
  dimensions TEXT[],
  filters JSONB,
  time_range TEXT,
  comparison_period TEXT,
  position JSONB NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard ON dashboard_widgets(dashboard_id);

-- Budget line items
CREATE TABLE IF NOT EXISTS budget_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  category TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_line_items_project ON budget_line_items(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_line_items_category ON budget_line_items(category);

-- Budget alert configs
CREATE TABLE IF NOT EXISTS budget_alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) UNIQUE,
  threshold_percent NUMERIC(8,4) DEFAULT 10,
  alert_channels TEXT[] DEFAULT ARRAY['in_app', 'email'],
  alert_recipients UUID[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_alert_configs_project ON budget_alert_configs(project_id);

-- Budget alerts
CREATE TABLE IF NOT EXISTS budget_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  config_id UUID REFERENCES budget_alert_configs(id),
  budget NUMERIC(14,2) NOT NULL,
  actual NUMERIC(14,2) NOT NULL,
  variance_percent NUMERIC(8,4) NOT NULL,
  threshold_percent NUMERIC(8,4) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  dismissed_by UUID REFERENCES platform_users(id)
);

CREATE INDEX IF NOT EXISTS idx_budget_alerts_project ON budget_alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_alerts_active ON budget_alerts(is_active);

-- Maintenance schedules
CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  maintenance_type TEXT NOT NULL,
  frequency TEXT NOT NULL,
  custom_interval_days INT,
  next_due_date TIMESTAMPTZ NOT NULL,
  estimated_duration_hours NUMERIC(8,2),
  estimated_cost NUMERIC(14,2),
  assigned_to UUID REFERENCES platform_users(id),
  instructions TEXT,
  checklist TEXT[],
  notify_days_before INT DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  last_completed_at TIMESTAMPTZ,
  last_completed_by UUID REFERENCES platform_users(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_asset ON maintenance_schedules(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_due ON maintenance_schedules(next_due_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_active ON maintenance_schedules(is_active);

-- Maintenance logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES maintenance_schedules(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  maintenance_type TEXT,
  status TEXT DEFAULT 'completed',
  notes TEXT,
  actual_duration_hours NUMERIC(8,2),
  actual_cost NUMERIC(14,2),
  checklist_completed JSONB,
  issues_found TEXT,
  parts_replaced TEXT[],
  completed_by UUID REFERENCES platform_users(id),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_schedule ON maintenance_logs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_asset ON maintenance_logs(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_completed ON maintenance_logs(completed_at);

-- RFPs
CREATE TABLE IF NOT EXISTS rfps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  rfp_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget_min NUMERIC(14,2),
  budget_max NUMERIC(14,2),
  deadline TIMESTAMPTZ NOT NULL,
  requirements TEXT[],
  evaluation_criteria JSONB,
  invited_vendors UUID[],
  is_public BOOLEAN DEFAULT false,
  attachments TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'evaluating', 'awarded', 'cancelled')),
  published_at TIMESTAMPTZ,
  awarded_to UUID REFERENCES vendors(id),
  awarded_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfps_status ON rfps(status);
CREATE INDEX IF NOT EXISTS idx_rfps_deadline ON rfps(deadline);

-- RFP responses
CREATE TABLE IF NOT EXISTS rfp_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID NOT NULL REFERENCES rfps(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  proposal TEXT,
  pricing JSONB,
  attachments TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'awarded', 'not_selected')),
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfp_responses_rfp ON rfp_responses(rfp_id);
CREATE INDEX IF NOT EXISTS idx_rfp_responses_vendor ON rfp_responses(vendor_id);

-- RFP evaluations
CREATE TABLE IF NOT EXISTS rfp_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID NOT NULL REFERENCES rfps(id),
  response_id UUID NOT NULL REFERENCES rfp_responses(id),
  scores JSONB NOT NULL,
  notes TEXT,
  recommendation TEXT,
  evaluated_by UUID REFERENCES platform_users(id),
  evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfp_evaluations_rfp ON rfp_evaluations(rfp_id);
CREATE INDEX IF NOT EXISTS idx_rfp_evaluations_response ON rfp_evaluations(response_id);

-- RFQs
CREATE TABLE IF NOT EXISTS rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  rfq_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  items JSONB NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  delivery_date DATE,
  delivery_location TEXT,
  invited_vendors UUID[],
  is_public BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'awarded', 'cancelled')),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_deadline ON rfqs(deadline);

-- RFQ quotes
CREATE TABLE IF NOT EXISTS rfq_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  line_items JSONB NOT NULL,
  total_amount NUMERIC(14,2) NOT NULL,
  validity_days INT,
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'selected', 'not_selected')),
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfq_quotes_rfq ON rfq_quotes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_quotes_vendor ON rfq_quotes(vendor_id);

-- Procurement automation rules
CREATE TABLE IF NOT EXISTS procurement_automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  priority INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_procurement_automation_rules_active ON procurement_automation_rules(is_active);

-- Add source fields to purchase_orders
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS source_rfp_id UUID REFERENCES rfps(id);
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS source_rfq_id UUID REFERENCES rfqs(id);

-- Add maintenance fields to assets
ALTER TABLE assets ADD COLUMN IF NOT EXISTS last_maintenance_date TIMESTAMPTZ;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS maintenance_status TEXT;

-- Function to check budget variance
CREATE OR REPLACE FUNCTION check_budget_variance(p_project_id UUID)
RETURNS TABLE (
  budget NUMERIC,
  actual NUMERIC,
  variance NUMERIC,
  variance_percent NUMERIC,
  status TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_budget NUMERIC;
  v_actual NUMERIC;
BEGIN
  SELECT p.budget INTO v_budget
  FROM projects p
  WHERE p.id = p_project_id;
  
  SELECT COALESCE(SUM(e.amount), 0) INTO v_actual
  FROM expenses e
  WHERE e.project_id = p_project_id;
  
  RETURN QUERY
  SELECT 
    v_budget as budget,
    v_actual as actual,
    v_budget - v_actual as variance,
    CASE WHEN v_budget > 0 THEN ((v_actual - v_budget) / v_budget * 100) ELSE 0 END as variance_percent,
    CASE 
      WHEN v_budget > 0 AND ((v_actual - v_budget) / v_budget * 100) > 10 THEN 'over_budget'
      WHEN v_budget > 0 AND ((v_actual - v_budget) / v_budget * 100) > 0 THEN 'at_risk'
      ELSE 'on_track'
    END as status;
END;
$$;

-- RLS policies
ALTER TABLE analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfp_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE procurement_automation_rules ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_dashboards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dashboard_widgets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON budget_line_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON budget_alert_configs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON budget_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON maintenance_schedules TO authenticated;
GRANT SELECT, INSERT ON maintenance_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON rfps TO authenticated;
GRANT SELECT, INSERT, UPDATE ON rfp_responses TO authenticated;
GRANT SELECT, INSERT ON rfp_evaluations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON rfqs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON rfq_quotes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON procurement_automation_rules TO authenticated;
GRANT EXECUTE ON FUNCTION check_budget_variance(UUID) TO authenticated;
