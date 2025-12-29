-- ============================================================================
-- 0036_fix_gvteway_rls_policies.sql
-- Fix incorrect role codes in GVTEWAY RLS policies
-- GHXSTSHIP Platform - RLS Audit Remediation
-- ============================================================================

-- Drop and recreate policies with correct role codes
-- Issue: Policies used 'admin', 'super_admin' instead of standard role codes

-- Fix user_favorites_owner policy
DROP POLICY IF EXISTS user_favorites_owner ON user_favorites;
CREATE POLICY user_favorites_owner ON user_favorites FOR ALL USING (
  person_id = current_platform_user_id() OR 
  role_in('GVTEWAY_ADMIN', 'GVTEWAY_SUPER_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- Fix wishlists_owner policy
DROP POLICY IF EXISTS wishlists_owner ON wishlists;
CREATE POLICY wishlists_owner ON wishlists FOR ALL USING (
  person_id = current_platform_user_id() OR 
  is_public = true OR 
  role_in('GVTEWAY_ADMIN', 'GVTEWAY_SUPER_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- Fix saved_searches_owner policy
DROP POLICY IF EXISTS saved_searches_owner ON saved_searches;
CREATE POLICY saved_searches_owner ON saved_searches FOR ALL USING (
  person_id = current_platform_user_id() OR 
  role_in('GVTEWAY_ADMIN', 'GVTEWAY_SUPER_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- Fix price_alerts_owner policy
DROP POLICY IF EXISTS price_alerts_owner ON price_alerts;
CREATE POLICY price_alerts_owner ON price_alerts FOR ALL USING (
  person_id = current_platform_user_id() OR 
  role_in('GVTEWAY_ADMIN', 'GVTEWAY_SUPER_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- Add comment for audit trail
COMMENT ON POLICY user_favorites_owner ON user_favorites IS 'Fixed in 0036: Corrected role codes from admin/super_admin to standard GVTEWAY/ATLVS/LEGEND role codes';
COMMENT ON POLICY wishlists_owner ON wishlists IS 'Fixed in 0036: Corrected role codes from admin/super_admin to standard GVTEWAY/ATLVS/LEGEND role codes';
COMMENT ON POLICY saved_searches_owner ON saved_searches IS 'Fixed in 0036: Corrected role codes from admin/super_admin to standard GVTEWAY/ATLVS/LEGEND role codes';
COMMENT ON POLICY price_alerts_owner ON price_alerts IS 'Fixed in 0036: Corrected role codes from admin/super_admin to standard GVTEWAY/ATLVS/LEGEND role codes';

-- ============================================================================
-- FIX 2: Add authorization check to get_legend_entity_counts RPC
-- Issue: Function was missing org_matches() authorization check
-- ============================================================================

CREATE OR REPLACE FUNCTION get_legend_entity_counts(p_organization_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Authorization check: verify user has access to this organization
  IF NOT org_matches(p_organization_id) THEN
    RAISE EXCEPTION 'Insufficient permissions to access organization data';
  END IF;

  SELECT json_build_object(
    'people', (SELECT COUNT(*) FROM legend_people WHERE organization_id = p_organization_id AND status = 'active'),
    'places', (SELECT COUNT(*) FROM legend_places WHERE organization_id = p_organization_id AND status = 'active'),
    'organizations', (SELECT COUNT(*) FROM legend_organizations WHERE organization_id = p_organization_id AND status = 'active'),
    'products', (SELECT COUNT(*) FROM legend_products WHERE organization_id = p_organization_id AND status = 'active'),
    'events', (SELECT COUNT(*) FROM legend_events WHERE organization_id = p_organization_id),
    'documents', (SELECT COUNT(*) FROM legend_documents WHERE organization_id = p_organization_id),
    'departments', (SELECT COUNT(*) FROM legend_departments WHERE organization_id = p_organization_id AND is_active = true),
    'teams', (SELECT COUNT(*) FROM legend_teams WHERE organization_id = p_organization_id AND is_active = true),
    'positions', (SELECT COUNT(*) FROM legend_positions WHERE organization_id = p_organization_id AND is_active = true)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- ============================================================================
-- FIX 3: Add RLS to schema_version table (system table - read-only for all)
-- ============================================================================

ALTER TABLE IF EXISTS schema_version ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read schema version (system info)
DROP POLICY IF EXISTS schema_version_read ON schema_version;
CREATE POLICY schema_version_read ON schema_version FOR SELECT USING (true);

-- Only service role can insert (migrations)
DROP POLICY IF EXISTS schema_version_insert ON schema_version;
CREATE POLICY schema_version_insert ON schema_version FOR INSERT WITH CHECK (false);

GRANT SELECT ON schema_version TO authenticated;
