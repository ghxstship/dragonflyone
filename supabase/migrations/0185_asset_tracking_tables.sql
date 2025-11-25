-- Migration: Asset Location Tracking Tables
-- Description: Tables for GPS/RFID asset tracking and warehouse management

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'USA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  capacity_sqft INTEGER,
  zones JSONB,
  contact_name VARCHAR(200),
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouse zones table
CREATE TABLE IF NOT EXISTS warehouse_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('storage', 'staging', 'maintenance', 'shipping', 'receiving')),
  capacity INTEGER,
  current_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset locations table (current location)
CREATE TABLE IF NOT EXISTS asset_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  location_type VARCHAR(30) NOT NULL CHECK (location_type IN ('gps', 'rfid', 'manual', 'warehouse', 'venue', 'transit')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  warehouse_id UUID REFERENCES warehouses(id),
  warehouse_zone VARCHAR(100),
  warehouse_shelf VARCHAR(50),
  venue_id UUID REFERENCES venues(id),
  project_id UUID REFERENCES projects(id),
  rfid_tag VARCHAR(100),
  notes TEXT,
  reported_by UUID REFERENCES platform_users(id),
  is_current BOOLEAN DEFAULT TRUE,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset location history table
CREATE TABLE IF NOT EXISTS asset_location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  location_type VARCHAR(30) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  warehouse_id UUID REFERENCES warehouses(id),
  warehouse_zone VARCHAR(100),
  venue_id UUID REFERENCES venues(id),
  project_id UUID REFERENCES projects(id),
  notes TEXT,
  reported_by UUID REFERENCES platform_users(id),
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset RFID tags table
CREATE TABLE IF NOT EXISTS asset_rfid_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  rfid_tag VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deactivated', 'lost')),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  last_scanned_at TIMESTAMPTZ
);

-- RFID scans table
CREATE TABLE IF NOT EXISTS rfid_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  rfid_tag VARCHAR(100) NOT NULL,
  scanner_id VARCHAR(100) NOT NULL,
  location_id UUID REFERENCES warehouse_zones(id),
  scan_type VARCHAR(30) NOT NULL CHECK (scan_type IN ('checkin', 'checkout', 'inventory', 'transit')),
  scanned_by UUID REFERENCES platform_users(id),
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asset location alerts table
CREATE TABLE IF NOT EXISTS asset_location_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES platform_users(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_asset_locations_asset ON asset_locations(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_locations_current ON asset_locations(is_current) WHERE is_current = TRUE;
CREATE INDEX IF NOT EXISTS idx_asset_locations_warehouse ON asset_locations(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_asset_locations_venue ON asset_locations(venue_id);
CREATE INDEX IF NOT EXISTS idx_asset_locations_project ON asset_locations(project_id);
CREATE INDEX IF NOT EXISTS idx_asset_location_history_asset ON asset_location_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_location_history_recorded ON asset_location_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_asset_rfid_tags_asset ON asset_rfid_tags(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_rfid_tags_tag ON asset_rfid_tags(rfid_tag);
CREATE INDEX IF NOT EXISTS idx_rfid_scans_asset ON rfid_scans(asset_id);
CREATE INDEX IF NOT EXISTS idx_rfid_scans_scanned_at ON rfid_scans(scanned_at);
CREATE INDEX IF NOT EXISTS idx_asset_location_alerts_asset ON asset_location_alerts(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_location_alerts_resolved ON asset_location_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_warehouse_zones_warehouse ON warehouse_zones(warehouse_id);

-- RLS Policies
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_rfid_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfid_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_location_alerts ENABLE ROW LEVEL SECURITY;

-- View policies for authenticated users
CREATE POLICY warehouses_view ON warehouses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY warehouse_zones_view ON warehouse_zones FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY asset_locations_view ON asset_locations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY asset_location_history_view ON asset_location_history FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY asset_rfid_tags_view ON asset_rfid_tags FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY rfid_scans_view ON rfid_scans FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY asset_location_alerts_view ON asset_location_alerts FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin manage policies
CREATE POLICY warehouses_admin ON warehouses FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

CREATE POLICY asset_locations_manage ON asset_locations FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('ATLVS_TEAM_MEMBER' = ANY(platform_roles) OR 'ATLVS_ADMIN' = ANY(platform_roles)))
);

-- Trigger to update warehouse zone counts
CREATE OR REPLACE FUNCTION update_zone_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_current = TRUE THEN
    UPDATE warehouse_zones 
    SET current_count = current_count + 1 
    WHERE warehouse_id = NEW.warehouse_id AND name = NEW.warehouse_zone;
  ELSIF TG_OP = 'UPDATE' AND OLD.is_current = TRUE AND NEW.is_current = FALSE THEN
    UPDATE warehouse_zones 
    SET current_count = current_count - 1 
    WHERE warehouse_id = OLD.warehouse_id AND name = OLD.warehouse_zone;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_zone_count
AFTER INSERT OR UPDATE ON asset_locations
FOR EACH ROW EXECUTE FUNCTION update_zone_count();
