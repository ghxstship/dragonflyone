-- Migration: Badges and Fan Tiers
-- Adds badge system and fan tier progression

-- User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, badge_id)
);

-- User Points Table
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points Transactions Table
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(30) NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_featured ON user_badges(user_id, is_featured) WHERE is_featured = TRUE;

CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total ON user_points(total_points DESC);

CREATE INDEX IF NOT EXISTS idx_points_transactions_user ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created ON points_transactions(created_at DESC);

-- RLS Policies
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- Badge policies
CREATE POLICY "Users can view all badges" ON user_badges
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage their badges" ON user_badges
  FOR ALL USING (user_id = auth.uid());

-- Points policies
CREATE POLICY "Users can view all points" ON user_points
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can view their transactions" ON points_transactions
  FOR SELECT USING (user_id = auth.uid());

-- Function to award badge
CREATE OR REPLACE FUNCTION award_badge(p_user_id UUID, p_badge_id VARCHAR(50))
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM user_badges
    WHERE user_id = p_user_id AND badge_id = p_badge_id
  ) INTO v_exists;
  
  IF NOT v_exists THEN
    INSERT INTO user_badges (user_id, badge_id)
    VALUES (p_user_id, p_badge_id);
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add points
CREATE OR REPLACE FUNCTION add_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_type VARCHAR(30),
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type VARCHAR(30) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_new_total INTEGER;
BEGIN
  -- Insert transaction
  INSERT INTO points_transactions (user_id, amount, type, description, reference_id, reference_type)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id, p_reference_type);
  
  -- Update or insert user points
  INSERT INTO user_points (user_id, total_points, lifetime_points)
  VALUES (p_user_id, p_amount, GREATEST(p_amount, 0))
  ON CONFLICT (user_id) DO UPDATE
  SET total_points = user_points.total_points + p_amount,
      lifetime_points = user_points.lifetime_points + GREATEST(p_amount, 0),
      updated_at = NOW()
  RETURNING total_points INTO v_new_total;
  
  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's fan tier
CREATE OR REPLACE FUNCTION get_fan_tier(p_user_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  v_points INTEGER;
BEGIN
  SELECT total_points INTO v_points
  FROM user_points
  WHERE user_id = p_user_id;
  
  v_points := COALESCE(v_points, 0);
  
  IF v_points >= 10000 THEN RETURN 'platinum';
  ELSIF v_points >= 2000 THEN RETURN 'gold';
  ELSIF v_points >= 500 THEN RETURN 'silver';
  ELSIF v_points >= 100 THEN RETURN 'bronze';
  ELSE RETURN 'new';
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Updated at trigger
CREATE TRIGGER user_points_updated_at
  BEFORE UPDATE ON user_points
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
