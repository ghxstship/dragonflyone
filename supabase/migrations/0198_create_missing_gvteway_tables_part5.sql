-- Migration: Create missing GVTEWAY tables (Part 5 - Gift Cards, Groups, Inventory, Loyalty, Merch)
-- These tables are referenced by API routes but don't exist in the schema

-- ============================================
-- GIFT CARD TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  initial_balance DECIMAL(12,2) NOT NULL,
  current_balance DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  purchaser_id UUID REFERENCES auth.users(id),
  recipient_email TEXT,
  recipient_name TEXT,
  message TEXT,
  design_template TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
  purchased_at TIMESTAMPTZ DEFAULT now(),
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'redemption', 'refund', 'adjustment')),
  amount DECIMAL(12,2) NOT NULL,
  balance_after DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- GIFT REGISTRY TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS gift_registries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  occasion TEXT,
  event_date DATE,
  is_public BOOLEAN DEFAULT true,
  share_code TEXT UNIQUE,
  total_value DECIMAL(12,2) DEFAULT 0,
  funded_value DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gift_registry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_id UUID NOT NULL REFERENCES gift_registries(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('ticket', 'merch', 'experience', 'cash')),
  item_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  quantity_needed INTEGER DEFAULT 1,
  quantity_funded INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gift_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_item_id UUID NOT NULL REFERENCES gift_registry_items(id) ON DELETE CASCADE,
  contributor_id UUID REFERENCES auth.users(id),
  contributor_name TEXT,
  contributor_email TEXT,
  amount DECIMAL(12,2) NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- GROUP ORDER TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS group_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  max_members INTEGER,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed', 'cancelled')),
  total_amount DECIMAL(12,2) DEFAULT 0,
  share_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_order_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id UUID NOT NULL REFERENCES group_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  ticket_quantity INTEGER DEFAULT 1,
  amount DECIMAL(12,2),
  payment_status TEXT DEFAULT 'pending',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_order_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id UUID NOT NULL REFERENCES group_orders(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES auth.users(id),
  group_name TEXT NOT NULL,
  group_size INTEGER NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  special_requests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INVENTORY TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  type TEXT CHECK (type IN ('warehouse', 'venue', 'popup', 'virtual')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  location_id UUID REFERENCES inventory_locations(id),
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('add', 'remove', 'transfer', 'count', 'damage', 'return')),
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER,
  new_quantity INTEGER,
  reason TEXT,
  adjusted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  location_id UUID REFERENCES inventory_locations(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock', 'overstock', 'expiring')),
  threshold INTEGER,
  current_quantity INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS inventory_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  location_id UUID REFERENCES inventory_locations(id),
  min_quantity INTEGER DEFAULT 0,
  max_quantity INTEGER,
  reorder_point INTEGER,
  reorder_quantity INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  sync_type TEXT CHECK (sync_type IN ('full', 'incremental', 'manual')),
  items_synced INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_details JSONB
);

-- ============================================
-- LOYALTY TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  min_points INTEGER DEFAULT 0,
  multiplier DECIMAL(4,2) DEFAULT 1.00,
  benefits JSONB DEFAULT '[]'::jsonb,
  badge_url TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES loyalty_tiers(id),
  points_balance INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier_progress INTEGER DEFAULT 0,
  member_since TIMESTAMPTZ DEFAULT now(),
  last_activity_at TIMESTAMPTZ,
  UNIQUE(user_id, organization_id)
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'adjust', 'bonus')),
  points INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  order_id UUID REFERENCES orders(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  reward_type TEXT CHECK (reward_type IN ('discount', 'free_item', 'upgrade', 'experience', 'merch')),
  reward_value JSONB DEFAULT '{}'::jsonb,
  quantity_available INTEGER,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES loyalty_rewards(id),
  points_spent INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'expired', 'cancelled')),
  redemption_code TEXT UNIQUE,
  fulfilled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  source TEXT NOT NULL,
  source_id UUID,
  description TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- MERCHANDISE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS merch_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  base_price DECIMAL(12,2) NOT NULL,
  compare_at_price DECIMAL(12,2),
  sku TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  inventory_quantity INTEGER DEFAULT 0,
  weight DECIMAL(8,2),
  dimensions JSONB,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS merchandise_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES merch_products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  price DECIMAL(12,2),
  compare_at_price DECIMAL(12,2),
  inventory_quantity INTEGER DEFAULT 0,
  options JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS merchandise_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES merchandise_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS merchandise_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal DECIMAL(12,2) NOT NULL,
  tax DECIMAL(12,2) DEFAULT 0,
  shipping DECIMAL(12,2) DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  shipping_address JSONB,
  billing_address JSONB,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS merchandise_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES merchandise_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES merch_products(id),
  variant_id UUID REFERENCES merchandise_variants(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  customization JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS merchandise_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES merch_products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID REFERENCES merchandise_orders(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  content TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS merchandise_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES merch_products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES merchandise_variants(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id, variant_id)
);

-- Enable RLS
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_registries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_registry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_order_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_wishlist ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Authenticated users can read gift_cards" ON gift_cards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read gift_card_transactions" ON gift_card_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read gift_registries" ON gift_registries FOR SELECT TO authenticated USING (is_public = true OR user_id = auth.uid());
CREATE POLICY "Authenticated users can read gift_registry_items" ON gift_registry_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read gift_contributions" ON gift_contributions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read group_orders" ON group_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read group_order_members" ON group_order_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read group_payments" ON group_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read group_registrations" ON group_registrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read inventory_locations" ON inventory_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read inventory_adjustments" ON inventory_adjustments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read inventory_alerts" ON inventory_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read inventory_thresholds" ON inventory_thresholds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read inventory_sync_logs" ON inventory_sync_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read loyalty_tiers" ON loyalty_tiers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read their loyalty_accounts" ON loyalty_accounts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can read their loyalty_transactions" ON loyalty_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read loyalty_rewards" ON loyalty_rewards FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read their loyalty_redemptions" ON loyalty_redemptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read their loyalty_points" ON loyalty_points FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read merch_products" ON merch_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read merchandise_variants" ON merchandise_variants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read merchandise_categories" ON merchandise_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read their merchandise_orders" ON merchandise_orders FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can read their merchandise_order_items" ON merchandise_order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read merchandise_reviews" ON merchandise_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their merchandise_wishlist" ON merchandise_wishlist FOR ALL TO authenticated USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_registries_user_id ON gift_registries(user_id);
CREATE INDEX IF NOT EXISTS idx_group_orders_event_id ON group_orders(event_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_user_id ON loyalty_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_merch_products_organization_id ON merch_products(organization_id);
CREATE INDEX IF NOT EXISTS idx_merchandise_orders_user_id ON merchandise_orders(user_id);
