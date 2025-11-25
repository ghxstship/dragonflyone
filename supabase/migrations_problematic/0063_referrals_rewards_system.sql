-- Migration: Referrals & Rewards System
-- Description: Tables and functions for referral programs, rewards, and loyalty

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  code TEXT NOT NULL UNIQUE,
  code_type TEXT NOT NULL DEFAULT 'personal' CHECK (code_type IN ('personal', 'promotional', 'influencer', 'partner', 'campaign')),
  display_name TEXT,
  description TEXT,
  referrer_reward_type TEXT NOT NULL CHECK (referrer_reward_type IN ('percentage', 'fixed_amount', 'credits', 'points', 'custom')),
  referrer_reward_value NUMERIC(10,2) NOT NULL,
  referee_reward_type TEXT NOT NULL CHECK (referee_reward_type IN ('percentage', 'fixed_amount', 'credits', 'points', 'custom')),
  referee_reward_value NUMERIC(10,2) NOT NULL,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  min_purchase_amount NUMERIC(10,2),
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id),
  referrer_id UUID NOT NULL REFERENCES platform_users(id),
  referee_id UUID REFERENCES platform_users(id),
  referee_email TEXT,
  referee_phone TEXT,
  referee_name TEXT,
  source TEXT DEFAULT 'web',
  campaign_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'qualified', 'rewarded', 'expired', 'cancelled')),
  signup_at TIMESTAMPTZ,
  qualified_at TIMESTAMPTZ,
  qualifying_order_id UUID REFERENCES orders(id),
  qualifying_amount NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Referral rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  referral_id UUID NOT NULL REFERENCES referrals(id),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('referrer', 'referee')),
  reward_category TEXT NOT NULL CHECK (reward_category IN ('percentage', 'fixed_amount', 'credits', 'points', 'custom')),
  reward_value NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'issued', 'redeemed', 'expired', 'cancelled')),
  issued_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  redeemed_order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_user ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON referral_rewards(status);

-- Loyalty points table
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  points_balance INT DEFAULT 0,
  lifetime_points INT DEFAULT 0,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  tier_points INT DEFAULT 0,
  tier_expiry DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_tier ON loyalty_points(tier);

-- Loyalty transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'adjust', 'bonus', 'transfer')),
  points INT NOT NULL,
  balance_after INT NOT NULL,
  source TEXT,
  source_id UUID,
  description TEXT,
  expires_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);

-- Rewards catalog table
CREATE TABLE IF NOT EXISTS rewards_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('discount', 'free_item', 'upgrade', 'experience', 'merchandise', 'credit')),
  points_required INT NOT NULL,
  tier_required TEXT CHECK (tier_required IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  reward_value NUMERIC(10,2),
  quantity_available INT,
  quantity_redeemed INT DEFAULT 0,
  image_url TEXT,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  terms_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rewards_catalog_category ON rewards_catalog(category);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_active ON rewards_catalog(is_active);

-- Generate referral code function
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INT, 1);
  END LOOP;
  
  -- Check uniqueness
  WHILE EXISTS (SELECT 1 FROM referral_codes WHERE code = result) LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INT, 1);
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Get user referral stats function
CREATE OR REPLACE FUNCTION get_user_referral_stats(p_user_id UUID)
RETURNS TABLE (
  total_referrals INT,
  successful_referrals INT,
  pending_referrals INT,
  total_rewards_earned NUMERIC,
  available_rewards NUMERIC,
  conversion_rate NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(r.id)::INT AS total_referrals,
    COUNT(r.id) FILTER (WHERE r.status IN ('qualified', 'rewarded'))::INT AS successful_referrals,
    COUNT(r.id) FILTER (WHERE r.status = 'pending')::INT AS pending_referrals,
    COALESCE(SUM(rw.reward_value) FILTER (WHERE rw.status IN ('issued', 'redeemed')), 0) AS total_rewards_earned,
    COALESCE(SUM(rw.reward_value) FILTER (WHERE rw.status = 'issued'), 0) AS available_rewards,
    CASE 
      WHEN COUNT(r.id) > 0 
      THEN ROUND((COUNT(r.id) FILTER (WHERE r.status IN ('qualified', 'rewarded'))::NUMERIC / COUNT(r.id)) * 100, 2)
      ELSE 0 
    END AS conversion_rate
  FROM referrals r
  LEFT JOIN referral_rewards rw ON r.id = rw.referral_id AND rw.reward_type = 'referrer'
  WHERE r.referrer_id = p_user_id;
END;
$$;

-- Process referral signup function
CREATE OR REPLACE FUNCTION process_referral_signup(p_referral_id UUID, p_referee_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE referrals SET
    referee_id = p_referee_user_id,
    status = 'signed_up',
    signup_at = NOW(),
    updated_at = NOW()
  WHERE id = p_referral_id AND status = 'pending';
  
  -- Update referral code usage count
  UPDATE referral_codes SET
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE id = (SELECT referral_code_id FROM referrals WHERE id = p_referral_id);
END;
$$;

-- Qualify referral function
CREATE OR REPLACE FUNCTION qualify_referral(p_referral_id UUID, p_purchase_amount NUMERIC, p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_referral RECORD;
  v_code RECORD;
BEGIN
  SELECT * INTO v_referral FROM referrals WHERE id = p_referral_id;
  SELECT * INTO v_code FROM referral_codes WHERE id = v_referral.referral_code_id;
  
  -- Check minimum purchase amount
  IF v_code.min_purchase_amount IS NOT NULL AND p_purchase_amount < v_code.min_purchase_amount THEN
    RETURN;
  END IF;
  
  -- Update referral status
  UPDATE referrals SET
    status = 'qualified',
    qualified_at = NOW(),
    qualifying_order_id = p_order_id,
    qualifying_amount = p_purchase_amount,
    updated_at = NOW()
  WHERE id = p_referral_id;
  
  -- Create rewards for referrer
  INSERT INTO referral_rewards (user_id, referral_id, reward_type, reward_category, reward_value, status, issued_at)
  VALUES (v_referral.referrer_id, p_referral_id, 'referrer', v_code.referrer_reward_type, v_code.referrer_reward_value, 'issued', NOW());
  
  -- Create rewards for referee
  IF v_referral.referee_id IS NOT NULL THEN
    INSERT INTO referral_rewards (user_id, referral_id, reward_type, reward_category, reward_value, status, issued_at)
    VALUES (v_referral.referee_id, p_referral_id, 'referee', v_code.referee_reward_type, v_code.referee_reward_value, 'issued', NOW());
  END IF;
  
  -- Update referral to rewarded
  UPDATE referrals SET status = 'rewarded', updated_at = NOW() WHERE id = p_referral_id;
END;
$$;

-- RLS policies
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_catalog ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON referral_codes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON referrals TO authenticated;
GRANT SELECT, UPDATE ON referral_rewards TO authenticated;
GRANT SELECT ON loyalty_points TO authenticated;
GRANT SELECT ON loyalty_transactions TO authenticated;
GRANT SELECT ON rewards_catalog TO authenticated;
GRANT EXECUTE ON FUNCTION generate_referral_code() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_referral_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION process_referral_signup(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION qualify_referral(UUID, NUMERIC, UUID) TO authenticated;
