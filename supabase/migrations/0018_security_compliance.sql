-- ============================================================================
-- 0018_security_compliance.sql
-- Security, Compliance, and Audit Tables
-- GHXSTSHIP Platform - 3NF Gap Remediation
-- ============================================================================

-- ============================================================================
-- AUDIT LOG (Comprehensive audit trail)
-- ============================================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'OTHER')),
  old_data JSONB,
  new_data JSONB,
  changes JSONB,
  changed_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  role_code TEXT,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  request_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_org ON audit_log(organization_id, changed_at DESC);
CREATE INDEX idx_audit_log_table ON audit_log(table_name, changed_at DESC);
CREATE INDEX idx_audit_log_user ON audit_log(changed_by, changed_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_record ON audit_log(table_name, record_id);

-- ============================================================================
-- SECURITY POLICY CONFIG
-- ============================================================================

CREATE TABLE security_policy_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  policy_type TEXT NOT NULL,
  policy_name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, policy_type, policy_name)
);

CREATE INDEX idx_security_policy_org ON security_policy_config(organization_id);
CREATE INDEX idx_security_policy_type ON security_policy_config(policy_type);
CREATE INDEX idx_security_policy_active ON security_policy_config(is_active) WHERE is_active = true;

-- ============================================================================
-- IMPERSONATION PERMISSIONS
-- ============================================================================

CREATE TABLE impersonation_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  impersonator_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  target_role_code TEXT,
  permission_type TEXT NOT NULL CHECK (permission_type IN ('user', 'role', 'any')),
  reason TEXT,
  granted_by UUID NOT NULL REFERENCES platform_users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_impersonation_perms_org ON impersonation_permissions(organization_id);
CREATE INDEX idx_impersonation_perms_impersonator ON impersonation_permissions(impersonator_id);
CREATE INDEX idx_impersonation_perms_target ON impersonation_permissions(target_user_id);
CREATE INDEX idx_impersonation_perms_active ON impersonation_permissions(is_active, expires_at);

-- ============================================================================
-- IMPERSONATION SESSIONS
-- ============================================================================

CREATE TABLE impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES impersonation_permissions(id) ON DELETE SET NULL,
  impersonator_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  actions_performed INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_impersonation_sessions_org ON impersonation_sessions(organization_id);
CREATE INDEX idx_impersonation_sessions_impersonator ON impersonation_sessions(impersonator_id);
CREATE INDEX idx_impersonation_sessions_target ON impersonation_sessions(target_user_id);
CREATE INDEX idx_impersonation_sessions_active ON impersonation_sessions(ended_at) WHERE ended_at IS NULL;

-- ============================================================================
-- API RATE LIMITS
-- ============================================================================

CREATE TABLE api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  endpoint_pattern TEXT NOT NULL,
  requests_per_minute INTEGER DEFAULT 60,
  requests_per_hour INTEGER DEFAULT 1000,
  requests_per_day INTEGER DEFAULT 10000,
  burst_limit INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limits_org ON api_rate_limits(organization_id);
CREATE INDEX idx_rate_limits_user ON api_rate_limits(user_id);
CREATE INDEX idx_rate_limits_endpoint ON api_rate_limits(endpoint_pattern);

-- ============================================================================
-- API RATE LIMIT USAGE (Tracking)
-- ============================================================================

CREATE TABLE api_rate_limit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  window_type TEXT NOT NULL CHECK (window_type IN ('minute', 'hour', 'day')),
  request_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_usage_org ON api_rate_limit_usage(organization_id, window_start DESC);
CREATE INDEX idx_rate_usage_user ON api_rate_limit_usage(user_id, window_start DESC);
CREATE INDEX idx_rate_usage_window ON api_rate_limit_usage(window_start, window_type);

-- ============================================================================
-- STATUS REGISTRY (Configurable statuses)
-- ============================================================================

CREATE TABLE status_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_terminal BOOLEAN DEFAULT false,
  next_statuses TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, category, code)
);

CREATE INDEX idx_status_registry_org ON status_registry(organization_id);
CREATE INDEX idx_status_registry_category ON status_registry(category);

-- ============================================================================
-- RISK LEVELS
-- ============================================================================

CREATE TABLE risk_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
  color TEXT,
  icon TEXT,
  mitigation_required BOOLEAN DEFAULT false,
  approval_required BOOLEAN DEFAULT false,
  notification_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_risk_levels_org ON risk_levels(organization_id);
CREATE INDEX idx_risk_levels_severity ON risk_levels(severity);

-- ============================================================================
-- DATA EXPORT LOGS
-- ============================================================================

CREATE TABLE data_export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  exported_by UUID NOT NULL REFERENCES platform_users(id),
  export_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  record_count INTEGER,
  file_format TEXT,
  file_size_bytes BIGINT,
  file_url TEXT,
  filters_applied JSONB,
  columns_exported TEXT[],
  ip_address INET,
  exported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_export_logs_org ON data_export_logs(organization_id, exported_at DESC);
CREATE INDEX idx_export_logs_user ON data_export_logs(exported_by);
CREATE INDEX idx_export_logs_type ON data_export_logs(export_type);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policy_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE impersonation_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limit_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_logs ENABLE ROW LEVEL SECURITY;

-- Audit Log policies
CREATE POLICY audit_log_select ON audit_log FOR SELECT USING (
  (organization_id IS NULL AND current_app_role() LIKE 'LEGEND_%') OR org_matches(organization_id)
);
CREATE POLICY audit_log_insert ON audit_log FOR INSERT WITH CHECK (
  (organization_id IS NULL AND current_app_role() LIKE 'LEGEND_%') OR org_matches(organization_id)
);

-- Security Policy policies
CREATE POLICY security_policy_select ON security_policy_config FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY security_policy_manage ON security_policy_config FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Impersonation Permissions policies
CREATE POLICY impersonation_perms_select ON impersonation_permissions FOR SELECT USING (
  org_matches(organization_id) AND (
    impersonator_id = current_platform_user_id() OR
    role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_SUPPORT')
  )
);
CREATE POLICY impersonation_perms_manage ON impersonation_permissions FOR ALL USING (
  org_matches(organization_id) AND role_in('LEGEND_SUPER_ADMIN', 'LEGEND_SUPPORT')
);

-- Impersonation Sessions policies
CREATE POLICY impersonation_sessions_select ON impersonation_sessions FOR SELECT USING (
  org_matches(organization_id) AND (
    impersonator_id = current_platform_user_id() OR
    target_user_id = current_platform_user_id() OR
    role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_SUPPORT')
  )
);
CREATE POLICY impersonation_sessions_insert ON impersonation_sessions FOR INSERT WITH CHECK (
  org_matches(organization_id) AND role_in('LEGEND_SUPER_ADMIN', 'LEGEND_SUPPORT')
);
CREATE POLICY impersonation_sessions_update ON impersonation_sessions FOR UPDATE USING (
  org_matches(organization_id) AND (
    impersonator_id = current_platform_user_id() OR
    role_in('LEGEND_SUPER_ADMIN', 'LEGEND_SUPPORT')
  )
);

-- Rate Limits policies
CREATE POLICY rate_limits_select ON api_rate_limits FOR SELECT USING (
  (organization_id IS NULL OR org_matches(organization_id)) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);
CREATE POLICY rate_limits_manage ON api_rate_limits FOR ALL USING (role_in('LEGEND_SUPER_ADMIN'));

-- Rate Limit Usage policies
CREATE POLICY rate_usage_select ON api_rate_limit_usage FOR SELECT USING (
  (organization_id IS NULL OR org_matches(organization_id)) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);
CREATE POLICY rate_usage_insert ON api_rate_limit_usage FOR INSERT WITH CHECK (true);

-- Status Registry policies
CREATE POLICY status_registry_select ON status_registry FOR SELECT USING (organization_id IS NULL OR org_matches(organization_id));
CREATE POLICY status_registry_manage ON status_registry FOR ALL USING (
  (organization_id IS NULL AND role_in('LEGEND_SUPER_ADMIN')) OR
  (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
);

-- Risk Levels policies
CREATE POLICY risk_levels_select ON risk_levels FOR SELECT USING (organization_id IS NULL OR org_matches(organization_id));
CREATE POLICY risk_levels_manage ON risk_levels FOR ALL USING (
  (organization_id IS NULL AND role_in('LEGEND_SUPER_ADMIN')) OR
  (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
);

-- Export Logs policies
CREATE POLICY export_logs_select ON data_export_logs FOR SELECT USING (
  org_matches(organization_id) AND (
    exported_by = current_platform_user_id() OR
    role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  )
);
CREATE POLICY export_logs_insert ON data_export_logs FOR INSERT WITH CHECK (org_matches(organization_id));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT ON audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON security_policy_config TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON impersonation_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON impersonation_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api_rate_limits TO authenticated;
GRANT SELECT, INSERT ON api_rate_limit_usage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON status_registry TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON risk_levels TO authenticated;
GRANT SELECT, INSERT ON data_export_logs TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER security_policy_updated_at BEFORE UPDATE ON security_policy_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER api_rate_limits_updated_at BEFORE UPDATE ON api_rate_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUDIT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_log_capture()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org UUID;
  v_changed_by UUID := current_platform_user_id();
  v_role TEXT := current_app_role();
  v_record_id TEXT;
  v_old JSONB;
  v_new JSONB;
  v_changes JSONB;
  v_col TEXT := COALESCE(TG_ARGV[0], 'organization_id');
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
    v_new := NULL;
    v_record_id := COALESCE(v_old ->> 'id', v_old ->> 'code');
    v_org := NULLIF(v_old ->> v_col, '')::UUID;
  ELSE
    v_old := CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END;
    v_new := to_jsonb(NEW);
    v_record_id := COALESCE(v_new ->> 'id', v_new ->> 'code');
    v_org := NULLIF(v_new ->> v_col, '')::UUID;
    
    IF TG_OP = 'UPDATE' THEN
      SELECT jsonb_object_agg(key, value)
      INTO v_changes
      FROM jsonb_each(v_new)
      WHERE v_old ->> key IS DISTINCT FROM v_new ->> key;
    END IF;
  END IF;

  INSERT INTO audit_log (
    organization_id,
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changes,
    changed_by,
    role_code,
    metadata
  ) VALUES (
    v_org,
    TG_TABLE_NAME,
    v_record_id,
    TG_OP,
    v_old,
    v_new,
    v_changes,
    v_changed_by,
    v_role,
    jsonb_build_object('trigger', TG_NAME)
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION attach_audit_trigger(p_table REGCLASS, p_column TEXT DEFAULT 'organization_id')
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format('DROP TRIGGER IF EXISTS audit_%s ON %s', p_column, p_table);
  EXECUTE format(
    'CREATE TRIGGER audit_%s AFTER INSERT OR UPDATE OR DELETE ON %s FOR EACH ROW EXECUTE FUNCTION audit_log_capture(%L)',
    p_column,
    p_table,
    p_column
  );
END;
$$;

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION grant_impersonation_permission(
  p_impersonator_id UUID,
  p_target_user_id UUID DEFAULT NULL,
  p_target_role_code TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_permission_type TEXT;
  v_id UUID;
BEGIN
  IF NOT role_in('LEGEND_SUPER_ADMIN', 'LEGEND_SUPPORT') THEN
    RAISE EXCEPTION 'Only Legend admins can grant impersonation permissions';
  END IF;

  SELECT organization_id INTO v_org_id FROM platform_users WHERE id = p_impersonator_id;

  IF p_target_user_id IS NOT NULL THEN
    v_permission_type := 'user';
  ELSIF p_target_role_code IS NOT NULL THEN
    v_permission_type := 'role';
  ELSE
    v_permission_type := 'any';
  END IF;

  INSERT INTO impersonation_permissions (
    organization_id,
    impersonator_id,
    target_user_id,
    target_role_code,
    permission_type,
    reason,
    granted_by,
    expires_at
  ) VALUES (
    v_org_id,
    p_impersonator_id,
    p_target_user_id,
    p_target_role_code,
    v_permission_type,
    p_reason,
    current_platform_user_id(),
    p_expires_at
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION grant_impersonation_permission TO authenticated;

CREATE OR REPLACE FUNCTION log_impersonation_session(
  p_target_user_id UUID,
  p_reason TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_permission_id UUID;
  v_session_id UUID;
BEGIN
  SELECT organization_id INTO v_org_id FROM platform_users WHERE id = p_target_user_id;

  SELECT id INTO v_permission_id
  FROM impersonation_permissions
  WHERE impersonator_id = current_platform_user_id()
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (
      target_user_id = p_target_user_id OR
      permission_type = 'any' OR
      (permission_type = 'role' AND target_role_code IN (
        SELECT role_code FROM user_roles WHERE platform_user_id = p_target_user_id
      ))
    )
  LIMIT 1;

  IF v_permission_id IS NULL AND NOT role_in('LEGEND_SUPER_ADMIN') THEN
    RAISE EXCEPTION 'No valid impersonation permission found';
  END IF;

  INSERT INTO impersonation_sessions (
    organization_id,
    permission_id,
    impersonator_id,
    target_user_id,
    reason,
    ip_address,
    user_agent
  ) VALUES (
    v_org_id,
    v_permission_id,
    current_platform_user_id(),
    p_target_user_id,
    p_reason,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION log_impersonation_session TO authenticated;

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_endpoint TEXT,
  p_user_id UUID DEFAULT NULL,
  p_org_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit RECORD;
  v_minute_count INTEGER;
  v_hour_count INTEGER;
  v_day_count INTEGER;
BEGIN
  SELECT * INTO v_limit
  FROM api_rate_limits
  WHERE is_active = true
    AND (user_id = p_user_id OR user_id IS NULL)
    AND (organization_id = p_org_id OR organization_id IS NULL)
    AND p_endpoint LIKE endpoint_pattern
  ORDER BY 
    CASE WHEN user_id IS NOT NULL THEN 0 ELSE 1 END,
    CASE WHEN organization_id IS NOT NULL THEN 0 ELSE 1 END
  LIMIT 1;

  IF v_limit IS NULL THEN
    RETURN true;
  END IF;

  SELECT COUNT(*) INTO v_minute_count
  FROM api_rate_limit_usage
  WHERE (user_id = p_user_id OR (user_id IS NULL AND organization_id = p_org_id))
    AND endpoint = p_endpoint
    AND window_type = 'minute'
    AND window_start > now() - INTERVAL '1 minute';

  IF v_minute_count >= v_limit.requests_per_minute THEN
    RETURN false;
  END IF;

  INSERT INTO api_rate_limit_usage (organization_id, user_id, endpoint, window_start, window_type)
  VALUES (p_org_id, p_user_id, p_endpoint, date_trunc('minute', now()), 'minute');

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated;
