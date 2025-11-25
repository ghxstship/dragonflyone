-- Migration: Extended Ticketing Tables
-- Description: Tables for member benefits, secondary market, and ticket features

-- Member benefits table
CREATE TABLE IF NOT EXISTS member_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_tier_id UUID NOT NULL REFERENCES membership_tiers(id),
  name VARCHAR(200) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('discount', 'priority_access', 'exclusive_content', 'free_item', 'upgrade', 'early_access')),
  value DECIMAL(10, 2),
  description TEXT,
  terms TEXT,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resale listings table
CREATE TABLE IF NOT EXISTS resale_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  seller_id UUID NOT NULL REFERENCES platform_users(id),
  buyer_id UUID REFERENCES platform_users(id),
  asking_price DECIMAL(10, 2) NOT NULL,
  min_price DECIMAL(10, 2),
  allow_offers BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled', 'expired')),
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resale price controls table
CREATE TABLE IF NOT EXISTS resale_price_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  max_price DECIMAL(10, 2),
  max_markup_percent DECIMAL(5, 2),
  min_price DECIMAL(10, 2),
  allow_resale BOOLEAN DEFAULT TRUE,
  verification_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Will call entries table
CREATE TABLE IF NOT EXISTS will_call_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  event_id UUID NOT NULL REFERENCES events(id),
  pickup_name VARCHAR(200) NOT NULL,
  pickup_email VARCHAR(200),
  pickup_phone VARCHAR(50),
  id_type VARCHAR(50),
  id_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'cancelled')),
  picked_up_at TIMESTAMPTZ,
  picked_up_by VARCHAR(200),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mobile ticket deliveries table
CREATE TABLE IF NOT EXISTS mobile_ticket_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES tickets(id),
  delivery_method VARCHAR(20) NOT NULL CHECK (delivery_method IN ('email', 'sms', 'push')),
  recipient VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_member_benefits_tier ON member_benefits(membership_tier_id);
CREATE INDEX IF NOT EXISTS idx_member_benefits_type ON member_benefits(type);
CREATE INDEX IF NOT EXISTS idx_resale_listings_ticket ON resale_listings(ticket_id);
CREATE INDEX IF NOT EXISTS idx_resale_listings_seller ON resale_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_resale_listings_status ON resale_listings(status);
CREATE INDEX IF NOT EXISTS idx_resale_price_controls_event ON resale_price_controls(event_id);
CREATE INDEX IF NOT EXISTS idx_will_call_event ON will_call_entries(event_id);
CREATE INDEX IF NOT EXISTS idx_will_call_status ON will_call_entries(status);
CREATE INDEX IF NOT EXISTS idx_mobile_deliveries_ticket ON mobile_ticket_deliveries(ticket_id);

-- RLS Policies
ALTER TABLE member_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE resale_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resale_price_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE will_call_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_ticket_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY member_benefits_view ON member_benefits FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY resale_listings_view ON resale_listings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY resale_price_controls_view ON resale_price_controls FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY will_call_view ON will_call_entries FOR SELECT USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('GVTEWAY_TEAM_MEMBER' = ANY(platform_roles) OR 'GVTEWAY_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY resale_listings_manage ON resale_listings FOR ALL USING (
  seller_id = auth.uid() OR
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'GVTEWAY_ADMIN' = ANY(platform_roles))
);

CREATE POLICY member_benefits_manage ON member_benefits FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'GVTEWAY_ADMIN' = ANY(platform_roles))
);

CREATE POLICY will_call_manage ON will_call_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('GVTEWAY_TEAM_MEMBER' = ANY(platform_roles) OR 'GVTEWAY_ADMIN' = ANY(platform_roles)))
);
