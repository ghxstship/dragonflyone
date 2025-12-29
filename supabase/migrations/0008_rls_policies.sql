-- ============================================================================
-- 0008_rls_policies.sql
-- Row Level Security Policies for All Tables
-- GHXSTSHIP Platform - 3NF Normalized Structure
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

-- Core Foundation
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Legend Schema
ALTER TABLE legend_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_relationships ENABLE ROW LEVEL SECURITY;

-- Legend Profiles - People
ALTER TABLE people_profile_employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_artist ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_volunteer ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_candidate ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_mentor ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_influencer ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_speaker ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_attendee ENABLE ROW LEVEL SECURITY;

-- Legend Profiles - Places
ALTER TABLE places_profile_venue ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_profile_warehouse ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_profile_zone ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_profile_space ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_profile_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_profile_parking ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_profile_office ENABLE ROW LEVEL SECURITY;

-- Legend Profiles - Organizations
ALTER TABLE orgs_profile_vendor ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgs_profile_sponsor ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgs_profile_partner ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgs_profile_agency ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgs_profile_client ENABLE ROW LEVEL SECURITY;

-- Legend Profiles - Products
ALTER TABLE products_profile_merchandise ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_profile_ticket ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_profile_service ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_profile_subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_profile_rental ENABLE ROW LEVEL SECURITY;

-- Legend Profiles - Events
ALTER TABLE events_profile_conference ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_profile_festival ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_profile_workshop ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_profile_webinar ENABLE ROW LEVEL SECURITY;

-- Legend Profiles - Documents
ALTER TABLE docs_profile_contract ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_profile_invoice ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_profile_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_profile_template ENABLE ROW LEVEL SECURITY;

-- Saga Schema
ALTER TABLE saga_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_profile_approval ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_profile_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_profile_submission ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_profile_process ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_profile_automation ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_profile_change ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_templates ENABLE ROW LEVEL SECURITY;

-- Chronicle Schema
ALTER TABLE chronicle_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_profile_transaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_profile_timesheet ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_profile_movement ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_profile_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_profile_automation ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_profile_communication ENABLE ROW LEVEL SECURITY;
ALTER TABLE chronicle_daily_aggregates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CORE FOUNDATION POLICIES
-- ============================================================================

-- Organizations
CREATE POLICY "organizations_select" ON organizations
  FOR SELECT USING (
    current_app_role() LIKE 'LEGEND_%' 
    OR id = current_organization_id()
    OR id IN (SELECT organization_id FROM user_organizations WHERE user_id = current_platform_user_id())
  );

CREATE POLICY "organizations_insert" ON organizations
  FOR INSERT WITH CHECK (current_app_role() IN ('LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN'));

CREATE POLICY "organizations_update" ON organizations
  FOR UPDATE USING (
    current_app_role() IN ('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN')
    AND (id = current_organization_id() OR current_app_role() LIKE 'LEGEND_%')
  );

CREATE POLICY "organizations_delete" ON organizations
  FOR DELETE USING (current_app_role() IN ('LEGEND_SUPER_ADMIN'));

-- Platform Users
CREATE POLICY "platform_users_select" ON platform_users
  FOR SELECT USING (
    auth.uid() = auth_user_id
    OR org_matches(organization_id)
  );

CREATE POLICY "platform_users_insert" ON platform_users
  FOR INSERT WITH CHECK (
    auth.uid() = auth_user_id
    OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "platform_users_update" ON platform_users
  FOR UPDATE USING (
    auth.uid() = auth_user_id
    OR (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  );

-- User Organizations
CREATE POLICY "user_organizations_select" ON user_organizations
  FOR SELECT USING (
    user_id = current_platform_user_id()
    OR has_org_access(organization_id)
  );

CREATE POLICY "user_organizations_insert" ON user_organizations
  FOR INSERT WITH CHECK (
    has_org_access(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "user_organizations_update" ON user_organizations
  FOR UPDATE USING (
    has_org_access(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "user_organizations_delete" ON user_organizations
  FOR DELETE USING (
    has_org_access(organization_id)
    AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- User Roles
CREATE POLICY "user_roles_select" ON user_roles
  FOR SELECT USING (
    org_matches(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY "user_roles_manage" ON user_roles
  FOR ALL USING (
    org_matches(organization_id)
    AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- ============================================================================
-- LEGEND SCHEMA POLICIES
-- ============================================================================

-- Legend People
CREATE POLICY "legend_people_select" ON legend_people
  FOR SELECT USING (has_org_access(organization_id));

CREATE POLICY "legend_people_insert" ON legend_people
  FOR INSERT WITH CHECK (has_org_access(organization_id));

CREATE POLICY "legend_people_update" ON legend_people
  FOR UPDATE USING (has_org_access(organization_id));

CREATE POLICY "legend_people_delete" ON legend_people
  FOR DELETE USING (
    has_org_access(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Legend Places
CREATE POLICY "legend_places_select" ON legend_places
  FOR SELECT USING (has_org_access(organization_id));

CREATE POLICY "legend_places_insert" ON legend_places
  FOR INSERT WITH CHECK (has_org_access(organization_id));

CREATE POLICY "legend_places_update" ON legend_places
  FOR UPDATE USING (has_org_access(organization_id));

CREATE POLICY "legend_places_delete" ON legend_places
  FOR DELETE USING (
    has_org_access(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Legend Organizations
CREATE POLICY "legend_organizations_select" ON legend_organizations
  FOR SELECT USING (has_org_access(organization_id));

CREATE POLICY "legend_organizations_insert" ON legend_organizations
  FOR INSERT WITH CHECK (has_org_access(organization_id));

CREATE POLICY "legend_organizations_update" ON legend_organizations
  FOR UPDATE USING (has_org_access(organization_id));

CREATE POLICY "legend_organizations_delete" ON legend_organizations
  FOR DELETE USING (
    has_org_access(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Legend Products
CREATE POLICY "legend_products_select" ON legend_products
  FOR SELECT USING (has_org_access(organization_id));

CREATE POLICY "legend_products_insert" ON legend_products
  FOR INSERT WITH CHECK (has_org_access(organization_id));

CREATE POLICY "legend_products_update" ON legend_products
  FOR UPDATE USING (has_org_access(organization_id));

CREATE POLICY "legend_products_delete" ON legend_products
  FOR DELETE USING (
    has_org_access(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Legend Events
CREATE POLICY "legend_events_select" ON legend_events
  FOR SELECT USING (has_org_access(organization_id));

CREATE POLICY "legend_events_insert" ON legend_events
  FOR INSERT WITH CHECK (has_org_access(organization_id));

CREATE POLICY "legend_events_update" ON legend_events
  FOR UPDATE USING (has_org_access(organization_id));

CREATE POLICY "legend_events_delete" ON legend_events
  FOR DELETE USING (
    has_org_access(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Legend Documents
CREATE POLICY "legend_documents_select" ON legend_documents
  FOR SELECT USING (has_org_access(organization_id));

CREATE POLICY "legend_documents_insert" ON legend_documents
  FOR INSERT WITH CHECK (has_org_access(organization_id));

CREATE POLICY "legend_documents_update" ON legend_documents
  FOR UPDATE USING (has_org_access(organization_id));

CREATE POLICY "legend_documents_delete" ON legend_documents
  FOR DELETE USING (
    has_org_access(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Addresses
CREATE POLICY "addresses_select" ON addresses
  FOR SELECT USING (organization_id IS NULL OR has_org_access(organization_id));

CREATE POLICY "addresses_insert" ON addresses
  FOR INSERT WITH CHECK (organization_id IS NULL OR has_org_access(organization_id));

CREATE POLICY "addresses_update" ON addresses
  FOR UPDATE USING (organization_id IS NULL OR has_org_access(organization_id));

CREATE POLICY "addresses_delete" ON addresses
  FOR DELETE USING (
    (organization_id IS NULL OR has_org_access(organization_id))
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Legend Reference Tables (departments, teams, positions, cost_centers, categories, tags)
CREATE POLICY "legend_departments_access" ON legend_departments
  FOR ALL USING (has_org_access(organization_id));

CREATE POLICY "legend_teams_access" ON legend_teams
  FOR ALL USING (has_org_access(organization_id));

CREATE POLICY "legend_positions_access" ON legend_positions
  FOR ALL USING (has_org_access(organization_id));

CREATE POLICY "legend_cost_centers_access" ON legend_cost_centers
  FOR ALL USING (has_org_access(organization_id));

CREATE POLICY "legend_categories_access" ON legend_categories
  FOR ALL USING (has_org_access(organization_id));

CREATE POLICY "legend_tags_access" ON legend_tags
  FOR ALL USING (has_org_access(organization_id));

CREATE POLICY "legend_relationships_access" ON legend_relationships
  FOR ALL USING (has_org_access(organization_id));

-- ============================================================================
-- LEGEND PROFILE POLICIES (inherit from parent entity)
-- ============================================================================

-- People Profiles
CREATE POLICY "people_profile_employee_access" ON people_profile_employee
  FOR ALL USING (
    person_id IN (SELECT id FROM legend_people WHERE has_org_access(organization_id))
  );

CREATE POLICY "people_profile_crew_access" ON people_profile_crew
  FOR ALL USING (
    person_id IN (SELECT id FROM legend_people WHERE has_org_access(organization_id))
  );

CREATE POLICY "people_profile_artist_access" ON people_profile_artist
  FOR ALL USING (
    person_id IN (SELECT id FROM legend_people WHERE has_org_access(organization_id))
  );

CREATE POLICY "people_profile_volunteer_access" ON people_profile_volunteer
  FOR ALL USING (
    person_id IN (SELECT id FROM legend_people WHERE has_org_access(organization_id))
  );

CREATE POLICY "people_profile_contact_access" ON people_profile_contact
  FOR ALL USING (
    person_id IN (SELECT id FROM legend_people WHERE has_org_access(organization_id))
  );

CREATE POLICY "people_profile_candidate_access" ON people_profile_candidate
  FOR ALL USING (
    person_id IN (SELECT id FROM legend_people WHERE has_org_access(organization_id))
  );

CREATE POLICY "people_profile_mentor_access" ON people_profile_mentor
  FOR ALL USING (
    person_id IN (SELECT id FROM legend_people WHERE has_org_access(organization_id))
  );

CREATE POLICY "people_profile_influencer_access" ON people_profile_influencer
  FOR ALL USING (
    person_id IN (SELECT id FROM legend_people WHERE has_org_access(organization_id))
  );

CREATE POLICY "people_profile_speaker_access" ON people_profile_speaker
  FOR ALL USING (
    person_id IN (SELECT id FROM legend_people WHERE has_org_access(organization_id))
  );

CREATE POLICY "people_profile_attendee_access" ON people_profile_attendee
  FOR ALL USING (
    person_id IN (SELECT id FROM legend_people WHERE has_org_access(organization_id))
  );

-- Places Profiles
CREATE POLICY "places_profile_venue_access" ON places_profile_venue
  FOR ALL USING (
    place_id IN (SELECT id FROM legend_places WHERE has_org_access(organization_id))
  );

CREATE POLICY "places_profile_warehouse_access" ON places_profile_warehouse
  FOR ALL USING (
    place_id IN (SELECT id FROM legend_places WHERE has_org_access(organization_id))
  );

CREATE POLICY "places_profile_zone_access" ON places_profile_zone
  FOR ALL USING (
    place_id IN (SELECT id FROM legend_places WHERE has_org_access(organization_id))
  );

CREATE POLICY "places_profile_space_access" ON places_profile_space
  FOR ALL USING (
    place_id IN (SELECT id FROM legend_places WHERE has_org_access(organization_id))
  );

CREATE POLICY "places_profile_staging_access" ON places_profile_staging
  FOR ALL USING (
    place_id IN (SELECT id FROM legend_places WHERE has_org_access(organization_id))
  );

CREATE POLICY "places_profile_parking_access" ON places_profile_parking
  FOR ALL USING (
    place_id IN (SELECT id FROM legend_places WHERE has_org_access(organization_id))
  );

CREATE POLICY "places_profile_office_access" ON places_profile_office
  FOR ALL USING (
    place_id IN (SELECT id FROM legend_places WHERE has_org_access(organization_id))
  );

-- Organizations Profiles
CREATE POLICY "orgs_profile_vendor_access" ON orgs_profile_vendor
  FOR ALL USING (
    org_id IN (SELECT id FROM legend_organizations WHERE has_org_access(organization_id))
  );

CREATE POLICY "orgs_profile_sponsor_access" ON orgs_profile_sponsor
  FOR ALL USING (
    org_id IN (SELECT id FROM legend_organizations WHERE has_org_access(organization_id))
  );

CREATE POLICY "orgs_profile_partner_access" ON orgs_profile_partner
  FOR ALL USING (
    org_id IN (SELECT id FROM legend_organizations WHERE has_org_access(organization_id))
  );

CREATE POLICY "orgs_profile_agency_access" ON orgs_profile_agency
  FOR ALL USING (
    org_id IN (SELECT id FROM legend_organizations WHERE has_org_access(organization_id))
  );

CREATE POLICY "orgs_profile_client_access" ON orgs_profile_client
  FOR ALL USING (
    org_id IN (SELECT id FROM legend_organizations WHERE has_org_access(organization_id))
  );

-- Products Profiles
CREATE POLICY "products_profile_merchandise_access" ON products_profile_merchandise
  FOR ALL USING (
    product_id IN (SELECT id FROM legend_products WHERE has_org_access(organization_id))
  );

CREATE POLICY "products_profile_ticket_access" ON products_profile_ticket
  FOR ALL USING (
    product_id IN (SELECT id FROM legend_products WHERE has_org_access(organization_id))
  );

CREATE POLICY "products_profile_service_access" ON products_profile_service
  FOR ALL USING (
    product_id IN (SELECT id FROM legend_products WHERE has_org_access(organization_id))
  );

CREATE POLICY "products_profile_subscription_access" ON products_profile_subscription
  FOR ALL USING (
    product_id IN (SELECT id FROM legend_products WHERE has_org_access(organization_id))
  );

CREATE POLICY "products_profile_rental_access" ON products_profile_rental
  FOR ALL USING (
    product_id IN (SELECT id FROM legend_products WHERE has_org_access(organization_id))
  );

-- Events Profiles
CREATE POLICY "events_profile_conference_access" ON events_profile_conference
  FOR ALL USING (
    event_id IN (SELECT id FROM legend_events WHERE has_org_access(organization_id))
  );

CREATE POLICY "events_profile_festival_access" ON events_profile_festival
  FOR ALL USING (
    event_id IN (SELECT id FROM legend_events WHERE has_org_access(organization_id))
  );

CREATE POLICY "events_profile_workshop_access" ON events_profile_workshop
  FOR ALL USING (
    event_id IN (SELECT id FROM legend_events WHERE has_org_access(organization_id))
  );

CREATE POLICY "events_profile_webinar_access" ON events_profile_webinar
  FOR ALL USING (
    event_id IN (SELECT id FROM legend_events WHERE has_org_access(organization_id))
  );

-- Documents Profiles
CREATE POLICY "docs_profile_contract_access" ON docs_profile_contract
  FOR ALL USING (
    document_id IN (SELECT id FROM legend_documents WHERE has_org_access(organization_id))
  );

CREATE POLICY "docs_profile_invoice_access" ON docs_profile_invoice
  FOR ALL USING (
    document_id IN (SELECT id FROM legend_documents WHERE has_org_access(organization_id))
  );

CREATE POLICY "docs_profile_report_access" ON docs_profile_report
  FOR ALL USING (
    document_id IN (SELECT id FROM legend_documents WHERE has_org_access(organization_id))
  );

CREATE POLICY "docs_profile_template_access" ON docs_profile_template
  FOR ALL USING (
    document_id IN (SELECT id FROM legend_documents WHERE has_org_access(organization_id))
  );

-- ============================================================================
-- SAGA SCHEMA POLICIES
-- ============================================================================

CREATE POLICY "saga_instances_select" ON saga_instances
  FOR SELECT USING (has_org_access(organization_id));

CREATE POLICY "saga_instances_insert" ON saga_instances
  FOR INSERT WITH CHECK (has_org_access(organization_id));

CREATE POLICY "saga_instances_update" ON saga_instances
  FOR UPDATE USING (has_org_access(organization_id));

CREATE POLICY "saga_instances_delete" ON saga_instances
  FOR DELETE USING (
    has_org_access(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Saga Profile Tables
CREATE POLICY "saga_profile_approval_access" ON saga_profile_approval
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE has_org_access(organization_id))
  );

CREATE POLICY "saga_profile_request_access" ON saga_profile_request
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE has_org_access(organization_id))
  );

CREATE POLICY "saga_profile_submission_access" ON saga_profile_submission
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE has_org_access(organization_id))
  );

CREATE POLICY "saga_profile_process_access" ON saga_profile_process
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE has_org_access(organization_id))
  );

CREATE POLICY "saga_profile_automation_access" ON saga_profile_automation
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE has_org_access(organization_id))
  );

CREATE POLICY "saga_profile_change_access" ON saga_profile_change
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE has_org_access(organization_id))
  );

-- Saga Supporting Tables
CREATE POLICY "saga_steps_access" ON saga_steps
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE has_org_access(organization_id))
  );

CREATE POLICY "saga_transitions_access" ON saga_transitions
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE has_org_access(organization_id))
  );

CREATE POLICY "saga_participants_access" ON saga_participants
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE has_org_access(organization_id))
  );

CREATE POLICY "saga_comments_access" ON saga_comments
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE has_org_access(organization_id))
  );

CREATE POLICY "saga_attachments_access" ON saga_attachments
  FOR ALL USING (
    saga_id IN (SELECT id FROM saga_instances WHERE has_org_access(organization_id))
  );

CREATE POLICY "saga_templates_select" ON saga_templates
  FOR SELECT USING (has_org_access(organization_id));

CREATE POLICY "saga_templates_manage" ON saga_templates
  FOR ALL USING (
    has_org_access(organization_id)
    AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- ============================================================================
-- CHRONICLE SCHEMA POLICIES
-- ============================================================================

CREATE POLICY "chronicle_entries_select" ON chronicle_entries
  FOR SELECT USING (has_org_access(organization_id));

CREATE POLICY "chronicle_entries_insert" ON chronicle_entries
  FOR INSERT WITH CHECK (has_org_access(organization_id));

-- Chronicle Profile Tables
CREATE POLICY "chronicle_profile_transaction_access" ON chronicle_profile_transaction
  FOR ALL USING (
    chronicle_id IN (SELECT id FROM chronicle_entries WHERE has_org_access(organization_id))
  );

CREATE POLICY "chronicle_profile_timesheet_access" ON chronicle_profile_timesheet
  FOR ALL USING (
    chronicle_id IN (SELECT id FROM chronicle_entries WHERE has_org_access(organization_id))
  );

CREATE POLICY "chronicle_profile_movement_access" ON chronicle_profile_movement
  FOR ALL USING (
    chronicle_id IN (SELECT id FROM chronicle_entries WHERE has_org_access(organization_id))
  );

CREATE POLICY "chronicle_profile_audit_access" ON chronicle_profile_audit
  FOR ALL USING (
    chronicle_id IN (SELECT id FROM chronicle_entries WHERE has_org_access(organization_id))
  );

CREATE POLICY "chronicle_profile_automation_access" ON chronicle_profile_automation
  FOR ALL USING (
    chronicle_id IN (SELECT id FROM chronicle_entries WHERE has_org_access(organization_id))
  );

CREATE POLICY "chronicle_profile_communication_access" ON chronicle_profile_communication
  FOR ALL USING (
    chronicle_id IN (SELECT id FROM chronicle_entries WHERE has_org_access(organization_id))
  );

CREATE POLICY "chronicle_daily_aggregates_select" ON chronicle_daily_aggregates
  FOR SELECT USING (has_org_access(organization_id));
