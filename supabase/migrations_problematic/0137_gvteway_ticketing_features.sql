-- Migration: GVTEWAY Ticketing Features
-- Adds promo codes, collections, and gift tickets support

-- Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  min_purchase DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  CONSTRAINT valid_dates CHECK (valid_until > valid_from)
);

-- Collections Table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500),
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Collection Events Junction Table
CREATE TABLE IF NOT EXISTS collection_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, event_id)
);

-- Gift Tickets Metadata (extends tickets table)
-- Add gift-related columns to tickets if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'is_gift') THEN
    ALTER TABLE tickets ADD COLUMN is_gift BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'gift_recipient_email') THEN
    ALTER TABLE tickets ADD COLUMN gift_recipient_email VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'gift_recipient_name') THEN
    ALTER TABLE tickets ADD COLUMN gift_recipient_name VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'gift_sender_name') THEN
    ALTER TABLE tickets ADD COLUMN gift_sender_name VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'gift_message') THEN
    ALTER TABLE tickets ADD COLUMN gift_message TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'gift_delivery_date') THEN
    ALTER TABLE tickets ADD COLUMN gift_delivery_date TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tickets' AND column_name = 'gift_claimed_at') THEN
    ALTER TABLE tickets ADD COLUMN gift_claimed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Ticket Transfers Table
CREATE TABLE IF NOT EXISTS ticket_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES profiles(id),
  to_email VARCHAR(255) NOT NULL,
  to_name VARCHAR(255),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  transfer_code VARCHAR(50) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  to_user_id UUID REFERENCES profiles(id)
);

-- Promo Code Usage Tracking
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id),
  discount_applied DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_status ON promo_codes(status);
CREATE INDEX IF NOT EXISTS idx_promo_codes_event ON promo_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid_dates ON promo_codes(valid_from, valid_until);

CREATE INDEX IF NOT EXISTS idx_collections_status ON collections(status);
CREATE INDEX IF NOT EXISTS idx_collections_featured ON collections(featured);
CREATE INDEX IF NOT EXISTS idx_collection_events_collection ON collection_events(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_events_event ON collection_events(event_id);

CREATE INDEX IF NOT EXISTS idx_ticket_transfers_ticket ON ticket_transfers(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_status ON ticket_transfers(status);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_code ON ticket_transfers(transfer_code);

CREATE INDEX IF NOT EXISTS idx_promo_code_usage_promo ON promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_order ON promo_code_usage(order_id);

-- RLS Policies
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- Promo codes: admins can manage, users can view active codes
CREATE POLICY "Admins can manage promo codes" ON promo_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can view active promo codes" ON promo_codes
  FOR SELECT USING (status = 'active' AND valid_from <= NOW() AND valid_until >= NOW());

-- Collections: public read, admin write
CREATE POLICY "Anyone can view active collections" ON collections
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage collections" ON collections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Collection events: public read
CREATE POLICY "Anyone can view collection events" ON collection_events
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage collection events" ON collection_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Ticket transfers: users can manage their own
CREATE POLICY "Users can view their transfers" ON ticket_transfers
  FOR SELECT USING (
    from_user_id = auth.uid() OR to_user_id = auth.uid()
  );

CREATE POLICY "Users can create transfers for their tickets" ON ticket_transfers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE tickets.id = ticket_id 
      AND tickets.user_id = auth.uid()
    )
  );

-- Promo code usage: users can view their own
CREATE POLICY "Users can view their promo usage" ON promo_code_usage
  FOR SELECT USING (user_id = auth.uid());

-- Function to validate and apply promo code
CREATE OR REPLACE FUNCTION apply_promo_code(
  p_code VARCHAR,
  p_order_id UUID,
  p_user_id UUID,
  p_order_total DECIMAL
)
RETURNS TABLE (
  success BOOLEAN,
  discount_amount DECIMAL,
  message TEXT
) AS $$
DECLARE
  v_promo promo_codes%ROWTYPE;
  v_discount DECIMAL;
BEGIN
  -- Find the promo code
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE code = UPPER(p_code)
    AND status = 'active'
    AND valid_from <= NOW()
    AND valid_until >= NOW();
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, 'Invalid or expired promo code'::TEXT;
    RETURN;
  END IF;
  
  -- Check max uses
  IF v_promo.max_uses IS NOT NULL AND v_promo.current_uses >= v_promo.max_uses THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, 'Promo code has reached maximum uses'::TEXT;
    RETURN;
  END IF;
  
  -- Check minimum purchase
  IF v_promo.min_purchase IS NOT NULL AND p_order_total < v_promo.min_purchase THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, 
      ('Minimum purchase of $' || v_promo.min_purchase || ' required')::TEXT;
    RETURN;
  END IF;
  
  -- Calculate discount
  IF v_promo.discount_type = 'percentage' THEN
    v_discount := p_order_total * (v_promo.discount_value / 100);
  ELSE
    v_discount := LEAST(v_promo.discount_value, p_order_total);
  END IF;
  
  -- Record usage
  INSERT INTO promo_code_usage (promo_code_id, order_id, user_id, discount_applied)
  VALUES (v_promo.id, p_order_id, p_user_id, v_discount);
  
  -- Update usage count
  UPDATE promo_codes 
  SET current_uses = current_uses + 1
  WHERE id = v_promo.id;
  
  RETURN QUERY SELECT TRUE, v_discount, 'Promo code applied successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initiate ticket transfer
CREATE OR REPLACE FUNCTION initiate_ticket_transfer(
  p_ticket_id UUID,
  p_to_email VARCHAR,
  p_to_name VARCHAR DEFAULT NULL,
  p_message TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  transfer_code VARCHAR,
  message TEXT
) AS $$
DECLARE
  v_ticket tickets%ROWTYPE;
  v_code VARCHAR;
BEGIN
  -- Verify ticket ownership and status
  SELECT * INTO v_ticket
  FROM tickets
  WHERE id = p_ticket_id
    AND user_id = auth.uid()
    AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, ''::VARCHAR, 'Ticket not found or not transferable'::TEXT;
    RETURN;
  END IF;
  
  -- Generate transfer code
  v_code := 'TRF-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8));
  
  -- Create transfer record
  INSERT INTO ticket_transfers (
    ticket_id, from_user_id, to_email, to_name, message, 
    transfer_code, expires_at
  )
  VALUES (
    p_ticket_id, auth.uid(), p_to_email, p_to_name, p_message,
    v_code, NOW() + INTERVAL '7 days'
  );
  
  -- Update ticket status
  UPDATE tickets SET status = 'transfer_pending' WHERE id = p_ticket_id;
  
  RETURN QUERY SELECT TRUE, v_code, 'Transfer initiated successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-expire promo codes
CREATE OR REPLACE FUNCTION check_promo_code_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.valid_until < NOW() AND NEW.status = 'active' THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER promo_code_expiry_check
  BEFORE INSERT OR UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION check_promo_code_expiry();

-- Updated at trigger for promo_codes
CREATE TRIGGER promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Updated at trigger for collections
CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
