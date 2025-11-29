-- 0119_add_audit_log_operation_column.sql
-- Fix audit_sensitive_access trigger to use correct 'action' column instead of 'operation'
-- The audit_log table uses 'action' (from 0008) but trigger was using 'operation' (from 0028)

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
