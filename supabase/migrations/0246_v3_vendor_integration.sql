-- ============================================================================
-- V3 EXPANSION: VENDOR & INTEGRATION FEATURES
-- Migration: 0047_v3_vendor_integration.sql
-- Features: VD-001 Vendor Database, INT-001 Integration Suite,
--           Additional Vendor Services features
-- ============================================================================

-- ============================================================================
-- PART 1: VENDOR DATABASE ENHANCEMENT (VD-001)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES vendor_categories(id) ON DELETE SET NULL,
  icon VARCHAR(100),
  asset_catalog_category VARCHAR(100),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES vendor_categories(id) ON DELETE SET NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  contact_info JSONB DEFAULT '{}',
  service_areas TEXT[],
  certifications JSONB DEFAULT '[]',
  insurance JSONB DEFAULT '{}',
  payment_terms VARCHAR(100),
  tax_id VARCHAR(100),
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'inactive')),
  preferred BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_profile_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  is_primary BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_profile_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  expires_at DATE,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_profile_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  response TEXT,
  responded_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing vendor tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_profiles' AND column_name = 'organization_id') THEN
    ALTER TABLE vendor_profiles ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_profiles' AND column_name = 'category_id') THEN
    ALTER TABLE vendor_profiles ADD COLUMN category_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_profiles' AND column_name = 'status') THEN
    ALTER TABLE vendor_profiles ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_contacts' AND column_name = 'vendor_profile_id') THEN
    ALTER TABLE vendor_contacts ADD COLUMN vendor_profile_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_documents' AND column_name = 'vendor_profile_id') THEN
    ALTER TABLE vendor_documents ADD COLUMN vendor_profile_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_ratings' AND column_name = 'vendor_profile_id') THEN
    ALTER TABLE vendor_ratings ADD COLUMN vendor_profile_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_categories' AND column_name = 'parent_id') THEN
    ALTER TABLE vendor_categories ADD COLUMN parent_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_categories' AND column_name = 'icon') THEN
    ALTER TABLE vendor_categories ADD COLUMN icon VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendor_categories' AND column_name = 'asset_catalog_category') THEN
    ALTER TABLE vendor_categories ADD COLUMN asset_catalog_category VARCHAR(100);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_vendor_categories_parent ON vendor_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_org ON vendor_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_category ON vendor_profiles(category_id);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_status ON vendor_profiles(status);
CREATE INDEX IF NOT EXISTS idx_vendor_contacts_profile ON vendor_contacts(vendor_profile_id);
CREATE INDEX IF NOT EXISTS idx_vendor_documents_profile ON vendor_documents(vendor_profile_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ratings_profile ON vendor_ratings(vendor_profile_id);

-- Default vendor categories
INSERT INTO vendor_categories (name, icon, asset_catalog_category) VALUES
  ('Catering', 'utensils', 'catering'),
  ('Photography', 'camera', 'photography'),
  ('Videography', 'video', 'videography'),
  ('Florals', 'flower', 'florals'),
  ('Music & Entertainment', 'music', 'entertainment'),
  ('Lighting', 'lightbulb', 'lighting'),
  ('Audio/Visual', 'speaker', 'av_equipment'),
  ('Rentals', 'package', 'rentals'),
  ('Transportation', 'car', 'transportation'),
  ('Staffing', 'users', 'staffing'),
  ('Security', 'shield', 'security'),
  ('Décor', 'palette', 'decor'),
  ('Bakery', 'cake', 'bakery'),
  ('Bar Services', 'wine', 'bar'),
  ('Printing', 'printer', 'printing')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 2: INTEGRATION SUITE (INT-001)
-- ============================================================================

CREATE TYPE integration_status AS ENUM ('pending', 'connected', 'disconnected', 'error');

CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(100) NOT NULL,
  provider_display_name VARCHAR(255),
  status integration_status DEFAULT 'pending',
  credentials JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  scopes TEXT[],
  access_token_expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  sync_enabled BOOLEAN DEFAULT TRUE,
  sync_frequency_minutes INT DEFAULT 60,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, provider)
);

CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound', 'bidirectional')),
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  external_id VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'skipped')),
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integration_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  entity_type VARCHAR(100) NOT NULL,
  local_field VARCHAR(255) NOT NULL,
  external_field VARCHAR(255) NOT NULL,
  transform VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhooks_outgoing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret VARCHAR(255),
  headers JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  failure_count INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks_outgoing(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  response_status INT,
  response_body TEXT,
  duration_ms INT,
  attempt_count INT DEFAULT 1,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integrations_org ON integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_integration ON integration_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_entity ON integration_sync_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_org ON webhooks_outgoing(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);

-- ============================================================================
-- PART 3: VENDOR ORDERING SYSTEM (VO-001)
-- ============================================================================

CREATE TYPE vendor_order_status AS ENUM (
  'draft', 'pending_approval', 'approved', 'sent', 'acknowledged',
  'in_progress', 'completed', 'cancelled'
);

CREATE TABLE IF NOT EXISTS vendor_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_profile_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE,
  status vendor_order_status DEFAULT 'draft',
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  delivery_time TIME,
  delivery_location TEXT,
  special_instructions TEXT,
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  payment_terms VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  notes TEXT,
  internal_notes TEXT,
  sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES vendor_orders(id) ON DELETE CASCADE,
  product_id UUID,
  sku VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50),
  unit_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_orders_org ON vendor_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_vendor ON vendor_orders(vendor_profile_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_booking ON vendor_orders(booking_id);
CREATE INDEX IF NOT EXISTS idx_vendor_orders_status ON vendor_orders(status);
CREATE INDEX IF NOT EXISTS idx_vendor_order_items_order ON vendor_order_items(order_id);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_vendor_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'VO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                        LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_vendor_orders_number
  BEFORE INSERT ON vendor_orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_vendor_order_number();

-- ============================================================================
-- PART 4: RLS POLICIES
-- ============================================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'vendor_categories', 'vendor_profiles', 'vendor_contacts', 'vendor_documents',
    'vendor_ratings', 'integrations', 'integration_sync_logs', 'integration_field_mappings',
    'webhooks_outgoing', 'webhook_deliveries', 'vendor_orders', 'vendor_order_items'
  ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;

-- ============================================================================
-- PART 5: GRANTS
-- ============================================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'vendor_categories', 'vendor_profiles', 'vendor_contacts', 'vendor_documents',
    'vendor_ratings', 'integrations', 'integration_sync_logs', 'integration_field_mappings',
    'webhooks_outgoing', 'webhook_deliveries', 'vendor_orders', 'vendor_order_items'
  ])
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO authenticated', tbl);
    EXECUTE format('GRANT SELECT ON %I TO anon', tbl);
  END LOOP;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
