-- ============================================================================
-- Gap 5 Remediation: Granular Finance Permissions
-- Adds finance:view, finance:edit, finance:approve, finance:export permissions
-- ============================================================================

-- Add finance permissions to the permission system
-- First, create a finance_permissions table to track granular access

CREATE TABLE IF NOT EXISTS public.finance_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.platform_users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  -- Granular permissions
  can_view BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_approve BOOLEAN NOT NULL DEFAULT FALSE,
  can_export BOOLEAN NOT NULL DEFAULT FALSE,
  -- Approval limits
  approval_limit_amount DECIMAL(15, 2),
  approval_limit_currency TEXT DEFAULT 'USD',
  -- Scope restrictions
  restricted_to_productions UUID[], -- If set, only these productions
  restricted_to_departments TEXT[], -- If set, only these departments
  restricted_to_categories TEXT[], -- If set, only these budget categories
  -- Metadata
  granted_by UUID REFERENCES public.platform_users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_finance_permissions_user_id ON public.finance_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_permissions_org_id ON public.finance_permissions(organization_id);

-- Enable RLS
ALTER TABLE public.finance_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies
DROP POLICY IF EXISTS "finance_permissions_select" ON public.finance_permissions;
CREATE POLICY "finance_permissions_select" ON public.finance_permissions
  FOR SELECT USING (
    -- Users can see their own permissions
    user_id IN (SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid())
    -- Admins can see all
    OR EXISTS (
      SELECT 1 FROM public.platform_users pu
      WHERE pu.auth_user_id = auth.uid()
      AND pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN']
    )
  );

DROP POLICY IF EXISTS "finance_permissions_insert" ON public.finance_permissions;
CREATE POLICY "finance_permissions_insert" ON public.finance_permissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.platform_users pu
      WHERE pu.auth_user_id = auth.uid()
      AND pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN']
    )
  );

DROP POLICY IF EXISTS "finance_permissions_update" ON public.finance_permissions;
CREATE POLICY "finance_permissions_update" ON public.finance_permissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.platform_users pu
      WHERE pu.auth_user_id = auth.uid()
      AND pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN']
    )
  );

-- Function to check if user has specific finance permission
CREATE OR REPLACE FUNCTION public.has_finance_permission(
  p_user_id UUID,
  p_permission TEXT, -- 'view', 'edit', 'approve', 'export'
  p_organization_id UUID DEFAULT NULL,
  p_production_id UUID DEFAULT NULL,
  p_amount DECIMAL DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_perm RECORD;
  v_user_roles TEXT[];
BEGIN
  -- Get user roles
  SELECT platform_roles INTO v_user_roles
  FROM public.platform_users
  WHERE id = p_user_id;
  
  -- Legend and Super Admin roles have all finance permissions
  IF v_user_roles && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN'] THEN
    RETURN TRUE;
  END IF;
  
  -- ATLVS Admin has view, edit, approve (no export by default)
  IF v_user_roles && ARRAY['ATLVS_ADMIN'] THEN
    IF p_permission IN ('view', 'edit', 'approve') THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  -- Check granular permissions
  SELECT * INTO v_perm
  FROM public.finance_permissions
  WHERE user_id = p_user_id
    AND (organization_id IS NULL OR organization_id = p_organization_id)
    AND (expires_at IS NULL OR expires_at > NOW());
  
  IF v_perm IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check specific permission
  CASE p_permission
    WHEN 'view' THEN
      IF NOT v_perm.can_view THEN RETURN FALSE; END IF;
    WHEN 'edit' THEN
      IF NOT v_perm.can_edit THEN RETURN FALSE; END IF;
    WHEN 'approve' THEN
      IF NOT v_perm.can_approve THEN RETURN FALSE; END IF;
      -- Check approval limit
      IF p_amount IS NOT NULL AND v_perm.approval_limit_amount IS NOT NULL THEN
        IF p_amount > v_perm.approval_limit_amount THEN
          RETURN FALSE;
        END IF;
      END IF;
    WHEN 'export' THEN
      IF NOT v_perm.can_export THEN RETURN FALSE; END IF;
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- Check production restriction
  IF p_production_id IS NOT NULL AND v_perm.restricted_to_productions IS NOT NULL THEN
    IF NOT (p_production_id = ANY(v_perm.restricted_to_productions)) THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Function to grant finance permissions
CREATE OR REPLACE FUNCTION public.grant_finance_permissions(
  p_user_id UUID,
  p_organization_id UUID,
  p_can_view BOOLEAN DEFAULT FALSE,
  p_can_edit BOOLEAN DEFAULT FALSE,
  p_can_approve BOOLEAN DEFAULT FALSE,
  p_can_export BOOLEAN DEFAULT FALSE,
  p_approval_limit DECIMAL DEFAULT NULL,
  p_restricted_productions UUID[] DEFAULT NULL,
  p_restricted_departments TEXT[] DEFAULT NULL,
  p_restricted_categories TEXT[] DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_granter_id UUID;
  v_perm_id UUID;
BEGIN
  -- Get granter ID
  SELECT id INTO v_granter_id
  FROM public.platform_users
  WHERE auth_user_id = auth.uid();
  
  -- Check if granter has permission
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_users pu
    WHERE pu.id = v_granter_id
    AND pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN']
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to grant finance access';
  END IF;
  
  -- Insert or update
  INSERT INTO public.finance_permissions (
    user_id, organization_id, can_view, can_edit, can_approve, can_export,
    approval_limit_amount, restricted_to_productions, restricted_to_departments,
    restricted_to_categories, granted_by, expires_at, notes
  )
  VALUES (
    p_user_id, p_organization_id, p_can_view, p_can_edit, p_can_approve, p_can_export,
    p_approval_limit, p_restricted_productions, p_restricted_departments,
    p_restricted_categories, v_granter_id, p_expires_at, p_notes
  )
  ON CONFLICT (user_id, organization_id)
  DO UPDATE SET
    can_view = EXCLUDED.can_view,
    can_edit = EXCLUDED.can_edit,
    can_approve = EXCLUDED.can_approve,
    can_export = EXCLUDED.can_export,
    approval_limit_amount = EXCLUDED.approval_limit_amount,
    restricted_to_productions = EXCLUDED.restricted_to_productions,
    restricted_to_departments = EXCLUDED.restricted_to_departments,
    restricted_to_categories = EXCLUDED.restricted_to_categories,
    granted_by = EXCLUDED.granted_by,
    expires_at = EXCLUDED.expires_at,
    notes = EXCLUDED.notes,
    updated_at = NOW()
  RETURNING id INTO v_perm_id;
  
  -- Log the permission change
  PERFORM public.log_permission_change(
    'permission_granted',
    p_user_id,
    NULL,
    jsonb_build_object(
      'type', 'finance',
      'can_view', p_can_view,
      'can_edit', p_can_edit,
      'can_approve', p_can_approve,
      'can_export', p_can_export,
      'approval_limit', p_approval_limit
    )
  );
  
  RETURN v_perm_id;
END;
$$;

-- Function to revoke finance permissions
CREATE OR REPLACE FUNCTION public.revoke_finance_permissions(
  p_user_id UUID,
  p_organization_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_granter_id UUID;
  v_old_perms RECORD;
BEGIN
  -- Get granter ID
  SELECT id INTO v_granter_id
  FROM public.platform_users
  WHERE auth_user_id = auth.uid();
  
  -- Check if granter has permission
  IF NOT EXISTS (
    SELECT 1 FROM public.platform_users pu
    WHERE pu.id = v_granter_id
    AND pu.platform_roles::text[] && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN']
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to revoke finance access';
  END IF;
  
  -- Get old permissions for audit
  SELECT * INTO v_old_perms
  FROM public.finance_permissions
  WHERE user_id = p_user_id
    AND (organization_id = p_organization_id OR (p_organization_id IS NULL AND organization_id IS NULL));
  
  -- Delete permissions
  DELETE FROM public.finance_permissions
  WHERE user_id = p_user_id
    AND (organization_id = p_organization_id OR (p_organization_id IS NULL AND organization_id IS NULL));
  
  -- Log the permission change
  IF v_old_perms IS NOT NULL THEN
    PERFORM public.log_permission_change(
      'permission_revoked',
      p_user_id,
      jsonb_build_object(
        'type', 'finance',
        'can_view', v_old_perms.can_view,
        'can_edit', v_old_perms.can_edit,
        'can_approve', v_old_perms.can_approve,
        'can_export', v_old_perms.can_export
      ),
      NULL
    );
  END IF;
  
  RETURN FOUND;
END;
$$;

-- Function to get user's finance permissions
CREATE OR REPLACE FUNCTION public.get_finance_permissions(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_roles TEXT[];
  v_perms RECORD;
  v_result JSONB;
BEGIN
  -- Get user roles
  SELECT platform_roles INTO v_user_roles
  FROM public.platform_users
  WHERE id = p_user_id;
  
  -- Check role-based permissions first
  IF v_user_roles && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN'] THEN
    RETURN jsonb_build_object(
      'source', 'role',
      'can_view', TRUE,
      'can_edit', TRUE,
      'can_approve', TRUE,
      'can_export', TRUE,
      'approval_limit', NULL,
      'restrictions', NULL
    );
  END IF;
  
  IF v_user_roles && ARRAY['ATLVS_ADMIN'] THEN
    RETURN jsonb_build_object(
      'source', 'role',
      'can_view', TRUE,
      'can_edit', TRUE,
      'can_approve', TRUE,
      'can_export', FALSE,
      'approval_limit', NULL,
      'restrictions', NULL
    );
  END IF;
  
  -- Get granular permissions
  SELECT * INTO v_perms
  FROM public.finance_permissions
  WHERE user_id = p_user_id
    AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1;
  
  IF v_perms IS NULL THEN
    RETURN jsonb_build_object(
      'source', 'none',
      'can_view', FALSE,
      'can_edit', FALSE,
      'can_approve', FALSE,
      'can_export', FALSE
    );
  END IF;
  
  RETURN jsonb_build_object(
    'source', 'explicit',
    'can_view', v_perms.can_view,
    'can_edit', v_perms.can_edit,
    'can_approve', v_perms.can_approve,
    'can_export', v_perms.can_export,
    'approval_limit', v_perms.approval_limit_amount,
    'restrictions', jsonb_build_object(
      'productions', v_perms.restricted_to_productions,
      'departments', v_perms.restricted_to_departments,
      'categories', v_perms.restricted_to_categories
    ),
    'expires_at', v_perms.expires_at
  );
END;
$$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_finance_permissions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS finance_permissions_updated_at ON public.finance_permissions;
CREATE TRIGGER finance_permissions_updated_at
  BEFORE UPDATE ON public.finance_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_finance_permissions_updated_at();

-- Grant permissions
GRANT SELECT ON public.finance_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_finance_permission TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_finance_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_finance_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_finance_permissions TO authenticated;
