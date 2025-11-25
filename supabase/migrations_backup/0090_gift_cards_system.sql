-- Migration: Gift Cards System
-- Description: Tables for gift cards, transactions, and redemptions

-- Gift cards table
CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  code TEXT NOT NULL UNIQUE,
  initial_amount NUMERIC(10,2) NOT NULL,
  current_balance NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  purchaser_id UUID REFERENCES platform_users(id),
  purchaser_email TEXT,
  purchaser_name TEXT,
  recipient_email TEXT,
  recipient_name TEXT,
  recipient_id UUID REFERENCES platform_users(id),
  message TEXT,
  design_template TEXT DEFAULT 'default',
  delivery_method TEXT DEFAULT 'email' CHECK (delivery_method IN ('email', 'sms', 'print', 'physical')),
  delivery_date TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'partially_redeemed', 'redeemed', 'expired', 'cancelled', 'refunded')),
  redeemed_by UUID REFERENCES platform_users(id),
  first_used_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  order_id UUID REFERENCES orders(id),
  payment_id UUID REFERENCES payments(id),
  is_promotional BOOLEAN DEFAULT false,
  promotion_id UUID,
  restrictions JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_purchaser ON gift_cards(purchaser_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_recipient ON gift_cards(recipient_email);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON gift_cards(status);
CREATE INDEX IF NOT EXISTS idx_gift_cards_expires ON gift_cards(expires_at);

-- Gift card transactions table
CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id),
  user_id UUID REFERENCES platform_users(id),
  order_id UUID REFERENCES orders(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'redemption', 'refund', 'adjustment', 'transfer', 'expiration')),
  amount NUMERIC(10,2) NOT NULL,
  balance_before NUMERIC(10,2),
  balance_after NUMERIC(10,2) NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_card ON gift_card_transactions(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_user ON gift_card_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_type ON gift_card_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_created ON gift_card_transactions(created_at);

-- Gift card designs/templates table
CREATE TABLE IF NOT EXISTS gift_card_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  template_key TEXT NOT NULL,
  preview_image_url TEXT,
  background_image_url TEXT,
  background_color TEXT,
  text_color TEXT,
  accent_color TEXT,
  category TEXT CHECK (category IN ('birthday', 'holiday', 'celebration', 'thank_you', 'general', 'seasonal', 'custom')),
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, template_key)
);

CREATE INDEX IF NOT EXISTS idx_gift_card_designs_org ON gift_card_designs(organization_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_designs_category ON gift_card_designs(category);

-- Gift card batches (for bulk creation)
CREATE TABLE IF NOT EXISTS gift_card_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  quantity INT NOT NULL,
  amount_per_card NUMERIC(10,2) NOT NULL,
  total_value NUMERIC(15,2) NOT NULL,
  cards_generated INT DEFAULT 0,
  cards_activated INT DEFAULT 0,
  cards_redeemed INT DEFAULT 0,
  design_template TEXT,
  expires_at TIMESTAMPTZ,
  restrictions JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'active', 'completed', 'cancelled')),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_card_batches_org ON gift_card_batches(organization_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_batches_status ON gift_card_batches(status);

-- Function to generate gift card code
CREATE OR REPLACE FUNCTION generate_gift_card_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code TEXT := '';
  v_i INT;
BEGIN
  FOR v_i IN 1..16 LOOP
    IF v_i > 1 AND (v_i - 1) % 4 = 0 THEN
      v_code := v_code || '-';
    END IF;
    v_code := v_code || SUBSTR(v_chars, FLOOR(RANDOM() * LENGTH(v_chars) + 1)::INT, 1);
  END LOOP;
  
  RETURN v_code;
END;
$$;

-- Function to redeem gift card
CREATE OR REPLACE FUNCTION redeem_gift_card(
  p_code TEXT,
  p_amount NUMERIC,
  p_user_id UUID,
  p_order_id UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  amount_applied NUMERIC,
  remaining_balance NUMERIC,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_gift_card RECORD;
  v_new_balance NUMERIC;
BEGIN
  -- Find and lock gift card
  SELECT * INTO v_gift_card
  FROM gift_cards
  WHERE code = UPPER(p_code)
    AND status IN ('active', 'partially_redeemed')
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC, 0::NUMERIC, 'Invalid or inactive gift card code';
    RETURN;
  END IF;
  
  -- Check expiration
  IF v_gift_card.expires_at < NOW() THEN
    UPDATE gift_cards SET status = 'expired' WHERE id = v_gift_card.id;
    RETURN QUERY SELECT FALSE, 0::NUMERIC, 0::NUMERIC, 'Gift card has expired';
    RETURN;
  END IF;
  
  -- Check balance
  IF p_amount > v_gift_card.current_balance THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC, v_gift_card.current_balance, 'Insufficient balance';
    RETURN;
  END IF;
  
  v_new_balance := v_gift_card.current_balance - p_amount;
  
  -- Update gift card
  UPDATE gift_cards SET
    current_balance = v_new_balance,
    status = CASE WHEN v_new_balance = 0 THEN 'redeemed' ELSE 'partially_redeemed' END,
    redeemed_by = COALESCE(redeemed_by, p_user_id),
    first_used_at = COALESCE(first_used_at, NOW()),
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE id = v_gift_card.id;
  
  -- Record transaction
  INSERT INTO gift_card_transactions (
    gift_card_id, user_id, order_id, transaction_type, amount, balance_before, balance_after
  )
  VALUES (
    v_gift_card.id, p_user_id, p_order_id, 'redemption', -p_amount, v_gift_card.current_balance, v_new_balance
  );
  
  RETURN QUERY SELECT TRUE, p_amount, v_new_balance, NULL::TEXT;
END;
$$;

-- Function to check gift card balance
CREATE OR REPLACE FUNCTION check_gift_card_balance(p_code TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  balance NUMERIC,
  expires_at TIMESTAMPTZ,
  status TEXT,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_gift_card RECORD;
BEGIN
  SELECT * INTO v_gift_card
  FROM gift_cards
  WHERE code = UPPER(p_code);
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC, NULL::TIMESTAMPTZ, NULL::TEXT, 'Gift card not found';
    RETURN;
  END IF;
  
  IF v_gift_card.status NOT IN ('active', 'partially_redeemed') THEN
    RETURN QUERY SELECT FALSE, v_gift_card.current_balance, v_gift_card.expires_at, v_gift_card.status, 'Gift card is not active';
    RETURN;
  END IF;
  
  IF v_gift_card.expires_at < NOW() THEN
    RETURN QUERY SELECT FALSE, v_gift_card.current_balance, v_gift_card.expires_at, 'expired', 'Gift card has expired';
    RETURN;
  END IF;
  
  RETURN QUERY SELECT TRUE, v_gift_card.current_balance, v_gift_card.expires_at, v_gift_card.status, NULL::TEXT;
END;
$$;

-- Trigger to record balance before transaction
CREATE OR REPLACE FUNCTION set_gift_card_balance_before()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.balance_before IS NULL THEN
    SELECT current_balance INTO NEW.balance_before
    FROM gift_cards WHERE id = NEW.gift_card_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gift_card_transaction_balance_trigger ON gift_card_transactions;
CREATE TRIGGER gift_card_transaction_balance_trigger
  BEFORE INSERT ON gift_card_transactions
  FOR EACH ROW
  EXECUTE FUNCTION set_gift_card_balance_before();

-- RLS policies
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_card_batches ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON gift_cards TO authenticated;
GRANT SELECT, INSERT ON gift_card_transactions TO authenticated;
GRANT SELECT ON gift_card_designs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON gift_card_batches TO authenticated;
GRANT EXECUTE ON FUNCTION generate_gift_card_code() TO authenticated;
GRANT EXECUTE ON FUNCTION redeem_gift_card(TEXT, NUMERIC, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_gift_card_balance(TEXT) TO authenticated;
