-- Migration: Serialized Component Tracking System
-- Description: Track individual serialized components within assets with full lifecycle management

-- Serialized components table
CREATE TABLE IF NOT EXISTS serialized_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  serial_number VARCHAR(100) NOT NULL UNIQUE,
  component_type VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(255),
  model VARCHAR(255),
  part_number VARCHAR(100),
  firmware_version VARCHAR(50),
  hardware_revision VARCHAR(50),
  manufacture_date DATE,
  purchase_date DATE,
  warranty_expiration DATE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'in_repair', 'retired', 'lost', 'disposed')),
  condition VARCHAR(50) DEFAULT 'good' CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor', 'non_functional')),
  location_id UUID REFERENCES asset_locations(id),
  parent_component_id UUID REFERENCES serialized_components(id),
  specifications JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  updated_by UUID REFERENCES platform_users(id)
);

-- Component service history
CREATE TABLE IF NOT EXISTS component_service_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES serialized_components(id) ON DELETE CASCADE,
  service_type VARCHAR(100) NOT NULL CHECK (service_type IN ('repair', 'maintenance', 'calibration', 'firmware_update', 'inspection', 'replacement', 'refurbishment')),
  service_date DATE NOT NULL,
  service_provider VARCHAR(255),
  technician_name VARCHAR(255),
  description TEXT,
  parts_replaced JSONB DEFAULT '[]',
  labor_hours DECIMAL(10,2),
  cost DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  invoice_number VARCHAR(100),
  warranty_claim BOOLEAN DEFAULT FALSE,
  next_service_date DATE,
  service_notes TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Component transfers/movements
CREATE TABLE IF NOT EXISTS component_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES serialized_components(id) ON DELETE CASCADE,
  from_asset_id UUID REFERENCES assets(id),
  to_asset_id UUID REFERENCES assets(id),
  from_location_id UUID REFERENCES asset_locations(id),
  to_location_id UUID REFERENCES asset_locations(id),
  transfer_type VARCHAR(50) NOT NULL CHECK (transfer_type IN ('installation', 'removal', 'relocation', 'swap', 'loan', 'return')),
  transfer_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT,
  authorized_by UUID REFERENCES platform_users(id),
  performed_by UUID REFERENCES platform_users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Component compatibility matrix
CREATE TABLE IF NOT EXISTS component_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_type VARCHAR(100) NOT NULL,
  compatible_with_type VARCHAR(100) NOT NULL,
  compatibility_level VARCHAR(50) DEFAULT 'full' CHECK (compatibility_level IN ('full', 'partial', 'conditional', 'not_recommended')),
  notes TEXT,
  firmware_requirements JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(component_type, compatible_with_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_serialized_components_asset ON serialized_components(asset_id);
CREATE INDEX IF NOT EXISTS idx_serialized_components_serial ON serialized_components(serial_number);
CREATE INDEX IF NOT EXISTS idx_serialized_components_status ON serialized_components(status);
CREATE INDEX IF NOT EXISTS idx_serialized_components_type ON serialized_components(component_type);
CREATE INDEX IF NOT EXISTS idx_component_service_component ON component_service_history(component_id);
CREATE INDEX IF NOT EXISTS idx_component_service_date ON component_service_history(service_date);
CREATE INDEX IF NOT EXISTS idx_component_transfers_component ON component_transfers(component_id);
CREATE INDEX IF NOT EXISTS idx_component_transfers_date ON component_transfers(transfer_date);

-- RLS Policies
ALTER TABLE serialized_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_service_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_compatibility ENABLE ROW LEVEL SECURITY;

-- Serialized components policies
CREATE POLICY "serialized_components_select" ON serialized_components
  FOR SELECT USING (true);

CREATE POLICY "serialized_components_insert" ON serialized_components
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "serialized_components_update" ON serialized_components
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "serialized_components_delete" ON serialized_components
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Service history policies
CREATE POLICY "component_service_history_select" ON component_service_history
  FOR SELECT USING (true);

CREATE POLICY "component_service_history_insert" ON component_service_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Transfer policies
CREATE POLICY "component_transfers_select" ON component_transfers
  FOR SELECT USING (true);

CREATE POLICY "component_transfers_insert" ON component_transfers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Compatibility policies
CREATE POLICY "component_compatibility_select" ON component_compatibility
  FOR SELECT USING (true);

CREATE POLICY "component_compatibility_manage" ON component_compatibility
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_serialized_components_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER serialized_components_updated
  BEFORE UPDATE ON serialized_components
  FOR EACH ROW
  EXECUTE FUNCTION update_serialized_components_timestamp();
