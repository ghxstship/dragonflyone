-- Migration: 0148_drop_duplicate_indexes.sql
-- Description: Drop duplicate indexes to fix Supabase performance warnings
-- Note: RLS policy optimizations require careful schema analysis and are deferred

-- ============================================================================
-- DROP DUPLICATE INDEXES
-- These indexes are exact duplicates of other indexes on the same tables
-- ============================================================================

-- crew_certifications: Drop duplicate expiration index
-- Keep: idx_crew_certifications_expiration
DROP INDEX IF EXISTS idx_crew_certifications_expired;

-- finance_expenses: Drop duplicate org_status index
-- Keep: finance_expenses_organization_id_status_idx
DROP INDEX IF EXISTS idx_finance_expenses_org_status;

-- finance_purchase_orders: Drop duplicate org_status index
-- Keep: finance_purchase_orders_organization_id_status_idx
DROP INDEX IF EXISTS idx_finance_po_org_status;

-- integration_event_links: Drop duplicate org index
-- Keep: integration_event_links_organization_id_status_idx
DROP INDEX IF EXISTS idx_integration_event_links_org;

-- integration_project_links: Drop duplicate org index
-- Keep: integration_project_links_organization_id_status_idx
DROP INDEX IF EXISTS idx_integration_project_links_org;

-- notification_preferences: Drop duplicate user index
-- Keep: idx_notification_preferences_user
DROP INDEX IF EXISTS idx_notification_prefs_user;

-- procurement_requests: Drop duplicate org_status index
-- Keep: procurement_requests_organization_id_status_idx
DROP INDEX IF EXISTS idx_procurement_requests_org_status;
