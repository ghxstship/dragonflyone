-- Migration: Grant Table Permissions
-- Description: Grants permissions on new catalog tables and reloads schema cache
-- Date: 2025-12-11

-- Grant permissions on new tables to authenticated and service_role
GRANT ALL ON organization_catalog_items TO authenticated;
GRANT ALL ON organization_catalog_items TO service_role;
GRANT ALL ON catalog_visibility_settings TO authenticated;
GRANT ALL ON catalog_visibility_settings TO service_role;
GRANT ALL ON asset_request_permissions TO authenticated;
GRANT ALL ON asset_request_permissions TO service_role;
GRANT ALL ON advance_template_items TO authenticated;
GRANT ALL ON advance_template_items TO service_role;
GRANT ALL ON user_template_favorites TO authenticated;
GRANT ALL ON user_template_favorites TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION duplicate_catalog_item_to_org TO authenticated;
GRANT EXECUTE ON FUNCTION duplicate_catalog_item_to_org TO service_role;
GRANT EXECUTE ON FUNCTION can_request_category TO authenticated;
GRANT EXECUTE ON FUNCTION can_request_category TO service_role;
GRANT EXECUTE ON FUNCTION get_effective_catalog TO authenticated;
GRANT EXECUTE ON FUNCTION get_effective_catalog TO service_role;
GRANT EXECUTE ON FUNCTION create_advance_from_template TO authenticated;
GRANT EXECUTE ON FUNCTION create_advance_from_template TO service_role;
GRANT EXECUTE ON FUNCTION create_template_from_advance TO authenticated;
GRANT EXECUTE ON FUNCTION create_template_from_advance TO service_role;
GRANT EXECUTE ON FUNCTION get_user_templates TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_templates TO service_role;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
