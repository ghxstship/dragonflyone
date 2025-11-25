-- =====================================================
-- REFERRALS PROGRAM SYSTEM
-- =====================================================
-- Customer referral program for GVTEWAY
-- Track referrals, rewards, conversions, and payouts

-- =====================================================
-- REFERRAL CODES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  
  -- Code details
  code TEXT NOT NULL UNIQUE,
  code_type TEXT NOT NULL DEFAULT 'personal' CHECK (code_type IN (
    'personal', 'promotional', 'influencer', 'partner', 'campaign'
  )),
  
  -- Branding
  display_name TEXT,
  description TEXT,
  
  -- Rewards configuration
  referrer_reward_type TEXT NOT NULL CHECK (referrer_reward_type IN (
    'percentage', 'fixed_amount', 'credits', 'points', 'custom'
  )),
  referrer_reward_value NUMERIC(10, 2) NOT NULL,
  
  referee_reward_type TEXT NOT NULL CHECK (referee_reward_type IN (
    'percentage', 'fixed_amount', 'credits', 'points', 'custom'
  )),
  referee_reward_value NUMERIC(10, 2) NOT NULL,
  
  -- Limits and conditions
  usage_limit INTEGER, -- Max times code can be used (NULL = unlimited)
  usage_count INTEGER DEFAULT 0,
  min_purchase_amount NUMERIC(10, 2), -- Minimum purchase to qualify
  
  -- Validity
  is_active BOOLEAN DEFAULT true,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB
);

-- =====================================================
-- REFERRALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id),
  
  -- Parties
  referrer_id UUID NOT NULL REFERENCES platform_users(id), -- Person who referred
  referee_id UUID REFERENCES platform_users(id), -- Person who was referred (NULL until signup)
  
  -- Referee information (before account creation)
  referee_email TEXT,
  referee_phone TEXT,
  referee_name TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'signed_up', 'qualified', 'rewarded', 'expired', 'cancelled'
  )),
  
  -- Conversion tracking
  signed_up_at TIMESTAMPTZ,
  first_purchase_at TIMESTAMPTZ,
  qualified_at TIMESTAMPTZ, -- When conditions met
  rewarded_at TIMESTAMPTZ,
  
  -- Purchase details (qualification)
  first_purchase_amount NUMERIC(10, 2),
  first_order_id UUID,
  
  -- Rewards issued
  referrer_reward_issued BOOLEAN DEFAULT false,
  referee_reward_issued BOOLEAN DEFAULT false,
  
  -- Attribution
  source TEXT, -- web, mobile, email, social
  campaign_id TEXT,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  notes TEXT
);

-- =====================================================
-- REFERRAL REWARDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  
  -- Recipient
  user_id UUID NOT NULL REFERENCES platform_users(id),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('referrer', 'referee')),
  
  -- Reward details
  reward_type TEXT NOT NULL CHECK (reward_type IN (
    'percentage', 'fixed_amount', 'credits', 'points', 'custom'
  )),
  reward_value NUMERIC(10, 2) NOT NULL,
  
  -- Redemption
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'issued', 'redeemed', 'expired', 'cancelled'
  )),
  
  -- Credit/coupon details
  credit_code TEXT, -- Discount code generated
  credit_expires_at TIMESTAMPTZ,
  
  -- Payout details (for cash rewards)
  payout_method TEXT, -- wallet, bank_transfer, paypal, check
  payout_amount NUMERIC(10, 2),
  payout_status TEXT CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed')),
  payout_reference TEXT,
  
  -- Timestamps
  issued_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  notes TEXT
);

-- =====================================================
-- REFERRAL CAMPAIGNS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS referral_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campaign details
  name TEXT NOT NULL,
  description TEXT,
  campaign_code TEXT UNIQUE,
  
  -- Rewards configuration
  referrer_reward_type TEXT NOT NULL CHECK (referrer_reward_type IN (
    'percentage', 'fixed_amount', 'credits', 'points', 'custom'
  )),
  referrer_reward_value NUMERIC(10, 2) NOT NULL,
  
  referee_reward_type TEXT NOT NULL CHECK (referee_reward_type IN (
    'percentage', 'fixed_amount', 'credits', 'points', 'custom'
  )),
  referee_reward_value NUMERIC(10, 2) NOT NULL,
  
  -- Targeting
  eligible_user_segments TEXT[], -- VIP, new_users, etc.
  min_referrals_target INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Tracking
  total_referrals INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  total_rewards_issued NUMERIC(12, 2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id),
  
  metadata JSONB
);

-- =====================================================
-- REFERRAL ANALYTICS TABLE (Daily aggregates)
-- =====================================================

CREATE TABLE IF NOT EXISTS referral_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time period
  date DATE NOT NULL,
  
  -- Aggregates
  new_referrals INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  qualified_referrals INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5, 2),
  
  -- Revenue
  referral_revenue NUMERIC(12, 2) DEFAULT 0,
  rewards_issued NUMERIC(12, 2) DEFAULT 0,
  net_revenue NUMERIC(12, 2) GENERATED ALWAYS AS (
    referral_revenue - rewards_issued
  ) STORED,
  
  -- By code type
  personal_referrals INTEGER DEFAULT 0,
  promotional_referrals INTEGER DEFAULT 0,
  influencer_referrals INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_date UNIQUE (date)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_type ON referral_codes(code_type);
CREATE INDEX idx_referral_codes_active ON referral_codes(is_active) WHERE is_active = true;
CREATE INDEX idx_referral_codes_valid ON referral_codes(valid_from, valid_until);

CREATE INDEX idx_referrals_code ON referrals(referral_code_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee ON referrals(referee_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_email ON referrals(referee_email);
CREATE INDEX idx_referrals_created ON referrals(created_at DESC);

CREATE INDEX idx_referral_rewards_referral ON referral_rewards(referral_id);
CREATE INDEX idx_referral_rewards_user ON referral_rewards(user_id);
CREATE INDEX idx_referral_rewards_status ON referral_rewards(status);
CREATE INDEX idx_referral_rewards_expires ON referral_rewards(expires_at) WHERE status = 'issued';

CREATE INDEX idx_referral_campaigns_active ON referral_campaigns(is_active) WHERE is_active = true;
CREATE INDEX idx_referral_campaigns_dates ON referral_campaigns(start_date, end_date);

CREATE INDEX idx_referral_analytics_date ON referral_analytics(date DESC);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_analytics ENABLE ROW LEVEL SECURITY;

-- Referral codes policies
CREATE POLICY "Users can view their own referral codes"
  ON referral_codes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own referral codes"
  ON referral_codes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own referral codes"
  ON referral_codes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Referrals policies
CREATE POLICY "Users can view their referrals (as referrer)"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    referrer_id = auth.uid()
    OR referee_id = auth.uid()
  );

CREATE POLICY "Anyone can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (true);

-- Referral rewards policies
CREATE POLICY "Users can view their own rewards"
  ON referral_rewards FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Campaigns (public read)
CREATE POLICY "Anyone can view active campaigns"
  ON referral_campaigns FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage campaigns"
  ON referral_campaigns FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND role IN ('GVTEWAY_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
    )
  );

-- Analytics (admin only)
CREATE POLICY "Admins can view analytics"
  ON referral_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM platform_users
      WHERE id = auth.uid()
      AND role IN ('GVTEWAY_ADMIN', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = code) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process referral signup
CREATE OR REPLACE FUNCTION process_referral_signup(
  p_referral_id UUID,
  p_referee_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE referrals
  SET 
    referee_id = p_referee_user_id,
    status = 'signed_up',
    signed_up_at = NOW(),
    updated_at = NOW()
  WHERE id = p_referral_id;
  
  -- Update code usage count
  UPDATE referral_codes
  SET usage_count = usage_count + 1
  WHERE id = (SELECT referral_code_id FROM referrals WHERE id = p_referral_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Qualify referral (after first purchase)
CREATE OR REPLACE FUNCTION qualify_referral(
  p_referral_id UUID,
  p_purchase_amount NUMERIC,
  p_order_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_referral RECORD;
  v_code RECORD;
  v_min_amount NUMERIC;
BEGIN
  -- Get referral and code details
  SELECT r.*, rc.min_purchase_amount, rc.referrer_reward_type, rc.referrer_reward_value,
         rc.referee_reward_type, rc.referee_reward_value
  INTO v_referral
  FROM referrals r
  JOIN referral_codes rc ON r.referral_code_id = rc.id
  WHERE r.id = p_referral_id;
  
  -- Check if purchase meets minimum
  IF v_referral.min_purchase_amount IS NULL OR p_purchase_amount >= v_referral.min_purchase_amount THEN
    -- Update referral status
    UPDATE referrals
    SET 
      status = 'qualified',
      first_purchase_at = NOW(),
      first_purchase_amount = p_purchase_amount,
      first_order_id = p_order_id,
      qualified_at = NOW(),
      updated_at = NOW()
    WHERE id = p_referral_id;
    
    -- Create reward records
    INSERT INTO referral_rewards (
      referral_id,
      user_id,
      recipient_type,
      reward_type,
      reward_value,
      status
    ) VALUES
    (
      p_referral_id,
      v_referral.referrer_id,
      'referrer',
      v_referral.referrer_reward_type,
      v_referral.referrer_reward_value,
      'pending'
    ),
    (
      p_referral_id,
      v_referral.referee_id,
      'referee',
      v_referral.referee_reward_type,
      v_referral.referee_reward_value,
      'pending'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get referral statistics for user
CREATE OR REPLACE FUNCTION get_user_referral_stats(p_user_id UUID)
RETURNS TABLE (
  total_referrals INTEGER,
  pending_referrals INTEGER,
  qualified_referrals INTEGER,
  total_rewards NUMERIC,
  pending_rewards NUMERIC,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_referrals,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending_referrals,
    COUNT(*) FILTER (WHERE status IN ('qualified', 'rewarded'))::INTEGER as qualified_referrals,
    COALESCE((
      SELECT SUM(reward_value)
      FROM referral_rewards
      WHERE user_id = p_user_id AND status IN ('issued', 'redeemed')
    ), 0) as total_rewards,
    COALESCE((
      SELECT SUM(reward_value)
      FROM referral_rewards
      WHERE user_id = p_user_id AND status = 'pending'
    ), 0) as pending_rewards,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE status IN ('qualified', 'rewarded'))::NUMERIC / COUNT(*)::NUMERIC * 100)
      ELSE 0
    END as conversion_rate
  FROM referrals
  WHERE referrer_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update timestamps
CREATE TRIGGER update_referral_codes_timestamp
  BEFORE UPDATE ON referral_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

CREATE TRIGGER update_referrals_timestamp
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

CREATE TRIGGER update_referral_campaigns_timestamp
  BEFORE UPDATE ON referral_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_timestamp();

COMMENT ON TABLE referral_codes IS 'User referral codes with reward configuration';
COMMENT ON TABLE referrals IS 'Individual referral instances tracking referee journey';
COMMENT ON TABLE referral_rewards IS 'Rewards issued to referrers and referees';
COMMENT ON TABLE referral_campaigns IS 'Promotional referral campaigns with targets';
COMMENT ON TABLE referral_analytics IS 'Daily aggregated referral program metrics';
