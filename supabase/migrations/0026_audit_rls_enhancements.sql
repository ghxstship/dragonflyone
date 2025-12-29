-- ============================================================================
-- 0026_audit_rls_enhancements.sql
-- Audit Logging Enhancements and Additional RLS Policies
-- GHXSTSHIP Platform - Comprehensive Security Enhancement
-- ============================================================================
-- 
-- This migration provides:
-- 1. Comprehensive audit triggers for critical tables
-- 2. Missing RLS policies for edge cases
-- 3. Soft delete support for key entities
-- 4. Data retention policies
-- 5. Enhanced security functions
-- ============================================================================

-- ============================================================================
-- SECTION 1: SOFT DELETE SUPPORT
-- ============================================================================

-- Add deleted_at columns to key tables that don't have them
ALTER TABLE deals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES platform_users(id);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES platform_users(id);

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES platform_users(id);

ALTER TABLE assets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES platform_users(id);

ALTER TABLE legend_people ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE legend_people ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES platform_users(id);

ALTER TABLE legend_organizations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE legend_organizations ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES platform_users(id);

ALTER TABLE legend_events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE legend_events ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES platform_users(id);

-- Indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_deals_not_deleted ON deals(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_not_deleted ON projects(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_not_deleted ON contacts(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_assets_not_deleted ON assets(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_legend_people_not_deleted ON legend_people(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_legend_orgs_not_deleted ON legend_organizations(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_legend_events_not_deleted ON legend_events(organization_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- SECTION 2: SOFT DELETE TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    EXECUTE format(
      'UPDATE %I.%I SET deleted_at = now(), deleted_by = $1 WHERE id = $2',
      TG_TABLE_SCHEMA, TG_TABLE_NAME
    ) USING current_platform_user_id(), OLD.id;
    
    INSERT INTO audit_log (
      organization_id, table_name, record_id, action,
      old_data, changed_by, metadata
    ) VALUES (
      OLD.organization_id, TG_TABLE_NAME, OLD.id::TEXT, 'DELETE',
      to_jsonb(OLD), current_platform_user_id(),
      jsonb_build_object('soft_delete', true)
    );
    
    RETURN NULL;
  END IF;
  RETURN OLD;
END;
$$;

-- ============================================================================
-- SECTION 3: COMPREHENSIVE AUDIT TRIGGERS
-- ============================================================================

-- Audit trigger for deals
DROP TRIGGER IF EXISTS audit_deals ON deals;
CREATE TRIGGER audit_deals
  AFTER INSERT OR UPDATE OR DELETE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- Audit trigger for projects
DROP TRIGGER IF EXISTS audit_projects ON projects;
CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- Audit trigger for contacts
DROP TRIGGER IF EXISTS audit_contacts ON contacts;
CREATE TRIGGER audit_contacts
  AFTER INSERT OR UPDATE OR DELETE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- Audit trigger for assets
DROP TRIGGER IF EXISTS audit_assets ON assets;
CREATE TRIGGER audit_assets
  AFTER INSERT OR UPDATE OR DELETE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- Audit trigger for finance_expenses
DROP TRIGGER IF EXISTS audit_finance_expenses ON finance_expenses;
CREATE TRIGGER audit_finance_expenses
  AFTER INSERT OR UPDATE OR DELETE ON finance_expenses
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- Audit trigger for finance_purchase_orders
DROP TRIGGER IF EXISTS audit_finance_purchase_orders ON finance_purchase_orders;
CREATE TRIGGER audit_finance_purchase_orders
  AFTER INSERT OR UPDATE OR DELETE ON finance_purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- Audit trigger for procurement_requests
DROP TRIGGER IF EXISTS audit_procurement_requests ON procurement_requests;
CREATE TRIGGER audit_procurement_requests
  AFTER INSERT OR UPDATE OR DELETE ON procurement_requests
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- Audit trigger for production_advances
DROP TRIGGER IF EXISTS audit_production_advances ON production_advances;
CREATE TRIGGER audit_production_advances
  AFTER INSERT OR UPDATE OR DELETE ON production_advances
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- Audit trigger for user_roles
DROP TRIGGER IF EXISTS audit_user_roles ON user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- Audit trigger for legend_events
DROP TRIGGER IF EXISTS audit_legend_events ON legend_events;
CREATE TRIGGER audit_legend_events
  AFTER INSERT OR UPDATE OR DELETE ON legend_events
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- Audit trigger for legend_people
DROP TRIGGER IF EXISTS audit_legend_people ON legend_people;
CREATE TRIGGER audit_legend_people
  AFTER INSERT OR UPDATE OR DELETE ON legend_people
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- Audit trigger for legend_organizations
DROP TRIGGER IF EXISTS audit_legend_organizations ON legend_organizations;
CREATE TRIGGER audit_legend_organizations
  AFTER INSERT OR UPDATE OR DELETE ON legend_organizations
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- Audit trigger for budgets
DROP TRIGGER IF EXISTS audit_budgets ON budgets;
CREATE TRIGGER audit_budgets
  AFTER INSERT OR UPDATE OR DELETE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- Audit trigger for orders
DROP TRIGGER IF EXISTS audit_orders ON orders;
CREATE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- Audit trigger for bills
DROP TRIGGER IF EXISTS audit_bills ON bills;
CREATE TRIGGER audit_bills
  AFTER INSERT OR UPDATE OR DELETE ON bills
  FOR EACH ROW
  EXECUTE FUNCTION audit_log_capture('organization_id');

-- ============================================================================
-- SECTION 4: ENHANCED RLS POLICIES
-- ============================================================================

-- Ensure core foundation tables have proper RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_definitions ENABLE ROW LEVEL SECURITY;

-- Organizations RLS
DROP POLICY IF EXISTS organizations_select ON organizations;
CREATE POLICY organizations_select ON organizations FOR SELECT USING (
  id = current_organization_id() OR 
  EXISTS (SELECT 1 FROM user_organizations WHERE user_id = current_platform_user_id() AND organization_id = organizations.id) OR
  current_app_role() LIKE 'LEGEND_%'
);

DROP POLICY IF EXISTS organizations_update ON organizations;
CREATE POLICY organizations_update ON organizations FOR UPDATE USING (
  (id = current_organization_id() AND role_in('ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN')) OR
  current_app_role() LIKE 'LEGEND_%'
);

-- Platform Users RLS
DROP POLICY IF EXISTS platform_users_select ON platform_users;
CREATE POLICY platform_users_select ON platform_users FOR SELECT USING (
  organization_id = current_organization_id() OR
  id = current_platform_user_id() OR
  current_app_role() LIKE 'LEGEND_%'
);

DROP POLICY IF EXISTS platform_users_update ON platform_users;
CREATE POLICY platform_users_update ON platform_users FOR UPDATE USING (
  id = current_platform_user_id() OR
  (organization_id = current_organization_id() AND role_in('ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN')) OR
  current_app_role() LIKE 'LEGEND_%'
);

-- User Organizations RLS
DROP POLICY IF EXISTS user_organizations_select ON user_organizations;
CREATE POLICY user_organizations_select ON user_organizations FOR SELECT USING (
  user_id = current_platform_user_id() OR
  organization_id = current_organization_id() OR
  current_app_role() LIKE 'LEGEND_%'
);

DROP POLICY IF EXISTS user_organizations_manage ON user_organizations;
CREATE POLICY user_organizations_manage ON user_organizations FOR ALL USING (
  (organization_id = current_organization_id() AND role_in('ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN')) OR
  current_app_role() LIKE 'LEGEND_%'
);

-- User Roles RLS
DROP POLICY IF EXISTS user_roles_select ON user_roles;
CREATE POLICY user_roles_select ON user_roles FOR SELECT USING (
  platform_user_id = current_platform_user_id() OR
  organization_id = current_organization_id() OR
  current_app_role() LIKE 'LEGEND_%'
);

DROP POLICY IF EXISTS user_roles_manage ON user_roles;
CREATE POLICY user_roles_manage ON user_roles FOR ALL USING (
  (organization_id = current_organization_id() AND role_in('ATLVS_SUPER_ADMIN')) OR
  current_app_role() LIKE 'LEGEND_%'
);

-- Role Definitions RLS (read-only for most users)
DROP POLICY IF EXISTS role_definitions_select ON role_definitions;
CREATE POLICY role_definitions_select ON role_definitions FOR SELECT USING (true);

DROP POLICY IF EXISTS role_definitions_manage ON role_definitions;
CREATE POLICY role_definitions_manage ON role_definitions FOR ALL USING (
  current_app_role() LIKE 'LEGEND_%'
);

-- ============================================================================
-- SECTION 5: GRANTS FOR CORE TABLES
-- ============================================================================

GRANT SELECT ON organizations TO authenticated;
GRANT UPDATE ON organizations TO authenticated;
GRANT SELECT ON platform_users TO authenticated;
GRANT UPDATE ON platform_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO authenticated;
GRANT SELECT ON role_definitions TO authenticated;

-- ============================================================================
-- SECTION 6: SECURITY HELPER FUNCTIONS
-- ============================================================================

-- Check if user has specific permission
CREATE OR REPLACE FUNCTION has_permission(p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_permissions JSONB;
BEGIN
  SELECT rd.permissions INTO v_permissions
  FROM user_roles ur
  JOIN role_definitions rd ON rd.code = ur.role_code
  WHERE ur.platform_user_id = current_platform_user_id()
    AND ur.organization_id = current_organization_id()
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
  ORDER BY rd.hierarchy_rank DESC
  LIMIT 1;

  RETURN v_permissions ? p_permission OR current_app_role() LIKE 'LEGEND_%';
END;
$$;

GRANT EXECUTE ON FUNCTION has_permission(TEXT) TO authenticated;

-- Check if user can access specific entity
CREATE OR REPLACE FUNCTION can_access_entity(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_action TEXT DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_owner_id UUID;
BEGIN
  IF current_app_role() LIKE 'LEGEND_%' THEN
    RETURN true;
  END IF;

  CASE p_entity_type
    WHEN 'deal' THEN
      SELECT organization_id, owner_id INTO v_org_id, v_owner_id FROM deals WHERE id = p_entity_id;
    WHEN 'project' THEN
      SELECT organization_id, project_manager_id INTO v_org_id, v_owner_id FROM projects WHERE id = p_entity_id;
    WHEN 'contact' THEN
      SELECT organization_id, assigned_to INTO v_org_id, v_owner_id FROM contacts WHERE id = p_entity_id;
    WHEN 'asset' THEN
      SELECT organization_id, NULL INTO v_org_id, v_owner_id FROM assets WHERE id = p_entity_id;
    WHEN 'expense' THEN
      SELECT organization_id, submitter_id INTO v_org_id, v_owner_id FROM finance_expenses WHERE id = p_entity_id;
    ELSE
      RETURN false;
  END CASE;

  IF v_org_id IS NULL THEN
    RETURN false;
  END IF;

  IF NOT org_matches(v_org_id) THEN
    RETURN false;
  END IF;

  IF p_action = 'read' THEN
    RETURN true;
  END IF;

  IF p_action IN ('update', 'delete') THEN
    RETURN v_owner_id = current_platform_user_id() OR 
           role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN');
  END IF;

  RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION can_access_entity(TEXT, UUID, TEXT) TO authenticated;

-- Get user's effective permissions
CREATE OR REPLACE FUNCTION get_effective_permissions()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'role_code', rd.code,
    'platform', rd.platform,
    'level', rd.level,
    'hierarchy_rank', rd.hierarchy_rank,
    'permissions', rd.permissions,
    'is_legend', rd.code LIKE 'LEGEND_%'
  ) INTO v_result
  FROM user_roles ur
  JOIN role_definitions rd ON rd.code = ur.role_code
  WHERE ur.platform_user_id = current_platform_user_id()
    AND ur.organization_id = current_organization_id()
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
  ORDER BY rd.hierarchy_rank DESC
  LIMIT 1;

  RETURN COALESCE(v_result, jsonb_build_object(
    'role_code', 'ATLVS_VIEWER',
    'platform', 'atlvs',
    'level', 'viewer',
    'hierarchy_rank', 1,
    'permissions', '[]'::jsonb,
    'is_legend', false
  ));
END;
$$;

GRANT EXECUTE ON FUNCTION get_effective_permissions() TO authenticated;

-- ============================================================================
-- SECTION 7: DATA RETENTION FUNCTIONS
-- ============================================================================

-- Archive old audit logs
CREATE OR REPLACE FUNCTION archive_old_audit_logs(p_days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  IF NOT role_in('LEGEND_SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Only Legend admins can archive audit logs';
  END IF;

  DELETE FROM audit_log
  WHERE changed_at < now() - (p_days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  
  INSERT INTO audit_log (
    table_name, record_id, action, changed_by, metadata
  ) VALUES (
    'audit_log', NULL, 'OTHER', current_platform_user_id(),
    jsonb_build_object('action', 'archive', 'deleted_count', v_deleted, 'days_kept', p_days_to_keep)
  );

  RETURN v_deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION archive_old_audit_logs(INTEGER) TO authenticated;

-- Archive old chronicle entries
CREATE OR REPLACE FUNCTION archive_old_chronicle_entries(p_days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  IF NOT role_in('LEGEND_SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Only Legend admins can archive chronicle entries';
  END IF;

  DELETE FROM chronicle_entries
  WHERE created_at < now() - (p_days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN v_deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION archive_old_chronicle_entries(INTEGER) TO authenticated;

-- Archive old webhook logs
CREATE OR REPLACE FUNCTION archive_old_webhook_logs(p_days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  IF NOT role_in('LEGEND_SUPER_ADMIN', 'ATLVS_SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  DELETE FROM webhook_event_logs
  WHERE received_at < now() - (p_days_to_keep || ' days')::INTERVAL
    AND status IN ('processed', 'ignored');

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN v_deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION archive_old_webhook_logs(INTEGER) TO authenticated;

-- ============================================================================
-- SECTION 8: SESSION AND ACTIVITY TRACKING
-- ============================================================================

-- User session tracking table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_type TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(platform_user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_org ON user_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active, last_activity_at) WHERE is_active = true;

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_sessions_select ON user_sessions FOR SELECT USING (
  platform_user_id = current_platform_user_id() OR
  (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')) OR
  current_app_role() LIKE 'LEGEND_%'
);

CREATE POLICY user_sessions_insert ON user_sessions FOR INSERT WITH CHECK (
  platform_user_id = current_platform_user_id()
);

CREATE POLICY user_sessions_update ON user_sessions FOR UPDATE USING (
  platform_user_id = current_platform_user_id() OR
  current_app_role() LIKE 'LEGEND_%'
);

GRANT SELECT, INSERT, UPDATE ON user_sessions TO authenticated;

-- Function to record session activity
CREATE OR REPLACE FUNCTION record_session_activity(
  p_session_token TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
  v_user_id UUID := current_platform_user_id();
  v_org_id UUID := current_organization_id();
BEGIN
  SELECT id INTO v_session_id
  FROM user_sessions
  WHERE platform_user_id = v_user_id
    AND session_token = p_session_token
    AND is_active = true;

  IF v_session_id IS NULL THEN
    INSERT INTO user_sessions (
      platform_user_id, organization_id, session_token,
      ip_address, user_agent, device_type
    ) VALUES (
      v_user_id, v_org_id, p_session_token,
      p_ip_address, p_user_agent,
      CASE 
        WHEN p_user_agent ILIKE '%mobile%' THEN 'mobile'
        WHEN p_user_agent ILIKE '%tablet%' THEN 'tablet'
        ELSE 'desktop'
      END
    ) RETURNING id INTO v_session_id;
  ELSE
    UPDATE user_sessions
    SET last_activity_at = now(),
        ip_address = COALESCE(p_ip_address, ip_address)
    WHERE id = v_session_id;
  END IF;

  RETURN v_session_id;
END;
$$;

GRANT EXECUTE ON FUNCTION record_session_activity(TEXT, INET, TEXT) TO authenticated;

-- Function to end session
CREATE OR REPLACE FUNCTION end_session(p_session_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_sessions
  SET ended_at = now(),
      is_active = false
  WHERE platform_user_id = current_platform_user_id()
    AND session_token = p_session_token
    AND is_active = true;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION end_session(TEXT) TO authenticated;

-- ============================================================================
-- SECTION 9: RATE LIMITING ENHANCEMENTS
-- ============================================================================

-- Function to check and increment rate limit
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_endpoint TEXT,
  p_window_type TEXT DEFAULT 'minute'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := current_platform_user_id();
  v_org_id UUID := current_organization_id();
  v_limit RECORD;
  v_current_count INTEGER;
  v_max_requests INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_limit
  FROM api_rate_limits
  WHERE is_active = true
    AND (user_id = v_user_id OR user_id IS NULL)
    AND (organization_id = v_org_id OR organization_id IS NULL)
    AND p_endpoint LIKE endpoint_pattern
  ORDER BY 
    CASE WHEN user_id IS NOT NULL THEN 0 ELSE 1 END,
    CASE WHEN organization_id IS NOT NULL THEN 0 ELSE 1 END
  LIMIT 1;

  IF v_limit IS NULL THEN
    RETURN jsonb_build_object('allowed', true, 'remaining', -1);
  END IF;

  v_window_start := date_trunc(p_window_type, now());
  
  v_max_requests := CASE p_window_type
    WHEN 'minute' THEN v_limit.requests_per_minute
    WHEN 'hour' THEN v_limit.requests_per_hour
    WHEN 'day' THEN v_limit.requests_per_day
    ELSE v_limit.requests_per_minute
  END;

  SELECT COALESCE(SUM(request_count), 0) INTO v_current_count
  FROM api_rate_limit_usage
  WHERE (user_id = v_user_id OR (user_id IS NULL AND organization_id = v_org_id))
    AND endpoint = p_endpoint
    AND window_type = p_window_type
    AND window_start = v_window_start;

  IF v_current_count >= v_max_requests THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'reset_at', v_window_start + ('1 ' || p_window_type)::INTERVAL
    );
  END IF;

  INSERT INTO api_rate_limit_usage (
    organization_id, user_id, endpoint, window_start, window_type, request_count
  ) VALUES (
    v_org_id, v_user_id, p_endpoint, v_window_start, p_window_type, 1
  )
  ON CONFLICT (organization_id, user_id, endpoint, window_start, window_type)
  DO UPDATE SET request_count = api_rate_limit_usage.request_count + 1;

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', v_max_requests - v_current_count - 1,
    'reset_at', v_window_start + ('1 ' || p_window_type)::INTERVAL
  );
END;
$$;

GRANT EXECUTE ON FUNCTION check_and_increment_rate_limit(TEXT, TEXT) TO authenticated;

-- Add unique constraint for rate limit usage upsert
ALTER TABLE api_rate_limit_usage DROP CONSTRAINT IF EXISTS api_rate_limit_usage_unique;
ALTER TABLE api_rate_limit_usage ADD CONSTRAINT api_rate_limit_usage_unique 
  UNIQUE NULLS NOT DISTINCT (organization_id, user_id, endpoint, window_start, window_type);

-- ============================================================================
-- SECTION 10: COMMENTS
-- ============================================================================

COMMENT ON FUNCTION trigger_soft_delete IS 'Converts DELETE operations to soft deletes with audit logging';
COMMENT ON FUNCTION has_permission IS 'Checks if current user has a specific permission';
COMMENT ON FUNCTION can_access_entity IS 'Checks if current user can access a specific entity with given action';
COMMENT ON FUNCTION get_effective_permissions IS 'Returns the effective permissions for the current user';
COMMENT ON FUNCTION archive_old_audit_logs IS 'Archives audit logs older than specified days';
COMMENT ON FUNCTION archive_old_chronicle_entries IS 'Archives chronicle entries older than specified days';
COMMENT ON FUNCTION record_session_activity IS 'Records or updates user session activity';
COMMENT ON FUNCTION end_session IS 'Ends a user session';
COMMENT ON FUNCTION check_and_increment_rate_limit IS 'Checks rate limit and increments counter if allowed';

COMMENT ON TABLE user_sessions IS 'Tracks user sessions for security and analytics';
