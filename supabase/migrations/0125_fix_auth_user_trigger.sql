-- 0125_fix_auth_user_trigger.sql
-- Fix the auth user insert trigger to handle audit logging properly

-- Temporarily drop the audit trigger on platform_users
DROP TRIGGER IF EXISTS audit_platform_users ON platform_users;

-- Update the handle_auth_user_insert function to be more robust
CREATE OR REPLACE FUNCTION public.handle_auth_user_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org uuid;
  v_platform_user_id uuid;
  v_full_name text;
BEGIN
  -- Get or create the primary organization
  SELECT id INTO v_org FROM organizations WHERE slug = 'ghxstship' LIMIT 1;
  IF v_org IS NULL THEN
    INSERT INTO organizations (id, slug, name, timezone)
    VALUES ('00000000-0000-0000-0000-000000000001', 'ghxstship', 'GHXSTSHIP Industries', 'America/New_York')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_org;
  END IF;

  v_full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email);

  -- Insert platform user
  INSERT INTO platform_users (auth_user_id, organization_id, email, full_name)
  VALUES (NEW.id, v_org, NEW.email, v_full_name)
  ON CONFLICT (auth_user_id) DO UPDATE
    SET organization_id = EXCLUDED.organization_id,
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name
  RETURNING id INTO v_platform_user_id;

  -- Insert default role
  INSERT INTO user_roles (platform_user_id, organization_id, role_code)
  VALUES (v_platform_user_id, v_org, 'ATLVS_VIEWER')
  ON CONFLICT DO NOTHING;

  -- Refresh role claims (but don't fail if it errors)
  BEGIN
    PERFORM public.refresh_user_role_claims(NEW.id);
  EXCEPTION WHEN OTHERS THEN
    -- Log but don't fail
    RAISE WARNING 'Could not refresh role claims for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Recreate the audit trigger with a safer version that won't fail on missing columns
CREATE OR REPLACE FUNCTION audit_sensitive_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if we can get the required data
  BEGIN
    INSERT INTO audit_log (
      table_name,
      action,
      old_data,
      new_data,
      metadata
    ) VALUES (
      TG_TABLE_NAME,
      TG_OP,
      CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
      CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW)::jsonb ELSE NULL END,
      jsonb_build_object(
        'timestamp', now(),
        'trigger', TG_NAME
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Don't fail the main operation if audit logging fails
    RAISE WARNING 'Audit logging failed: %', SQLERRM;
  END;
  
  RETURN CASE TG_OP
    WHEN 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$;

-- Recreate audit trigger on platform_users
CREATE TRIGGER audit_platform_users
  AFTER INSERT OR UPDATE OR DELETE ON platform_users
  FOR EACH ROW EXECUTE FUNCTION audit_sensitive_access();
