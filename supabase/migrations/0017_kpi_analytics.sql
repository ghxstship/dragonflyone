-- ============================================================================
-- 0017_kpi_analytics.sql
-- KPI Tracking, Analytics, and Reporting Tables
-- GHXSTSHIP Platform - 3NF Gap Remediation
-- ============================================================================

-- ============================================================================
-- KPI DATA POINTS (Historical KPI values)
-- ============================================================================

CREATE TABLE kpi_data_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  kpi_code TEXT NOT NULL,
  kpi_name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  department_id UUID REFERENCES legend_departments(id),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  dimension_1 TEXT,
  dimension_2 TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kpi_data_org ON kpi_data_points(organization_id, kpi_code, calculated_at DESC);
CREATE INDEX idx_kpi_data_project ON kpi_data_points(project_id, kpi_code);
CREATE INDEX idx_kpi_data_event ON kpi_data_points(event_id, kpi_code);
CREATE INDEX idx_kpi_data_period ON kpi_data_points(period_start, period_end);
CREATE INDEX idx_kpi_data_code ON kpi_data_points(kpi_code);

-- ============================================================================
-- KPI REPORTS (Report definitions)
-- ============================================================================

CREATE TABLE kpi_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  kpi_codes TEXT[] NOT NULL DEFAULT '{}',
  category TEXT,
  report_type TEXT DEFAULT 'standard' CHECK (report_type IN ('standard', 'dashboard', 'executive', 'operational', 'custom')),
  filters JSONB DEFAULT '{}'::jsonb,
  visualization_config JSONB DEFAULT '{}'::jsonb,
  schedule TEXT,
  recipients TEXT[],
  is_global BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kpi_reports_org ON kpi_reports(organization_id);
CREATE INDEX idx_kpi_reports_category ON kpi_reports(category);
CREATE INDEX idx_kpi_reports_global ON kpi_reports(is_global) WHERE is_global = true;

-- ============================================================================
-- KPI TARGETS (Target values and thresholds)
-- ============================================================================

CREATE TABLE kpi_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  kpi_code TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  warning_threshold NUMERIC,
  critical_threshold NUMERIC,
  comparison_operator TEXT DEFAULT 'gte' CHECK (comparison_operator IN ('gt', 'gte', 'lt', 'lte', 'eq', 'between')),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE CASCADE,
  department_id UUID REFERENCES legend_departments(id),
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_to TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_kpi_targets_org ON kpi_targets(organization_id, kpi_code);
CREATE INDEX idx_kpi_targets_project ON kpi_targets(project_id);
CREATE INDEX idx_kpi_targets_validity ON kpi_targets(valid_from, valid_to);

-- ============================================================================
-- ALERT THRESHOLDS (System alerts configuration)
-- ============================================================================

CREATE TABLE alert_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  metric_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  threshold_value NUMERIC NOT NULL,
  comparison_operator TEXT NOT NULL CHECK (comparison_operator IN ('gt', 'gte', 'lt', 'lte', 'eq', 'neq')),
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  notification_channels TEXT[] DEFAULT ARRAY['email'],
  notification_recipients TEXT[],
  cooldown_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_alert_thresholds_org ON alert_thresholds(organization_id);
CREATE INDEX idx_alert_thresholds_metric ON alert_thresholds(metric_type);
CREATE INDEX idx_alert_thresholds_active ON alert_thresholds(is_active) WHERE is_active = true;

-- ============================================================================
-- ALERT HISTORY (Triggered alerts)
-- ============================================================================

CREATE TABLE alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  threshold_id UUID REFERENCES alert_thresholds(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  metric_value NUMERIC,
  threshold_value NUMERIC,
  entity_type TEXT,
  entity_id UUID,
  status TEXT DEFAULT 'triggered' CHECK (status IN ('triggered', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_by UUID REFERENCES platform_users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_alert_history_org ON alert_history(organization_id, triggered_at DESC);
CREATE INDEX idx_alert_history_status ON alert_history(status);
CREATE INDEX idx_alert_history_severity ON alert_history(severity);
CREATE INDEX idx_alert_history_threshold ON alert_history(threshold_id);

-- ============================================================================
-- CLIENT FEEDBACK (NPS and satisfaction)
-- ============================================================================

CREATE TABLE client_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  person_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ATLVS', 'COMPVSS', 'GVTEWAY')),
  feedback_type TEXT DEFAULT 'general' CHECK (feedback_type IN ('nps', 'csat', 'ces', 'general', 'review')),
  feedback_channel TEXT,
  nps_score SMALLINT CHECK (nps_score BETWEEN 0 AND 10),
  satisfaction_score SMALLINT CHECK (satisfaction_score BETWEEN 1 AND 5),
  effort_score SMALLINT CHECK (effort_score BETWEEN 1 AND 7),
  comment TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  tags TEXT[],
  is_public BOOLEAN DEFAULT false,
  response TEXT,
  responded_by UUID REFERENCES platform_users(id),
  responded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_org ON client_feedback(organization_id, submitted_at DESC);
CREATE INDEX idx_feedback_project ON client_feedback(project_id);
CREATE INDEX idx_feedback_event ON client_feedback(event_id);
CREATE INDEX idx_feedback_platform ON client_feedback(platform);
CREATE INDEX idx_feedback_type ON client_feedback(feedback_type);

-- ============================================================================
-- DASHBOARD CONFIGS (User dashboard configurations)
-- ============================================================================

CREATE TABLE dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  dashboard_type TEXT DEFAULT 'custom' CHECK (dashboard_type IN ('executive', 'operational', 'financial', 'project', 'custom')),
  layout JSONB DEFAULT '[]'::jsonb,
  widgets JSONB DEFAULT '[]'::jsonb,
  filters JSONB DEFAULT '{}'::jsonb,
  refresh_interval INTEGER DEFAULT 300,
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dashboard_configs_org ON dashboard_configs(organization_id);
CREATE INDEX idx_dashboard_configs_user ON dashboard_configs(user_id);
CREATE INDEX idx_dashboard_configs_type ON dashboard_configs(dashboard_type);

-- ============================================================================
-- ANALYTICS REPORTS (Generated report instances)
-- ============================================================================

CREATE TABLE analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  report_definition_id UUID REFERENCES kpi_reports(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  data JSONB,
  file_url TEXT,
  file_format TEXT CHECK (file_format IN ('pdf', 'xlsx', 'csv', 'json')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT,
  generated_by UUID REFERENCES platform_users(id),
  generated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_reports_org ON analytics_reports(organization_id, created_at DESC);
CREATE INDEX idx_analytics_reports_status ON analytics_reports(status);
CREATE INDEX idx_analytics_reports_user ON analytics_reports(generated_by);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE kpi_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;

-- KPI Data Points policies
CREATE POLICY kpi_data_select ON kpi_data_points FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY kpi_data_manage ON kpi_data_points FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- KPI Reports policies
CREATE POLICY kpi_reports_select ON kpi_reports FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY kpi_reports_manage ON kpi_reports FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- KPI Targets policies
CREATE POLICY kpi_targets_select ON kpi_targets FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY kpi_targets_manage ON kpi_targets FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Alert Thresholds policies
CREATE POLICY alert_thresholds_select ON alert_thresholds FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY alert_thresholds_manage ON alert_thresholds FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Alert History policies
CREATE POLICY alert_history_select ON alert_history FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY alert_history_insert ON alert_history FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY alert_history_update ON alert_history FOR UPDATE USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Client Feedback policies
CREATE POLICY feedback_select ON client_feedback FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY feedback_insert ON client_feedback FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY feedback_manage ON client_feedback FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Dashboard Configs policies
CREATE POLICY dashboard_select ON dashboard_configs FOR SELECT USING (org_matches(organization_id) AND (user_id = current_platform_user_id() OR is_shared OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')));
CREATE POLICY dashboard_insert ON dashboard_configs FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY dashboard_update ON dashboard_configs FOR UPDATE USING (org_matches(organization_id) AND (user_id = current_platform_user_id() OR role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')));
CREATE POLICY dashboard_delete ON dashboard_configs FOR DELETE USING (org_matches(organization_id) AND (user_id = current_platform_user_id() OR role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')));

-- Analytics Reports policies
CREATE POLICY analytics_reports_select ON analytics_reports FOR SELECT USING (org_matches(organization_id) AND (generated_by = current_platform_user_id() OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')));
CREATE POLICY analytics_reports_manage ON analytics_reports FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON kpi_data_points TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON kpi_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON kpi_targets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON alert_thresholds TO authenticated;
GRANT SELECT, INSERT, UPDATE ON alert_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dashboard_configs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_reports TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER kpi_reports_updated_at BEFORE UPDATE ON kpi_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER kpi_targets_updated_at BEFORE UPDATE ON kpi_targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER alert_thresholds_updated_at BEFORE UPDATE ON alert_thresholds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER dashboard_configs_updated_at BEFORE UPDATE ON dashboard_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION record_kpi_data_point(
  p_organization_id UUID,
  p_kpi_code TEXT,
  p_kpi_name TEXT,
  p_value NUMERIC,
  p_unit TEXT,
  p_project_id UUID DEFAULT NULL,
  p_event_id UUID DEFAULT NULL,
  p_period_start TIMESTAMPTZ DEFAULT NULL,
  p_period_end TIMESTAMPTZ DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO kpi_data_points (
    organization_id,
    kpi_code,
    kpi_name,
    value,
    unit,
    project_id,
    event_id,
    period_start,
    period_end,
    metadata
  ) VALUES (
    p_organization_id,
    p_kpi_code,
    p_kpi_name,
    p_value,
    p_unit,
    p_project_id,
    p_event_id,
    p_period_start,
    p_period_end,
    p_metadata
  ) RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION record_kpi_data_point TO authenticated;

CREATE OR REPLACE FUNCTION get_kpi_trend(
  p_organization_id UUID,
  p_kpi_code TEXT,
  p_days INTEGER DEFAULT 30,
  p_project_id UUID DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  value NUMERIC,
  target_value NUMERIC,
  warning_threshold NUMERIC,
  critical_threshold NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kdp.calculated_at::DATE AS date,
    AVG(kdp.value) AS value,
    MAX(kt.target_value) AS target_value,
    MAX(kt.warning_threshold) AS warning_threshold,
    MAX(kt.critical_threshold) AS critical_threshold
  FROM kpi_data_points kdp
  LEFT JOIN kpi_targets kt ON 
    kt.organization_id = kdp.organization_id 
    AND kt.kpi_code = kdp.kpi_code
    AND kdp.calculated_at BETWEEN kt.valid_from AND COALESCE(kt.valid_to, 'infinity'::TIMESTAMPTZ)
  WHERE kdp.organization_id = p_organization_id
    AND kdp.kpi_code = p_kpi_code
    AND kdp.calculated_at >= now() - (p_days || ' days')::INTERVAL
    AND (p_project_id IS NULL OR kdp.project_id = p_project_id)
  GROUP BY kdp.calculated_at::DATE
  ORDER BY date DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_kpi_trend TO authenticated;

CREATE OR REPLACE FUNCTION record_alert(
  p_organization_id UUID,
  p_alert_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_metric_value NUMERIC DEFAULT NULL,
  p_threshold_value NUMERIC DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_threshold_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO alert_history (
    organization_id,
    threshold_id,
    alert_type,
    severity,
    title,
    message,
    metric_value,
    threshold_value,
    entity_type,
    entity_id
  ) VALUES (
    p_organization_id,
    p_threshold_id,
    p_alert_type,
    p_severity,
    p_title,
    p_message,
    p_metric_value,
    p_threshold_value,
    p_entity_type,
    p_entity_id
  ) RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION record_alert TO authenticated;

CREATE OR REPLACE FUNCTION acknowledge_alert(
  p_alert_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE alert_history
  SET status = 'acknowledged',
      acknowledged_by = current_platform_user_id(),
      acknowledged_at = now(),
      resolution_notes = COALESCE(p_notes, resolution_notes)
  WHERE id = p_alert_id
    AND org_matches(organization_id);
  
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION acknowledge_alert TO authenticated;

CREATE OR REPLACE FUNCTION get_active_alerts(
  p_organization_id UUID,
  p_severity TEXT DEFAULT NULL
)
RETURNS SETOF alert_history
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM alert_history
  WHERE organization_id = p_organization_id
    AND status IN ('triggered', 'acknowledged')
    AND (p_severity IS NULL OR severity = p_severity)
  ORDER BY 
    CASE severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
    triggered_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_active_alerts TO authenticated;
