-- Migration: Advanced Analytics and Predictive Insights
-- Description: Cross-platform analytics, forecasting, and predictive models

-- Analytics dashboards configuration
CREATE TABLE IF NOT EXISTS analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  dashboard_type VARCHAR(50) NOT NULL CHECK (dashboard_type IN ('executive', 'operations', 'finance', 'marketing', 'production', 'custom')),
  
  -- Layout
  layout JSONB DEFAULT '{"columns": 12, "rows": []}',
  widgets JSONB DEFAULT '[]',
  
  -- Settings
  is_default BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with JSONB DEFAULT '[]',
  refresh_interval_seconds INTEGER DEFAULT 300,
  
  -- Filters
  default_date_range VARCHAR(50) DEFAULT '30d',
  default_filters JSONB DEFAULT '{}',
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics metrics definitions
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  metric_key VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  platform VARCHAR(50) CHECK (platform IN ('atlvs', 'compvss', 'gvteway', 'cross_platform')),
  
  -- Calculation
  calculation_type VARCHAR(50) NOT NULL CHECK (calculation_type IN ('count', 'sum', 'average', 'min', 'max', 'percentage', 'ratio', 'custom')),
  source_table VARCHAR(100),
  source_column VARCHAR(100),
  aggregation_sql TEXT,
  
  -- Display
  display_format VARCHAR(50) DEFAULT 'number',
  unit VARCHAR(50),
  decimal_places INTEGER DEFAULT 2,
  
  -- Thresholds
  warning_threshold DECIMAL(15,2),
  critical_threshold DECIMAL(15,2),
  threshold_direction VARCHAR(10) CHECK (threshold_direction IN ('above', 'below')),
  
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, metric_key)
);

-- Analytics data points (time series)
CREATE TABLE IF NOT EXISTS analytics_data_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric_id UUID NOT NULL REFERENCES analytics_metrics(id) ON DELETE CASCADE,
  
  timestamp TIMESTAMPTZ NOT NULL,
  value DECIMAL(20,4) NOT NULL,
  
  -- Dimensions
  dimension_1 VARCHAR(255),
  dimension_2 VARCHAR(255),
  dimension_3 VARCHAR(255),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predictive models
CREATE TABLE IF NOT EXISTS predictive_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  model_type VARCHAR(50) NOT NULL CHECK (model_type IN ('revenue_forecast', 'demand_forecast', 'churn_prediction', 'ticket_sales', 'resource_optimization', 'custom')),
  
  -- Model configuration
  algorithm VARCHAR(100),
  features JSONB DEFAULT '[]',
  hyperparameters JSONB DEFAULT '{}',
  
  -- Training
  last_trained_at TIMESTAMPTZ,
  training_data_start DATE,
  training_data_end DATE,
  training_metrics JSONB DEFAULT '{}',
  
  -- Performance
  accuracy DECIMAL(5,4),
  mape DECIMAL(5,4),
  rmse DECIMAL(15,4),
  
  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'training', 'active', 'deprecated')),
  
  model_artifact_url TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Predictions
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES predictive_models(id) ON DELETE CASCADE,
  
  prediction_date DATE NOT NULL,
  target_date DATE NOT NULL,
  
  predicted_value DECIMAL(20,4) NOT NULL,
  confidence_lower DECIMAL(20,4),
  confidence_upper DECIMAL(20,4),
  confidence_level DECIMAL(5,4) DEFAULT 0.95,
  
  -- Actual value (filled in later)
  actual_value DECIMAL(20,4),
  error DECIMAL(20,4),
  
  -- Dimensions
  dimension_key VARCHAR(255),
  dimension_value VARCHAR(255),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPI targets
CREATE TABLE IF NOT EXISTS kpi_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric_id UUID NOT NULL REFERENCES analytics_metrics(id) ON DELETE CASCADE,
  
  period_type VARCHAR(50) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  target_value DECIMAL(20,4) NOT NULL,
  stretch_target DECIMAL(20,4),
  
  -- Progress
  current_value DECIMAL(20,4),
  progress_percent DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'behind', 'exceeded')),
  
  notes TEXT,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Analytics alerts
CREATE TABLE IF NOT EXISTS analytics_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric_id UUID REFERENCES analytics_metrics(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Condition
  condition_type VARCHAR(50) NOT NULL CHECK (condition_type IN ('threshold', 'anomaly', 'trend', 'comparison')),
  condition_config JSONB NOT NULL,
  
  -- Notification
  notification_channels JSONB DEFAULT '["email"]',
  recipients JSONB DEFAULT '[]',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  
  -- Cooldown
  cooldown_minutes INTEGER DEFAULT 60,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Analytics alert history
CREATE TABLE IF NOT EXISTS analytics_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES analytics_alerts(id) ON DELETE CASCADE,
  
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  metric_value DECIMAL(20,4),
  threshold_value DECIMAL(20,4),
  
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_channels JSONB DEFAULT '[]',
  
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES platform_users(id),
  
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  metadata JSONB DEFAULT '{}'
);

-- Cross-platform reports
CREATE TABLE IF NOT EXISTS cross_platform_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('executive_summary', 'financial', 'operational', 'marketing', 'custom')),
  
  -- Configuration
  platforms JSONB DEFAULT '["atlvs", "compvss", "gvteway"]',
  sections JSONB DEFAULT '[]',
  filters JSONB DEFAULT '{}',
  
  -- Schedule
  schedule_type VARCHAR(50) CHECK (schedule_type IN ('manual', 'daily', 'weekly', 'monthly')),
  schedule_config JSONB DEFAULT '{}',
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  
  -- Distribution
  recipients JSONB DEFAULT '[]',
  delivery_format VARCHAR(50) DEFAULT 'pdf' CHECK (delivery_format IN ('pdf', 'excel', 'html', 'json')),
  
  is_active BOOLEAN DEFAULT TRUE,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_org ON analytics_dashboards(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_user ON analytics_dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_org ON analytics_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_key ON analytics_metrics(metric_key);
CREATE INDEX IF NOT EXISTS idx_analytics_data_points_metric ON analytics_data_points(metric_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_points_timestamp ON analytics_data_points(timestamp);
CREATE INDEX IF NOT EXISTS idx_predictive_models_org ON predictive_models(organization_id);
CREATE INDEX IF NOT EXISTS idx_predictions_model ON predictions(model_id);
CREATE INDEX IF NOT EXISTS idx_predictions_dates ON predictions(prediction_date, target_date);
CREATE INDEX IF NOT EXISTS idx_kpi_targets_org ON kpi_targets(organization_id);
CREATE INDEX IF NOT EXISTS idx_kpi_targets_metric ON kpi_targets(metric_id);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_org ON analytics_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_alert_history_alert ON analytics_alert_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_cross_platform_reports_org ON cross_platform_reports(organization_id);

-- RLS Policies
ALTER TABLE analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_platform_reports ENABLE ROW LEVEL SECURITY;

-- Dashboards - users can see their own and shared
CREATE POLICY "analytics_dashboards_select" ON analytics_dashboards
  FOR SELECT USING (
    user_id = auth.uid()
    OR is_shared = TRUE
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = analytics_dashboards.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "analytics_dashboards_manage" ON analytics_dashboards
  FOR ALL USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = analytics_dashboards.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Metrics - org members can view
CREATE POLICY "analytics_metrics_select" ON analytics_metrics
  FOR SELECT USING (
    organization_id IS NULL
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = analytics_metrics.organization_id
    )
  );

-- Data points - org members can view
CREATE POLICY "analytics_data_points_select" ON analytics_data_points
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = analytics_data_points.organization_id
    )
  );

-- Predictive models - admins can manage
CREATE POLICY "predictive_models_select" ON predictive_models
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = predictive_models.organization_id
    )
  );

CREATE POLICY "predictive_models_manage" ON predictive_models
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = predictive_models.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- KPI targets - org members can view
CREATE POLICY "kpi_targets_select" ON kpi_targets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = kpi_targets.organization_id
    )
  );

-- Alerts - org members can view
CREATE POLICY "analytics_alerts_select" ON analytics_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = analytics_alerts.organization_id
    )
  );

-- Reports - org members can view
CREATE POLICY "cross_platform_reports_select" ON cross_platform_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = cross_platform_reports.organization_id
    )
  );

-- Seed system metrics
INSERT INTO analytics_metrics (organization_id, metric_key, name, description, category, platform, calculation_type, is_system) VALUES
(NULL, 'total_revenue', 'Total Revenue', 'Total revenue across all platforms', 'Financial', 'cross_platform', 'sum', TRUE),
(NULL, 'ticket_sales', 'Ticket Sales', 'Total ticket sales count', 'Sales', 'gvteway', 'count', TRUE),
(NULL, 'active_projects', 'Active Projects', 'Number of active projects', 'Operations', 'atlvs', 'count', TRUE),
(NULL, 'crew_utilization', 'Crew Utilization Rate', 'Percentage of crew hours utilized', 'Operations', 'compvss', 'percentage', TRUE),
(NULL, 'customer_satisfaction', 'Customer Satisfaction Score', 'Average customer satisfaction rating', 'Customer', 'gvteway', 'average', TRUE),
(NULL, 'event_attendance', 'Event Attendance', 'Total event attendance', 'Events', 'gvteway', 'sum', TRUE),
(NULL, 'vendor_spend', 'Vendor Spend', 'Total spend with vendors', 'Financial', 'atlvs', 'sum', TRUE),
(NULL, 'production_efficiency', 'Production Efficiency', 'Production efficiency score', 'Operations', 'compvss', 'average', TRUE)
ON CONFLICT DO NOTHING;
