-- 0121_fix_audit_function.sql
-- Fix the audit_sensitive_access function to use correct column name 'action' instead of 'operation'

CREATE OR REPLACE FUNCTION audit_sensitive_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    action,
    user_id,
    old_data,
    new_data,
    metadata
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    jsonb_build_object(
      'timestamp', now(),
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for',
      'user_agent', current_setting('request.headers', true)::json->>'user-agent'
    )
  );

  RETURN CASE TG_OP
    WHEN 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create missing helper functions for role management
CREATE OR REPLACE FUNCTION public.get_highest_platform_role(p_auth_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_highest TEXT;
BEGIN
  SELECT rd.code INTO v_highest
  FROM user_roles ur
  JOIN role_definitions rd ON rd.code = ur.role_code
  JOIN platform_users pu ON pu.id = ur.platform_user_id
  WHERE pu.auth_user_id = p_auth_user_id
  ORDER BY rd.hierarchy_rank DESC
  LIMIT 1;
  
  RETURN v_highest;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.refresh_user_role_claims(p_auth_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_highest TEXT;
BEGIN
  v_highest := public.get_highest_platform_role(p_auth_user_id);
  
  -- Update the user's app_metadata with the role
  IF v_highest IS NOT NULL THEN
    UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', v_highest)
    WHERE id = p_auth_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
