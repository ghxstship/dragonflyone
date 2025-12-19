-- ============================================================================
-- V3 EXPANSION: CATALOG & VENDOR SERVICES FEATURES
-- Migration: 0048_v3_catalog_vendor_services.sql
-- Features: PC-001 Global Product/Service Catalog, VD-002 Preferred Vendor Lists,
--           VD-003 Vendor Performance Tracking, VO-001 Vendor Ordering
-- ============================================================================

-- ============================================================================
-- PART 1: GLOBAL PRODUCT/SERVICE CATALOG (PC-001)
-- ============================================================================

CREATE TABLE IF NOT EXISTS catalog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES catalog_categories(id) ON DELETE SET NULL,
  global_asset_category VARCHAR(100),
  icon VARCHAR(100),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES catalog_categories(id) ON DELETE SET NULL,
  vendor_profile_id UUID REFERENCES vendor_profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  unit_type VARCHAR(50) DEFAULT 'each',
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  pricing_rules JSONB DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  images JSONB DEFAULT '[]',
  tags TEXT[],
  min_quantity INT DEFAULT 1,
  max_quantity INT,
  lead_time_days INT,
  is_taxable BOOLEAN DEFAULT TRUE,
  tax_rate DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'inactive', 'discontinued')),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalog_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
  quantity_min INT NOT NULL,
  quantity_max INT,
  price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS catalog_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  attributes JSONB NOT NULL DEFAULT '{}',
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog_categories' AND column_name = 'name') THEN
    ALTER TABLE catalog_categories ADD COLUMN name VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog_categories' AND column_name = 'parent_id') THEN
    ALTER TABLE catalog_categories ADD COLUMN parent_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog_categories' AND column_name = 'organization_id') THEN
    ALTER TABLE catalog_categories ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog_categories' AND column_name = 'global_asset_category') THEN
    ALTER TABLE catalog_categories ADD COLUMN global_asset_category VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog_categories' AND column_name = 'icon') THEN
    ALTER TABLE catalog_categories ADD COLUMN icon VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog_categories' AND column_name = 'sort_order') THEN
    ALTER TABLE catalog_categories ADD COLUMN sort_order INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'catalog_pricing_tiers' AND column_name = 'item_id') THEN
    ALTER TABLE catalog_pricing_tiers ADD COLUMN item_id UUID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_catalog_categories_parent ON catalog_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_catalog_categories_org ON catalog_categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_org ON catalog_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_category ON catalog_items(category_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_vendor ON catalog_items(vendor_profile_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_status ON catalog_items(status);
CREATE INDEX IF NOT EXISTS idx_catalog_items_sku ON catalog_items(sku);
CREATE INDEX IF NOT EXISTS idx_catalog_pricing_item ON catalog_pricing_tiers(item_id);
CREATE INDEX IF NOT EXISTS idx_catalog_variants_item ON catalog_variants(item_id);

-- Default catalog categories aligned with Global Asset Catalog
-- Only insert if the table doesn't have a category_code NOT NULL constraint (legacy schema)
DO $$
BEGIN
  -- Check if this is the new schema (no category_code column or it's nullable)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'catalog_categories' 
    AND column_name = 'category_code' 
    AND is_nullable = 'NO'
  ) THEN
    INSERT INTO catalog_categories (name, global_asset_category, icon, sort_order) VALUES
      ('Venue Facilities', 'venue', 'building', 1),
      ('Staging & Platforms', 'staging', 'box', 2),
      ('Audio Equipment', 'audio', 'speaker', 3),
      ('Video Equipment', 'video', 'video', 4),
      ('Lighting Equipment', 'lighting', 'lightbulb', 5),
      ('Power & Electrical', 'power', 'zap', 6),
      ('Rigging & Trussing', 'rigging', 'link', 7),
      ('Scenic & Decor', 'decor', 'palette', 8),
      ('Furniture & Furnishings', 'furniture', 'armchair', 9),
      ('Linens & Fabrics', 'linens', 'layout', 10),
      ('Tableware & Serviceware', 'tableware', 'utensils', 11),
      ('Tenting & Structures', 'tenting', 'tent', 12),
      ('Climate Control', 'climate', 'thermometer', 13),
      ('Vehicles & Transport', 'transport', 'truck', 14),
      ('IT & Networking', 'it', 'wifi', 15),
      ('Safety & Crowd Control', 'safety', 'shield', 16),
      ('Signage & Graphics', 'signage', 'signpost', 17),
      ('Catering Equipment', 'catering', 'chef-hat', 18),
      ('Bar & Beverage', 'bar', 'wine', 19),
      ('Photography Equipment', 'photography', 'camera', 20),
      ('Entertainment & Games', 'entertainment', 'gamepad', 21),
      ('Floral & Plants', 'floral', 'flower', 22),
      ('Personnel & Staffing', 'staffing', 'users', 23),
      ('Consumables & Supplies', 'consumables', 'package', 24)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- PART 2: PREFERRED VENDOR LISTS (VD-002)
-- ============================================================================

CREATE TABLE IF NOT EXISTS preferred_vendor_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES vendor_categories(id) ON DELETE SET NULL,
  is_exclusive BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS preferred_vendor_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES preferred_vendor_lists(id) ON DELETE CASCADE,
  vendor_profile_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  notes TEXT,
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, vendor_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_preferred_lists_org ON preferred_vendor_lists(organization_id);
CREATE INDEX IF NOT EXISTS idx_preferred_lists_venue ON preferred_vendor_lists(venue_id);
CREATE INDEX IF NOT EXISTS idx_preferred_list_items_list ON preferred_vendor_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_preferred_list_items_vendor ON preferred_vendor_list_items(vendor_profile_id);

-- ============================================================================
-- PART 3: VENDOR PERFORMANCE TRACKING (VD-003)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_profile_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  overall_rating INT NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  category_ratings JSONB DEFAULT '{}',
  review_text TEXT,
  pros TEXT,
  cons TEXT,
  would_recommend BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden', 'removed')),
  response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_profile_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric_period DATE NOT NULL,
  period_type VARCHAR(20) DEFAULT 'monthly' CHECK (period_type IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  total_bookings INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  on_time_rate DECIMAL(5,2),
  quality_score DECIMAL(5,2),
  response_time_hours DECIMAL(10,2),
  issue_count INT DEFAULT 0,
  cancellation_count INT DEFAULT 0,
  repeat_booking_rate DECIMAL(5,2),
  metadata JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_profile_id, organization_id, metric_period, period_type)
);

CREATE TABLE IF NOT EXISTS vendor_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_profile_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  order_id UUID REFERENCES vendor_orders(id) ON DELETE SET NULL,
  issue_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'escalated')),
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  reported_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_reviews_vendor ON vendor_reviews(vendor_profile_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_org ON vendor_reviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendor_reviews_booking ON vendor_reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_vendor_metrics_vendor ON vendor_metrics(vendor_profile_id);
CREATE INDEX IF NOT EXISTS idx_vendor_metrics_period ON vendor_metrics(metric_period);
CREATE INDEX IF NOT EXISTS idx_vendor_issues_vendor ON vendor_issues(vendor_profile_id);
CREATE INDEX IF NOT EXISTS idx_vendor_issues_status ON vendor_issues(status);

-- ============================================================================
-- PART 4: RLS POLICIES
-- ============================================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'catalog_categories', 'catalog_items', 'catalog_pricing_tiers', 'catalog_variants',
    'preferred_vendor_lists', 'preferred_vendor_list_items',
    'vendor_reviews', 'vendor_metrics', 'vendor_issues'
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
    'catalog_categories', 'catalog_items', 'catalog_pricing_tiers', 'catalog_variants',
    'preferred_vendor_lists', 'preferred_vendor_list_items',
    'vendor_reviews', 'vendor_metrics', 'vendor_issues'
  ])
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO authenticated', tbl);
    EXECUTE format('GRANT SELECT ON %I TO anon', tbl);
  END LOOP;
END $$;

-- ============================================================================
-- PART 6: TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'catalog_items', 'preferred_vendor_lists', 'vendor_reviews', 'vendor_issues'
  ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS tr_%I_updated_at ON %I',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE TRIGGER tr_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
