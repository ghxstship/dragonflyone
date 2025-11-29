-- 0121_add_missing_role_function.sql
-- Add missing get_highest_platform_role function needed by user_roles trigger

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
