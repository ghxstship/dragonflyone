-- Migration: GVTEWAY Advanced Features
-- Description: Tables for merchandise store, fan profiles, and preferences

-- Merchandise categories
CREATE TABLE IF NOT EXISTS merchandise_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES merchandise_categories(id),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchandise_categories_parent ON merchandise_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_merchandise_categories_active ON merchandise_categories(is_active);

-- Merchandise products
CREATE TABLE IF NOT EXISTS merchandise_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  compare_at_price NUMERIC(10,2),
  sku TEXT,
  inventory_quantity INT DEFAULT 0,
  images TEXT[],
  event_id UUID REFERENCES events(id),
  artist_id UUID,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchandise_products_category ON merchandise_products(category);
CREATE INDEX IF NOT EXISTS idx_merchandise_products_event ON merchandise_products(event_id);
CREATE INDEX IF NOT EXISTS idx_merchandise_products_active ON merchandise_products(is_active);
CREATE INDEX IF NOT EXISTS idx_merchandise_products_featured ON merchandise_products(is_featured);

-- Merchandise variants
CREATE TABLE IF NOT EXISTS merchandise_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES merchandise_products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  options TEXT[],
  price_modifier NUMERIC(10,2) DEFAULT 0,
  sku TEXT,
  inventory_quantity INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchandise_variants_product ON merchandise_variants(product_id);

-- Merchandise orders
CREATE TABLE IF NOT EXISTS merchandise_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  subtotal NUMERIC(10,2) NOT NULL,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  shipping_address JSONB,
  billing_address JSONB,
  payment_method_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchandise_orders_user ON merchandise_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_merchandise_orders_status ON merchandise_orders(status);

-- Merchandise order items
CREATE TABLE IF NOT EXISTS merchandise_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES merchandise_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES merchandise_products(id),
  variant_id UUID REFERENCES merchandise_variants(id),
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchandise_order_items_order ON merchandise_order_items(order_id);

-- Merchandise reviews
CREATE TABLE IF NOT EXISTS merchandise_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES merchandise_products(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_merchandise_reviews_product ON merchandise_reviews(product_id);

-- Merchandise wishlist
CREATE TABLE IF NOT EXISTS merchandise_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  product_id UUID NOT NULL REFERENCES merchandise_products(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_merchandise_wishlist_user ON merchandise_wishlist(user_id);

-- Fan profiles
CREATE TABLE IF NOT EXISTS fan_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  favorite_genres TEXT[],
  favorite_artists UUID[],
  favorite_venues UUID[],
  location JSONB,
  preferences JSONB DEFAULT '{"email_notifications": true, "push_notifications": true, "show_activity": true, "show_favorites": true}',
  social_links JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fan_profiles_user ON fan_profiles(user_id);

-- Fan favorites
CREATE TABLE IF NOT EXISTS fan_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  favorite_type TEXT NOT NULL CHECK (favorite_type IN ('event', 'artist', 'venue')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, favorite_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_fan_favorites_user ON fan_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_fan_favorites_type ON fan_favorites(favorite_type);

-- Event attendance
CREATE TABLE IF NOT EXISTS event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  attended_at TIMESTAMPTZ DEFAULT NOW(),
  check_in_method TEXT,
  UNIQUE(user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_attendance_user ON event_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendance_event ON event_attendance(event_id);

-- Event reviews
CREATE TABLE IF NOT EXISTS event_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  event_id UUID NOT NULL REFERENCES events(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  photos TEXT[],
  verified_attendance BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_reviews_event ON event_reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reviews_rating ON event_reviews(rating);

-- Functions for inventory management
CREATE OR REPLACE FUNCTION decrement_product_inventory(p_product_id UUID, p_quantity INT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE merchandise_products
  SET inventory_quantity = inventory_quantity - p_quantity
  WHERE id = p_product_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_variant_inventory(p_variant_id UUID, p_quantity INT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE merchandise_variants
  SET inventory_quantity = inventory_quantity - p_quantity
  WHERE id = p_variant_id;
END;
$$;

-- RLS policies
ALTER TABLE merchandise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reviews ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON merchandise_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE ON merchandise_products TO authenticated;
GRANT SELECT, INSERT, UPDATE ON merchandise_variants TO authenticated;
GRANT SELECT, INSERT, UPDATE ON merchandise_orders TO authenticated;
GRANT SELECT, INSERT ON merchandise_order_items TO authenticated;
GRANT SELECT, INSERT ON merchandise_reviews TO authenticated;
GRANT SELECT, INSERT, DELETE ON merchandise_wishlist TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fan_profiles TO authenticated;
GRANT SELECT, INSERT, DELETE ON fan_favorites TO authenticated;
GRANT SELECT, INSERT ON event_attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE ON event_reviews TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_product_inventory(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_variant_inventory(UUID, INT) TO authenticated;

-- Insert default merchandise categories
INSERT INTO merchandise_categories (name, slug, sort_order) VALUES
('Apparel', 'apparel', 1),
('Accessories', 'accessories', 2),
('Music', 'music', 3),
('Collectibles', 'collectibles', 4),
('Posters & Art', 'posters-art', 5)
ON CONFLICT (slug) DO NOTHING;
