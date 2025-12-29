-- ============================================================================
-- 0003_legend_schema.sql
-- LEGEND Schema: Normalized Entities (Nouns)
-- Single Source of Truth for People, Places, Organizations, Products, Events, Documents
-- GHXSTSHIP Platform - 3NF Normalized Structure
-- ============================================================================

-- ============================================================================
-- LEGEND_PEOPLE - Single source of truth for all humans
-- Replaces: contacts, employees, crew_members, artists, vendors (reps), 
--           volunteers, freelancers, ambassadors, candidates, stakeholders
-- ============================================================================

CREATE TABLE legend_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  preferred_name TEXT,
  
  -- Contact information
  email TEXT,
  phone TEXT,
  mobile TEXT,
  
  -- Profile
  avatar_url TEXT,
  bio TEXT,
  title TEXT,
  
  -- Linked platform user
  platform_user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  -- Status and classification
  status legend_status DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  
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

CREATE TABLE legend_places (
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
  
  -- Parent place (for hierarchical locations)
  parent_place_id UUID REFERENCES legend_places(id) ON DELETE SET NULL,
  
  -- Capacity and dimensions
  capacity INTEGER,
  square_footage DECIMAL(12, 2),
  
  -- Geolocation
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone TEXT DEFAULT 'America/New_York',
  
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

CREATE TABLE legend_organizations (
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
  
  -- Business details
  tax_id TEXT,
  duns_number TEXT,
  industry TEXT,
  company_size TEXT CHECK (company_size IN (
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'
  )),
  
  -- Primary contact
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
-- Replaces: catalog_items, assets, equipment, inventory_items, merchandise
-- ============================================================================

CREATE TABLE legend_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  description TEXT,
  
  -- Product type
  product_type TEXT NOT NULL CHECK (product_type IN (
    'asset', 'equipment', 'inventory', 'merchandise', 'rental', 'service', 'consumable', 'ticket', 'other'
  )),
  
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
  
  -- Vendor
  vendor_id UUID REFERENCES legend_organizations(id) ON DELETE SET NULL,
  
  -- Status and classification
  status legend_status DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  
  -- Media
  image_url TEXT,
  thumbnail_url TEXT,
  
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
CREATE INDEX idx_legend_products_vendor ON legend_products(vendor_id);
CREATE INDEX idx_legend_products_tags ON legend_products USING GIN(tags);

-- ============================================================================
-- LEGEND_EVENTS - Single source of truth for all events/productions/shows
-- Replaces: events, productions, shows, meetings, bookings, tours
-- ============================================================================

CREATE TABLE legend_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  
  -- Event type
  event_type TEXT NOT NULL CHECK (event_type IN (
    'event', 'production', 'show', 'meeting', 'booking', 'tour', 'activation', 
    'rehearsal', 'load_in', 'load_out', 'conference', 'festival', 'workshop', 'webinar', 'other'
  )),
  
  -- Timing
  start_datetime TIMESTAMPTZ,
  end_datetime TIMESTAMPTZ,
  timezone TEXT DEFAULT 'America/New_York',
  is_all_day BOOLEAN DEFAULT false,
  
  -- Location
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

CREATE TABLE legend_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Core identity
  name TEXT NOT NULL,
  document_number TEXT,
  description TEXT,
  
  -- Document type
  document_type TEXT NOT NULL CHECK (document_type IN (
    'contract', 'invoice', 'proposal', 'permit', 'insurance', 'agreement',
    'certificate', 'license', 'report', 'policy', 'template', 'other'
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
-- LEGEND REFERENCE DATA TABLES
-- ============================================================================

-- ADDRESSES - Normalized address storage
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  address_type TEXT CHECK (address_type IN ('billing', 'shipping', 'venue', 'office', 'home', 'warehouse', 'other')),
  label TEXT,
  street_address TEXT,
  street_address_2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_source TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_addresses_organization ON addresses(organization_id);
CREATE INDEX idx_addresses_type ON addresses(address_type);
CREATE INDEX idx_addresses_city_state ON addresses(city, state_province);
CREATE INDEX idx_addresses_postal ON addresses(postal_code);

-- LEGEND_DEPARTMENTS - Organizational departments
CREATE TABLE legend_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES legend_departments(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  budget_amount DECIMAL(14, 2),
  budget_currency TEXT DEFAULT 'USD',
  cost_center_code TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_legend_departments_org ON legend_departments(organization_id);
CREATE INDEX idx_legend_departments_parent ON legend_departments(parent_id);
CREATE INDEX idx_legend_departments_manager ON legend_departments(manager_id);

-- LEGEND_TEAMS - Team groupings
CREATE TABLE legend_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES legend_departments(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE INDEX idx_legend_teams_org ON legend_teams(organization_id);
CREATE INDEX idx_legend_teams_department ON legend_teams(department_id);
CREATE INDEX idx_legend_teams_lead ON legend_teams(lead_id);

-- LEGEND_POSITIONS - Job titles/positions
CREATE TABLE legend_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  level TEXT CHECK (level IN ('entry', 'mid', 'senior', 'lead', 'manager', 'director', 'executive')),
  job_family TEXT,
  department_id UUID REFERENCES legend_departments(id) ON DELETE SET NULL,
  min_salary DECIMAL(12, 2),
  max_salary DECIMAL(12, 2),
  salary_currency TEXT DEFAULT 'USD',
  requirements JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_legend_positions_org ON legend_positions(organization_id);
CREATE INDEX idx_legend_positions_department ON legend_positions(department_id);
CREATE INDEX idx_legend_positions_level ON legend_positions(level);

-- LEGEND_COST_CENTERS - Financial tracking units
CREATE TABLE legend_cost_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES legend_cost_centers(id) ON DELETE SET NULL,
  budget_amount DECIMAL(14, 2),
  budget_currency TEXT DEFAULT 'USD',
  fiscal_year INTEGER,
  owner_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

CREATE INDEX idx_legend_cost_centers_org ON legend_cost_centers(organization_id);
CREATE INDEX idx_legend_cost_centers_parent ON legend_cost_centers(parent_id);
CREATE INDEX idx_legend_cost_centers_owner ON legend_cost_centers(owner_id);

-- LEGEND_CATEGORIES - Hierarchical categorization
CREATE TABLE legend_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES legend_categories(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 0,
  path TEXT[],
  entity_type legend_entity_type NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, entity_type, code)
);

CREATE INDEX idx_legend_categories_org ON legend_categories(organization_id);
CREATE INDEX idx_legend_categories_parent ON legend_categories(parent_id);
CREATE INDEX idx_legend_categories_entity_type ON legend_categories(entity_type);
CREATE INDEX idx_legend_categories_path ON legend_categories USING GIN(path);

-- LEGEND_TAGS - Universal tagging system
CREATE TABLE legend_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  applicable_entity_types legend_entity_type[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE INDEX idx_legend_tags_org ON legend_tags(organization_id);
CREATE INDEX idx_legend_tags_slug ON legend_tags(slug);

-- LEGEND_RELATIONSHIPS - Universal M:M relationships between entities
CREATE TABLE legend_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_entity_type legend_entity_type NOT NULL,
  source_entity_id UUID NOT NULL,
  target_entity_type legend_entity_type NOT NULL,
  target_entity_id UUID NOT NULL,
  relationship_type TEXT NOT NULL,
  is_bidirectional BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES platform_users(id),
  UNIQUE(organization_id, source_entity_type, source_entity_id, target_entity_type, target_entity_id, relationship_type)
);

CREATE INDEX idx_legend_relationships_org ON legend_relationships(organization_id);
CREATE INDEX idx_legend_relationships_source ON legend_relationships(source_entity_type, source_entity_id);
CREATE INDEX idx_legend_relationships_target ON legend_relationships(target_entity_type, target_entity_id);
CREATE INDEX idx_legend_relationships_type ON legend_relationships(relationship_type);

-- Apply updated_at triggers
CREATE TRIGGER legend_people_updated_at BEFORE UPDATE ON legend_people FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER legend_places_updated_at BEFORE UPDATE ON legend_places FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER legend_organizations_updated_at BEFORE UPDATE ON legend_organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER legend_products_updated_at BEFORE UPDATE ON legend_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER legend_events_updated_at BEFORE UPDATE ON legend_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER legend_documents_updated_at BEFORE UPDATE ON legend_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER legend_departments_updated_at BEFORE UPDATE ON legend_departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER legend_teams_updated_at BEFORE UPDATE ON legend_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER legend_positions_updated_at BEFORE UPDATE ON legend_positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER legend_cost_centers_updated_at BEFORE UPDATE ON legend_cost_centers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER legend_categories_updated_at BEFORE UPDATE ON legend_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER legend_tags_updated_at BEFORE UPDATE ON legend_tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER legend_relationships_updated_at BEFORE UPDATE ON legend_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
