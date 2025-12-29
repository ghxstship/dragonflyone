-- ============================================================================
-- LEGEND MASTER DATA SCHEMA
-- Normalized entity system for organization-level master data
-- Created: December 27, 2024
-- ============================================================================

-- ============================================================================
-- PART 1: LEGEND BASE ENTITY TABLES
-- ============================================================================

-- Legend Entity Types enum
CREATE TYPE legend_entity_type AS ENUM (
  'person',
  'place',
  'organization',
  'product',
  'event',
  'document'
);

-- Legend Status enum
CREATE TYPE legend_status AS ENUM (
  'active',
  'inactive',
  'archived',
  'pending',
  'draft'
);

-- ============================================================================
-- LEGEND_PEOPLE - Single source of truth for all humans
-- Replaces: contacts, employees, crew_members, artists, vendors (reps), 
--           volunteers, freelancers, ambassadors, candidates, stakeholders,
--           staff, speakers, guests, talent
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity fields
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  preferred_name TEXT,
  
  -- Contact information
  email TEXT,
  phone TEXT,
  mobile TEXT,
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  
  -- Profile
  avatar_url TEXT,
  bio TEXT,
  title TEXT,
  
  -- Status and classification
  status legend_status DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  
  -- Linked platform user (if they have login access)
  platform_user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES platform_users(id),
  updated_by UUID REFERENCES platform_users(id)
);

CREATE INDEX idx_legend_people_org ON legend_people(organization_id);
CREATE INDEX idx_legend_people_email ON legend_people(email);
CREATE INDEX idx_legend_people_status ON legend_people(status);
CREATE INDEX idx_legend_people_tags ON legend_people USING GIN(tags);
CREATE INDEX idx_legend_people_platform_user ON legend_people(platform_user_id);

-- ============================================================================
-- LEGEND_PLACES - Single source of truth for all locations
-- Replaces: venues, warehouses, stages, zones, rooms, spaces, sites
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  
  -- Location type
  place_type TEXT NOT NULL CHECK (place_type IN (
    'venue', 'warehouse', 'stage', 'zone', 'room', 'space', 'site', 'office', 'other'
  )),
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  
  -- Geolocation
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone TEXT DEFAULT 'America/New_York',
  
  -- Capacity and dimensions
  capacity INTEGER,
  square_footage DECIMAL(12, 2),
  
  -- Parent place (for hierarchical locations)
  parent_place_id UUID REFERENCES legend_places(id) ON DELETE SET NULL,
  
  -- Status and classification
  status legend_status DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  
  -- Media
  image_url TEXT,
  floor_plan_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES platform_users(id),
  updated_by UUID REFERENCES platform_users(id)
);

CREATE INDEX idx_legend_places_org ON legend_places(organization_id);
CREATE INDEX idx_legend_places_type ON legend_places(place_type);
CREATE INDEX idx_legend_places_status ON legend_places(status);
CREATE INDEX idx_legend_places_parent ON legend_places(parent_place_id);
CREATE INDEX idx_legend_places_tags ON legend_places USING GIN(tags);

-- ============================================================================
-- LEGEND_ORGANIZATIONS - Single source of truth for all companies/orgs
-- Replaces: vendors (companies), sponsors, clients, partners, agencies
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  legal_name TEXT,
  code TEXT,
  description TEXT,
  
  -- Organization type
  org_type TEXT NOT NULL CHECK (org_type IN (
    'vendor', 'sponsor', 'client', 'partner', 'agency', 'subsidiary', 'other'
  )),
  
  -- Contact information
  email TEXT,
  phone TEXT,
  website TEXT,
  
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  
  -- Business details
  tax_id TEXT,
  duns_number TEXT,
  industry TEXT,
  company_size TEXT CHECK (company_size IN (
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'
  )),
  
  -- Primary contact (links to legend_people)
  primary_contact_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  
  -- Status and classification
  status legend_status DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  
  -- Media
  logo_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES platform_users(id),
  updated_by UUID REFERENCES platform_users(id)
);

CREATE INDEX idx_legend_orgs_org ON legend_organizations(organization_id);
CREATE INDEX idx_legend_orgs_type ON legend_organizations(org_type);
CREATE INDEX idx_legend_orgs_status ON legend_organizations(status);
CREATE INDEX idx_legend_orgs_primary_contact ON legend_organizations(primary_contact_id);
CREATE INDEX idx_legend_orgs_tags ON legend_organizations USING GIN(tags);

-- ============================================================================
-- LEGEND_PRODUCTS - Single source of truth for all products/services/assets
-- Replaces: catalog_items, assets, equipment, inventory_items, products, 
--           merchandise, rentals
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  description TEXT,
  
  -- Product type
  product_type TEXT NOT NULL CHECK (product_type IN (
    'asset', 'equipment', 'inventory', 'merchandise', 'rental', 'service', 'consumable', 'other'
  )),
  
  -- Category (links to legend_categories)
  category_id UUID,
  subcategory_id UUID,
  
  -- Pricing
  unit_price DECIMAL(12, 2),
  cost_price DECIMAL(12, 2),
  currency TEXT DEFAULT 'USD',
  
  -- Inventory
  quantity_on_hand INTEGER DEFAULT 0,
  quantity_reserved INTEGER DEFAULT 0,
  quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  reorder_point INTEGER,
  reorder_quantity INTEGER,
  
  -- Physical attributes
  weight DECIMAL(10, 2),
  weight_unit TEXT DEFAULT 'lbs',
  length DECIMAL(10, 2),
  width DECIMAL(10, 2),
  height DECIMAL(10, 2),
  dimension_unit TEXT DEFAULT 'in',
  
  -- Status and classification
  status legend_status DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  
  -- Media
  image_url TEXT,
  thumbnail_url TEXT,
  
  -- Vendor (links to legend_organizations)
  vendor_id UUID REFERENCES legend_organizations(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES platform_users(id),
  updated_by UUID REFERENCES platform_users(id)
);

CREATE INDEX idx_legend_products_org ON legend_products(organization_id);
CREATE INDEX idx_legend_products_type ON legend_products(product_type);
CREATE INDEX idx_legend_products_sku ON legend_products(sku);
CREATE INDEX idx_legend_products_status ON legend_products(status);
CREATE INDEX idx_legend_products_category ON legend_products(category_id);
CREATE INDEX idx_legend_products_vendor ON legend_products(vendor_id);
CREATE INDEX idx_legend_products_tags ON legend_products USING GIN(tags);

-- ============================================================================
-- LEGEND_EVENTS - Single source of truth for all events/productions/shows
-- Replaces: events, productions, shows, meetings, bookings, tours, activations
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  
  -- Event type
  event_type TEXT NOT NULL CHECK (event_type IN (
    'event', 'production', 'show', 'meeting', 'booking', 'tour', 'activation', 
    'rehearsal', 'load_in', 'load_out', 'other'
  )),
  
  -- Timing
  start_datetime TIMESTAMPTZ,
  end_datetime TIMESTAMPTZ,
  timezone TEXT DEFAULT 'America/New_York',
  is_all_day BOOLEAN DEFAULT false,
  
  -- Location (links to legend_places)
  place_id UUID REFERENCES legend_places(id) ON DELETE SET NULL,
  
  -- Parent event (for series/tours)
  parent_event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  
  -- Capacity and attendance
  capacity INTEGER,
  expected_attendance INTEGER,
  actual_attendance INTEGER,
  
  -- Status and classification
  status legend_status DEFAULT 'draft',
  tags TEXT[] DEFAULT '{}',
  
  -- Media
  image_url TEXT,
  banner_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES platform_users(id),
  updated_by UUID REFERENCES platform_users(id)
);

CREATE INDEX idx_legend_events_org ON legend_events(organization_id);
CREATE INDEX idx_legend_events_type ON legend_events(event_type);
CREATE INDEX idx_legend_events_status ON legend_events(status);
CREATE INDEX idx_legend_events_dates ON legend_events(start_datetime, end_datetime);
CREATE INDEX idx_legend_events_place ON legend_events(place_id);
CREATE INDEX idx_legend_events_parent ON legend_events(parent_event_id);
CREATE INDEX idx_legend_events_tags ON legend_events USING GIN(tags);

-- ============================================================================
-- LEGEND_DOCUMENTS - Single source of truth for all documents/contracts
-- Replaces: documents, contracts, invoices, proposals, permits, insurance
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  document_number TEXT,
  description TEXT,
  
  -- Document type
  document_type TEXT NOT NULL CHECK (document_type IN (
    'contract', 'invoice', 'proposal', 'permit', 'insurance', 'agreement',
    'certificate', 'license', 'report', 'policy', 'other'
  )),
  
  -- File information
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  
  -- Dates
  issue_date DATE,
  effective_date DATE,
  expiration_date DATE,
  
  -- Financial
  amount DECIMAL(12, 2),
  currency TEXT DEFAULT 'USD',
  
  -- Related entities
  related_person_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  related_org_id UUID REFERENCES legend_organizations(id) ON DELETE SET NULL,
  related_event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  
  -- Status and classification
  status legend_status DEFAULT 'draft',
  tags TEXT[] DEFAULT '{}',
  
  -- Signatures
  requires_signature BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  signed_by UUID REFERENCES platform_users(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES platform_users(id),
  updated_by UUID REFERENCES platform_users(id)
);

CREATE INDEX idx_legend_docs_org ON legend_documents(organization_id);
CREATE INDEX idx_legend_docs_type ON legend_documents(document_type);
CREATE INDEX idx_legend_docs_status ON legend_documents(status);
CREATE INDEX idx_legend_docs_dates ON legend_documents(effective_date, expiration_date);
CREATE INDEX idx_legend_docs_person ON legend_documents(related_person_id);
CREATE INDEX idx_legend_docs_related_org ON legend_documents(related_org_id);
CREATE INDEX idx_legend_docs_event ON legend_documents(related_event_id);
CREATE INDEX idx_legend_docs_tags ON legend_documents USING GIN(tags);

-- ============================================================================
-- PART 2: LEGEND REFERENCE DATA TABLES
-- ============================================================================

-- ============================================================================
-- LEGEND_CATEGORIES - Hierarchical categorization system
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  
  -- Hierarchy
  parent_id UUID REFERENCES legend_categories(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 0,
  path TEXT[], -- Materialized path for efficient queries
  
  -- Entity type this category applies to
  entity_type legend_entity_type NOT NULL,
  
  -- Display
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, entity_type, code)
);

CREATE INDEX idx_legend_categories_org ON legend_categories(organization_id);
CREATE INDEX idx_legend_categories_parent ON legend_categories(parent_id);
CREATE INDEX idx_legend_categories_entity_type ON legend_categories(entity_type);
CREATE INDEX idx_legend_categories_path ON legend_categories USING GIN(path);

-- ============================================================================
-- LEGEND_TAGS - Universal tagging system
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  
  -- Display
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  
  -- Entity types this tag can apply to (empty = all)
  applicable_entity_types legend_entity_type[] DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, slug)
);

CREATE INDEX idx_legend_tags_org ON legend_tags(organization_id);
CREATE INDEX idx_legend_tags_slug ON legend_tags(slug);

-- ============================================================================
-- LEGEND_STATUSES - Custom status workflows
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  
  -- Entity type this status applies to
  entity_type legend_entity_type NOT NULL,
  
  -- Workflow
  sort_order INTEGER DEFAULT 0,
  is_initial BOOLEAN DEFAULT false,
  is_final BOOLEAN DEFAULT false,
  allowed_transitions TEXT[] DEFAULT '{}', -- Array of status codes this can transition to
  
  -- Display
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, entity_type, code)
);

CREATE INDEX idx_legend_statuses_org ON legend_statuses(organization_id);
CREATE INDEX idx_legend_statuses_entity_type ON legend_statuses(entity_type);

-- ============================================================================
-- LEGEND_DEPARTMENTS - Organizational departments
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  
  -- Hierarchy
  parent_id UUID REFERENCES legend_departments(id) ON DELETE SET NULL,
  
  -- Leadership
  manager_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  
  -- Budget
  budget_amount DECIMAL(14, 2),
  budget_currency TEXT DEFAULT 'USD',
  cost_center_code TEXT,
  
  -- Display
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_legend_departments_org ON legend_departments(organization_id);
CREATE INDEX idx_legend_departments_parent ON legend_departments(parent_id);
CREATE INDEX idx_legend_departments_manager ON legend_departments(manager_id);

-- ============================================================================
-- LEGEND_TEAMS - Team groupings
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  
  -- Department association
  department_id UUID REFERENCES legend_departments(id) ON DELETE SET NULL,
  
  -- Leadership
  lead_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  
  -- Display
  icon TEXT,
  color TEXT,
  
  -- Settings
  is_default BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, slug)
);

CREATE INDEX idx_legend_teams_org ON legend_teams(organization_id);
CREATE INDEX idx_legend_teams_department ON legend_teams(department_id);
CREATE INDEX idx_legend_teams_lead ON legend_teams(lead_id);

-- ============================================================================
-- LEGEND_POSITIONS - Job titles/positions
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  
  -- Classification
  level TEXT CHECK (level IN ('entry', 'mid', 'senior', 'lead', 'manager', 'director', 'executive')),
  job_family TEXT,
  
  -- Department association
  department_id UUID REFERENCES legend_departments(id) ON DELETE SET NULL,
  
  -- Compensation
  min_salary DECIMAL(12, 2),
  max_salary DECIMAL(12, 2),
  salary_currency TEXT DEFAULT 'USD',
  
  -- Requirements
  requirements JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_legend_positions_org ON legend_positions(organization_id);
CREATE INDEX idx_legend_positions_department ON legend_positions(department_id);
CREATE INDEX idx_legend_positions_level ON legend_positions(level);

-- ============================================================================
-- LEGEND_COST_CENTERS - Financial tracking units
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  
  -- Hierarchy
  parent_id UUID REFERENCES legend_cost_centers(id) ON DELETE SET NULL,
  
  -- Budget
  budget_amount DECIMAL(14, 2),
  budget_currency TEXT DEFAULT 'USD',
  fiscal_year INTEGER,
  
  -- Owner
  owner_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_legend_cost_centers_org ON legend_cost_centers(organization_id);
CREATE INDEX idx_legend_cost_centers_parent ON legend_cost_centers(parent_id);
CREATE INDEX idx_legend_cost_centers_owner ON legend_cost_centers(owner_id);

-- ============================================================================
-- LEGEND_RELATIONSHIPS - Universal M:M relationships between entities
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Source entity
  source_entity_type legend_entity_type NOT NULL,
  source_entity_id UUID NOT NULL,
  
  -- Target entity
  target_entity_type legend_entity_type NOT NULL,
  target_entity_id UUID NOT NULL,
  
  -- Relationship type
  relationship_type TEXT NOT NULL,
  
  -- Direction (for asymmetric relationships)
  is_bidirectional BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  
  -- Validity period
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES platform_users(id),
  
  UNIQUE(organization_id, source_entity_type, source_entity_id, target_entity_type, target_entity_id, relationship_type)
);

CREATE INDEX idx_legend_relationships_org ON legend_relationships(organization_id);
CREATE INDEX idx_legend_relationships_source ON legend_relationships(source_entity_type, source_entity_id);
CREATE INDEX idx_legend_relationships_target ON legend_relationships(target_entity_type, target_entity_id);
CREATE INDEX idx_legend_relationships_type ON legend_relationships(relationship_type);

-- ============================================================================
-- PART 3: LEGEND SYSTEM TABLES
-- ============================================================================

-- ============================================================================
-- LEGEND_AUDIT_LOG - Change tracking for all Legend entities
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Entity reference
  entity_type legend_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Action
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'archive', 'restore')),
  
  -- Changes
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  
  -- Actor
  performed_by UUID REFERENCES platform_users(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT
);

CREATE INDEX idx_legend_audit_org ON legend_audit_log(organization_id);
CREATE INDEX idx_legend_audit_entity ON legend_audit_log(entity_type, entity_id);
CREATE INDEX idx_legend_audit_action ON legend_audit_log(action);
CREATE INDEX idx_legend_audit_performed_at ON legend_audit_log(performed_at);
CREATE INDEX idx_legend_audit_performed_by ON legend_audit_log(performed_by);

-- ============================================================================
-- LEGEND_ATTRIBUTES - Custom field definitions
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  
  -- Entity type this attribute applies to
  entity_type legend_entity_type NOT NULL,
  
  -- Field type
  field_type TEXT NOT NULL CHECK (field_type IN (
    'text', 'number', 'boolean', 'date', 'datetime', 'select', 'multiselect',
    'url', 'email', 'phone', 'currency', 'percentage', 'json'
  )),
  
  -- Options (for select/multiselect)
  options JSONB DEFAULT '[]'::jsonb,
  
  -- Validation
  is_required BOOLEAN DEFAULT false,
  min_value DECIMAL(12, 2),
  max_value DECIMAL(12, 2),
  min_length INTEGER,
  max_length INTEGER,
  pattern TEXT, -- Regex pattern
  
  -- Display
  display_order INTEGER DEFAULT 0,
  group_name TEXT,
  placeholder TEXT,
  help_text TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, entity_type, code)
);

CREATE INDEX idx_legend_attributes_org ON legend_attributes(organization_id);
CREATE INDEX idx_legend_attributes_entity_type ON legend_attributes(entity_type);

-- ============================================================================
-- LEGEND_ATTRIBUTE_VALUES - Custom field values
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Attribute reference
  attribute_id UUID NOT NULL REFERENCES legend_attributes(id) ON DELETE CASCADE,
  
  -- Entity reference
  entity_type legend_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  
  -- Value (stored as JSONB for flexibility)
  value JSONB NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(attribute_id, entity_id)
);

CREATE INDEX idx_legend_attr_values_org ON legend_attribute_values(organization_id);
CREATE INDEX idx_legend_attr_values_attribute ON legend_attribute_values(attribute_id);
CREATE INDEX idx_legend_attr_values_entity ON legend_attribute_values(entity_type, entity_id);

-- ============================================================================
-- LEGEND_VIEWS - Saved filters/views
-- ============================================================================
CREATE TABLE IF NOT EXISTS legend_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  description TEXT,
  
  -- Entity type this view applies to
  entity_type legend_entity_type NOT NULL,
  
  -- View configuration
  filters JSONB DEFAULT '{}'::jsonb,
  columns TEXT[] DEFAULT '{}',
  sort_by TEXT,
  sort_direction TEXT DEFAULT 'asc' CHECK (sort_direction IN ('asc', 'desc')),
  page_size INTEGER DEFAULT 25,
  
  -- Sharing
  is_public BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  owner_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  
  -- Display
  icon TEXT,
  color TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_legend_views_org ON legend_views(organization_id);
CREATE INDEX idx_legend_views_entity_type ON legend_views(entity_type);
CREATE INDEX idx_legend_views_owner ON legend_views(owner_id);

-- ============================================================================
-- PART 4: LEGEND PROFILE EXTENSION TABLES
-- ============================================================================

-- ============================================================================
-- PEOPLE PROFILES
-- ============================================================================

-- Employee profile
CREATE TABLE IF NOT EXISTS people_profile_employee (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  
  -- Employment details
  employee_number TEXT,
  hire_date DATE,
  termination_date DATE,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern', 'temp')),
  
  -- Position
  position_id UUID REFERENCES legend_positions(id) ON DELETE SET NULL,
  department_id UUID REFERENCES legend_departments(id) ON DELETE SET NULL,
  team_id UUID REFERENCES legend_teams(id) ON DELETE SET NULL,
  
  -- Reporting
  manager_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  
  -- Compensation
  salary DECIMAL(12, 2),
  salary_currency TEXT DEFAULT 'USD',
  pay_frequency TEXT CHECK (pay_frequency IN ('hourly', 'weekly', 'biweekly', 'monthly', 'annual')),
  
  -- Work location
  work_location_id UUID REFERENCES legend_places(id) ON DELETE SET NULL,
  is_remote BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(person_id)
);

CREATE INDEX idx_people_profile_employee_person ON people_profile_employee(person_id);
CREATE INDEX idx_people_profile_employee_department ON people_profile_employee(department_id);
CREATE INDEX idx_people_profile_employee_manager ON people_profile_employee(manager_id);

-- Crew profile
CREATE TABLE IF NOT EXISTS people_profile_crew (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  
  -- Crew details
  crew_type TEXT CHECK (crew_type IN ('stagehand', 'technician', 'rigger', 'carpenter', 'electrician', 'audio', 'video', 'lighting', 'other')),
  skill_level TEXT CHECK (skill_level IN ('trainee', 'junior', 'mid', 'senior', 'lead', 'master')),
  
  -- Certifications
  certifications TEXT[] DEFAULT '{}',
  
  -- Rates
  hourly_rate DECIMAL(10, 2),
  day_rate DECIMAL(10, 2),
  overtime_rate DECIMAL(10, 2),
  rate_currency TEXT DEFAULT 'USD',
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  availability_notes TEXT,
  
  -- Union
  union_name TEXT,
  union_local TEXT,
  union_member_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(person_id)
);

CREATE INDEX idx_people_profile_crew_person ON people_profile_crew(person_id);
CREATE INDEX idx_people_profile_crew_type ON people_profile_crew(crew_type);

-- Artist profile
CREATE TABLE IF NOT EXISTS people_profile_artist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  
  -- Artist details
  stage_name TEXT,
  genre TEXT[] DEFAULT '{}',
  artist_type TEXT CHECK (artist_type IN ('musician', 'band', 'dj', 'comedian', 'speaker', 'performer', 'other')),
  
  -- Booking
  booking_fee DECIMAL(12, 2),
  booking_currency TEXT DEFAULT 'USD',
  booking_agent_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  
  -- Technical
  rider_url TEXT,
  tech_requirements JSONB DEFAULT '{}'::jsonb,
  
  -- Social
  spotify_url TEXT,
  apple_music_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(person_id)
);

CREATE INDEX idx_people_profile_artist_person ON people_profile_artist(person_id);
CREATE INDEX idx_people_profile_artist_type ON people_profile_artist(artist_type);

-- Vendor representative profile
CREATE TABLE IF NOT EXISTS people_profile_vendor_rep (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  
  -- Vendor association
  vendor_org_id UUID REFERENCES legend_organizations(id) ON DELETE CASCADE,
  
  -- Role at vendor
  role_title TEXT,
  is_primary_contact BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(person_id, vendor_org_id)
);

CREATE INDEX idx_people_profile_vendor_rep_person ON people_profile_vendor_rep(person_id);
CREATE INDEX idx_people_profile_vendor_rep_vendor ON people_profile_vendor_rep(vendor_org_id);

-- Volunteer profile
CREATE TABLE IF NOT EXISTS people_profile_volunteer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  
  -- Volunteer details
  volunteer_since DATE,
  total_hours DECIMAL(10, 2) DEFAULT 0,
  
  -- Skills and interests
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  
  -- Availability
  availability_notes TEXT,
  
  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  
  -- Background check
  background_check_date DATE,
  background_check_status TEXT CHECK (background_check_status IN ('pending', 'passed', 'failed', 'expired')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(person_id)
);

CREATE INDEX idx_people_profile_volunteer_person ON people_profile_volunteer(person_id);

-- Contact profile (external contacts)
CREATE TABLE IF NOT EXISTS people_profile_contact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES legend_people(id) ON DELETE CASCADE,
  
  -- Contact type
  contact_type TEXT CHECK (contact_type IN ('lead', 'prospect', 'customer', 'partner', 'press', 'other')),
  
  -- Associated organization
  associated_org_id UUID REFERENCES legend_organizations(id) ON DELETE SET NULL,
  
  -- Lead scoring
  lead_score INTEGER,
  lead_source TEXT,
  
  -- Communication preferences
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'mail')),
  do_not_contact BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(person_id)
);

CREATE INDEX idx_people_profile_contact_person ON people_profile_contact(person_id);
CREATE INDEX idx_people_profile_contact_org ON people_profile_contact(associated_org_id);

-- ============================================================================
-- PLACE PROFILES
-- ============================================================================

-- Venue profile
CREATE TABLE IF NOT EXISTS places_profile_venue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES legend_places(id) ON DELETE CASCADE,
  
  -- Venue details
  venue_type TEXT CHECK (venue_type IN ('arena', 'stadium', 'theater', 'club', 'bar', 'outdoor', 'convention_center', 'hotel', 'other')),
  
  -- Capacity breakdown
  seated_capacity INTEGER,
  standing_capacity INTEGER,
  vip_capacity INTEGER,
  
  -- Technical specs
  stage_dimensions JSONB DEFAULT '{}'::jsonb,
  power_capacity TEXT,
  rigging_points INTEGER,
  
  -- Amenities
  has_parking BOOLEAN DEFAULT false,
  has_catering BOOLEAN DEFAULT false,
  has_green_room BOOLEAN DEFAULT false,
  has_loading_dock BOOLEAN DEFAULT false,
  
  -- Booking
  rental_rate DECIMAL(12, 2),
  rental_currency TEXT DEFAULT 'USD',
  rental_unit TEXT CHECK (rental_unit IN ('hour', 'half_day', 'day', 'week')),
  
  -- Contact
  booking_contact_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(place_id)
);

CREATE INDEX idx_places_profile_venue_place ON places_profile_venue(place_id);
CREATE INDEX idx_places_profile_venue_type ON places_profile_venue(venue_type);

-- Warehouse profile
CREATE TABLE IF NOT EXISTS places_profile_warehouse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES legend_places(id) ON DELETE CASCADE,
  
  -- Warehouse details
  warehouse_type TEXT CHECK (warehouse_type IN ('storage', 'distribution', 'cross_dock', 'cold_storage', 'other')),
  
  -- Capacity
  total_bays INTEGER,
  available_bays INTEGER,
  pallet_positions INTEGER,
  
  -- Features
  has_climate_control BOOLEAN DEFAULT false,
  has_security BOOLEAN DEFAULT false,
  has_loading_dock BOOLEAN DEFAULT false,
  dock_doors INTEGER,
  
  -- Operating hours
  operating_hours JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(place_id)
);

CREATE INDEX idx_places_profile_warehouse_place ON places_profile_warehouse(place_id);

-- Stage profile
CREATE TABLE IF NOT EXISTS places_profile_stage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES legend_places(id) ON DELETE CASCADE,
  
  -- Stage details
  stage_type TEXT CHECK (stage_type IN ('main', 'secondary', 'outdoor', 'mobile', 'other')),
  
  -- Dimensions
  width DECIMAL(10, 2),
  depth DECIMAL(10, 2),
  height DECIMAL(10, 2),
  dimension_unit TEXT DEFAULT 'ft',
  
  -- Technical
  power_available TEXT,
  rigging_capacity DECIMAL(10, 2),
  rigging_unit TEXT DEFAULT 'lbs',
  
  -- Features
  has_pit BOOLEAN DEFAULT false,
  has_wings BOOLEAN DEFAULT false,
  has_fly_system BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(place_id)
);

CREATE INDEX idx_places_profile_stage_place ON places_profile_stage(place_id);

-- ============================================================================
-- ORGANIZATION PROFILES
-- ============================================================================

-- Vendor profile
CREATE TABLE IF NOT EXISTS orgs_profile_vendor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES legend_organizations(id) ON DELETE CASCADE,
  
  -- Vendor details
  vendor_type TEXT CHECK (vendor_type IN ('equipment', 'services', 'staffing', 'catering', 'transportation', 'production', 'other')),
  
  -- Payment terms
  payment_terms TEXT CHECK (payment_terms IN ('net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'prepaid')),
  credit_limit DECIMAL(12, 2),
  
  -- Rating
  rating DECIMAL(3, 2),
  total_orders INTEGER DEFAULT 0,
  
  -- Compliance
  is_approved BOOLEAN DEFAULT false,
  approved_date DATE,
  insurance_verified BOOLEAN DEFAULT false,
  insurance_expiry DATE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(org_id)
);

CREATE INDEX idx_orgs_profile_vendor_org ON orgs_profile_vendor(org_id);
CREATE INDEX idx_orgs_profile_vendor_type ON orgs_profile_vendor(vendor_type);

-- Sponsor profile
CREATE TABLE IF NOT EXISTS orgs_profile_sponsor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES legend_organizations(id) ON DELETE CASCADE,
  
  -- Sponsor details
  sponsor_tier TEXT CHECK (sponsor_tier IN ('platinum', 'gold', 'silver', 'bronze', 'partner', 'in_kind')),
  
  -- Contract
  contract_value DECIMAL(14, 2),
  contract_currency TEXT DEFAULT 'USD',
  contract_start DATE,
  contract_end DATE,
  
  -- Benefits
  benefits JSONB DEFAULT '[]'::jsonb,
  
  -- Activation
  activation_requirements JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(org_id)
);

CREATE INDEX idx_orgs_profile_sponsor_org ON orgs_profile_sponsor(org_id);
CREATE INDEX idx_orgs_profile_sponsor_tier ON orgs_profile_sponsor(sponsor_tier);

-- Client profile
CREATE TABLE IF NOT EXISTS orgs_profile_client (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES legend_organizations(id) ON DELETE CASCADE,
  
  -- Client details
  client_type TEXT CHECK (client_type IN ('enterprise', 'mid_market', 'smb', 'startup', 'nonprofit', 'government', 'other')),
  
  -- Account
  account_manager_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  account_tier TEXT CHECK (account_tier IN ('platinum', 'gold', 'silver', 'bronze', 'standard')),
  
  -- Billing
  billing_contact_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  payment_terms TEXT CHECK (payment_terms IN ('net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'prepaid')),
  
  -- Metrics
  lifetime_value DECIMAL(14, 2) DEFAULT 0,
  total_projects INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(org_id)
);

CREATE INDEX idx_orgs_profile_client_org ON orgs_profile_client(org_id);
CREATE INDEX idx_orgs_profile_client_manager ON orgs_profile_client(account_manager_id);

-- ============================================================================
-- PRODUCT PROFILES
-- ============================================================================

-- Asset profile
CREATE TABLE IF NOT EXISTS products_profile_asset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES legend_products(id) ON DELETE CASCADE,
  
  -- Asset details
  asset_tag TEXT,
  serial_number TEXT,
  
  -- Acquisition
  purchase_date DATE,
  purchase_price DECIMAL(12, 2),
  purchase_currency TEXT DEFAULT 'USD',
  
  -- Depreciation
  depreciation_method TEXT CHECK (depreciation_method IN ('straight_line', 'declining_balance', 'none')),
  useful_life_years INTEGER,
  salvage_value DECIMAL(12, 2),
  current_value DECIMAL(12, 2),
  
  -- Location
  current_location_id UUID REFERENCES legend_places(id) ON DELETE SET NULL,
  assigned_to_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  
  -- Maintenance
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_interval_days INTEGER,
  
  -- Warranty
  warranty_expiry DATE,
  warranty_provider TEXT,
  
  -- Condition
  condition TEXT CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor', 'retired')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(product_id)
);

CREATE INDEX idx_products_profile_asset_product ON products_profile_asset(product_id);
CREATE INDEX idx_products_profile_asset_location ON products_profile_asset(current_location_id);
CREATE INDEX idx_products_profile_asset_assigned ON products_profile_asset(assigned_to_id);

-- Equipment profile
CREATE TABLE IF NOT EXISTS products_profile_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES legend_products(id) ON DELETE CASCADE,
  
  -- Equipment details
  equipment_type TEXT CHECK (equipment_type IN ('audio', 'video', 'lighting', 'staging', 'rigging', 'power', 'other')),
  
  -- Technical specs
  power_requirements TEXT,
  weight DECIMAL(10, 2),
  weight_unit TEXT DEFAULT 'lbs',
  
  -- Rental
  daily_rate DECIMAL(10, 2),
  weekly_rate DECIMAL(10, 2),
  rate_currency TEXT DEFAULT 'USD',
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  current_event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  
  -- Certifications required
  requires_certification BOOLEAN DEFAULT false,
  certification_types TEXT[] DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(product_id)
);

CREATE INDEX idx_products_profile_equipment_product ON products_profile_equipment(product_id);
CREATE INDEX idx_products_profile_equipment_type ON products_profile_equipment(equipment_type);

-- ============================================================================
-- EVENT PROFILES
-- ============================================================================

-- Production profile
CREATE TABLE IF NOT EXISTS events_profile_production (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  
  -- Production details
  production_type TEXT CHECK (production_type IN ('concert', 'festival', 'corporate', 'theater', 'broadcast', 'other')),
  
  -- Budget
  budget_amount DECIMAL(14, 2),
  budget_currency TEXT DEFAULT 'USD',
  
  -- Team
  production_manager_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  stage_manager_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  
  -- Schedule
  load_in_datetime TIMESTAMPTZ,
  load_out_datetime TIMESTAMPTZ,
  doors_datetime TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(event_id)
);

CREATE INDEX idx_events_profile_production_event ON events_profile_production(event_id);
CREATE INDEX idx_events_profile_production_pm ON events_profile_production(production_manager_id);

-- Show profile
CREATE TABLE IF NOT EXISTS events_profile_show (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  
  -- Show details
  show_number INTEGER DEFAULT 1,
  
  -- Timing
  doors_time TIME,
  show_time TIME,
  curfew_time TIME,
  
  -- Ticketing
  ticket_price_min DECIMAL(10, 2),
  ticket_price_max DECIMAL(10, 2),
  tickets_sold INTEGER DEFAULT 0,
  tickets_comped INTEGER DEFAULT 0,
  
  -- Age restriction
  age_restriction TEXT CHECK (age_restriction IN ('all_ages', '18+', '21+')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(event_id)
);

CREATE INDEX idx_events_profile_show_event ON events_profile_show(event_id);

-- ============================================================================
-- DOCUMENT PROFILES
-- ============================================================================

-- Contract profile
CREATE TABLE IF NOT EXISTS docs_profile_contract (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES legend_documents(id) ON DELETE CASCADE,
  
  -- Contract details
  contract_type TEXT CHECK (contract_type IN ('service', 'employment', 'nda', 'rental', 'sponsorship', 'vendor', 'other')),
  
  -- Parties
  party_a_org_id UUID REFERENCES legend_organizations(id) ON DELETE SET NULL,
  party_b_org_id UUID REFERENCES legend_organizations(id) ON DELETE SET NULL,
  party_a_person_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  party_b_person_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  
  -- Terms
  auto_renew BOOLEAN DEFAULT false,
  renewal_terms TEXT,
  termination_notice_days INTEGER,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(document_id)
);

CREATE INDEX idx_docs_profile_contract_document ON docs_profile_contract(document_id);

-- Invoice profile
CREATE TABLE IF NOT EXISTS docs_profile_invoice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES legend_documents(id) ON DELETE CASCADE,
  
  -- Invoice details
  invoice_type TEXT CHECK (invoice_type IN ('standard', 'credit_note', 'proforma', 'recurring')),
  
  -- Payment
  payment_status TEXT CHECK (payment_status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'void')),
  due_date DATE,
  paid_date DATE,
  paid_amount DECIMAL(12, 2),
  
  -- Line items stored in document metadata
  subtotal DECIMAL(12, 2),
  tax_amount DECIMAL(12, 2),
  discount_amount DECIMAL(12, 2),
  total_amount DECIMAL(12, 2),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(document_id)
);

CREATE INDEX idx_docs_profile_invoice_document ON docs_profile_invoice(document_id);
CREATE INDEX idx_docs_profile_invoice_status ON docs_profile_invoice(payment_status);

-- ============================================================================
-- PART 5: ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all Legend tables
ALTER TABLE legend_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE legend_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_artist ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_vendor_rep ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_volunteer ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_profile_contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_profile_venue ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_profile_warehouse ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_profile_stage ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgs_profile_vendor ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgs_profile_sponsor ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgs_profile_client ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_profile_asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_profile_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_profile_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_profile_show ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_profile_contract ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_profile_invoice ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for Base Entity Tables
-- ============================================================================

-- legend_people policies
CREATE POLICY "legend_people_select" ON legend_people
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_people_insert" ON legend_people
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "legend_people_update" ON legend_people
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "legend_people_delete" ON legend_people
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- legend_places policies
CREATE POLICY "legend_places_select" ON legend_places
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_places_insert" ON legend_places
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "legend_places_update" ON legend_places
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "legend_places_delete" ON legend_places
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- legend_organizations policies
CREATE POLICY "legend_organizations_select" ON legend_organizations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_organizations_insert" ON legend_organizations
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "legend_organizations_update" ON legend_organizations
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "legend_organizations_delete" ON legend_organizations
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- legend_products policies
CREATE POLICY "legend_products_select" ON legend_products
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_products_insert" ON legend_products
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "legend_products_update" ON legend_products
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "legend_products_delete" ON legend_products
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- legend_events policies
CREATE POLICY "legend_events_select" ON legend_events
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_events_insert" ON legend_events
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "legend_events_update" ON legend_events
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "legend_events_delete" ON legend_events
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- legend_documents policies
CREATE POLICY "legend_documents_select" ON legend_documents
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_documents_insert" ON legend_documents
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "legend_documents_update" ON legend_documents
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  );

CREATE POLICY "legend_documents_delete" ON legend_documents
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- RLS Policies for Reference Data Tables (similar pattern)
-- ============================================================================

-- legend_categories policies
CREATE POLICY "legend_categories_select" ON legend_categories
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_categories_modify" ON legend_categories
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- legend_tags policies
CREATE POLICY "legend_tags_select" ON legend_tags
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_tags_modify" ON legend_tags
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- legend_statuses policies
CREATE POLICY "legend_statuses_select" ON legend_statuses
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_statuses_modify" ON legend_statuses
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- legend_departments policies
CREATE POLICY "legend_departments_select" ON legend_departments
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_departments_modify" ON legend_departments
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- legend_teams policies
CREATE POLICY "legend_teams_select" ON legend_teams
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_teams_modify" ON legend_teams
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- legend_positions policies
CREATE POLICY "legend_positions_select" ON legend_positions
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_positions_modify" ON legend_positions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- legend_cost_centers policies
CREATE POLICY "legend_cost_centers_select" ON legend_cost_centers
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_cost_centers_modify" ON legend_cost_centers
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- legend_relationships policies
CREATE POLICY "legend_relationships_select" ON legend_relationships
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_relationships_modify" ON legend_relationships
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  );

-- legend_audit_log policies (read-only for most users)
CREATE POLICY "legend_audit_log_select" ON legend_audit_log
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- legend_attributes policies
CREATE POLICY "legend_attributes_select" ON legend_attributes
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_attributes_modify" ON legend_attributes
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- legend_attribute_values policies
CREATE POLICY "legend_attribute_values_select" ON legend_attribute_values
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "legend_attribute_values_modify" ON legend_attribute_values
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin', 'manager')
    )
  );

-- legend_views policies
CREATE POLICY "legend_views_select" ON legend_views
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid()
    )
    AND (is_public = true OR owner_id = auth.uid())
  );

CREATE POLICY "legend_views_modify" ON legend_views
  FOR ALL USING (
    owner_id = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- PART 6: HELPER FUNCTIONS
-- ============================================================================

-- Function to get all profiles for a person
CREATE OR REPLACE FUNCTION get_person_profiles(p_person_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}'::jsonb;
BEGIN
  -- Check employee profile
  IF EXISTS (SELECT 1 FROM people_profile_employee WHERE person_id = p_person_id) THEN
    SELECT result || jsonb_build_object('employee', row_to_json(e)::jsonb)
    INTO result
    FROM people_profile_employee e WHERE person_id = p_person_id;
  END IF;
  
  -- Check crew profile
  IF EXISTS (SELECT 1 FROM people_profile_crew WHERE person_id = p_person_id) THEN
    SELECT result || jsonb_build_object('crew', row_to_json(c)::jsonb)
    INTO result
    FROM people_profile_crew c WHERE person_id = p_person_id;
  END IF;
  
  -- Check artist profile
  IF EXISTS (SELECT 1 FROM people_profile_artist WHERE person_id = p_person_id) THEN
    SELECT result || jsonb_build_object('artist', row_to_json(a)::jsonb)
    INTO result
    FROM people_profile_artist a WHERE person_id = p_person_id;
  END IF;
  
  -- Check vendor_rep profile
  IF EXISTS (SELECT 1 FROM people_profile_vendor_rep WHERE person_id = p_person_id) THEN
    SELECT result || jsonb_build_object('vendor_rep', row_to_json(v)::jsonb)
    INTO result
    FROM people_profile_vendor_rep v WHERE person_id = p_person_id;
  END IF;
  
  -- Check volunteer profile
  IF EXISTS (SELECT 1 FROM people_profile_volunteer WHERE person_id = p_person_id) THEN
    SELECT result || jsonb_build_object('volunteer', row_to_json(vol)::jsonb)
    INTO result
    FROM people_profile_volunteer vol WHERE person_id = p_person_id;
  END IF;
  
  -- Check contact profile
  IF EXISTS (SELECT 1 FROM people_profile_contact WHERE person_id = p_person_id) THEN
    SELECT result || jsonb_build_object('contact', row_to_json(con)::jsonb)
    INTO result
    FROM people_profile_contact con WHERE person_id = p_person_id;
  END IF;
  
  RETURN result;
END;
$$;

-- Function to get entity counts for Legend dashboard
CREATE OR REPLACE FUNCTION get_legend_entity_counts(p_organization_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'people', (SELECT COUNT(*) FROM legend_people WHERE organization_id = p_organization_id AND status = 'active'),
    'places', (SELECT COUNT(*) FROM legend_places WHERE organization_id = p_organization_id AND status = 'active'),
    'organizations', (SELECT COUNT(*) FROM legend_organizations WHERE organization_id = p_organization_id AND status = 'active'),
    'products', (SELECT COUNT(*) FROM legend_products WHERE organization_id = p_organization_id AND status = 'active'),
    'events', (SELECT COUNT(*) FROM legend_events WHERE organization_id = p_organization_id AND status = 'active'),
    'documents', (SELECT COUNT(*) FROM legend_documents WHERE organization_id = p_organization_id AND status = 'active'),
    'departments', (SELECT COUNT(*) FROM legend_departments WHERE organization_id = p_organization_id AND is_active = true),
    'teams', (SELECT COUNT(*) FROM legend_teams WHERE organization_id = p_organization_id AND is_active = true),
    'positions', (SELECT COUNT(*) FROM legend_positions WHERE organization_id = p_organization_id AND is_active = true)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION legend_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all Legend tables
CREATE TRIGGER legend_people_updated_at BEFORE UPDATE ON legend_people FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_places_updated_at BEFORE UPDATE ON legend_places FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_organizations_updated_at BEFORE UPDATE ON legend_organizations FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_products_updated_at BEFORE UPDATE ON legend_products FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_events_updated_at BEFORE UPDATE ON legend_events FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_documents_updated_at BEFORE UPDATE ON legend_documents FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_categories_updated_at BEFORE UPDATE ON legend_categories FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_tags_updated_at BEFORE UPDATE ON legend_tags FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_statuses_updated_at BEFORE UPDATE ON legend_statuses FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_departments_updated_at BEFORE UPDATE ON legend_departments FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_teams_updated_at BEFORE UPDATE ON legend_teams FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_positions_updated_at BEFORE UPDATE ON legend_positions FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_cost_centers_updated_at BEFORE UPDATE ON legend_cost_centers FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_relationships_updated_at BEFORE UPDATE ON legend_relationships FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_attributes_updated_at BEFORE UPDATE ON legend_attributes FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_attribute_values_updated_at BEFORE UPDATE ON legend_attribute_values FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();
CREATE TRIGGER legend_views_updated_at BEFORE UPDATE ON legend_views FOR EACH ROW EXECUTE FUNCTION legend_update_timestamp();

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON legend_people TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_places TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_statuses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_departments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_teams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_positions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_cost_centers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_relationships TO authenticated;
GRANT SELECT ON legend_audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_attributes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_attribute_values TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON legend_views TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_employee TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_crew TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_artist TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_vendor_rep TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_volunteer TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON people_profile_contact TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON places_profile_venue TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON places_profile_warehouse TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON places_profile_stage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orgs_profile_vendor TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orgs_profile_sponsor TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orgs_profile_client TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products_profile_asset TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products_profile_equipment TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON events_profile_production TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON events_profile_show TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON docs_profile_contract TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON docs_profile_invoice TO authenticated;

GRANT EXECUTE ON FUNCTION get_person_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_legend_entity_counts TO authenticated;
