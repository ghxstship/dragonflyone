-- ============================================================================
-- 0015_automation_catalog.sql
-- Automation Catalog: Triggers, Actions, Usage Logging
-- GHXSTSHIP Platform - 3NF Gap Remediation
-- ============================================================================

-- ============================================================================
-- ENUM TYPES FOR AUTOMATION
-- ============================================================================

CREATE TYPE automation_kind AS ENUM ('trigger', 'action');
CREATE TYPE automation_status AS ENUM ('success', 'error', 'pending', 'skipped');

-- ============================================================================
-- AUTOMATION TRIGGER CATALOG
-- ============================================================================

CREATE TABLE automation_trigger_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  category TEXT,
  platform_scope TEXT[] NOT NULL DEFAULT ARRAY['ATLVS', 'COMPVSS', 'GVTEWAY'],
  entity_type TEXT,
  event_type TEXT,
  payload_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  example_payload JSONB,
  throttling_window INTERVAL DEFAULT '1 minute',
  max_frequency INTEGER DEFAULT 100,
  requires_auth BOOLEAN DEFAULT true,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trigger_catalog_key ON automation_trigger_catalog(key);
CREATE INDEX idx_trigger_catalog_category ON automation_trigger_catalog(category);
CREATE INDEX idx_trigger_catalog_enabled ON automation_trigger_catalog(enabled) WHERE enabled = true;

-- ============================================================================
-- AUTOMATION ACTION CATALOG
-- ============================================================================

CREATE TABLE automation_action_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  category TEXT,
  platform_scope TEXT[] NOT NULL DEFAULT ARRAY['ATLVS', 'COMPVSS', 'GVTEWAY'],
  target_entity_type TEXT,
  action_type TEXT,
  payload_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  example_payload JSONB,
  requires_confirmation BOOLEAN NOT NULL DEFAULT false,
  is_destructive BOOLEAN DEFAULT false,
  timeout_seconds INTEGER DEFAULT 30,
  retry_count INTEGER DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_action_catalog_key ON automation_action_catalog(key);
CREATE INDEX idx_action_catalog_category ON automation_action_catalog(category);
CREATE INDEX idx_action_catalog_enabled ON automation_action_catalog(enabled) WHERE enabled = true;

-- ============================================================================
-- AUTOMATION RULES (User-defined automations)
-- ============================================================================

CREATE TABLE automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_id UUID NOT NULL REFERENCES automation_trigger_catalog(id),
  trigger_conditions JSONB DEFAULT '{}'::jsonb,
  action_id UUID NOT NULL REFERENCES automation_action_catalog(id),
  action_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  last_run_status automation_status,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_automation_rules_org ON automation_rules(organization_id);
CREATE INDEX idx_automation_rules_trigger ON automation_rules(trigger_id);
CREATE INDEX idx_automation_rules_active ON automation_rules(organization_id, is_active) WHERE is_active = true;

-- ============================================================================
-- AUTOMATION USAGE LOG
-- ============================================================================

CREATE TABLE automation_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  rule_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL,
  kind automation_kind NOT NULL,
  identifier TEXT NOT NULL,
  status automation_status NOT NULL DEFAULT 'success',
  platform TEXT NOT NULL DEFAULT 'ATLVS',
  trigger_payload JSONB DEFAULT '{}'::jsonb,
  action_payload JSONB DEFAULT '{}'::jsonb,
  response JSONB,
  error_message TEXT,
  latency_ms INTEGER,
  invoked_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_automation_log_org ON automation_usage_log(organization_id, executed_at DESC);
CREATE INDEX idx_automation_log_rule ON automation_usage_log(rule_id);
CREATE INDEX idx_automation_log_kind ON automation_usage_log(kind, identifier);
CREATE INDEX idx_automation_log_status ON automation_usage_log(status);

-- ============================================================================
-- SCHEDULED JOBS (Cron-like scheduling)
-- ============================================================================

CREATE TABLE scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  job_type TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  action_id UUID REFERENCES automation_action_catalog(id),
  action_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_run_status automation_status,
  last_run_duration_ms INTEGER,
  run_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_jobs_org ON scheduled_jobs(organization_id);
CREATE INDEX idx_scheduled_jobs_active ON scheduled_jobs(is_active, next_run_at) WHERE is_active = true;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE automation_trigger_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_action_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- Trigger Catalog policies (read-only for authenticated users)
CREATE POLICY trigger_catalog_select ON automation_trigger_catalog FOR SELECT USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Action Catalog policies (read-only for authenticated users)
CREATE POLICY action_catalog_select ON automation_action_catalog FOR SELECT USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Automation Rules policies
CREATE POLICY automation_rules_select ON automation_rules FOR SELECT USING (org_matches(organization_id));
CREATE POLICY automation_rules_manage ON automation_rules FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Usage Log policies
CREATE POLICY automation_log_select ON automation_usage_log FOR SELECT USING (
  (organization_id IS NULL AND current_app_role() LIKE 'LEGEND_%') OR org_matches(organization_id)
);
CREATE POLICY automation_log_insert ON automation_usage_log FOR INSERT WITH CHECK (
  (organization_id IS NULL AND current_app_role() LIKE 'LEGEND_%') OR org_matches(organization_id)
);

-- Scheduled Jobs policies
CREATE POLICY scheduled_jobs_select ON scheduled_jobs FOR SELECT USING (org_matches(organization_id));
CREATE POLICY scheduled_jobs_manage ON scheduled_jobs FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON automation_trigger_catalog TO authenticated;
GRANT SELECT ON automation_action_catalog TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON automation_rules TO authenticated;
GRANT SELECT, INSERT ON automation_usage_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON scheduled_jobs TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER trigger_catalog_updated_at BEFORE UPDATE ON automation_trigger_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER action_catalog_updated_at BEFORE UPDATE ON automation_action_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER automation_rules_updated_at BEFORE UPDATE ON automation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER scheduled_jobs_updated_at BEFORE UPDATE ON scheduled_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_list_automation_triggers(p_platform TEXT DEFAULT 'ATLVS')
RETURNS SETOF automation_trigger_catalog
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM automation_trigger_catalog
  WHERE enabled AND p_platform = ANY(platform_scope)
  ORDER BY category, label;
$$;

GRANT EXECUTE ON FUNCTION rpc_list_automation_triggers(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION rpc_list_automation_actions(p_platform TEXT DEFAULT 'ATLVS')
RETURNS SETOF automation_action_catalog
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM automation_action_catalog
  WHERE enabled AND p_platform = ANY(platform_scope)
  ORDER BY category, label;
$$;

GRANT EXECUTE ON FUNCTION rpc_list_automation_actions(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION rpc_log_automation_event(
  p_kind automation_kind,
  p_identifier TEXT,
  p_status automation_status DEFAULT 'success',
  p_platform TEXT DEFAULT 'ATLVS',
  p_org_slug TEXT DEFAULT NULL,
  p_trigger_payload JSONB DEFAULT '{}'::jsonb,
  p_action_payload JSONB DEFAULT '{}'::jsonb,
  p_response JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_latency_ms INTEGER DEFAULT NULL
)
RETURNS automation_usage_log
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org UUID;
  v_invoker UUID := current_platform_user_id();
  v_row automation_usage_log;
BEGIN
  IF p_org_slug IS NOT NULL THEN
    SELECT id INTO v_org FROM organizations WHERE slug = p_org_slug LIMIT 1;
  ELSE
    v_org := current_organization_id();
  END IF;

  INSERT INTO automation_usage_log (
    organization_id,
    kind,
    identifier,
    status,
    platform,
    trigger_payload,
    action_payload,
    response,
    error_message,
    latency_ms,
    invoked_by
  ) VALUES (
    v_org,
    p_kind,
    p_identifier,
    COALESCE(p_status, 'success'),
    COALESCE(p_platform, 'ATLVS'),
    COALESCE(p_trigger_payload, '{}'::jsonb),
    COALESCE(p_action_payload, '{}'::jsonb),
    p_response,
    p_error_message,
    p_latency_ms,
    v_invoker
  ) RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_log_automation_event TO authenticated;
