-- Migration: Enrich Venues and Add Zones System
-- Description: Enhanced venue details and zone-based access control from ExperienceGeneratorSchema

-- Add venue type enum
DO $$ BEGIN
  CREATE TYPE venue_type_enum AS ENUM (
    'warehouse', 'theater', 'arena', 'stadium', 'outdoor', 
    'convention', 'hotel', 'restaurant', 'club', 'custom', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add zone type enum
DO $$ BEGIN
  CREATE TYPE zone_type_enum AS ENUM (
    'public', 'vip', 'backstage', 'production', 'operations', 
    'restricted', 'loading', 'parking', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Enrich venues table
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS venue_type_enum venue_type_enum,
  ADD COLUMN IF NOT EXISTS address_line_2 TEXT,
  ADD COLUMN IF NOT EXISTS total_sqft INTEGER,
  ADD COLUMN IF NOT EXISTS max_capacity INTEGER,
  ADD COLUMN IF NOT EXISTS loading_dock BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS loading_dock_height_ft NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS parking_spaces INTEGER,
  ADD COLUMN IF NOT EXISTS ada_accessible BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS ada_notes TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS technical_specs JSONB,
  ADD COLUMN IF NOT EXISTS power_capacity TEXT,
  ADD COLUMN IF NOT EXISTS rigging_capacity TEXT,
  ADD COLUMN IF NOT EXISTS curfew_time TIME,
  ADD COLUMN IF NOT EXISTS noise_restrictions TEXT,
  ADD COLUMN IF NOT EXISTS insurance_requirements TEXT,
  ADD COLUMN IF NOT EXISTS union_requirements TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add indexes for venues
CREATE INDEX IF NOT EXISTS idx_venues_venue_type ON venues(venue_type_enum);
CREATE INDEX IF NOT EXISTS idx_venues_capacity ON venues(max_capacity);
CREATE INDEX IF NOT EXISTS idx_venues_deleted ON venues(deleted_at) WHERE deleted_at IS NULL;

-- Create zones table
CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code VARCHAR(20),
  zone_type zone_type_enum,
  description TEXT,
  sqft INTEGER,
  capacity INTEGER,
  access_level INTEGER DEFAULT 1 CHECK (access_level BETWEEN 1 AND 10),
  color VARCHAR(7),
  sort_order INTEGER DEFAULT 0,
  floor_number INTEGER,
  parent_zone_id UUID REFERENCES zones(id),
  coordinates JSONB,
  amenities JSONB DEFAULT '[]',
  restrictions TEXT[],
  emergency_exits INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT zone_venue_or_production CHECK (venue_id IS NOT NULL OR production_id IS NOT NULL)
);

-- Add indexes for zones
CREATE INDEX IF NOT EXISTS idx_zones_venue ON zones(venue_id);
CREATE INDEX IF NOT EXISTS idx_zones_production ON zones(production_id);
CREATE INDEX IF NOT EXISTS idx_zones_type ON zones(zone_type);
CREATE INDEX IF NOT EXISTS idx_zones_access_level ON zones(access_level);
CREATE INDEX IF NOT EXISTS idx_zones_parent ON zones(parent_zone_id);

-- Add comments
COMMENT ON TABLE zones IS 'Physical zones within venues or productions for access control and operations';
COMMENT ON COLUMN zones.access_level IS 'Access level required (1=public, 10=highest security)';
COMMENT ON COLUMN zones.coordinates IS 'GeoJSON or custom coordinate system for mapping';
COMMENT ON COLUMN venues.technical_specs IS 'Technical specifications: power, rigging, audio, lighting capabilities';
COMMENT ON COLUMN venues.amenities IS 'Available amenities: green rooms, catering, wifi, etc.';

-- Function to get venue with zones
CREATE OR REPLACE FUNCTION get_venue_with_zones(p_venue_id UUID)
RETURNS TABLE (
  venue_id UUID,
  venue_name TEXT,
  venue_type venue_type_enum,
  total_sqft INTEGER,
  max_capacity INTEGER,
  zone_count INTEGER,
  zones JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.name,
    v.venue_type_enum,
    v.total_sqft,
    v.max_capacity,
    COUNT(z.id)::INTEGER AS zone_count,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', z.id,
          'name', z.name,
          'code', z.code,
          'zone_type', z.zone_type,
          'capacity', z.capacity,
          'access_level', z.access_level,
          'color', z.color
        ) ORDER BY z.sort_order
      ) FILTER (WHERE z.id IS NOT NULL),
      '[]'::JSONB
    ) AS zones
  FROM venues v
  LEFT JOIN zones z ON z.venue_id = v.id
  WHERE v.id = p_venue_id
    AND v.deleted_at IS NULL
  GROUP BY v.id;
END;
$$;

-- Function to get zones for a production
CREATE OR REPLACE FUNCTION get_production_zones(p_production_id UUID)
RETURNS TABLE (
  zone_id UUID,
  zone_name TEXT,
  zone_code VARCHAR(20),
  zone_type zone_type_enum,
  capacity INTEGER,
  access_level INTEGER,
  parent_zone_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    z.id,
    z.name,
    z.code,
    z.zone_type,
    z.capacity,
    z.access_level,
    pz.name AS parent_zone_name
  FROM zones z
  LEFT JOIN zones pz ON z.parent_zone_id = pz.id
  WHERE z.production_id = p_production_id
  ORDER BY z.access_level DESC, z.sort_order;
END;
$$;

-- Trigger for zones updated_at
CREATE OR REPLACE FUNCTION update_zones_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS zones_updated_at_trigger ON zones;
CREATE TRIGGER zones_updated_at_trigger
  BEFORE UPDATE ON zones
  FOR EACH ROW
  EXECUTE FUNCTION update_zones_timestamp();

-- RLS for zones
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY zones_select_policy ON zones
  FOR SELECT
  TO authenticated
  USING (
    venue_id IN (SELECT id FROM venues WHERE organization_id IS NULL OR org_matches(organization_id))
    OR production_id IN (SELECT id FROM productions WHERE org_matches(organization_id))
  );

CREATE POLICY zones_manage_policy ON zones
  FOR ALL
  TO authenticated
  USING (
    role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN')
    AND (
      venue_id IN (SELECT id FROM venues WHERE organization_id IS NULL OR org_matches(organization_id))
      OR production_id IN (SELECT id FROM productions WHERE org_matches(organization_id))
    )
  )
  WITH CHECK (
    role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON zones TO authenticated;
GRANT EXECUTE ON FUNCTION get_venue_with_zones(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_production_zones(UUID) TO authenticated;
