-- ============================================================================
-- 0035_legend_rpcs.sql
-- Legend Schema RPC Functions
-- GHXSTSHIP Platform
-- ============================================================================

-- Get entity counts for Legend hub dashboard
CREATE OR REPLACE FUNCTION get_legend_entity_counts(p_organization_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_legend_entity_counts(UUID) TO authenticated;
