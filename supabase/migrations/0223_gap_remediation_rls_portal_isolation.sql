-- ============================================================================
-- Gap 2 Remediation: Portal User Data Isolation
-- Implements strict RLS policies and entity scoping for portal users
-- ============================================================================

-- Create portal_user_entity_access table to track which entities portal users can access
CREATE TABLE IF NOT EXISTS public.portal_user_entity_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.platform_users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('vendor', 'sponsor', 'investor', 'artist', 'crew')),
  entity_id UUID NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'read' CHECK (access_level IN ('read', 'write', 'admin')),
  granted_by UUID REFERENCES public.platform_users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_portal_user_entity_access_user_id ON public.portal_user_entity_access(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_user_entity_access_entity ON public.portal_user_entity_access(entity_type, entity_id);

-- Enable RLS on portal_user_entity_access
ALTER TABLE public.portal_user_entity_access ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only see their own access grants
DROP POLICY IF EXISTS "portal_user_entity_access_select" ON public.portal_user_entity_access;
CREATE POLICY "portal_user_entity_access_select" ON public.portal_user_entity_access
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_users pu ON pu.id = ur.platform_user_id
      WHERE pu.auth_user_id = auth.uid()
      AND ur.role_code IN ('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN')
    )
  );

-- Function to check if a user has portal access to an entity
CREATE OR REPLACE FUNCTION public.has_portal_entity_access(
  p_user_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_required_level TEXT DEFAULT 'read'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_access_level TEXT;
  v_level_hierarchy JSONB := '{"read": 1, "write": 2, "admin": 3}'::JSONB;
BEGIN
  -- Check if user has explicit access
  SELECT access_level INTO v_access_level
  FROM public.portal_user_entity_access
  WHERE user_id = p_user_id
    AND entity_type = p_entity_type
    AND entity_id = p_entity_id
    AND (expires_at IS NULL OR expires_at > NOW());
  
  IF v_access_level IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if access level is sufficient
  RETURN (v_level_hierarchy->>v_access_level)::INT >= (v_level_hierarchy->>p_required_level)::INT;
END;
$$;

-- ============================================================================
-- VENDOR PORTAL ISOLATION
-- ============================================================================

-- Drop existing vendor policies and recreate with portal isolation
DROP POLICY IF EXISTS "vendors_portal_isolation" ON public.vendors;
CREATE POLICY "vendors_portal_isolation" ON public.vendors
  FOR SELECT USING (
    -- Admins can see all vendors
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_users pu ON pu.id = ur.platform_user_id
      WHERE pu.auth_user_id = auth.uid()
      AND ur.role_code IN ('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN', 'COMPVSS_ADMIN')
    )
    -- Portal users can only see their own vendor record
    OR id IN (
      SELECT entity_id FROM public.portal_user_entity_access
      WHERE user_id IN (SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid())
      AND entity_type = 'vendor'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- Vendor contracts - portal users only see their own
DROP POLICY IF EXISTS "vendor_contracts_portal_isolation" ON public.contracts;
CREATE POLICY "vendor_contracts_portal_isolation" ON public.contracts
  FOR SELECT USING (
    -- Admins can see all contracts
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_users pu ON pu.id = ur.platform_user_id
      WHERE pu.auth_user_id = auth.uid()
      AND ur.role_code IN ('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN')
    )
    -- Portal users can only see contracts for their vendor entities
    OR (
      vendor_id IS NOT NULL AND vendor_id IN (
        SELECT entity_id FROM public.portal_user_entity_access
        WHERE user_id IN (SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid())
        AND entity_type = 'vendor'
        AND (expires_at IS NULL OR expires_at > NOW())
      )
    )
  );

-- ============================================================================
-- SPONSOR PORTAL ISOLATION
-- ============================================================================

DROP POLICY IF EXISTS "sponsors_portal_isolation" ON public.sponsors;
CREATE POLICY "sponsors_portal_isolation" ON public.sponsors
  FOR SELECT USING (
    -- Admins can see all sponsors
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_users pu ON pu.id = ur.platform_user_id
      WHERE pu.auth_user_id = auth.uid()
      AND ur.role_code IN ('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN')
    )
    -- Portal users can only see their own sponsor record
    OR id IN (
      SELECT entity_id FROM public.portal_user_entity_access
      WHERE user_id IN (SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid())
      AND entity_type = 'sponsor'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- Sponsor activations - portal users only see their own
DROP POLICY IF EXISTS "sponsor_activations_portal_isolation" ON public.sponsor_activations;
CREATE POLICY "sponsor_activations_portal_isolation" ON public.sponsor_activations
  FOR SELECT USING (
    -- Admins can see all activations
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_users pu ON pu.id = ur.platform_user_id
      WHERE pu.auth_user_id = auth.uid()
      AND ur.role_code IN ('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN')
    )
    -- Portal users can only see activations for their sponsors
    OR sponsor_id IN (
      SELECT entity_id FROM public.portal_user_entity_access
      WHERE user_id IN (SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid())
      AND entity_type = 'sponsor'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- ============================================================================
-- INVESTOR PORTAL ISOLATION
-- ============================================================================

DROP POLICY IF EXISTS "investors_portal_isolation" ON public.investors;
CREATE POLICY "investors_portal_isolation" ON public.investors
  FOR SELECT USING (
    -- Admins can see all investors
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_users pu ON pu.id = ur.platform_user_id
      WHERE pu.auth_user_id = auth.uid()
      AND ur.role_code IN ('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN')
    )
    -- Portal users can only see their own investor record
    OR id IN (
      SELECT entity_id FROM public.portal_user_entity_access
      WHERE user_id IN (SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid())
      AND entity_type = 'investor'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- Investment rounds - portal users only see rounds they're part of
DROP POLICY IF EXISTS "investment_rounds_portal_isolation" ON public.investment_rounds;
CREATE POLICY "investment_rounds_portal_isolation" ON public.investment_rounds
  FOR SELECT USING (
    -- Admins can see all rounds
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_users pu ON pu.id = ur.platform_user_id
      WHERE pu.auth_user_id = auth.uid()
      AND ur.role_code IN ('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN')
    )
    -- Portal users can only see rounds they've invested in
    OR id IN (
      SELECT round_id FROM public.investments
      WHERE investor_id IN (
        SELECT entity_id FROM public.portal_user_entity_access
        WHERE user_id IN (SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid())
        AND entity_type = 'investor'
        AND (expires_at IS NULL OR expires_at > NOW())
      )
    )
  );

-- ============================================================================
-- ARTIST PORTAL ISOLATION
-- ============================================================================

DROP POLICY IF EXISTS "artists_portal_isolation" ON public.artists;
CREATE POLICY "artists_portal_isolation" ON public.artists
  FOR SELECT USING (
    -- Admins can see all artists
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_users pu ON pu.id = ur.platform_user_id
      WHERE pu.auth_user_id = auth.uid()
      AND ur.role_code IN ('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN')
    )
    -- Portal users can only see their own artist record
    OR id IN (
      SELECT entity_id FROM public.portal_user_entity_access
      WHERE user_id IN (SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid())
      AND entity_type = 'artist'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
  );

-- ============================================================================
-- CREW PORTAL ISOLATION
-- ============================================================================

DROP POLICY IF EXISTS "crew_members_portal_isolation" ON public.crew_members;
CREATE POLICY "crew_members_portal_isolation" ON public.crew_members
  FOR SELECT USING (
    -- Admins can see all crew
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.platform_users pu ON pu.id = ur.platform_user_id
      WHERE pu.auth_user_id = auth.uid()
      AND ur.role_code IN ('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'COMPVSS_ADMIN')
    )
    -- Portal users can only see their own crew record
    OR id IN (
      SELECT entity_id FROM public.portal_user_entity_access
      WHERE user_id IN (SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid())
      AND entity_type = 'crew'
      AND (expires_at IS NULL OR expires_at > NOW())
    )
    -- Users can see their own record via user_id
    OR user_id IN (
      SELECT id FROM public.platform_users WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS FOR PORTAL ACCESS MANAGEMENT
-- ============================================================================

-- Grant portal access to a user
CREATE OR REPLACE FUNCTION public.grant_portal_access(
  p_user_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_access_level TEXT DEFAULT 'read',
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_granter_id UUID;
  v_access_id UUID;
BEGIN
  -- Get the granter's platform user ID
  SELECT id INTO v_granter_id
  FROM public.platform_users
  WHERE auth_user_id = auth.uid();
  
  -- Check if granter has permission (must be admin)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.platform_user_id = v_granter_id
    AND ur.role_code IN ('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to grant portal access';
  END IF;
  
  -- Insert or update access
  INSERT INTO public.portal_user_entity_access (
    user_id, entity_type, entity_id, access_level, granted_by, expires_at
  )
  VALUES (
    p_user_id, p_entity_type, p_entity_id, p_access_level, v_granter_id, p_expires_at
  )
  ON CONFLICT (user_id, entity_type, entity_id)
  DO UPDATE SET
    access_level = EXCLUDED.access_level,
    granted_by = EXCLUDED.granted_by,
    granted_at = NOW(),
    expires_at = EXCLUDED.expires_at,
    updated_at = NOW()
  RETURNING id INTO v_access_id;
  
  RETURN v_access_id;
END;
$$;

-- Revoke portal access from a user
CREATE OR REPLACE FUNCTION public.revoke_portal_access(
  p_user_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_granter_id UUID;
BEGIN
  -- Get the granter's platform user ID
  SELECT id INTO v_granter_id
  FROM public.platform_users
  WHERE auth_user_id = auth.uid();
  
  -- Check if granter has permission (must be admin)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.platform_user_id = v_granter_id
    AND ur.role_code IN ('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN', 'ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to revoke portal access';
  END IF;
  
  -- Delete access
  DELETE FROM public.portal_user_entity_access
  WHERE user_id = p_user_id
    AND entity_type = p_entity_type
    AND entity_id = p_entity_id;
  
  RETURN FOUND;
END;
$$;

-- Get all portal access for a user
CREATE OR REPLACE FUNCTION public.get_user_portal_access(p_user_id UUID)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  access_level TEXT,
  granted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pua.entity_type,
    pua.entity_id,
    pua.access_level,
    pua.granted_at,
    pua.expires_at
  FROM public.portal_user_entity_access pua
  WHERE pua.user_id = p_user_id
    AND (pua.expires_at IS NULL OR pua.expires_at > NOW());
END;
$$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_portal_access_updated_at()
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

DROP TRIGGER IF EXISTS portal_user_entity_access_updated_at ON public.portal_user_entity_access;
CREATE TRIGGER portal_user_entity_access_updated_at
  BEFORE UPDATE ON public.portal_user_entity_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_portal_access_updated_at();

-- Grant permissions
GRANT SELECT ON public.portal_user_entity_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_portal_entity_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_portal_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_portal_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_portal_access TO authenticated;
