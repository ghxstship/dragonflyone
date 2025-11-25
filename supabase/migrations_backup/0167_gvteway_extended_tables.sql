-- Migration: Extended GVTEWAY Tables
-- Description: Tables for GA floor configs, VIP zones, and event features

-- GA floor configurations table
CREATE TABLE IF NOT EXISTS ga_floor_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  name VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL,
  zones JSONB,
  barriers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VIP zones table
CREATE TABLE IF NOT EXISTS vip_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('vip', 'platinum', 'backstage', 'lounge', 'meet_greet')),
  capacity INTEGER NOT NULL,
  sold INTEGER DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  amenities TEXT[],
  access_level VARCHAR(20) DEFAULT 'standard' CHECK (access_level IN ('standard', 'premium', 'all_access')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Age restrictions table
CREATE TABLE IF NOT EXISTS event_age_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  minimum_age INTEGER,
  restriction_type VARCHAR(30) CHECK (restriction_type IN ('all_ages', '18+', '21+', 'family', 'custom')),
  content_warnings TEXT[],
  verification_required BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event parking info table
CREATE TABLE IF NOT EXISTS event_parking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  lot_name VARCHAR(100) NOT NULL,
  address TEXT,
  capacity INTEGER,
  price DECIMAL(10, 2),
  is_prepaid BOOLEAN DEFAULT FALSE,
  distance_to_venue VARCHAR(50),
  accessibility_features TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event weather policies table
CREATE TABLE IF NOT EXISTS event_weather_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  rain_policy TEXT,
  extreme_heat_policy TEXT,
  extreme_cold_policy TEXT,
  lightning_policy TEXT,
  cancellation_policy TEXT,
  refund_policy TEXT,
  contingency_venue_id UUID REFERENCES venues(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS campaigns table
CREATE TABLE IF NOT EXISTS sms_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  event_id UUID REFERENCES events(id),
  message TEXT NOT NULL,
  segment_criteria JSONB,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  recipient_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opt_out_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS opt-ins table
CREATE TABLE IF NOT EXISTS sms_opt_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id),
  phone_number VARCHAR(20) NOT NULL,
  opted_in BOOLEAN DEFAULT TRUE,
  opted_in_at TIMESTAMPTZ DEFAULT NOW(),
  opted_out_at TIMESTAMPTZ,
  source VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ga_floor_configs_event ON ga_floor_configs(event_id);
CREATE INDEX IF NOT EXISTS idx_vip_zones_event ON vip_zones(event_id);
CREATE INDEX IF NOT EXISTS idx_vip_zones_type ON vip_zones(type);
CREATE INDEX IF NOT EXISTS idx_event_age_restrictions_event ON event_age_restrictions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_parking_event ON event_parking(event_id);
CREATE INDEX IF NOT EXISTS idx_event_weather_policies_event ON event_weather_policies(event_id);
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_event ON sms_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_status ON sms_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_sms_opt_ins_user ON sms_opt_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_opt_ins_phone ON sms_opt_ins(phone_number);

-- RLS Policies
ALTER TABLE ga_floor_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_age_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_parking ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_weather_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_opt_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY ga_floor_configs_view ON ga_floor_configs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY vip_zones_view ON vip_zones FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY event_age_restrictions_view ON event_age_restrictions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY event_parking_view ON event_parking FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY event_weather_policies_view ON event_weather_policies FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY sms_campaigns_view ON sms_campaigns FOR SELECT USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'GVTEWAY_TEAM_MEMBER' = ANY(platform_roles))
);

CREATE POLICY sms_opt_ins_view ON sms_opt_ins FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'GVTEWAY_ADMIN' = ANY(platform_roles))
);

CREATE POLICY ga_floor_configs_manage ON ga_floor_configs FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('GVTEWAY_TEAM_MEMBER' = ANY(platform_roles) OR 'GVTEWAY_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY vip_zones_manage ON vip_zones FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND ('GVTEWAY_TEAM_MEMBER' = ANY(platform_roles) OR 'GVTEWAY_ADMIN' = ANY(platform_roles)))
);

CREATE POLICY sms_campaigns_manage ON sms_campaigns FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'GVTEWAY_ADMIN' = ANY(platform_roles))
);
