-- ============================================================================
-- 0009_grants.sql
-- Permission Grants for All Tables
-- GHXSTSHIP Platform - 3NF Normalized Structure
-- ============================================================================

-- ============================================================================
-- CORE FOUNDATION GRANTS
-- ============================================================================

GRANT SELECT ON organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON platform_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_organizations TO authenticated;
GRANT SELECT ON user_roles TO authenticated;
GRANT SELECT ON role_definitions TO authenticated;

-- ============================================================================
-- LEGEND SCHEMA GRANTS
-- ============================================================================

-- Legend Entity Tables
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_people TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_places TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_documents TO authenticated;

-- Legend Reference Tables
GRANT SELECT, INSERT, UPDATE, DELETE ON addresses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_departments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_teams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_positions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_cost_centers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_relationships TO authenticated;

-- ============================================================================
-- LEGEND PROFILE GRANTS - PEOPLE
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_employee TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_crew TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_artist TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_volunteer TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_contact TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_candidate TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_mentor TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_influencer TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_speaker TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_attendee TO authenticated;

-- ============================================================================
-- LEGEND PROFILE GRANTS - PLACES
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON places_profile_venue TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON places_profile_warehouse TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON places_profile_zone TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON places_profile_space TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON places_profile_staging TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON places_profile_parking TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON places_profile_office TO authenticated;

-- ============================================================================
-- LEGEND PROFILE GRANTS - ORGANIZATIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON orgs_profile_vendor TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orgs_profile_sponsor TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orgs_profile_partner TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orgs_profile_agency TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orgs_profile_client TO authenticated;

-- ============================================================================
-- LEGEND PROFILE GRANTS - PRODUCTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON products_profile_merchandise TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products_profile_ticket TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products_profile_service TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products_profile_subscription TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products_profile_rental TO authenticated;

-- ============================================================================
-- LEGEND PROFILE GRANTS - EVENTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON events_profile_conference TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON events_profile_festival TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON events_profile_workshop TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON events_profile_webinar TO authenticated;

-- ============================================================================
-- LEGEND PROFILE GRANTS - DOCUMENTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON docs_profile_contract TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON docs_profile_invoice TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON docs_profile_report TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON docs_profile_template TO authenticated;

-- ============================================================================
-- SAGA SCHEMA GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON saga_instances TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_profile_approval TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_profile_request TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_profile_submission TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_profile_process TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_profile_automation TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_profile_change TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_steps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_transitions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_attachments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saga_templates TO authenticated;

-- ============================================================================
-- CHRONICLE SCHEMA GRANTS
-- ============================================================================

-- Chronicle entries are append-only (no UPDATE/DELETE)
GRANT SELECT, INSERT ON chronicle_entries TO authenticated;
GRANT SELECT, INSERT ON chronicle_profile_transaction TO authenticated;
GRANT SELECT, INSERT ON chronicle_profile_timesheet TO authenticated;
GRANT SELECT, INSERT ON chronicle_profile_movement TO authenticated;
GRANT SELECT, INSERT ON chronicle_profile_audit TO authenticated;
GRANT SELECT, INSERT ON chronicle_profile_automation TO authenticated;
GRANT SELECT, INSERT ON chronicle_profile_communication TO authenticated;
GRANT SELECT ON chronicle_daily_aggregates TO authenticated;

-- ============================================================================
-- FUNCTION GRANTS
-- ============================================================================

GRANT EXECUTE ON FUNCTION current_platform_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION current_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION current_app_role() TO authenticated;
GRANT EXECUTE ON FUNCTION org_matches(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION role_in(TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION has_org_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_chronicle_entry(UUID, chronicle_type, TEXT, UUID, TEXT, TEXT, chronicle_action_category, TEXT, UUID, TEXT, TEXT, UUID, TEXT, JSONB, JSONB, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_entity_activity_feed(TEXT, UUID, INTEGER, INTEGER) TO authenticated;
