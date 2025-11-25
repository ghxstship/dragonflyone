-- Migration: Equipment Management System
-- Description: Tables for equipment inventory, checkouts, maintenance, and warehouses

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  code TEXT,
  location TEXT,
  address JSONB,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  capacity_sqft INT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warehouses_org ON warehouses(organization_id);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('lighting', 'audio', 'video', 'staging', 'rigging', 'power', 'cables', 'cases', 'other')),
  subcategory TEXT,
  serial_number TEXT,
  barcode TEXT,
  manufacturer TEXT,
  model TEXT,
  location TEXT,
  warehouse_id UUID REFERENCES warehouses(id),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'maintenance', 'repair', 'retired', 'lost')),
  condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  purchase_date DATE,
  purchase_price NUMERIC(15,2),
  current_value NUMERIC(15,2),
  depreciation_rate NUMERIC(5,2),
  rental_rate_daily NUMERIC(10,2),
  rental_rate_weekly NUMERIC(10,2),
  weight_kg NUMERIC(10,2),
  dimensions JSONB,
  power_requirements TEXT,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_interval_days INT,
  warranty_expiration DATE,
  insurance_value NUMERIC(15,2),
  notes TEXT,
  tags TEXT[],
  photos TEXT[],
  manual_url TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_org ON equipment(organization_id);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_warehouse ON equipment(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_equipment_serial ON equipment(serial_number);
CREATE INDEX IF NOT EXISTS idx_equipment_barcode ON equipment(barcode);

-- Equipment checkouts table
CREATE TABLE IF NOT EXISTS equipment_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  checked_out_by UUID NOT NULL REFERENCES platform_users(id),
  checkout_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expected_return_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  returned_by UUID REFERENCES platform_users(id),
  checkout_condition TEXT,
  return_condition TEXT,
  checkout_notes TEXT,
  return_notes TEXT,
  damage_notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_checkouts_equipment ON equipment_checkouts(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_checkouts_project ON equipment_checkouts(project_id);
CREATE INDEX IF NOT EXISTS idx_equipment_checkouts_status ON equipment_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_equipment_checkouts_date ON equipment_checkouts(checkout_date);

-- Equipment maintenance table
CREATE TABLE IF NOT EXISTS equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('routine', 'repair', 'inspection', 'calibration', 'cleaning', 'upgrade')),
  description TEXT,
  scheduled_date DATE,
  completed_date DATE,
  performed_by UUID REFERENCES platform_users(id),
  vendor_id UUID ,
  cost NUMERIC(10,2),
  parts_used JSONB,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  next_maintenance_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_equipment ON equipment_maintenance(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_status ON equipment_maintenance(status);
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_date ON equipment_maintenance(scheduled_date);

-- Equipment kits/bundles table
CREATE TABLE IF NOT EXISTS equipment_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  rental_rate_daily NUMERIC(10,2),
  rental_rate_weekly NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment kit items table
CREATE TABLE IF NOT EXISTS equipment_kit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID NOT NULL REFERENCES equipment_kits(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  quantity INT DEFAULT 1,
  is_required BOOLEAN DEFAULT true,
  notes TEXT,
  UNIQUE(kit_id, equipment_id)
);

-- Equipment reservations table
CREATE TABLE IF NOT EXISTS equipment_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  reserved_by UUID NOT NULL REFERENCES platform_users(id),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_out', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_reservations_equipment ON equipment_reservations(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_reservations_dates ON equipment_reservations(start_date, end_date);

-- Function to check equipment availability
CREATE OR REPLACE FUNCTION check_equipment_availability(
  p_equipment_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_equipment_status TEXT;
  v_conflict_count INT;
BEGIN
  -- Check equipment status
  SELECT status INTO v_equipment_status FROM equipment WHERE id = p_equipment_id;
  
  IF v_equipment_status NOT IN ('available') THEN
    RETURN FALSE;
  END IF;
  
  -- Check for conflicting reservations
  SELECT COUNT(*) INTO v_conflict_count
  FROM equipment_reservations
  WHERE equipment_id = p_equipment_id
    AND status IN ('pending', 'confirmed')
    AND (start_date, end_date) OVERLAPS (p_start_date, p_end_date);
  
  -- Check for conflicting checkouts
  SELECT COUNT(*) INTO v_conflict_count
  FROM equipment_checkouts
  WHERE equipment_id = p_equipment_id
    AND status = 'active'
    AND (checkout_date <= p_end_date AND (expected_return_date IS NULL OR expected_return_date >= p_start_date));
  
  RETURN v_conflict_count = 0;
END;
$$;

-- Function to mark overdue checkouts
CREATE OR REPLACE FUNCTION mark_overdue_checkouts()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE equipment_checkouts SET
    status = 'overdue'
  WHERE status = 'active'
    AND expected_return_date < NOW();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- RLS policies
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_kit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_reservations ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON warehouses TO authenticated;
GRANT SELECT, INSERT, UPDATE ON equipment TO authenticated;
GRANT SELECT, INSERT, UPDATE ON equipment_checkouts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON equipment_maintenance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON equipment_kits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON equipment_kit_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON equipment_reservations TO authenticated;
GRANT EXECUTE ON FUNCTION check_equipment_availability(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_overdue_checkouts() TO authenticated;
