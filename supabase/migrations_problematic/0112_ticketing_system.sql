-- Migration: Ticketing System
-- Description: Tables for tickets, orders, transfers, gifts, and waitlists

-- Ticket types table
CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  quantity INT NOT NULL,
  available INT NOT NULL,
  sold INT DEFAULT 0,
  reserved INT DEFAULT 0,
  min_per_order INT DEFAULT 1,
  max_per_order INT DEFAULT 10,
  ticket_category TEXT CHECK (ticket_category IN ('general', 'vip', 'premium', 'early_bird', 'student', 'senior', 'military', 'group', 'comp', 'press')),
  section TEXT,
  row TEXT,
  seat_start INT,
  seat_end INT,
  is_seated BOOLEAN DEFAULT false,
  includes TEXT[],
  restrictions TEXT,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'hidden', 'password', 'invite_only')),
  access_code TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_types_category ON ticket_types(ticket_category);
CREATE INDEX IF NOT EXISTS idx_ticket_types_active ON ticket_types(is_active);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  event_id UUID NOT NULL REFERENCES events(id),
  customer_id UUID REFERENCES platform_users(id),
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed', 'expired')),
  order_type TEXT DEFAULT 'purchase' CHECK (order_type IN ('purchase', 'gift', 'transfer', 'comp', 'exchange', 'upgrade')),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  service_fee NUMERIC(10,2) DEFAULT 0,
  facility_fee NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'partial', 'refunded', 'failed')),
  payment_method TEXT,
  payment_intent_id TEXT,
  stripe_session_id TEXT,
  promo_code_id UUID,
  promo_code TEXT,
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  billing_address JSONB,
  shipping_address JSONB,
  delivery_method TEXT DEFAULT 'digital' CHECK (delivery_method IN ('digital', 'will_call', 'mail', 'print_at_home')),
  notes TEXT,
  internal_notes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_event ON orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  event_id UUID NOT NULL REFERENCES events(id),
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
  holder_id UUID REFERENCES platform_users(id),
  barcode TEXT UNIQUE,
  qr_code TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled', 'transferred', 'refunded', 'expired', 'gift_pending', 'gift_claimed')),
  section TEXT,
  row TEXT,
  seat TEXT,
  price_paid NUMERIC(10,2) NOT NULL,
  holder_name TEXT,
  holder_email TEXT,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES platform_users(id),
  check_in_location TEXT,
  transfer_count INT DEFAULT 0,
  max_transfers INT DEFAULT 3,
  is_transferable BOOLEAN DEFAULT true,
  is_resaleable BOOLEAN DEFAULT true,
  original_holder_id UUID REFERENCES platform_users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_order ON tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_holder ON tickets(holder_id);
CREATE INDEX IF NOT EXISTS idx_tickets_barcode ON tickets(barcode);
CREATE INDEX IF NOT EXISTS idx_tickets_qr ON tickets(qr_code);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- Ticket transfers table
CREATE TABLE IF NOT EXISTS ticket_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  from_user_id UUID REFERENCES platform_users(id),
  to_user_id UUID REFERENCES platform_users(id),
  to_email TEXT NOT NULL,
  to_name TEXT,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('gift', 'transfer', 'resale')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  message TEXT,
  sale_price NUMERIC(10,2),
  platform_fee NUMERIC(10,2),
  seller_payout NUMERIC(10,2),
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_transfers_ticket ON ticket_transfers(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_from ON ticket_transfers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_to ON ticket_transfers(to_user_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_status ON ticket_transfers(status);

-- Waitlist table
CREATE TABLE IF NOT EXISTS event_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  ticket_type_id UUID REFERENCES ticket_types(id),
  user_id UUID REFERENCES platform_users(id),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  quantity INT DEFAULT 1,
  priority INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'converted', 'expired', 'cancelled')),
  notified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, email, ticket_type_id)
);

CREATE INDEX IF NOT EXISTS idx_event_waitlist_event ON event_waitlist(event_id);
CREATE INDEX IF NOT EXISTS idx_event_waitlist_user ON event_waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_event_waitlist_status ON event_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_event_waitlist_priority ON event_waitlist(priority DESC, created_at ASC);

-- Promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  event_id UUID REFERENCES events(id),
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_ticket', 'bogo')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_purchase NUMERIC(10,2),
  max_discount NUMERIC(10,2),
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'specific_tickets', 'specific_events')),
  ticket_type_ids UUID[],
  usage_limit INT,
  usage_count INT DEFAULT 0,
  per_user_limit INT DEFAULT 1,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  requires_email_domain TEXT,
  requires_verification BOOLEAN DEFAULT false,
  verification_type TEXT CHECK (verification_type IN ('student', 'military', 'senior', 'employee', 'member')),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_org ON promo_codes(organization_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_event ON promo_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);

-- Seating charts table
CREATE TABLE IF NOT EXISTS seating_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  venue_id UUID REFERENCES venues(id),
  name TEXT NOT NULL,
  description TEXT,
  chart_type TEXT NOT NULL CHECK (chart_type IN ('seated', 'general_admission', 'mixed', 'table', 'custom')),
  total_capacity INT NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]',
  rows JSONB,
  seats JSONB,
  svg_data TEXT,
  image_url TEXT,
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seating_charts_org ON seating_charts(organization_id);
CREATE INDEX IF NOT EXISTS idx_seating_charts_venue ON seating_charts(venue_id);

-- Event seating table (links events to seating charts)
CREATE TABLE IF NOT EXISTS event_seating (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  seating_chart_id UUID NOT NULL REFERENCES seating_charts(id),
  section_pricing JSONB,
  seat_holds JSONB,
  seat_kills JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_seating_event ON event_seating(event_id);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_number TEXT;
BEGIN
  v_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
  RETURN v_number;
END;
$$;

-- Function to generate ticket barcode
CREATE OR REPLACE FUNCTION generate_ticket_barcode()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'TKT-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 8)) || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$;

-- Function to update ticket availability
CREATE OR REPLACE FUNCTION update_ticket_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ticket_types SET
      sold = sold + 1,
      available = available - 1,
      updated_at = NOW()
    WHERE id = NEW.ticket_type_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IN ('cancelled', 'refunded') AND OLD.status NOT IN ('cancelled', 'refunded') THEN
    UPDATE ticket_types SET
      sold = sold - 1,
      available = available + 1,
      updated_at = NOW()
    WHERE id = NEW.ticket_type_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ticket_availability_trigger ON tickets;
CREATE TRIGGER ticket_availability_trigger
  AFTER INSERT OR UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_availability();

-- Function to process waitlist when tickets become available
CREATE OR REPLACE FUNCTION process_waitlist(p_event_id UUID, p_ticket_type_id UUID DEFAULT NULL)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_available INT;
  v_waitlist RECORD;
  v_notified INT := 0;
BEGIN
  -- Get available tickets
  SELECT available INTO v_available
  FROM ticket_types
  WHERE event_id = p_event_id
    AND (p_ticket_type_id IS NULL OR id = p_ticket_type_id)
    AND available > 0
  LIMIT 1;
  
  IF v_available IS NULL OR v_available = 0 THEN
    RETURN 0;
  END IF;
  
  -- Notify waitlist entries
  FOR v_waitlist IN
    SELECT * FROM event_waitlist
    WHERE event_id = p_event_id
      AND (p_ticket_type_id IS NULL OR ticket_type_id = p_ticket_type_id)
      AND status = 'waiting'
    ORDER BY priority DESC, created_at ASC
    LIMIT v_available
  LOOP
    UPDATE event_waitlist SET
      status = 'notified',
      notified_at = NOW(),
      expires_at = NOW() + INTERVAL '24 hours'
    WHERE id = v_waitlist.id;
    
    v_notified := v_notified + 1;
  END LOOP;
  
  RETURN v_notified;
END;
$$;

-- Function to validate promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_event_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  promo_code_id UUID,
  discount_type TEXT,
  discount_value NUMERIC,
  error_message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_promo RECORD;
  v_user_usage INT;
BEGIN
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE code = UPPER(p_code)
    AND is_active = TRUE
    AND (event_id IS NULL OR event_id = p_event_id)
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW());
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Invalid promo code';
    RETURN;
  END IF;
  
  IF v_promo.usage_limit IS NOT NULL AND v_promo.usage_count >= v_promo.usage_limit THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Promo code usage limit reached';
    RETURN;
  END IF;
  
  IF p_user_id IS NOT NULL AND v_promo.per_user_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_usage
    FROM orders
    WHERE customer_id = p_user_id AND promo_code_id = v_promo.id;
    
    IF v_user_usage >= v_promo.per_user_limit THEN
      RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'You have already used this promo code';
      RETURN;
    END IF;
  END IF;
  
  RETURN QUERY SELECT TRUE, v_promo.id, v_promo.discount_type, v_promo.discount_value, NULL::TEXT;
END;
$$;

-- RLS policies
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_seating ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON ticket_types TO authenticated;
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ticket_transfers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON event_waitlist TO authenticated;
GRANT SELECT, INSERT, UPDATE ON promo_codes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON seating_charts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON event_seating TO authenticated;
GRANT EXECUTE ON FUNCTION generate_order_number() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_ticket_barcode() TO authenticated;
GRANT EXECUTE ON FUNCTION process_waitlist(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_promo_code(TEXT, UUID, UUID) TO authenticated;
