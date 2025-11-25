-- Migration: Subscriptions & Memberships System
-- Description: Tables for subscription plans, memberships, and recurring billing

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('individual', 'family', 'corporate', 'vip', 'premium')),
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'quarterly', 'annual', 'lifetime')),
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  trial_days INT DEFAULT 0,
  features JSONB,
  benefits TEXT[],
  ticket_credits INT DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  priority_access BOOLEAN DEFAULT false,
  exclusive_events BOOLEAN DEFAULT false,
  free_shipping BOOLEAN DEFAULT false,
  concierge_service BOOLEAN DEFAULT false,
  max_members INT DEFAULT 1,
  stripe_price_id TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_org ON subscription_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_type ON subscription_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  organization_id UUID REFERENCES organizations(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'expired', 'paused')),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancellation_reason TEXT,
  paused_at TIMESTAMPTZ,
  resume_at TIMESTAMPTZ,
  ticket_credits_remaining INT DEFAULT 0,
  ticket_credits_used INT DEFAULT 0,
  billing_cycle_anchor TIMESTAMPTZ,
  payment_method_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe ON user_subscriptions(stripe_subscription_id);

-- Subscription invoices table
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  invoice_number TEXT NOT NULL,
  stripe_invoice_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  pdf_url TEXT,
  hosted_invoice_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_invoices_subscription ON subscription_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_user ON subscription_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_status ON subscription_invoices(status);

-- Membership tiers table
CREATE TABLE IF NOT EXISTS membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  tier_level INT NOT NULL DEFAULT 1,
  points_required INT DEFAULT 0,
  annual_spend_required NUMERIC(10,2) DEFAULT 0,
  events_attended_required INT DEFAULT 0,
  benefits JSONB,
  perks TEXT[],
  badge_image_url TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_membership_tiers_org ON membership_tiers(organization_id);
CREATE INDEX IF NOT EXISTS idx_membership_tiers_level ON membership_tiers(tier_level);

-- User memberships table
CREATE TABLE IF NOT EXISTS user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  tier_id UUID NOT NULL REFERENCES membership_tiers(id),
  organization_id UUID REFERENCES organizations(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'suspended')),
  points_balance INT DEFAULT 0,
  lifetime_points INT DEFAULT 0,
  annual_spend NUMERIC(15,2) DEFAULT 0,
  events_attended INT DEFAULT 0,
  member_since TIMESTAMPTZ DEFAULT NOW(),
  tier_achieved_at TIMESTAMPTZ DEFAULT NOW(),
  next_tier_progress NUMERIC(5,2) DEFAULT 0,
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_memberships_user ON user_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_tier ON user_memberships(tier_id);
CREATE INDEX IF NOT EXISTS idx_user_memberships_status ON user_memberships(status);

-- Points transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  membership_id UUID REFERENCES user_memberships(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'adjust', 'bonus', 'transfer')),
  points INT NOT NULL,
  balance_after INT NOT NULL,
  source TEXT,
  source_id UUID,
  description TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created ON points_transactions(created_at);

-- Function to check subscription status
CREATE OR REPLACE FUNCTION check_subscription_status(p_user_id UUID)
RETURNS TABLE (
  has_active_subscription BOOLEAN,
  subscription_id UUID,
  plan_name TEXT,
  status TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE,
    us.id,
    sp.name,
    us.status,
    us.current_period_end
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id
    AND us.status IN ('active', 'trialing')
    AND us.current_period_end > NOW()
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TIMESTAMPTZ;
  END IF;
END;
$$;

-- Function to add points
CREATE OR REPLACE FUNCTION add_points(
  p_user_id UUID,
  p_points INT,
  p_source TEXT,
  p_source_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_membership RECORD;
  v_new_balance INT;
BEGIN
  -- Get user membership
  SELECT * INTO v_membership
  FROM user_memberships
  WHERE user_id = p_user_id AND status = 'active'
  ORDER BY created_at DESC LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active membership found';
  END IF;
  
  v_new_balance := v_membership.points_balance + p_points;
  
  -- Update membership
  UPDATE user_memberships SET
    points_balance = v_new_balance,
    lifetime_points = lifetime_points + p_points,
    updated_at = NOW()
  WHERE id = v_membership.id;
  
  -- Record transaction
  INSERT INTO points_transactions (
    user_id, membership_id, transaction_type, points, balance_after, source, source_id, description
  )
  VALUES (
    p_user_id, v_membership.id, 'earn', p_points, v_new_balance, p_source, p_source_id, p_description
  );
  
  -- Check for tier upgrade
  PERFORM check_tier_upgrade(p_user_id);
  
  RETURN v_new_balance;
END;
$$;

-- Function to check tier upgrade
CREATE OR REPLACE FUNCTION check_tier_upgrade(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_membership RECORD;
  v_next_tier RECORD;
BEGIN
  SELECT um.*, mt.tier_level INTO v_membership
  FROM user_memberships um
  JOIN membership_tiers mt ON mt.id = um.tier_id
  WHERE um.user_id = p_user_id AND um.status = 'active'
  ORDER BY um.created_at DESC LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Find next tier
  SELECT * INTO v_next_tier
  FROM membership_tiers
  WHERE organization_id = v_membership.organization_id
    AND tier_level > v_membership.tier_level
    AND is_active = TRUE
    AND (
      (points_required > 0 AND v_membership.lifetime_points >= points_required) OR
      (annual_spend_required > 0 AND v_membership.annual_spend >= annual_spend_required) OR
      (events_attended_required > 0 AND v_membership.events_attended >= events_attended_required)
    )
  ORDER BY tier_level ASC
  LIMIT 1;
  
  IF FOUND THEN
    UPDATE user_memberships SET
      tier_id = v_next_tier.id,
      tier_achieved_at = NOW(),
      updated_at = NOW()
    WHERE id = v_membership.id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Insert default membership tiers
INSERT INTO membership_tiers (name, slug, tier_level, points_required, benefits, perks)
VALUES 
  ('Bronze', 'bronze', 1, 0, '{"discount": 0}', ARRAY['Early access to select events']),
  ('Silver', 'silver', 2, 1000, '{"discount": 5}', ARRAY['5% discount', 'Priority customer support', 'Exclusive presales']),
  ('Gold', 'gold', 3, 5000, '{"discount": 10}', ARRAY['10% discount', 'Free shipping', 'VIP lounge access', 'Dedicated concierge']),
  ('Platinum', 'platinum', 4, 15000, '{"discount": 15}', ARRAY['15% discount', 'Complimentary upgrades', 'Meet & greet opportunities', 'Exclusive events'])
ON CONFLICT DO NOTHING;

-- RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON subscription_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_subscriptions TO authenticated;
GRANT SELECT ON subscription_invoices TO authenticated;
GRANT SELECT ON membership_tiers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_memberships TO authenticated;
GRANT SELECT, INSERT ON points_transactions TO authenticated;
GRANT EXECUTE ON FUNCTION check_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_points(UUID, INT, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_tier_upgrade(UUID) TO authenticated;
