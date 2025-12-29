-- Migration: 0235_add_foreign_keys.sql
-- Purpose: Add foreign key constraints for table relationships
-- Date: December 15, 2025

-- UGC Posts -> Events
ALTER TABLE ugc_posts ADD CONSTRAINT fk_ugc_posts_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;

-- UGC Campaigns -> Events
ALTER TABLE ugc_campaigns ADD CONSTRAINT fk_ugc_campaigns_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;

-- Cookie Consent -> Platform Users
ALTER TABLE cookie_consent ADD CONSTRAINT fk_cookie_consent_user FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE SET NULL;

-- Crew Assignments -> Crew Members
ALTER TABLE crew_assignments ADD CONSTRAINT fk_crew_assignments_member FOREIGN KEY (crew_member_id) REFERENCES crew(id) ON DELETE CASCADE;

-- Crew Assignments -> Projects
ALTER TABLE crew_assignments ADD CONSTRAINT fk_crew_assignments_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Event Performers -> Events
ALTER TABLE event_performers ADD CONSTRAINT fk_event_performers_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Event Performers -> Artists
ALTER TABLE event_performers ADD CONSTRAINT fk_event_performers_artist FOREIGN KEY (artist_id) REFERENCES artists(id) ON DELETE SET NULL;

-- Tickets -> Events
ALTER TABLE tickets ADD CONSTRAINT fk_tickets_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Tickets -> Users
ALTER TABLE tickets ADD CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE SET NULL;

-- Orders -> Users
ALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE SET NULL;

-- Orders -> Events
ALTER TABLE orders ADD CONSTRAINT fk_orders_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;

-- Notifications -> Users
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES platform_users(id) ON DELETE CASCADE;

-- Documents -> Organizations
ALTER TABLE documents ADD CONSTRAINT fk_documents_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Projects -> Organizations
ALTER TABLE projects ADD CONSTRAINT fk_projects_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Venues -> Organizations
ALTER TABLE venues ADD CONSTRAINT fk_venues_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Events -> Venues
ALTER TABLE events ADD CONSTRAINT fk_events_venue FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL;

-- Events -> Organizations
ALTER TABLE events ADD CONSTRAINT fk_events_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
