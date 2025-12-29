-- Migration: Marketing Affiliate Tables
-- Description: Tables for affiliates, urgency tactics, retargeting pixels, and marketing analytics

-- Affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  social_handles JSONB,
  commission_rate DECIMAL(5, 2) NOT NULL,
  tier VARCHAR(20) CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  total_clicks INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate clicks table
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  event_id UUID REFERENCES events(id),
  source VARCHAR(100),
  ip_address VARCHAR(50),
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate conversions table
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  order_id UUID REFERENCES orders(id),
  order_amount DECIMAL(10, 2) NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  payout_id UUID,
  converted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate payouts table
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Urgency tactics table
CREATE TABLE IF NOT EXISTS urgency_tactics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  tactic_type VARCHAR(50) NOT NULL,
  config JSONB,
  enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, tactic_type)
);

-- Retargeting pixels table
CREATE TABLE IF NOT EXISTS retargeting_pixels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(30) CHECK (platform IN ('facebook', 'google', 'tiktok', 'snapchat', 'twitter', 'linkedin')),
  pixel_id VARCHAR(100) NOT NULL,
  name VARCHAR(200),
  event_id UUID REFERENCES events(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pixel events table
CREATE TABLE IF NOT EXISTS pixel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pixel_id UUID NOT NULL REFERENCES retargeting_pixels(id),
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB,
  user_id UUID REFERENCES platform_users(id),
  tracked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketing campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  name VARCHAR(200) NOT NULL,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  budget DECIMAL(10, 2),
  spent DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign clicks table
CREATE TABLE IF NOT EXISTS campaign_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id),
  user_id UUID REFERENCES platform_users(id),
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page views table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  page_type VARCHAR(50),
  user_id UUID REFERENCES platform_users(id),
  session_id VARCHAR(100),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checkout sessions table
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES platform_users(id),
  cart_value DECIMAL(10, 2),
  status VARCHAR(20) DEFAULT 'started',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Add UTM fields to orders if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'utm_source') THEN
    ALTER TABLE orders ADD COLUMN utm_source VARCHAR(100);
    ALTER TABLE orders ADD COLUMN utm_medium VARCHAR(100);
    ALTER TABLE orders ADD COLUMN utm_campaign VARCHAR(100);
    ALTER TABLE orders ADD COLUMN affiliate_code VARCHAR(50);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_affiliate ON affiliate_conversions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate ON affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_urgency_tactics_event ON urgency_tactics(event_id);
CREATE INDEX IF NOT EXISTS idx_retargeting_pixels_event ON retargeting_pixels(event_id);
CREATE INDEX IF NOT EXISTS idx_pixel_events_pixel ON pixel_events(pixel_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_event ON marketing_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_page_views_event ON page_views(event_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_event ON checkout_sessions(event_id);

-- RLS Policies
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE urgency_tactics ENABLE ROW LEVEL SECURITY;
ALTER TABLE retargeting_pixels ENABLE ROW LEVEL SECURITY;
ALTER TABLE pixel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY affiliates_view ON affiliates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY urgency_tactics_view ON urgency_tactics FOR SELECT USING (TRUE);
CREATE POLICY retargeting_pixels_view ON retargeting_pixels FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY marketing_campaigns_view ON marketing_campaigns FOR SELECT USING (auth.uid() IS NOT NULL);
