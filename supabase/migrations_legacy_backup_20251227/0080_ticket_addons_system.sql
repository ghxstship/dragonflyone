-- Migration: Ticket Add-ons System
-- Description: Tables for ticket add-ons, upgrades, and purchases

-- Ticket add-ons table
CREATE TABLE IF NOT EXISTS ticket_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('parking', 'merchandise', 'upgrade', 'fast_lane', 'lounge_access', 'food_beverage', 'vip_experience', 'meet_greet', 'photo_op', 'insurance', 'other')),
  subcategory TEXT,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  quantity_available INT,
  quantity_sold INT DEFAULT 0,
  quantity_reserved INT DEFAULT 0,
  min_per_order INT DEFAULT 1,
  max_per_order INT DEFAULT 10,
  requires_ticket BOOLEAN DEFAULT true,
  compatible_ticket_types UUID[],
  image_url TEXT,
  thumbnail_url TEXT,
  sku TEXT,
  sort_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  redemption_instructions TEXT,
  terms_conditions TEXT,
  metadata JSONB,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_addons_event ON ticket_addons(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_addons_category ON ticket_addons(category);
CREATE INDEX IF NOT EXISTS idx_ticket_addons_active ON ticket_addons(is_active);

-- Add-on purchases table
CREATE TABLE IF NOT EXISTS addon_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  addon_id UUID NOT NULL REFERENCES ticket_addons(id),
  order_id UUID REFERENCES orders(id),
  ticket_id UUID REFERENCES tickets(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'redeemed', 'cancelled', 'refunded')),
  redemption_code TEXT UNIQUE,
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID REFERENCES platform_users(id),
  redemption_location TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addon_purchases_addon ON addon_purchases(addon_id);
CREATE INDEX IF NOT EXISTS idx_addon_purchases_order ON addon_purchases(order_id);
CREATE INDEX IF NOT EXISTS idx_addon_purchases_ticket ON addon_purchases(ticket_id);
CREATE INDEX IF NOT EXISTS idx_addon_purchases_user ON addon_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_addon_purchases_status ON addon_purchases(status);
CREATE INDEX IF NOT EXISTS idx_addon_purchases_code ON addon_purchases(redemption_code);

-- Add-on bundles table
CREATE TABLE IF NOT EXISTS addon_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  addon_ids UUID[] NOT NULL,
  bundle_price NUMERIC(10,2) NOT NULL,
  regular_price NUMERIC(10,2) NOT NULL,
  savings NUMERIC(10,2) GENERATED ALWAYS AS (regular_price - bundle_price) STORED,
  savings_percent NUMERIC(5,2),
  quantity_available INT,
  quantity_sold INT DEFAULT 0,
  max_per_order INT DEFAULT 5,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addon_bundles_event ON addon_bundles(event_id);
CREATE INDEX IF NOT EXISTS idx_addon_bundles_active ON addon_bundles(is_active);

-- Parking passes table
CREATE TABLE IF NOT EXISTS parking_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id),
  lot_name TEXT NOT NULL,
  lot_code TEXT,
  pass_type TEXT NOT NULL CHECK (pass_type IN ('general', 'premium', 'vip', 'accessible', 'oversized', 'rv')),
  price NUMERIC(10,2) NOT NULL,
  quantity_available INT,
  quantity_sold INT DEFAULT 0,
  distance_to_venue TEXT,
  amenities TEXT[],
  entry_time TIMESTAMPTZ,
  exit_time TIMESTAMPTZ,
  instructions TEXT,
  map_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parking_passes_event ON parking_passes(event_id);
CREATE INDEX IF NOT EXISTS idx_parking_passes_type ON parking_passes(pass_type);

-- Parking purchases table
CREATE TABLE IF NOT EXISTS parking_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parking_pass_id UUID NOT NULL REFERENCES parking_passes(id),
  order_id UUID REFERENCES orders(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  vehicle_info JSONB,
  license_plate TEXT,
  qr_code TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled', 'refunded')),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parking_purchases_pass ON parking_purchases(parking_pass_id);
CREATE INDEX IF NOT EXISTS idx_parking_purchases_user ON parking_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_parking_purchases_qr ON parking_purchases(qr_code);

-- Function to generate redemption code
CREATE OR REPLACE FUNCTION generate_addon_redemption_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_code TEXT;
BEGIN
  v_code := 'ADD-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8));
  RETURN v_code;
END;
$$;

-- Trigger to generate redemption code on purchase
CREATE OR REPLACE FUNCTION set_addon_redemption_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.redemption_code IS NULL THEN
    NEW.redemption_code := generate_addon_redemption_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS addon_purchase_code_trigger ON addon_purchases;
CREATE TRIGGER addon_purchase_code_trigger
  BEFORE INSERT ON addon_purchases
  FOR EACH ROW
  EXECUTE FUNCTION set_addon_redemption_code();

-- Function to update addon sold quantity
CREATE OR REPLACE FUNCTION update_addon_sold_quantity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE ticket_addons SET
      quantity_sold = quantity_sold + NEW.quantity,
      updated_at = NOW()
    WHERE id = NEW.addon_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IN ('cancelled', 'refunded') AND OLD.status = 'confirmed' THEN
    UPDATE ticket_addons SET
      quantity_sold = quantity_sold - OLD.quantity,
      updated_at = NOW()
    WHERE id = NEW.addon_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS addon_sold_quantity_trigger ON addon_purchases;
CREATE TRIGGER addon_sold_quantity_trigger
  AFTER INSERT OR UPDATE ON addon_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_addon_sold_quantity();

-- Function to redeem addon
CREATE OR REPLACE FUNCTION redeem_addon(
  p_redemption_code TEXT,
  p_redeemed_by UUID,
  p_location TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  addon_name TEXT,
  quantity INT,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_purchase RECORD;
BEGIN
  SELECT ap.*, ta.name as addon_name INTO v_purchase
  FROM addon_purchases ap
  JOIN ticket_addons ta ON ta.id = ap.addon_id
  WHERE ap.redemption_code = UPPER(p_redemption_code);
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, 0, 'Invalid redemption code';
    RETURN;
  END IF;
  
  IF v_purchase.status = 'redeemed' THEN
    RETURN QUERY SELECT FALSE, v_purchase.addon_name, v_purchase.quantity, 'Already redeemed';
    RETURN;
  END IF;
  
  IF v_purchase.status != 'confirmed' THEN
    RETURN QUERY SELECT FALSE, v_purchase.addon_name, v_purchase.quantity, 'Purchase not confirmed';
    RETURN;
  END IF;
  
  UPDATE addon_purchases SET
    status = 'redeemed',
    redeemed_at = NOW(),
    redeemed_by = p_redeemed_by,
    redemption_location = p_location,
    updated_at = NOW()
  WHERE id = v_purchase.id;
  
  RETURN QUERY SELECT TRUE, v_purchase.addon_name, v_purchase.quantity, NULL::TEXT;
END;
$$;

-- RLS policies
ALTER TABLE ticket_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE addon_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_purchases ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON ticket_addons TO authenticated;
GRANT SELECT, INSERT, UPDATE ON addon_purchases TO authenticated;
GRANT SELECT, INSERT, UPDATE ON addon_bundles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON parking_passes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON parking_purchases TO authenticated;
GRANT EXECUTE ON FUNCTION generate_addon_redemption_code() TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_addon(TEXT, UUID, TEXT) TO authenticated;
