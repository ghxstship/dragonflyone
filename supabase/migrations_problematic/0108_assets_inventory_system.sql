-- Migration: Assets & Inventory System
-- Description: Tables for asset tracking, inventory management, and depreciation

-- Assets table (enhanced)
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  asset_tag TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  type TEXT,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  barcode TEXT,
  qr_code TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'reserved', 'maintenance', 'repair', 'retired', 'lost', 'damaged')),
  condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor', 'broken')),
  location TEXT,
  warehouse_id UUID,
  room TEXT,
  shelf TEXT,
  bin TEXT,
  purchase_date DATE,
  purchase_price NUMERIC(15,2),
  vendor_id UUID ,
  warranty_expiration DATE,
  expected_life_years INT,
  salvage_value NUMERIC(15,2),
  current_value NUMERIC(15,2),
  depreciation_method TEXT CHECK (depreciation_method IN ('straight_line', 'declining_balance', 'units_of_production', 'none')),
  last_depreciation_date DATE,
  replacement_cost NUMERIC(15,2),
  insurance_value NUMERIC(15,2),
  insurance_policy TEXT,
  weight_lbs NUMERIC(10,2),
  dimensions JSONB,
  power_requirements TEXT,
  rental_rate_daily NUMERIC(10,2),
  rental_rate_weekly NUMERIC(10,2),
  rental_rate_monthly NUMERIC(10,2),
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_interval_days INT,
  maintenance_count INT DEFAULT 0,
  total_usage_hours NUMERIC(10,2) DEFAULT 0,
  photos TEXT[],
  documents TEXT[],
  notes TEXT,
  custom_fields JSONB,
  is_rentable BOOLEAN DEFAULT false,
  is_consumable BOOLEAN DEFAULT false,
  quantity INT DEFAULT 1,
  minimum_quantity INT DEFAULT 0,
  reorder_point INT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, asset_tag)
);

CREATE INDEX IF NOT EXISTS idx_assets_org ON assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_assets_tag ON assets(asset_tag);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_location ON assets(location);
CREATE INDEX IF NOT EXISTS idx_assets_serial ON assets(serial_number);
CREATE INDEX IF NOT EXISTS idx_assets_barcode ON assets(barcode);

-- Asset categories table
CREATE TABLE IF NOT EXISTS asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES asset_categories(id),
  description TEXT,
  default_depreciation_method TEXT,
  default_life_years INT,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name, parent_id)
);

CREATE INDEX IF NOT EXISTS idx_asset_categories_org ON asset_categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_categories_parent ON asset_categories(parent_id);

-- Asset checkouts table
CREATE TABLE IF NOT EXISTS asset_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  checked_out_to UUID REFERENCES platform_users(id),
  checked_out_by UUID NOT NULL REFERENCES platform_users(id),
  checkout_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expected_return_date TIMESTAMPTZ,
  actual_return_date TIMESTAMPTZ,
  returned_by UUID REFERENCES platform_users(id),
  condition_on_checkout TEXT,
  condition_on_return TEXT,
  checkout_notes TEXT,
  return_notes TEXT,
  status TEXT NOT NULL DEFAULT 'checked_out' CHECK (status IN ('checked_out', 'returned', 'overdue', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_checkouts_asset ON asset_checkouts(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_checkouts_project ON asset_checkouts(project_id);
CREATE INDEX IF NOT EXISTS idx_asset_checkouts_user ON asset_checkouts(checked_out_to);
CREATE INDEX IF NOT EXISTS idx_asset_checkouts_status ON asset_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_asset_checkouts_date ON asset_checkouts(checkout_date);

-- Asset reservations table
CREATE TABLE IF NOT EXISTS asset_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  reserved_by UUID NOT NULL REFERENCES platform_users(id),
  reserved_for UUID REFERENCES platform_users(id),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_asset_reservations_asset ON asset_reservations(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_reservations_dates ON asset_reservations(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_asset_reservations_status ON asset_reservations(status);

-- Asset maintenance records table
CREATE TABLE IF NOT EXISTS asset_maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'inspection', 'calibration', 'cleaning', 'repair', 'upgrade')),
  description TEXT NOT NULL,
  performed_by UUID REFERENCES platform_users(id),
  vendor_id UUID ,
  maintenance_date DATE NOT NULL,
  completion_date DATE,
  labor_hours NUMERIC(6,2),
  labor_cost NUMERIC(10,2),
  parts_cost NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  parts_used JSONB,
  condition_before TEXT,
  condition_after TEXT,
  notes TEXT,
  next_maintenance_date DATE,
  documents TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_maintenance_records_asset ON asset_maintenance_records(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_records_date ON asset_maintenance_records(maintenance_date);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_records_type ON asset_maintenance_records(maintenance_type);

-- Asset depreciation records table
CREATE TABLE IF NOT EXISTS asset_depreciation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  depreciation_date DATE NOT NULL,
  depreciation_amount NUMERIC(15,2) NOT NULL,
  accumulated_depreciation NUMERIC(15,2) NOT NULL,
  book_value NUMERIC(15,2) NOT NULL,
  depreciation_method TEXT NOT NULL,
  fiscal_year INT,
  fiscal_period INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_depreciation_records_asset ON asset_depreciation_records(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_depreciation_records_date ON asset_depreciation_records(depreciation_date);

-- Asset transfers table
CREATE TABLE IF NOT EXISTS asset_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  from_location TEXT,
  to_location TEXT,
  from_warehouse_id UUID,
  to_warehouse_id UUID,
  transfer_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT,
  transferred_by UUID NOT NULL REFERENCES platform_users(id),
  received_by UUID REFERENCES platform_users(id),
  received_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_transit' CHECK (status IN ('pending', 'in_transit', 'received', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_transfers_asset ON asset_transfers(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_transfers_date ON asset_transfers(transfer_date);
CREATE INDEX IF NOT EXISTS idx_asset_transfers_status ON asset_transfers(status);

-- Function to update asset status on checkout
CREATE OR REPLACE FUNCTION update_asset_on_checkout()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE assets SET
      status = 'checked_out',
      updated_at = NOW()
    WHERE id = NEW.asset_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'returned' AND OLD.status = 'checked_out' THEN
    UPDATE assets SET
      status = 'available',
      condition = COALESCE(NEW.condition_on_return, condition),
      updated_at = NOW()
    WHERE id = NEW.asset_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS asset_checkout_status_trigger ON asset_checkouts;
CREATE TRIGGER asset_checkout_status_trigger
  AFTER INSERT OR UPDATE ON asset_checkouts
  FOR EACH ROW
  EXECUTE FUNCTION update_asset_on_checkout();

-- Function to calculate depreciation
CREATE OR REPLACE FUNCTION calculate_asset_depreciation(
  p_asset_id UUID,
  p_depreciation_date DATE DEFAULT CURRENT_DATE
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_asset RECORD;
  v_depreciation NUMERIC;
  v_years_owned NUMERIC;
  v_accumulated NUMERIC;
BEGIN
  SELECT * INTO v_asset FROM assets WHERE id = p_asset_id;
  
  IF NOT FOUND OR v_asset.depreciation_method IS NULL OR v_asset.depreciation_method = 'none' THEN
    RETURN 0;
  END IF;
  
  v_years_owned := EXTRACT(YEAR FROM AGE(p_depreciation_date, v_asset.purchase_date));
  
  SELECT COALESCE(SUM(depreciation_amount), 0) INTO v_accumulated
  FROM asset_depreciation_records
  WHERE asset_id = p_asset_id;
  
  IF v_asset.depreciation_method = 'straight_line' THEN
    v_depreciation := (v_asset.purchase_price - COALESCE(v_asset.salvage_value, 0)) / COALESCE(v_asset.expected_life_years, 5);
  ELSIF v_asset.depreciation_method = 'declining_balance' THEN
    v_depreciation := (v_asset.purchase_price - v_accumulated) * (2.0 / COALESCE(v_asset.expected_life_years, 5));
  ELSE
    v_depreciation := 0;
  END IF;
  
  -- Don't depreciate below salvage value
  IF (v_accumulated + v_depreciation) > (v_asset.purchase_price - COALESCE(v_asset.salvage_value, 0)) THEN
    v_depreciation := v_asset.purchase_price - COALESCE(v_asset.salvage_value, 0) - v_accumulated;
  END IF;
  
  RETURN GREATEST(v_depreciation, 0);
END;
$$;

-- Function to get asset availability
CREATE OR REPLACE FUNCTION check_asset_availability(
  p_asset_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_asset RECORD;
BEGIN
  SELECT * INTO v_asset FROM assets WHERE id = p_asset_id;
  
  IF NOT FOUND OR v_asset.status NOT IN ('available', 'reserved') THEN
    RETURN FALSE;
  END IF;
  
  -- Check for conflicting reservations
  IF EXISTS (
    SELECT 1 FROM asset_reservations
    WHERE asset_id = p_asset_id
      AND status IN ('pending', 'confirmed')
      AND (start_date, end_date) OVERLAPS (p_start_date, p_end_date)
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Check for active checkouts
  IF EXISTS (
    SELECT 1 FROM asset_checkouts
    WHERE asset_id = p_asset_id
      AND status = 'checked_out'
      AND (checkout_date <= p_end_date AND (expected_return_date IS NULL OR expected_return_date >= p_start_date))
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- RLS policies
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_depreciation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_transfers ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON asset_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE ON asset_checkouts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON asset_reservations TO authenticated;
GRANT SELECT, INSERT ON asset_maintenance_records TO authenticated;
GRANT SELECT, INSERT ON asset_depreciation_records TO authenticated;
GRANT SELECT, INSERT, UPDATE ON asset_transfers TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_asset_depreciation(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION check_asset_availability(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
