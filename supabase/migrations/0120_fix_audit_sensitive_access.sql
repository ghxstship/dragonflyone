-- 0120_fix_audit_sensitive_access.sql
-- Fix audit_sensitive_access trigger to use correct 'action' column instead of 'operation'
-- The audit_log table uses 'action' (from 0008) but trigger was using 'operation' (from 0028)
-- Also adds missing get_highest_platform_role function needed by user_roles trigger

-- Fix the audit_sensitive_access function to use 'action' column
CREATE OR REPLACE FUNCTION audit_sensitive_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    action,
    changed_by,
    old_data,
    new_data,
    metadata
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    current_platform_user_id(),
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW)::jsonb ELSE NULL END,
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
$$;

COMMENT ON FUNCTION audit_sensitive_access IS 'Audit all access to sensitive tables with user context';

-- Create missing get_highest_platform_role function (needed by refresh_user_role_claims trigger)
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

COMMENT ON FUNCTION public.get_highest_platform_role IS 'Get the highest ranked platform role for a user';
