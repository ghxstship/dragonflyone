-- 0105_universal_advancing_catalog_schema.sql
-- Universal Multi-Industry Advancing Catalog Schema Enhancement
-- Extends the production_advancing_catalog to support any industry vertical

-- ============================================================================
-- SCHEMA ENHANCEMENTS
-- ============================================================================

-- Add industry classification enum
DO $$ BEGIN
  CREATE TYPE industry_vertical AS ENUM (
    'events_entertainment',
    'corporate_meetings',
    'construction',
    'healthcare',
    'hospitality',
    'film_television',
    'retail',
    'sports',
    'education',
    'government',
    'nonprofit',
    'manufacturing',
    'logistics',
    'universal'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add procurement type enum
DO $$ BEGIN
  CREATE TYPE procurement_type AS ENUM (
    'rental',
    'purchase',
    'service',
    'labor',
    'consumable',
    'license',
    'subscription'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add lead time unit enum
DO $$ BEGIN
  CREATE TYPE lead_time_unit AS ENUM (
    'hours',
    'days',
    'weeks',
    'months'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enhance production_advancing_catalog with universal fields
ALTER TABLE production_advancing_catalog
  ADD COLUMN IF NOT EXISTS industry_verticals industry_vertical[] DEFAULT ARRAY['universal']::industry_vertical[],
  ADD COLUMN IF NOT EXISTS procurement_type procurement_type DEFAULT 'rental',
  ADD COLUMN IF NOT EXISTS typical_lead_time integer,
  ADD COLUMN IF NOT EXISTS lead_time_unit lead_time_unit DEFAULT 'days',
  ADD COLUMN IF NOT EXISTS requires_certification boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS certification_types text[],
  ADD COLUMN IF NOT EXISTS hazard_class text,
  ADD COLUMN IF NOT EXISTS insurance_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS min_insurance_coverage numeric(14,2),
  ADD COLUMN IF NOT EXISTS regulatory_codes text[],
  ADD COLUMN IF NOT EXISTS sustainability_rating text,
  ADD COLUMN IF NOT EXISTS carbon_footprint_kg numeric(10,2),
  ADD COLUMN IF NOT EXISTS typical_vendors text[],
  ADD COLUMN IF NOT EXISTS alternative_items uuid[],
  ADD COLUMN IF NOT EXISTS bundle_items uuid[],
  ADD COLUMN IF NOT EXISTS min_quantity numeric(10,2) DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_quantity numeric(10,2),
  ADD COLUMN IF NOT EXISTS quantity_increment numeric(10,2) DEFAULT 1,
  ADD COLUMN IF NOT EXISTS base_price_low numeric(12,2),
  ADD COLUMN IF NOT EXISTS base_price_high numeric(12,2),
  ADD COLUMN IF NOT EXISTS price_currency text DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS price_includes_labor boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS setup_time_minutes integer,
  ADD COLUMN IF NOT EXISTS teardown_time_minutes integer,
  ADD COLUMN IF NOT EXISTS power_requirements text,
  ADD COLUMN IF NOT EXISTS weight_kg numeric(10,2),
  ADD COLUMN IF NOT EXISTS dimensions_cm jsonb,
  ADD COLUMN IF NOT EXISTS storage_requirements text,
  ADD COLUMN IF NOT EXISTS weather_rating text,
  ADD COLUMN IF NOT EXISTS indoor_outdoor text DEFAULT 'both',
  ADD COLUMN IF NOT EXISTS accessibility_compliant boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS search_keywords text[],
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deprecated boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deprecated_replacement_id uuid REFERENCES production_advancing_catalog(id);

-- Create catalog categories reference table for better organization
CREATE TABLE IF NOT EXISTS catalog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code text NOT NULL UNIQUE,
  category_name text NOT NULL,
  parent_category_id uuid REFERENCES catalog_categories(id),
  description text,
  icon_name text,
  color_hex text,
  industry_verticals industry_vertical[] DEFAULT ARRAY['universal']::industry_vertical[],
  display_order integer DEFAULT 0,
  enabled boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create catalog tags for flexible categorization
CREATE TABLE IF NOT EXISTS catalog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_name text NOT NULL UNIQUE,
  tag_type text NOT NULL DEFAULT 'general', -- general, industry, compliance, feature
  description text,
  color_hex text,
  created_at timestamptz DEFAULT now()
);

-- Junction table for catalog item tags
CREATE TABLE IF NOT EXISTS catalog_item_tags (
  catalog_item_id uuid NOT NULL REFERENCES production_advancing_catalog(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES catalog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (catalog_item_id, tag_id)
);

-- Catalog pricing tiers for volume discounts
CREATE TABLE IF NOT EXISTS catalog_pricing_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_item_id uuid NOT NULL REFERENCES production_advancing_catalog(id) ON DELETE CASCADE,
  min_quantity numeric(10,2) NOT NULL,
  max_quantity numeric(10,2),
  price_per_unit numeric(12,2) NOT NULL,
  currency text DEFAULT 'USD',
  effective_from date,
  effective_to date,
  created_at timestamptz DEFAULT now()
);

-- Catalog compliance requirements
CREATE TABLE IF NOT EXISTS catalog_compliance_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_item_id uuid NOT NULL REFERENCES production_advancing_catalog(id) ON DELETE CASCADE,
  requirement_type text NOT NULL, -- certification, license, permit, insurance, training
  requirement_name text NOT NULL,
  description text,
  issuing_authority text,
  validity_period_days integer,
  renewal_required boolean DEFAULT false,
  documentation_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Catalog vendor associations
CREATE TABLE IF NOT EXISTS catalog_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name text NOT NULL,
  vendor_code text UNIQUE,
  contact_email text,
  contact_phone text,
  website text,
  regions text[],
  certifications text[],
  rating numeric(3,2),
  preferred boolean DEFAULT false,
  enabled boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Junction table for catalog item vendors
CREATE TABLE IF NOT EXISTS catalog_item_vendors (
  catalog_item_id uuid NOT NULL REFERENCES production_advancing_catalog(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES catalog_vendors(id) ON DELETE CASCADE,
  vendor_sku text,
  vendor_price numeric(12,2),
  lead_time_days integer,
  min_order_quantity numeric(10,2),
  preferred boolean DEFAULT false,
  PRIMARY KEY (catalog_item_id, vendor_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_catalog_industry ON production_advancing_catalog USING GIN (industry_verticals);
CREATE INDEX IF NOT EXISTS idx_catalog_procurement ON production_advancing_catalog(procurement_type);
CREATE INDEX IF NOT EXISTS idx_catalog_featured ON production_advancing_catalog(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_catalog_keywords ON production_advancing_catalog USING GIN (search_keywords);
CREATE INDEX IF NOT EXISTS idx_catalog_price_range ON production_advancing_catalog(base_price_low, base_price_high);
CREATE INDEX IF NOT EXISTS idx_catalog_categories_parent ON catalog_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_catalog_categories_code ON catalog_categories(category_code);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_item ON catalog_pricing_tiers(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_compliance_item ON catalog_compliance_requirements(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_item_vendors_item ON catalog_item_vendors(catalog_item_id);
CREATE INDEX IF NOT EXISTS idx_item_vendors_vendor ON catalog_item_vendors(vendor_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger for new tables
CREATE TRIGGER catalog_categories_updated_at
  BEFORE UPDATE ON catalog_categories
  FOR EACH ROW EXECUTE FUNCTION update_production_advancing_updated_at();

CREATE TRIGGER catalog_vendors_updated_at
  BEFORE UPDATE ON catalog_vendors
  FOR EACH ROW EXECUTE FUNCTION update_production_advancing_updated_at();

-- ============================================================================
-- POPULATE CATEGORY HIERARCHY
-- ============================================================================

INSERT INTO catalog_categories (category_code, category_name, description, icon_name, display_order) VALUES
-- Technical Categories
('TECH', 'Technical', 'Technical equipment and services', 'settings', 1),
('TECH-AUD', 'Audio', 'Sound systems, microphones, and audio equipment', 'volume-2', 10),
('TECH-LGT', 'Lighting', 'Lighting fixtures, control, and effects', 'lightbulb', 20),
('TECH-VID', 'Video', 'Screens, projectors, cameras, and video systems', 'monitor', 30),
('TECH-BCK', 'Backline', 'Musical instruments and amplification', 'music', 40),
('TECH-STG', 'Staging', 'Stage decks, risers, and platforms', 'square', 50),
('TECH-RIG', 'Rigging', 'Hoists, truss, and rigging hardware', 'anchor', 60),
('TECH-PWR', 'Power Distribution', 'Generators, distribution, and cabling', 'zap', 70),
('TECH-CRW', 'Crew & Management', 'Technical personnel and management', 'users', 80),
('TECH-COM', 'Communications', 'IT, networking, and radio systems', 'radio', 90),

-- Production Categories
('PROD', 'Production', 'Production services and personnel', 'film', 2),
('PROD-EVT', 'Event Production', 'Event producers and coordinators', 'calendar', 100),
('PROD-CRE', 'Creative Direction', 'Creative and design services', 'palette', 110),
('PROD-TAL', 'Talent Management', 'Talent booking and management', 'star', 120),
('PROD-CNT', 'Content Production', 'Video, photo, and media production', 'camera', 130),

-- Equipment Categories
('EQUIP', 'Equipment', 'General equipment and tools', 'tool', 3),
('EQUIP-GEN', 'General Equipment', 'Hand tools, power tools, and supplies', 'wrench', 140),
('EQUIP-TST', 'Test Equipment', 'Meters, testers, and analyzers', 'activity', 150),
('EQUIP-SFT', 'Safety Equipment', 'PPE, fall protection, and safety gear', 'shield', 160),

-- Site Infrastructure Categories
('SITE', 'Site Infrastructure', 'Structures, facilities, and site services', 'building', 4),
('SITE-STR', 'Structures', 'Stages, scaffolding, and temporary structures', 'home', 170),
('SITE-TNT', 'Tents & Canopies', 'Temporary covered structures', 'umbrella', 180),
('SITE-FAC', 'Facilities', 'Restrooms, showers, and mobile offices', 'building-2', 190),
('SITE-FLR', 'Flooring', 'Event flooring and ground protection', 'grid', 200),
('SITE-BAR', 'Barriers & Fencing', 'Crowd control and perimeter security', 'minus-square', 210),

-- Hospitality Categories
('HOSP', 'Hospitality', 'Food, beverage, and guest services', 'coffee', 5),
('HOSP-CAT', 'Catering', 'Food service and catering equipment', 'utensils', 220),
('HOSP-BEV', 'Beverage', 'Bar service and beverage equipment', 'glass-water', 230),
('HOSP-GST', 'Guest Services', 'Registration, concierge, and VIP services', 'user-check', 240),

-- Transportation Categories
('TRANS', 'Transportation', 'Vehicles, logistics, and freight', 'truck', 6),
('TRANS-VEH', 'Vehicles', 'Trucks, vans, carts, and specialty vehicles', 'car', 250),
('TRANS-LOG', 'Logistics', 'Freight, shipping, and customs', 'package', 260),

-- Safety & Security Categories
('SAFE', 'Safety & Security', 'Security personnel and safety services', 'shield-check', 7),
('SAFE-PER', 'Security Personnel', 'Guards, crowd management, and access control', 'user-shield', 270),
('SAFE-EQP', 'Security Equipment', 'Surveillance, screening, and detection', 'eye', 280),
('SAFE-MED', 'Medical Services', 'First aid, EMTs, and medical facilities', 'heart-pulse', 290),

-- Signage & Branding Categories
('SIGN', 'Signage & Branding', 'Visual communications and branding', 'flag', 8),
('SIGN-BAN', 'Banners & Displays', 'Banners, flags, and display systems', 'image', 300),
('SIGN-WAY', 'Wayfinding', 'Directional signage and navigation', 'map-pin', 310),
('SIGN-DIG', 'Digital Signage', 'LED displays and digital messaging', 'tv', 320),

-- Furniture & Décor Categories
('FURN', 'Furniture & Décor', 'Furnishings, linens, and decorations', 'armchair', 9),
('FURN-SEA', 'Seating', 'Chairs, sofas, and seating arrangements', 'sofa', 330),
('FURN-TAB', 'Tables', 'Tables, counters, and work surfaces', 'table', 340),
('FURN-LIN', 'Linens & Soft Goods', 'Tablecloths, draping, and fabrics', 'shirt', 350),
('FURN-DEC', 'Décor & Florals', 'Decorations, florals, and centerpieces', 'flower', 360),

-- Climate Control Categories
('CLIM', 'Climate Control', 'HVAC, heating, and cooling systems', 'thermometer', 10),
('CLIM-HVA', 'HVAC Systems', 'Air conditioning and heating units', 'wind', 370),
('CLIM-POR', 'Portable Climate', 'Fans, heaters, and spot coolers', 'fan', 380),

-- Waste Management Categories
('WASTE', 'Waste Management', 'Waste disposal and cleaning services', 'trash-2', 11),
('WASTE-COL', 'Waste Collection', 'Bins, dumpsters, and recycling', 'recycle', 390),
('WASTE-CLN', 'Cleaning Services', 'Janitorial and cleaning crews', 'sparkles', 400),

-- Permits & Compliance Categories
('PERMIT', 'Permits & Compliance', 'Licenses, permits, and regulatory compliance', 'file-check', 12),
('PERMIT-LIC', 'Licenses & Permits', 'Event permits and operational licenses', 'badge', 410),
('PERMIT-INS', 'Insurance', 'Liability, equipment, and event insurance', 'shield-plus', 420),

-- Professional Services Categories
('PROF', 'Professional Services', 'Consulting and professional services', 'briefcase', 13),
('PROF-LEG', 'Legal Services', 'Contracts, compliance, and legal counsel', 'scale', 430),
('PROF-ACC', 'Accounting', 'Financial services and bookkeeping', 'calculator', 440),
('PROF-CON', 'Consulting', 'Strategy, planning, and advisory', 'lightbulb', 450),

-- Marketing & Promotion Categories
('MKTG', 'Marketing & Promotion', 'Marketing materials and promotional services', 'megaphone', 14),
('MKTG-PRT', 'Print Materials', 'Brochures, programs, and printed collateral', 'printer', 460),
('MKTG-DIG', 'Digital Marketing', 'Social media, email, and digital campaigns', 'globe', 470),
('MKTG-MER', 'Merchandise', 'Branded merchandise and giveaways', 'gift', 480),

-- Technology Services Categories
('TECH-SVC', 'Technology Services', 'Software, apps, and digital services', 'laptop', 15),
('TECH-REG', 'Registration Systems', 'Ticketing and registration platforms', 'ticket', 490),
('TECH-APP', 'Event Apps', 'Mobile apps and digital experiences', 'smartphone', 500),
('TECH-ANA', 'Analytics', 'Data collection and reporting', 'bar-chart', 510),

-- Staffing Categories
('STAFF', 'Staffing', 'Personnel and labor services', 'users', 16),
('STAFF-GEN', 'General Labor', 'Setup, teardown, and general assistance', 'hard-hat', 520),
('STAFF-SPE', 'Specialized Staff', 'Interpreters, photographers, stylists', 'user-cog', 530),
('STAFF-VOL', 'Volunteer Coordination', 'Volunteer management and training', 'heart-handshake', 540)
ON CONFLICT (category_code) DO UPDATE SET
  category_name = EXCLUDED.category_name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  display_order = EXCLUDED.display_order;

-- Set parent relationships
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'TECH') WHERE category_code LIKE 'TECH-%' AND category_code != 'TECH' AND category_code NOT LIKE 'TECH-SVC%';
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'PROD') WHERE category_code LIKE 'PROD-%';
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'EQUIP') WHERE category_code LIKE 'EQUIP-%';
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'SITE') WHERE category_code LIKE 'SITE-%';
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'HOSP') WHERE category_code LIKE 'HOSP-%';
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'TRANS') WHERE category_code LIKE 'TRANS-%';
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'SAFE') WHERE category_code LIKE 'SAFE-%';
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'SIGN') WHERE category_code LIKE 'SIGN-%';
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'FURN') WHERE category_code LIKE 'FURN-%';
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'CLIM') WHERE category_code LIKE 'CLIM-%';
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'WASTE') WHERE category_code LIKE 'WASTE-%';
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'PERMIT') WHERE category_code LIKE 'PERMIT-%';
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'PROF') WHERE category_code LIKE 'PROF-%';
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'MKTG') WHERE category_code LIKE 'MKTG-%';
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'TECH-SVC') WHERE category_code IN ('TECH-REG', 'TECH-APP', 'TECH-ANA');
UPDATE catalog_categories SET parent_category_id = (SELECT id FROM catalog_categories WHERE category_code = 'STAFF') WHERE category_code LIKE 'STAFF-%';

-- ============================================================================
-- POPULATE COMMON TAGS
-- ============================================================================

INSERT INTO catalog_tags (tag_name, tag_type, description, color_hex) VALUES
-- Industry tags
('events', 'industry', 'Live events and entertainment', '#8B5CF6'),
('corporate', 'industry', 'Corporate meetings and conferences', '#3B82F6'),
('construction', 'industry', 'Construction and building', '#F59E0B'),
('healthcare', 'industry', 'Healthcare and medical', '#EF4444'),
('hospitality', 'industry', 'Hotels, restaurants, and venues', '#EC4899'),
('film-tv', 'industry', 'Film and television production', '#6366F1'),
('retail', 'industry', 'Retail and pop-up experiences', '#14B8A6'),
('sports', 'industry', 'Sports and athletics', '#22C55E'),

-- Compliance tags
('osha-compliant', 'compliance', 'OSHA safety compliant', '#DC2626'),
('ada-accessible', 'compliance', 'ADA accessibility compliant', '#2563EB'),
('fire-rated', 'compliance', 'Fire safety rated', '#EA580C'),
('food-safe', 'compliance', 'Food safety certified', '#16A34A'),
('ul-listed', 'compliance', 'UL safety listed', '#7C3AED'),

-- Feature tags
('eco-friendly', 'feature', 'Environmentally sustainable', '#059669'),
('quick-deploy', 'feature', 'Rapid setup and deployment', '#0891B2'),
('weatherproof', 'feature', 'Weather resistant', '#64748B'),
('modular', 'feature', 'Modular and configurable', '#8B5CF6'),
('wireless', 'feature', 'Wireless operation', '#06B6D4'),
('battery-powered', 'feature', 'Battery operated', '#84CC16'),
('heavy-duty', 'feature', 'Heavy duty/industrial grade', '#78716C'),
('premium', 'feature', 'Premium/luxury tier', '#D97706'),
('budget-friendly', 'feature', 'Cost-effective option', '#10B981'),

-- General tags
('essential', 'general', 'Essential/must-have item', '#EF4444'),
('popular', 'general', 'Frequently requested', '#F59E0B'),
('new', 'general', 'Recently added to catalog', '#8B5CF6'),
('seasonal', 'general', 'Seasonal availability', '#06B6D4')
ON CONFLICT (tag_name) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE catalog_categories IS 'Hierarchical category structure for organizing catalog items';
COMMENT ON TABLE catalog_tags IS 'Flexible tagging system for catalog items';
COMMENT ON TABLE catalog_item_tags IS 'Many-to-many relationship between catalog items and tags';
COMMENT ON TABLE catalog_pricing_tiers IS 'Volume-based pricing tiers for catalog items';
COMMENT ON TABLE catalog_compliance_requirements IS 'Regulatory and compliance requirements for catalog items';
COMMENT ON TABLE catalog_vendors IS 'Approved vendors for catalog items';
COMMENT ON TABLE catalog_item_vendors IS 'Vendor-specific pricing and availability for catalog items';

COMMENT ON COLUMN production_advancing_catalog.industry_verticals IS 'Industries this item applies to';
COMMENT ON COLUMN production_advancing_catalog.procurement_type IS 'How this item is typically procured';
COMMENT ON COLUMN production_advancing_catalog.typical_lead_time IS 'Standard lead time for procurement';
COMMENT ON COLUMN production_advancing_catalog.requires_certification IS 'Whether operators need certification';
COMMENT ON COLUMN production_advancing_catalog.hazard_class IS 'Hazardous materials classification if applicable';
COMMENT ON COLUMN production_advancing_catalog.sustainability_rating IS 'Environmental sustainability rating';
COMMENT ON COLUMN production_advancing_catalog.search_keywords IS 'Additional keywords for search optimization';
