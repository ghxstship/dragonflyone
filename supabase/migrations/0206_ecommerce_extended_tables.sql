-- Migration: Extended Ecommerce Tables
-- Description: Tables for bundle deals, gift registries, and POS features

-- Bundle deals table
CREATE TABLE IF NOT EXISTS bundle_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  bundle_price DECIMAL(10, 2),
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bundle deal items table
CREATE TABLE IF NOT EXISTS bundle_deal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES bundle_deals(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER DEFAULT 1
);

-- Gift registries table
CREATE TABLE IF NOT EXISTS gift_registries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  name VARCHAR(200) NOT NULL,
  event_type VARCHAR(30) CHECK (event_type IN ('birthday', 'wedding', 'graduation', 'corporate', 'other')),
  event_date TIMESTAMPTZ,
  message TEXT,
  share_code VARCHAR(20) UNIQUE,
  is_public BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift registry items table
CREATE TABLE IF NOT EXISTS gift_registry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_id UUID NOT NULL REFERENCES gift_registries(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity_requested INTEGER DEFAULT 1,
  quantity_fulfilled INTEGER DEFAULT 0,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift contributions table
CREATE TABLE IF NOT EXISTS gift_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES gift_registry_items(id),
  contributor_name VARCHAR(200),
  contributor_email VARCHAR(200),
  quantity INTEGER DEFAULT 1,
  amount DECIMAL(10, 2),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- POS terminals table
CREATE TABLE IF NOT EXISTS pos_terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  venue_id UUID REFERENCES venues(id),
  terminal_name VARCHAR(100) NOT NULL,
  terminal_type VARCHAR(30) CHECK (terminal_type IN ('box_office', 'concession', 'merchandise', 'mobile')),
  location VARCHAR(200),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'offline', 'maintenance')),
  last_sync_at TIMESTAMPTZ,
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- POS transactions table
CREATE TABLE IF NOT EXISTS pos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID NOT NULL REFERENCES pos_terminals(id),
  transaction_type VARCHAR(30) CHECK (transaction_type IN ('sale', 'refund', 'void')),
  payment_method VARCHAR(30) CHECK (payment_method IN ('cash', 'card', 'nfc', 'rfid', 'split')),
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  tip DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  cashier_id UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- POS transaction items table
CREATE TABLE IF NOT EXISTS pos_transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES pos_transactions(id),
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(200),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL
);

-- RFID wristbands table
CREATE TABLE IF NOT EXISTS rfid_wristbands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID REFERENCES platform_users(id),
  wristband_id VARCHAR(100) UNIQUE NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'lost')),
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bundle_deals_status ON bundle_deals(status);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_deal_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_gift_registries_user ON gift_registries(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_registries_code ON gift_registries(share_code);
CREATE INDEX IF NOT EXISTS idx_gift_registry_items_registry ON gift_registry_items(registry_id);
CREATE INDEX IF NOT EXISTS idx_gift_contributions_item ON gift_contributions(item_id);
CREATE INDEX IF NOT EXISTS idx_pos_terminals_event ON pos_terminals(event_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_terminal ON pos_transactions(terminal_id);
CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_transaction ON pos_transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_rfid_wristbands_event ON rfid_wristbands(event_id);
CREATE INDEX IF NOT EXISTS idx_rfid_wristbands_user ON rfid_wristbands(user_id);

-- RLS Policies
ALTER TABLE bundle_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_deal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_registries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_registry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfid_wristbands ENABLE ROW LEVEL SECURITY;

CREATE POLICY bundle_deals_view ON bundle_deals FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY gift_registries_view ON gift_registries FOR SELECT USING (is_public = TRUE OR user_id = auth.uid());
CREATE POLICY gift_registry_items_view ON gift_registry_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY pos_terminals_view ON pos_terminals FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY pos_transactions_view ON pos_transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY rfid_wristbands_view ON rfid_wristbands FOR SELECT USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);
