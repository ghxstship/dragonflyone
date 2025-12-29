-- 0179_fix_duplicate_indexes.sql
-- Fixes linter warning: Duplicate Index
-- Removes duplicate indexes that have identical definitions

-- Drop duplicate indexes (keeping the more descriptive name)
DROP INDEX IF EXISTS public."idx_saved_filters_public";
DROP INDEX IF EXISTS public."idx_saved_views_public";

-- The following indexes are kept:
-- idx_saved_filters_is_public ON saved_filters(is_public) WHERE is_public = true
-- idx_saved_views_is_public ON saved_views(is_public) WHERE is_public = true
