-- Migration: Extended Ticketing Tables
-- Description: Tables for print-at-home, currency pricing, tax calculation, and group organizer

-- Ticket print logs table
CREATE TABLE IF NOT EXISTS ticket_print_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  user_id UUID REFERENCES platform_users(id),
  printed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(50)
);

-- Event currency prices table
CREATE TABLE IF NOT EXISTS event_currency_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  currency_code VARCHAR(10) NOT NULL,
  price_multiplier DECIMAL(10, 4),
  fixed_price DECIMAL(10, 2),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, currency_code)
);

-- Tax exemptions table
CREATE TABLE IF NOT EXISTS tax_exemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id),
  exemption_type VARCHAR(50),
  certificate_number VARCHAR(100),
  expiry_date DATE,
  exemption_rate DECIMAL(5, 4) DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group registrations table
CREATE TABLE IF NOT EXISTS group_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  name VARCHAR(200) NOT NULL,
  organizer_name VARCHAR(200) NOT NULL,
  organizer_email VARCHAR(200) NOT NULL,
  organizer_phone VARCHAR(50),
  expected_size INTEGER NOT NULL,
  ticket_type_id UUID REFERENCES ticket_types(id),
  invite_code VARCHAR(20) UNIQUE,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES group_registrations(id),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(50),
  ticket_id UUID REFERENCES tickets(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group payments table
CREATE TABLE IF NOT EXISTS group_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES group_registrations(id),
  member_id UUID REFERENCES group_members(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ticket_print_logs_ticket ON ticket_print_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_event_currency_prices_event ON event_currency_prices(event_id);
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_user ON tax_exemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_group_registrations_event ON group_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_group_registrations_code ON group_registrations(invite_code);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_payments_group ON group_payments(group_id);

-- RLS Policies
ALTER TABLE ticket_print_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_currency_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_exemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY ticket_print_logs_view ON ticket_print_logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY event_currency_prices_view ON event_currency_prices FOR SELECT USING (TRUE);
CREATE POLICY tax_exemptions_view ON tax_exemptions FOR SELECT USING (user_id = auth.uid() OR auth.uid() IS NOT NULL);
CREATE POLICY group_registrations_view ON group_registrations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY group_members_view ON group_members FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY group_payments_view ON group_payments FOR SELECT USING (auth.uid() IS NOT NULL);
