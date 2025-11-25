-- Migration: Memberships & Subscriptions System
-- Description: Tables for membership tiers, subscriptions, benefits, and billing

-- Membership tiers table
CREATE TABLE IF NOT EXISTS membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  tier_level INT NOT NULL,
  monthly_price NUMERIC(10,2),
  annual_price NUMERIC(10,2),
  benefits JSONB,
  features TEXT[],
  ticket_discount_percent NUMERIC(5,2),
  early_access_hours INT,
  exclusive_events BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  free_shipping BOOLEAN DEFAULT false,
  points_multiplier NUMERIC(3,2) DEFAULT 1.0,
  max_members INT,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_membership_tiers_org ON membership_tiers(organization_id);
CREATE INDEX IF NOT EXISTS idx_membership_tiers_level ON membership_tiers(tier_level);

-- Memberships table
CREATE TABLE IF NOT EXISTS memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  tier_id UUID REFERENCES membership_tiers(id),
  tier TEXT NOT NULL CHECK (tier IN ('member', 'member_plus', 'member_extra', 'vip', 'premium', 'elite')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'cancelled', 'expired')),
  start_date DATE NOT NULL,
  end_date DATE,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual', 'lifetime')),
  auto_renew BOOLEAN DEFAULT true,
  payment_method_id UUID,
  stripe_subscription_id TEXT,
  next_billing_date DATE,
  last_payment_date DATE,
  last_payment_amount NUMERIC(10,2),
  total_paid NUMERIC(15,2) DEFAULT 0,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  resume_date DATE,
  referral_code TEXT,
  referred_by UUID REFERENCES platform_users(id),
  notes TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_tier ON memberships(tier);
CREATE INDEX IF NOT EXISTS idx_memberships_status ON memberships(status);
CREATE INDEX IF NOT EXISTS idx_memberships_end_date ON memberships(end_date);

-- Membership benefits usage table
CREATE TABLE IF NOT EXISTS membership_benefits_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  benefit_type TEXT NOT NULL CHECK (benefit_type IN ('ticket_discount', 'early_access', 'exclusive_event', 'free_shipping', 'points_bonus', 'lounge_access', 'meet_greet', 'other')),
  used_at TIMESTAMPTZ DEFAULT NOW(),
  event_id UUID REFERENCES events(id),
  order_id UUID REFERENCES orders(id),
  value_amount NUMERIC(10,2),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_membership_benefits_usage_membership ON membership_benefits_usage(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_benefits_usage_type ON membership_benefits_usage(benefit_type);

-- Membership invoices table
CREATE TABLE IF NOT EXISTS membership_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES memberships(id),
  invoice_number TEXT NOT NULL,
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_membership_invoices_membership ON membership_invoices(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_invoices_status ON membership_invoices(status);

-- Membership activity log table
CREATE TABLE IF NOT EXISTS membership_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('created', 'upgraded', 'downgraded', 'renewed', 'paused', 'resumed', 'cancelled', 'expired', 'payment_success', 'payment_failed')),
  old_tier TEXT,
  new_tier TEXT,
  amount NUMERIC(10,2),
  notes TEXT,
  performed_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_membership_activity_log_membership ON membership_activity_log(membership_id);

-- Season passes table
CREATE TABLE IF NOT EXISTS season_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  season_year INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  max_passes INT,
  passes_sold INT DEFAULT 0,
  included_events UUID[],
  excluded_events UUID[],
  benefits JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_season_passes_org ON season_passes(organization_id);
CREATE INDEX IF NOT EXISTS idx_season_passes_year ON season_passes(season_year);

-- User season passes table
CREATE TABLE IF NOT EXISTS user_season_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  season_pass_id UUID NOT NULL REFERENCES season_passes(id),
  pass_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired', 'cancelled')),
  purchase_date DATE NOT NULL,
  purchase_price NUMERIC(10,2) NOT NULL,
  events_attended INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, season_pass_id)
);

CREATE INDEX IF NOT EXISTS idx_user_season_passes_user ON user_season_passes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_season_passes_pass ON user_season_passes(season_pass_id);

-- Function to check membership status
CREATE OR REPLACE FUNCTION check_membership_status(p_user_id UUID)
RETURNS TABLE (
  is_member BOOLEAN,
  tier TEXT,
  tier_level INT,
  expires_at DATE,
  benefits JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE AS is_member,
    m.tier,
    COALESCE(mt.tier_level, 0) AS tier_level,
    m.end_date AS expires_at,
    mt.benefits
  FROM memberships m
  LEFT JOIN membership_tiers mt ON m.tier_id = mt.id
  WHERE m.user_id = p_user_id
    AND m.status = 'active'
    AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
  ORDER BY mt.tier_level DESC NULLS LAST
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::TEXT, 0, NULL::DATE, NULL::JSONB;
  END IF;
END;
$$;

-- Function to process membership expiration
CREATE OR REPLACE FUNCTION process_membership_expirations()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE memberships SET
    status = 'expired',
    updated_at = NOW()
  WHERE status = 'active'
    AND end_date < CURRENT_DATE
    AND auto_renew = FALSE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- Log expirations
  INSERT INTO membership_activity_log (membership_id, activity_type, notes)
  SELECT id, 'expired', 'Membership expired'
  FROM memberships
  WHERE status = 'expired'
    AND updated_at >= NOW() - INTERVAL '1 minute';
  
  RETURN v_count;
END;
$$;

-- RLS policies
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_benefits_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_season_passes ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON membership_tiers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON memberships TO authenticated;
GRANT SELECT, INSERT ON membership_benefits_usage TO authenticated;
GRANT SELECT ON membership_invoices TO authenticated;
GRANT SELECT, INSERT ON membership_activity_log TO authenticated;
GRANT SELECT ON season_passes TO authenticated;
GRANT SELECT, INSERT ON user_season_passes TO authenticated;
GRANT EXECUTE ON FUNCTION check_membership_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION process_membership_expirations() TO authenticated;
