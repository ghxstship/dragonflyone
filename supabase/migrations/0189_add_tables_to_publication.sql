-- Migration: Add new tables to supabase_realtime publication
-- Description: Adds the new catalog tables to the realtime publication so PostgREST can see them
-- Date: 2025-12-11

-- Add tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE organization_catalog_items;
ALTER PUBLICATION supabase_realtime ADD TABLE catalog_visibility_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE asset_request_permissions;
ALTER PUBLICATION supabase_realtime ADD TABLE advance_template_items;
ALTER PUBLICATION supabase_realtime ADD TABLE user_template_favorites;
