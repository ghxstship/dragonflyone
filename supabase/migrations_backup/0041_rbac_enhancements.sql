-- 0041_rbac_enhancements.sql
-- Enhanced RBAC functions and role management

-- Create role validation function
CREATE OR REPLACE FUNCTION validate_user_role(
  p_user_id uuid,
  p_required_role text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role text;
BEGIN
  SELECT role INTO v_user_role
  FROM user_roles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  -- Check role hierarchy
  RETURN CASE
    WHEN p_required_role = 'LEGEND_SUPER_ADMIN' THEN v_user_role = 'LEGEND_SUPER_ADMIN'
    WHEN p_required_role = 'ATLVS_SUPER_ADMIN' THEN v_user_role IN ('LEGEND_SUPER_ADMIN', 'ATLVS_SUPER_ADMIN')
    WHEN p_required_role = 'ATLVS_ADMIN' THEN v_user_role IN ('LEGEND_SUPER_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN')
    WHEN p_required_role = 'ATLVS_TEAM_MEMBER' THEN v_user_role IN ('LEGEND_SUPER_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER')
    WHEN p_required_role = 'ATLVS_VIEWER' THEN v_user_role IN ('LEGEND_SUPER_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'ATLVS_VIEWER')
    ELSE false
  END;
END;
$$;

-- Get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_org_id uuid;
  v_permissions jsonb;
BEGIN
  SELECT role INTO v_role FROM user_roles WHERE user_id = p_user_id LIMIT 1;
  SELECT organization_id INTO v_org_id FROM user_organizations WHERE user_id = p_user_id LIMIT 1;
  
  v_permissions := jsonb_build_object(
    'user_id', p_user_id,
    'role', v_role,
    'organization_id', v_org_id,
    'can_read', role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'),
    'can_write', role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'),
    'can_delete', role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'),
    'can_manage_users', role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'),
    'is_super_admin', role_in('LEGEND_SUPER_ADMIN')
  );
  
  RETURN v_permissions;
END;
$$;

-- Audit user action
CREATE OR REPLACE FUNCTION audit_user_action(
  p_user_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id uuid;
BEGIN
  -- Create audit_log table if it doesn't exist
  CREATE TABLE IF NOT EXISTS audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    action text NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
  );
  
  INSERT INTO audit_log (user_id, action, resource_type, resource_id, metadata)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_metadata)
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION validate_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION audit_user_action TO authenticated;

-- Create audit_log table with proper structure
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- RLS for audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_select ON audit_log
  FOR SELECT USING (
    role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- No insert/update/delete policies - only through function

GRANT SELECT ON audit_log TO authenticated;

COMMENT ON TABLE audit_log IS 'Audit trail for user actions across the system';
COMMENT ON FUNCTION validate_user_role IS 'Validates if a user has the required role with hierarchy support';
COMMENT ON FUNCTION get_user_permissions IS 'Returns comprehensive permissions for a user';
COMMENT ON FUNCTION audit_user_action IS 'Records user actions in audit log';
