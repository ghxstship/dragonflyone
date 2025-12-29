-- ============================================================================
-- 0010_seed_data.sql
-- Initial Seed Data for Development and Testing
-- GHXSTSHIP Platform - 3NF Normalized Structure
-- ============================================================================

-- ============================================================================
-- DEFAULT ORGANIZATION
-- ============================================================================

INSERT INTO organizations (id, slug, name, legal_name, description, timezone, currency)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ghxstship',
  'GHXSTSHIP',
  'GHXSTSHIP LLC',
  'Default organization for GHXSTSHIP platform',
  'America/New_York',
  'USD'
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- DEFAULT LEGEND CATEGORIES
-- ============================================================================

-- People Categories
INSERT INTO legend_categories (organization_id, name, code, entity_type, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Employee', 'employee', 'person', 1),
  ('00000000-0000-0000-0000-000000000001', 'Crew', 'crew', 'person', 2),
  ('00000000-0000-0000-0000-000000000001', 'Artist', 'artist', 'person', 3),
  ('00000000-0000-0000-0000-000000000001', 'Volunteer', 'volunteer', 'person', 4),
  ('00000000-0000-0000-0000-000000000001', 'Contact', 'contact', 'person', 5),
  ('00000000-0000-0000-0000-000000000001', 'Candidate', 'candidate', 'person', 6),
  ('00000000-0000-0000-0000-000000000001', 'Mentor', 'mentor', 'person', 7),
  ('00000000-0000-0000-0000-000000000001', 'Influencer', 'influencer', 'person', 8),
  ('00000000-0000-0000-0000-000000000001', 'Speaker', 'speaker', 'person', 9),
  ('00000000-0000-0000-0000-000000000001', 'Attendee', 'attendee', 'person', 10)
ON CONFLICT (organization_id, entity_type, code) DO NOTHING;

-- Place Categories
INSERT INTO legend_categories (organization_id, name, code, entity_type, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Venue', 'venue', 'place', 1),
  ('00000000-0000-0000-0000-000000000001', 'Warehouse', 'warehouse', 'place', 2),
  ('00000000-0000-0000-0000-000000000001', 'Stage', 'stage', 'place', 3),
  ('00000000-0000-0000-0000-000000000001', 'Zone', 'zone', 'place', 4),
  ('00000000-0000-0000-0000-000000000001', 'Room', 'room', 'place', 5),
  ('00000000-0000-0000-0000-000000000001', 'Space', 'space', 'place', 6),
  ('00000000-0000-0000-0000-000000000001', 'Office', 'office', 'place', 7)
ON CONFLICT (organization_id, entity_type, code) DO NOTHING;

-- Organization Categories
INSERT INTO legend_categories (organization_id, name, code, entity_type, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Vendor', 'vendor', 'organization', 1),
  ('00000000-0000-0000-0000-000000000001', 'Sponsor', 'sponsor', 'organization', 2),
  ('00000000-0000-0000-0000-000000000001', 'Partner', 'partner', 'organization', 3),
  ('00000000-0000-0000-0000-000000000001', 'Agency', 'agency', 'organization', 4),
  ('00000000-0000-0000-0000-000000000001', 'Client', 'client', 'organization', 5)
ON CONFLICT (organization_id, entity_type, code) DO NOTHING;

-- Product Categories
INSERT INTO legend_categories (organization_id, name, code, entity_type, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Asset', 'asset', 'product', 1),
  ('00000000-0000-0000-0000-000000000001', 'Equipment', 'equipment', 'product', 2),
  ('00000000-0000-0000-0000-000000000001', 'Inventory', 'inventory', 'product', 3),
  ('00000000-0000-0000-0000-000000000001', 'Merchandise', 'merchandise', 'product', 4),
  ('00000000-0000-0000-0000-000000000001', 'Rental', 'rental', 'product', 5),
  ('00000000-0000-0000-0000-000000000001', 'Service', 'service', 'product', 6),
  ('00000000-0000-0000-0000-000000000001', 'Ticket', 'ticket', 'product', 7)
ON CONFLICT (organization_id, entity_type, code) DO NOTHING;

-- Event Categories
INSERT INTO legend_categories (organization_id, name, code, entity_type, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Event', 'event', 'event', 1),
  ('00000000-0000-0000-0000-000000000001', 'Production', 'production', 'event', 2),
  ('00000000-0000-0000-0000-000000000001', 'Show', 'show', 'event', 3),
  ('00000000-0000-0000-0000-000000000001', 'Conference', 'conference', 'event', 4),
  ('00000000-0000-0000-0000-000000000001', 'Festival', 'festival', 'event', 5),
  ('00000000-0000-0000-0000-000000000001', 'Workshop', 'workshop', 'event', 6),
  ('00000000-0000-0000-0000-000000000001', 'Webinar', 'webinar', 'event', 7),
  ('00000000-0000-0000-0000-000000000001', 'Meeting', 'meeting', 'event', 8)
ON CONFLICT (organization_id, entity_type, code) DO NOTHING;

-- Document Categories
INSERT INTO legend_categories (organization_id, name, code, entity_type, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Contract', 'contract', 'document', 1),
  ('00000000-0000-0000-0000-000000000001', 'Invoice', 'invoice', 'document', 2),
  ('00000000-0000-0000-0000-000000000001', 'Proposal', 'proposal', 'document', 3),
  ('00000000-0000-0000-0000-000000000001', 'Report', 'report', 'document', 4),
  ('00000000-0000-0000-0000-000000000001', 'Template', 'template', 'document', 5),
  ('00000000-0000-0000-0000-000000000001', 'Permit', 'permit', 'document', 6),
  ('00000000-0000-0000-0000-000000000001', 'Insurance', 'insurance', 'document', 7)
ON CONFLICT (organization_id, entity_type, code) DO NOTHING;

-- ============================================================================
-- DEFAULT LEGEND TAGS
-- ============================================================================

INSERT INTO legend_tags (organization_id, name, slug, color, applicable_entity_types) VALUES
  ('00000000-0000-0000-0000-000000000001', 'VIP', 'vip', '#FFD700', ARRAY['person', 'organization']::legend_entity_type[]),
  ('00000000-0000-0000-0000-000000000001', 'Priority', 'priority', '#FF4444', ARRAY[]::legend_entity_type[]),
  ('00000000-0000-0000-0000-000000000001', 'Featured', 'featured', '#4CAF50', ARRAY['event', 'product']::legend_entity_type[]),
  ('00000000-0000-0000-0000-000000000001', 'New', 'new', '#2196F3', ARRAY[]::legend_entity_type[]),
  ('00000000-0000-0000-0000-000000000001', 'Archived', 'archived', '#9E9E9E', ARRAY[]::legend_entity_type[]),
  ('00000000-0000-0000-0000-000000000001', 'Pending Review', 'pending-review', '#FF9800', ARRAY[]::legend_entity_type[]),
  ('00000000-0000-0000-0000-000000000001', 'Approved', 'approved', '#4CAF50', ARRAY[]::legend_entity_type[]),
  ('00000000-0000-0000-0000-000000000001', 'Rejected', 'rejected', '#F44336', ARRAY[]::legend_entity_type[])
ON CONFLICT (organization_id, slug) DO NOTHING;

-- ============================================================================
-- DEFAULT DEPARTMENTS
-- ============================================================================

INSERT INTO legend_departments (organization_id, name, code, description, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Executive', 'EXEC', 'Executive leadership', 1),
  ('00000000-0000-0000-0000-000000000001', 'Operations', 'OPS', 'Operations and logistics', 2),
  ('00000000-0000-0000-0000-000000000001', 'Production', 'PROD', 'Event production', 3),
  ('00000000-0000-0000-0000-000000000001', 'Finance', 'FIN', 'Finance and accounting', 4),
  ('00000000-0000-0000-0000-000000000001', 'Human Resources', 'HR', 'Human resources and talent', 5),
  ('00000000-0000-0000-0000-000000000001', 'Marketing', 'MKT', 'Marketing and communications', 6),
  ('00000000-0000-0000-0000-000000000001', 'Sales', 'SALES', 'Sales and business development', 7),
  ('00000000-0000-0000-0000-000000000001', 'Technology', 'TECH', 'Technology and engineering', 8),
  ('00000000-0000-0000-0000-000000000001', 'Creative', 'CREATIVE', 'Creative and design', 9),
  ('00000000-0000-0000-0000-000000000001', 'Customer Success', 'CS', 'Customer success and support', 10)
ON CONFLICT (organization_id, code) DO NOTHING;

-- ============================================================================
-- DEFAULT POSITIONS
-- ============================================================================

INSERT INTO legend_positions (organization_id, title, code, level, job_family) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Chief Executive Officer', 'CEO', 'executive', 'Executive'),
  ('00000000-0000-0000-0000-000000000001', 'Chief Operating Officer', 'COO', 'executive', 'Executive'),
  ('00000000-0000-0000-0000-000000000001', 'Chief Financial Officer', 'CFO', 'executive', 'Executive'),
  ('00000000-0000-0000-0000-000000000001', 'Chief Technology Officer', 'CTO', 'executive', 'Executive'),
  ('00000000-0000-0000-0000-000000000001', 'Director', 'DIR', 'director', 'Management'),
  ('00000000-0000-0000-0000-000000000001', 'Manager', 'MGR', 'manager', 'Management'),
  ('00000000-0000-0000-0000-000000000001', 'Team Lead', 'LEAD', 'lead', 'Management'),
  ('00000000-0000-0000-0000-000000000001', 'Senior Specialist', 'SR', 'senior', 'Individual Contributor'),
  ('00000000-0000-0000-0000-000000000001', 'Specialist', 'SPEC', 'mid', 'Individual Contributor'),
  ('00000000-0000-0000-0000-000000000001', 'Associate', 'ASSOC', 'entry', 'Individual Contributor'),
  ('00000000-0000-0000-0000-000000000001', 'Intern', 'INTERN', 'entry', 'Individual Contributor'),
  ('00000000-0000-0000-0000-000000000001', 'Production Manager', 'PM', 'manager', 'Production'),
  ('00000000-0000-0000-0000-000000000001', 'Stage Manager', 'SM', 'lead', 'Production'),
  ('00000000-0000-0000-0000-000000000001', 'Technical Director', 'TD', 'director', 'Production'),
  ('00000000-0000-0000-0000-000000000001', 'Audio Engineer', 'AE', 'mid', 'Technical'),
  ('00000000-0000-0000-0000-000000000001', 'Lighting Designer', 'LD', 'mid', 'Technical'),
  ('00000000-0000-0000-0000-000000000001', 'Video Engineer', 'VE', 'mid', 'Technical'),
  ('00000000-0000-0000-0000-000000000001', 'Stagehand', 'SH', 'entry', 'Technical')
ON CONFLICT (organization_id, code) DO NOTHING;

-- ============================================================================
-- DEFAULT SAGA TEMPLATES
-- ============================================================================

INSERT INTO saga_templates (organization_id, name, description, saga_type, saga_subtype, default_priority, default_sla_hours, step_definitions) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Expense Approval', 'Standard expense approval workflow', 'approval', 'expense', 'normal', 48, 
   '[{"step": 1, "name": "Submit Expense", "type": "action"}, {"step": 2, "name": "Manager Review", "type": "approval"}, {"step": 3, "name": "Finance Review", "type": "approval"}, {"step": 4, "name": "Process Payment", "type": "action"}]'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'Leave Request', 'Employee leave request workflow', 'request', 'leave', 'normal', 72,
   '[{"step": 1, "name": "Submit Request", "type": "action"}, {"step": 2, "name": "Manager Approval", "type": "approval"}, {"step": 3, "name": "HR Review", "type": "approval"}]'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'Vendor Onboarding', 'New vendor onboarding process', 'process', 'vendor_onboarding', 'normal', 168,
   '[{"step": 1, "name": "Collect Information", "type": "action"}, {"step": 2, "name": "Verify Documents", "type": "action"}, {"step": 3, "name": "Credit Check", "type": "action"}, {"step": 4, "name": "Approval", "type": "approval"}, {"step": 5, "name": "System Setup", "type": "action"}]'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'Event Proposal', 'Event proposal submission and review', 'submission', 'event_proposal', 'normal', 120,
   '[{"step": 1, "name": "Submit Proposal", "type": "action"}, {"step": 2, "name": "Initial Review", "type": "approval"}, {"step": 3, "name": "Budget Review", "type": "approval"}, {"step": 4, "name": "Final Approval", "type": "approval"}]'::jsonb),
  ('00000000-0000-0000-0000-000000000001', 'Change Order', 'Production change order workflow', 'change', 'production_change', 'high', 24,
   '[{"step": 1, "name": "Submit Change", "type": "action"}, {"step": 2, "name": "Impact Assessment", "type": "action"}, {"step": 3, "name": "Approval", "type": "approval"}, {"step": 4, "name": "Implementation", "type": "action"}]'::jsonb)
ON CONFLICT (organization_id, name, version) DO NOTHING;

-- ============================================================================
-- SCHEMA VERSION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_version (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  description TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO schema_version (version, description) VALUES
  ('3.0.0', '3NF Normalized Schema - Legend, Saga, Chronicle architecture')
ON CONFLICT DO NOTHING;
