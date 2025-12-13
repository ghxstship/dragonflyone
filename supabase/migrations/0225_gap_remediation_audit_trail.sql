-- ============================================================================
-- Gap 4 Remediation: Audit Trail for Permission Changes
-- Implements comprehensive audit logging for role/permission modifications
-- ============================================================================

-- Create permission audit log table
CREATE TABLE IF NOT EXISTS public.permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL CHECK (action_type IN (
    'role_assigned', 'role_removed', 'role_modified',
    'permission_granted', 'permission_revoked',
    'portal_access_granted', 'portal_access_revoked',
    '2fa_enabled', '2fa_disabled',
    'impersonation_started', 'impersonation_ended',
    'api_key_created', 'api_key_revoked'
  )),
  target_user_id UUID REFERENCES public.platform_users(id) ON DELETE SET NULL,
  target_user_email TEXT,
  performed_by_user_id UUID REFERENCES public.platform_users(id) ON DELETE SET NULL,
  performed_by_email TEXT,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_target_user ON public.permission_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_performed_by ON public.permission_audit_log(performed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_action_type ON public.permission_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_created_at ON public.permission_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_permission_audit_log_organization ON public.permission_audit_log(organization_id);

-- Enable RLS
ALTER TABLE public.permission_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policy: Only admins can view audit logs
DROP POLICY IF EXISTS "permission_audit_log_select" ON public.permission_audit_log;
CREATE POLICY "permission_audit_log_select" ON public.permission_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.platform_users pu
      WHERE pu.auth_user_id = auth.uid()
      AND (
        pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN']
        OR (
          -- Org admins can see logs for their organization
          pu.platform_roles::text[] && ARRAY['ATLVS_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN']
          AND pu.organization_id = permission_audit_log.organization_id
        )
      )
    )
  );

-- Function to log permission changes
CREATE OR REPLACE FUNCTION public.log_permission_change(
  p_action_type TEXT,
  p_target_user_id UUID,
  p_old_value JSONB DEFAULT NULL,
  p_new_value JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_performer_id UUID;
  v_performer_email TEXT;
  v_target_email TEXT;
  v_org_id UUID;
  v_log_id UUID;
BEGIN
  -- Get performer info
  SELECT id, email, organization_id INTO v_performer_id, v_performer_email, v_org_id
  FROM public.platform_users
  WHERE auth_user_id = auth.uid();
  
  -- Get target email
  SELECT email INTO v_target_email
  FROM public.platform_users
  WHERE id = p_target_user_id;
  
  -- Insert audit log
  INSERT INTO public.permission_audit_log (
    action_type,
    target_user_id,
    target_user_email,
    performed_by_user_id,
    performed_by_email,
    old_value,
    new_value,
    metadata,
    ip_address,
    user_agent,
    organization_id
  )
  VALUES (
    p_action_type,
    p_target_user_id,
    v_target_email,
    v_performer_id,
    v_performer_email,
    p_old_value,
    p_new_value,
    p_metadata,
    p_ip_address,
    p_user_agent,
    v_org_id
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Trigger function to automatically log role changes
CREATE OR REPLACE FUNCTION public.audit_platform_user_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if platform_roles changed
  IF OLD.platform_roles IS DISTINCT FROM NEW.platform_roles THEN
    -- Determine if roles were added or removed
    IF array_length(NEW.platform_roles, 1) > COALESCE(array_length(OLD.platform_roles, 1), 0) THEN
      PERFORM public.log_permission_change(
        'role_assigned',
        NEW.id,
        jsonb_build_object('roles', OLD.platform_roles),
        jsonb_build_object('roles', NEW.platform_roles),
        jsonb_build_object(
          'added_roles', (SELECT array_agg(r) FROM unnest(NEW.platform_roles) r WHERE r != ALL(COALESCE(OLD.platform_roles, ARRAY[]::TEXT[])))
        )
      );
    ELSIF array_length(NEW.platform_roles, 1) < COALESCE(array_length(OLD.platform_roles, 1), 0) THEN
      PERFORM public.log_permission_change(
        'role_removed',
        NEW.id,
        jsonb_build_object('roles', OLD.platform_roles),
        jsonb_build_object('roles', NEW.platform_roles),
        jsonb_build_object(
          'removed_roles', (SELECT array_agg(r) FROM unnest(OLD.platform_roles) r WHERE r != ALL(COALESCE(NEW.platform_roles, ARRAY[]::TEXT[])))
        )
      );
    ELSE
      PERFORM public.log_permission_change(
        'role_modified',
        NEW.id,
        jsonb_build_object('roles', OLD.platform_roles),
        jsonb_build_object('roles', NEW.platform_roles)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for role changes
DROP TRIGGER IF EXISTS audit_platform_user_roles ON public.platform_users;
CREATE TRIGGER audit_platform_user_roles
  AFTER UPDATE OF platform_roles ON public.platform_users
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_platform_user_role_changes();

-- Trigger function to log portal access changes
CREATE OR REPLACE FUNCTION public.audit_portal_access_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_permission_change(
      'portal_access_granted',
      NEW.user_id,
      NULL,
      jsonb_build_object(
        'entity_type', NEW.entity_type,
        'entity_id', NEW.entity_id,
        'access_level', NEW.access_level,
        'expires_at', NEW.expires_at
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_permission_change(
      'portal_access_revoked',
      OLD.user_id,
      jsonb_build_object(
        'entity_type', OLD.entity_type,
        'entity_id', OLD.entity_id,
        'access_level', OLD.access_level
      ),
      NULL
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for portal access changes
DROP TRIGGER IF EXISTS audit_portal_access ON public.portal_user_entity_access;
CREATE TRIGGER audit_portal_access
  AFTER INSERT OR DELETE ON public.portal_user_entity_access
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_portal_access_changes();

-- Trigger function to log 2FA changes
CREATE OR REPLACE FUNCTION public.audit_2fa_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.totp_enabled IS DISTINCT FROM NEW.totp_enabled THEN
    IF NEW.totp_enabled THEN
      PERFORM public.log_permission_change(
        '2fa_enabled',
        NEW.user_id,
        jsonb_build_object('totp_enabled', FALSE),
        jsonb_build_object('totp_enabled', TRUE)
      );
    ELSE
      PERFORM public.log_permission_change(
        '2fa_disabled',
        NEW.user_id,
        jsonb_build_object('totp_enabled', TRUE),
        jsonb_build_object('totp_enabled', FALSE)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for 2FA changes
DROP TRIGGER IF EXISTS audit_2fa ON public.user_2fa_config;
CREATE TRIGGER audit_2fa
  AFTER UPDATE OF totp_enabled ON public.user_2fa_config
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_2fa_changes();

-- Function to query audit logs with filters
CREATE OR REPLACE FUNCTION public.query_permission_audit_logs(
  p_target_user_id UUID DEFAULT NULL,
  p_performed_by_user_id UUID DEFAULT NULL,
  p_action_types TEXT[] DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  action_type TEXT,
  target_user_id UUID,
  target_user_email TEXT,
  performed_by_user_id UUID,
  performed_by_email TEXT,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has permission to query audit logs
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_users pu
    WHERE pu.auth_user_id = auth.uid()
    AND pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN']
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to query audit logs';
  END IF;
  
  RETURN QUERY
  SELECT 
    pal.id,
    pal.action_type,
    pal.target_user_id,
    pal.target_user_email,
    pal.performed_by_user_id,
    pal.performed_by_email,
    pal.old_value,
    pal.new_value,
    pal.metadata,
    pal.ip_address,
    pal.created_at
  FROM public.permission_audit_log pal
  WHERE (p_target_user_id IS NULL OR pal.target_user_id = p_target_user_id)
    AND (p_performed_by_user_id IS NULL OR pal.performed_by_user_id = p_performed_by_user_id)
    AND (p_action_types IS NULL OR pal.action_type = ANY(p_action_types))
    AND (p_start_date IS NULL OR pal.created_at >= p_start_date)
    AND (p_end_date IS NULL OR pal.created_at <= p_end_date)
    AND (p_organization_id IS NULL OR pal.organization_id = p_organization_id)
  ORDER BY pal.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to get audit log summary
CREATE OR REPLACE FUNCTION public.get_permission_audit_summary(
  p_days INT DEFAULT 30,
  p_organization_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Check permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_users pu
    WHERE pu.auth_user_id = auth.uid()
    AND pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN']
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  
  SELECT jsonb_build_object(
    'total_events', COUNT(*),
    'by_action_type', jsonb_object_agg(action_type, cnt),
    'unique_performers', COUNT(DISTINCT performed_by_user_id),
    'unique_targets', COUNT(DISTINCT target_user_id),
    'period_start', NOW() - (p_days || ' days')::INTERVAL,
    'period_end', NOW()
  ) INTO v_result
  FROM (
    SELECT action_type, COUNT(*) as cnt
    FROM public.permission_audit_log
    WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
      AND (p_organization_id IS NULL OR organization_id = p_organization_id)
    GROUP BY action_type
  ) sub;
  
  RETURN v_result;
END;
$$;

-- Grant permissions
GRANT SELECT ON public.permission_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_permission_change TO authenticated;
GRANT EXECUTE ON FUNCTION public.query_permission_audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_permission_audit_summary TO authenticated;
