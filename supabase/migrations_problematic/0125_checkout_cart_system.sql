-- Migration: Checkout & Cart System
-- Description: Tables for shopping cart, checkout sessions, and order processing

-- Shopping carts table
CREATE TABLE IF NOT EXISTS shopping_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id),
  session_id TEXT,
  event_id UUID REFERENCES events(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'converted', 'expired')),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(15,2) DEFAULT 0,
  item_count INT DEFAULT 0,
  promo_code TEXT,
  promo_discount NUMERIC(10,2) DEFAULT 0,
  expires_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  converted_order_id UUID REFERENCES orders(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopping_carts_user ON shopping_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_carts_session ON shopping_carts(session_id);
CREATE INDEX IF NOT EXISTS idx_shopping_carts_status ON shopping_carts(status);
CREATE INDEX IF NOT EXISTS idx_shopping_carts_expires ON shopping_carts(expires_at);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES shopping_carts(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('ticket', 'addon', 'parking', 'merchandise', 'bundle')),
  ticket_type_id UUID REFERENCES ticket_types(id),
  addon_id UUID REFERENCES ticket_addons(id),
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  reserved_until TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_type ON cart_items(item_type);

-- Checkout sessions table
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES shopping_carts(id),
  order_id UUID REFERENCES orders(id),
  user_id UUID REFERENCES platform_users(id),
  session_token TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'payment_pending', 'completed', 'failed', 'expired', 'abandoned')),
  step TEXT DEFAULT 'cart' CHECK (step IN ('cart', 'delivery', 'payment', 'review', 'confirmation')),
  customer_info JSONB,
  billing_address JSONB,
  shipping_address JSONB,
  delivery_method TEXT DEFAULT 'digital',
  payment_method_id UUID,
  payment_intent_id TEXT,
  subtotal NUMERIC(15,2) NOT NULL,
  service_fee NUMERIC(10,2) DEFAULT 0,
  facility_fee NUMERIC(10,2) DEFAULT 0,
  delivery_fee NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  gift_card_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  promo_code TEXT,
  gift_card_code TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  utm_params JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkout_sessions_cart ON checkout_sessions(cart_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_order ON checkout_sessions(order_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user ON checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_token ON checkout_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_status ON checkout_sessions(status);

-- Abandoned cart tracking
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES shopping_carts(id),
  user_id UUID REFERENCES platform_users(id),
  email TEXT,
  event_id UUID REFERENCES events(id),
  cart_value NUMERIC(15,2),
  item_count INT,
  items_summary JSONB,
  abandoned_at TIMESTAMPTZ DEFAULT NOW(),
  recovery_email_sent BOOLEAN DEFAULT false,
  recovery_email_sent_at TIMESTAMPTZ,
  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMPTZ,
  recovered_order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_user ON abandoned_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON abandoned_carts(email);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_event ON abandoned_carts(event_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_recovered ON abandoned_carts(recovered);

-- Order line items table
CREATE TABLE IF NOT EXISTS order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('ticket', 'addon', 'parking', 'merchandise', 'fee', 'discount', 'tax')),
  ticket_type_id UUID REFERENCES ticket_types(id),
  addon_id UUID REFERENCES ticket_addons(id),
  name TEXT NOT NULL,
  description TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_line_items_order ON order_line_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_line_items_type ON order_line_items(item_type);

-- Function to add item to cart
CREATE OR REPLACE FUNCTION add_to_cart(
  p_cart_id UUID,
  p_item_type TEXT,
  p_item_id UUID,
  p_quantity INT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_unit_price NUMERIC;
  v_item_name TEXT;
  v_cart_item_id UUID;
BEGIN
  -- Get item details
  IF p_item_type = 'ticket' THEN
    SELECT price, name INTO v_unit_price, v_item_name
    FROM ticket_types WHERE id = p_item_id;
  ELSIF p_item_type = 'addon' THEN
    SELECT price, name INTO v_unit_price, v_item_name
    FROM ticket_addons WHERE id = p_item_id;
  END IF;
  
  IF v_unit_price IS NULL THEN
    RAISE EXCEPTION 'Item not found';
  END IF;
  
  -- Check if item already in cart
  SELECT id INTO v_cart_item_id
  FROM cart_items
  WHERE cart_id = p_cart_id
    AND item_type = p_item_type
    AND (ticket_type_id = p_item_id OR addon_id = p_item_id);
  
  IF v_cart_item_id IS NOT NULL THEN
    -- Update quantity
    UPDATE cart_items SET
      quantity = quantity + p_quantity,
      total_price = (quantity + p_quantity) * unit_price,
      updated_at = NOW()
    WHERE id = v_cart_item_id;
  ELSE
    -- Insert new item
    INSERT INTO cart_items (
      cart_id, item_type, ticket_type_id, addon_id, quantity, unit_price, total_price
    )
    VALUES (
      p_cart_id, p_item_type,
      CASE WHEN p_item_type = 'ticket' THEN p_item_id ELSE NULL END,
      CASE WHEN p_item_type = 'addon' THEN p_item_id ELSE NULL END,
      p_quantity, v_unit_price, v_unit_price * p_quantity
    )
    RETURNING id INTO v_cart_item_id;
  END IF;
  
  -- Update cart totals
  UPDATE shopping_carts SET
    subtotal = (SELECT COALESCE(SUM(total_price), 0) FROM cart_items WHERE cart_id = p_cart_id),
    item_count = (SELECT COALESCE(SUM(quantity), 0) FROM cart_items WHERE cart_id = p_cart_id),
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE id = p_cart_id;
  
  RETURN v_cart_item_id;
END;
$$;

-- Function to calculate checkout totals
CREATE OR REPLACE FUNCTION calculate_checkout_totals(
  p_subtotal NUMERIC,
  p_promo_discount NUMERIC DEFAULT 0,
  p_gift_card_amount NUMERIC DEFAULT 0
)
RETURNS TABLE (
  subtotal NUMERIC,
  service_fee NUMERIC,
  facility_fee NUMERIC,
  tax_amount NUMERIC,
  discount_amount NUMERIC,
  gift_card_amount NUMERIC,
  total_amount NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_service_fee NUMERIC;
  v_facility_fee NUMERIC;
  v_tax_rate NUMERIC := 0.0825;
  v_taxable_amount NUMERIC;
  v_tax_amount NUMERIC;
  v_total NUMERIC;
BEGIN
  v_service_fee := p_subtotal * 0.10;
  v_facility_fee := 0; -- Would be calculated based on ticket count
  v_taxable_amount := p_subtotal - p_promo_discount;
  v_tax_amount := v_taxable_amount * v_tax_rate;
  v_total := p_subtotal + v_service_fee + v_facility_fee + v_tax_amount - p_promo_discount - p_gift_card_amount;
  
  RETURN QUERY SELECT
    p_subtotal,
    v_service_fee,
    v_facility_fee,
    v_tax_amount,
    p_promo_discount,
    p_gift_card_amount,
    GREATEST(v_total, 0);
END;
$$;

-- Function to expire abandoned carts
CREATE OR REPLACE FUNCTION expire_abandoned_carts()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_expired INT;
BEGIN
  -- Mark carts as abandoned
  WITH abandoned AS (
    UPDATE shopping_carts SET
      status = 'abandoned'
    WHERE status = 'active'
      AND last_activity_at < NOW() - INTERVAL '30 minutes'
    RETURNING id, user_id, event_id, subtotal, item_count, items
  )
  INSERT INTO abandoned_carts (cart_id, user_id, event_id, cart_value, item_count, items_summary, email)
  SELECT 
    a.id, a.user_id, a.event_id, a.subtotal, a.item_count, a.items,
    (SELECT email FROM platform_users WHERE id = a.user_id)
  FROM abandoned a;
  
  GET DIAGNOSTICS v_expired = ROW_COUNT;
  
  -- Expire checkout sessions
  UPDATE checkout_sessions SET
    status = 'expired',
    abandoned_at = NOW()
  WHERE status IN ('pending', 'processing', 'payment_pending')
    AND expires_at < NOW();
  
  RETURN v_expired;
END;
$$;

-- RLS policies
ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_line_items ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON shopping_carts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cart_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON checkout_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON abandoned_carts TO authenticated;
GRANT SELECT, INSERT ON order_line_items TO authenticated;
GRANT EXECUTE ON FUNCTION add_to_cart(UUID, TEXT, UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_checkout_totals(NUMERIC, NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION expire_abandoned_carts() TO authenticated;
