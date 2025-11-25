-- Migration: Ecommerce Customization Tables
-- Description: Tables for product customization, subscription boxes, and inventory locations

-- Product customization options table
CREATE TABLE IF NOT EXISTS product_customization_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  option_type VARCHAR(30) CHECK (option_type IN ('text', 'image', 'color', 'size', 'engraving', 'monogram')),
  field_name VARCHAR(100) NOT NULL,
  required BOOLEAN DEFAULT FALSE,
  additional_cost DECIMAL(10, 2) DEFAULT 0,
  options JSONB,
  display_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customization templates table
CREATE TABLE IF NOT EXISTS customization_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  template_type VARCHAR(50),
  fields JSONB,
  preview_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription boxes table
CREATE TABLE IF NOT EXISTS subscription_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  frequency_options TEXT[],
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription box items table
CREATE TABLE IF NOT EXISTS subscription_box_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES subscription_boxes(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER DEFAULT 1
);

-- Box subscriptions table
CREATE TABLE IF NOT EXISTS box_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  box_id UUID NOT NULL REFERENCES subscription_boxes(id),
  frequency VARCHAR(20) CHECK (frequency IN ('monthly', 'quarterly', 'biannual', 'annual')),
  shipping_address JSONB,
  price DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  next_ship_date TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Box shipments table
CREATE TABLE IF NOT EXISTS box_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES box_subscriptions(id),
  ship_date TIMESTAMPTZ,
  tracking_number VARCHAR(100),
  carrier VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'returned')),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory locations table
CREATE TABLE IF NOT EXISTS inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  location_id UUID NOT NULL,
  quantity INTEGER DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  UNIQUE(product_id, location_id)
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(30) CHECK (type IN ('warehouse', 'store', 'venue', 'booth')),
  address TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory sync logs table
CREATE TABLE IF NOT EXISTS inventory_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  location_id UUID,
  sync_type VARCHAR(20),
  previous_quantity INTEGER,
  new_quantity INTEGER,
  items_synced INTEGER,
  source VARCHAR(50),
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add customizations column to cart_items if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'customizations') THEN
    ALTER TABLE cart_items ADD COLUMN customizations JSONB;
    ALTER TABLE cart_items ADD COLUMN additional_cost DECIMAL(10, 2) DEFAULT 0;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customization_options_product ON product_customization_options(product_id);
CREATE INDEX IF NOT EXISTS idx_subscription_box_items_box ON subscription_box_items(box_id);
CREATE INDEX IF NOT EXISTS idx_box_subscriptions_user ON box_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_box_subscriptions_status ON box_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_box_shipments_subscription ON box_shipments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_inventory_locations_product ON inventory_locations(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_locations_location ON inventory_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sync_logs_product ON inventory_sync_logs(product_id);

-- RLS Policies
ALTER TABLE product_customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_box_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY customization_options_view ON product_customization_options FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY customization_templates_view ON customization_templates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY subscription_boxes_view ON subscription_boxes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY box_subscriptions_view ON box_subscriptions FOR SELECT USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);
CREATE POLICY inventory_locations_view ON inventory_locations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY locations_view ON locations FOR SELECT USING (auth.uid() IS NOT NULL);
