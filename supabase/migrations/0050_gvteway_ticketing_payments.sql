-- ============================================================================
-- 0050_gvteway_ticketing_payments.sql
-- GVTEWAY Ticketing & Payments - 3NF Compliant Schema
-- GHXSTSHIP Platform - Enterprise Grade
-- ============================================================================

-- ============================================================================
-- TICKET TYPES (Lookup Table - 3NF)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_types_code ON ticket_types(code);
CREATE INDEX IF NOT EXISTS idx_ticket_types_active ON ticket_types(is_active) WHERE is_active = true;

-- Seed ticket types
INSERT INTO ticket_types (code, name, description, sort_order) VALUES
  ('general_admission', 'General Admission', 'Standard entry ticket', 1),
  ('vip', 'VIP', 'VIP access with premium benefits', 2),
  ('reserved', 'Reserved Seating', 'Assigned seat ticket', 3),
  ('early_bird', 'Early Bird', 'Discounted early purchase ticket', 4),
  ('group', 'Group', 'Group booking ticket', 5),
  ('student', 'Student', 'Student discount ticket', 6),
  ('senior', 'Senior', 'Senior discount ticket', 7),
  ('child', 'Child', 'Child ticket', 8),
  ('companion', 'Companion', 'Accessibility companion ticket', 9),
  ('press', 'Press', 'Media/Press pass', 10),
  ('artist_guest', 'Artist Guest', 'Artist guest list ticket', 11),
  ('sponsor', 'Sponsor', 'Sponsor ticket', 12)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- TICKET STATUSES (Lookup Table - 3NF)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ticket_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_terminal BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO ticket_statuses (code, name, description, is_terminal, sort_order) VALUES
  ('pending', 'Pending', 'Ticket purchase pending', false, 1),
  ('confirmed', 'Confirmed', 'Ticket purchase confirmed', false, 2),
  ('issued', 'Issued', 'Ticket issued to holder', false, 3),
  ('checked_in', 'Checked In', 'Ticket holder has entered venue', true, 4),
  ('transferred', 'Transferred', 'Ticket transferred to another person', true, 5),
  ('refunded', 'Refunded', 'Ticket refunded', true, 6),
  ('cancelled', 'Cancelled', 'Ticket cancelled', true, 7),
  ('expired', 'Expired', 'Ticket expired', true, 8)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- TICKETS (Main Table - 3NF)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  ticket_type_id UUID NOT NULL REFERENCES ticket_types(id),
  status_id UUID NOT NULL REFERENCES ticket_statuses(id),
  
  -- Ticket identification
  ticket_number TEXT NOT NULL,
  barcode TEXT,
  qr_code_url TEXT,
  
  -- Holder information (FK to people for 3NF)
  holder_id UUID REFERENCES legend_people(id) ON DELETE SET NULL,
  holder_email TEXT,
  holder_name TEXT,
  holder_phone TEXT,
  
  -- Seating (if applicable)
  section TEXT,
  row_name TEXT,
  seat_number TEXT,
  is_accessible BOOLEAN DEFAULT false,
  
  -- Pricing
  face_value NUMERIC(10,2) NOT NULL,
  service_fee NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Validity
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  
  -- Check-in tracking
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES platform_users(id),
  check_in_location TEXT,
  
  -- Transfer tracking
  original_holder_id UUID REFERENCES legend_people(id),
  transferred_at TIMESTAMPTZ,
  transfer_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, ticket_number)
);

CREATE INDEX IF NOT EXISTS idx_tickets_org ON tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_order ON tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_holder ON tickets(holder_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status_id);
CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(ticket_type_id);
CREATE INDEX IF NOT EXISTS idx_tickets_barcode ON tickets(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_number ON tickets(ticket_number);

-- ============================================================================
-- TICKET ADDONS (3NF - Separate table for addons)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ticket_addon_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  max_per_ticket INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, code)
);

CREATE TABLE IF NOT EXISTS public.ticket_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  addon_type_id UUID NOT NULL REFERENCES ticket_addon_types(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ticket_id, addon_type_id)
);

CREATE INDEX IF NOT EXISTS idx_ticket_addons_ticket ON ticket_addons(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_addons_type ON ticket_addons(addon_type_id);

-- ============================================================================
-- TICKET DELIVERIES (3NF - Separate delivery tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.delivery_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  fee NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO delivery_methods (code, name, description, fee, sort_order) VALUES
  ('mobile', 'Mobile Ticket', 'Digital ticket delivered to mobile app', 0, 1),
  ('email', 'Email', 'PDF ticket delivered via email', 0, 2),
  ('will_call', 'Will Call', 'Pick up at venue box office', 0, 3),
  ('mail', 'Standard Mail', 'Physical ticket mailed', 5.00, 4),
  ('express', 'Express Mail', 'Physical ticket express shipped', 15.00, 5)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.ticket_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  delivery_method_id UUID NOT NULL REFERENCES delivery_methods(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'failed')),
  tracking_number TEXT,
  carrier TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivery_address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_deliveries_ticket ON ticket_deliveries(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_deliveries_status ON ticket_deliveries(status);

-- ============================================================================
-- TICKET TRANSFERS (3NF - Transfer history)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ticket_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  from_holder_id UUID REFERENCES legend_people(id),
  to_holder_id UUID REFERENCES legend_people(id),
  from_email TEXT,
  to_email TEXT,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('transfer', 'gift', 'resale')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  message TEXT,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_transfers_ticket ON ticket_transfers(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_from ON ticket_transfers(from_holder_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_to ON ticket_transfers(to_holder_id);
CREATE INDEX IF NOT EXISTS idx_ticket_transfers_status ON ticket_transfers(status);

-- ============================================================================
-- PAYMENT METHODS (Lookup Table - 3NF)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  processor TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO payment_methods (code, name, processor, sort_order) VALUES
  ('credit_card', 'Credit Card', 'stripe', 1),
  ('debit_card', 'Debit Card', 'stripe', 2),
  ('apple_pay', 'Apple Pay', 'stripe', 3),
  ('google_pay', 'Google Pay', 'stripe', 4),
  ('paypal', 'PayPal', 'paypal', 5),
  ('bank_transfer', 'Bank Transfer', 'stripe', 6),
  ('cash', 'Cash', 'manual', 7),
  ('gift_card', 'Gift Card', 'internal', 8),
  ('loyalty_points', 'Loyalty Points', 'internal', 9),
  ('invoice', 'Invoice', 'internal', 10)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- PAYMENTS (Main Table - 3NF)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
  
  -- Payment identification
  payment_number TEXT NOT NULL,
  external_id TEXT,
  processor_id TEXT,
  
  -- Payer information
  payer_id UUID REFERENCES legend_people(id),
  payer_email TEXT,
  payer_name TEXT,
  
  -- Amount
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  exchange_rate NUMERIC(10,6) DEFAULT 1,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled')),
  
  -- Processing details
  processor_response JSONB,
  failure_reason TEXT,
  
  -- Timestamps
  authorized_at TIMESTAMPTZ,
  captured_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Billing address
  billing_address JSONB,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, payment_number)
);

CREATE INDEX IF NOT EXISTS idx_payments_org ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer ON payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payments_external ON payments(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_processor ON payments(processor_id) WHERE processor_id IS NOT NULL;

-- ============================================================================
-- SPLIT PAYMENTS (3NF - Multiple payment methods per order)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.split_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  percentage NUMERIC(5,2),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_split_payments_order ON split_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_split_payments_payment ON split_payments(payment_id);

-- ============================================================================
-- REFUNDS (3NF - Separate refund tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  refund_number TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  reason TEXT,
  reason_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processor_id TEXT,
  processed_by UUID REFERENCES platform_users(id),
  processed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- ============================================================================
-- WAITLIST (3NF)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.event_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  ticket_type_id UUID REFERENCES ticket_types(id),
  quantity INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'converted', 'expired', 'cancelled')),
  notified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  converted_order_id UUID REFERENCES orders(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, email)
);

CREATE INDEX IF NOT EXISTS idx_waitlist_event ON event_waitlist(event_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON event_waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_user ON event_waitlist(user_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_addon_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_waitlist ENABLE ROW LEVEL SECURITY;

-- Public read for lookup tables
CREATE POLICY ticket_types_select ON ticket_types FOR SELECT USING (true);
CREATE POLICY ticket_statuses_select ON ticket_statuses FOR SELECT USING (true);
CREATE POLICY delivery_methods_select ON delivery_methods FOR SELECT USING (true);
CREATE POLICY payment_methods_select ON payment_methods FOR SELECT USING (true);

-- Tickets policies
CREATE POLICY tickets_select ON tickets FOR SELECT USING (
  org_matches(organization_id) OR 
  holder_id = current_platform_user_id()
);
CREATE POLICY tickets_insert ON tickets FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY tickets_update ON tickets FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY tickets_delete ON tickets FOR DELETE USING (
  org_matches(organization_id) AND 
  role_in('GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- Payments policies
CREATE POLICY payments_select ON payments FOR SELECT USING (
  org_matches(organization_id) OR 
  payer_id = current_platform_user_id()
);
CREATE POLICY payments_insert ON payments FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY payments_update ON payments FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY payments_delete ON payments FOR DELETE USING (
  org_matches(organization_id) AND 
  role_in('GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- Waitlist policies
CREATE POLICY waitlist_select ON event_waitlist FOR SELECT USING (
  org_matches(organization_id) OR 
  user_id = current_platform_user_id()
);
CREATE POLICY waitlist_insert ON event_waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY waitlist_update ON event_waitlist FOR UPDATE USING (
  org_matches(organization_id) OR 
  user_id = current_platform_user_id()
);
CREATE POLICY waitlist_delete ON event_waitlist FOR DELETE USING (
  org_matches(organization_id) OR 
  user_id = current_platform_user_id()
);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON ticket_types TO authenticated, anon;
GRANT SELECT ON ticket_statuses TO authenticated, anon;
GRANT SELECT ON delivery_methods TO authenticated, anon;
GRANT SELECT ON payment_methods TO authenticated, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_addon_types TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_addons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_deliveries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_transfers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON split_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON refunds TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON event_waitlist TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER ticket_addon_types_updated_at BEFORE UPDATE ON ticket_addon_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER ticket_deliveries_updated_at BEFORE UPDATE ON ticket_deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER refunds_updated_at BEFORE UPDATE ON refunds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER event_waitlist_updated_at BEFORE UPDATE ON event_waitlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
