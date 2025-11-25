-- Migration: Karma and Reputation System
-- Adds karma tracking and achievement system

-- User Karma Table
CREATE TABLE IF NOT EXISTS user_karma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  total_karma INTEGER DEFAULT 0,
  lifetime_karma INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Karma Transactions Table
CREATE TABLE IF NOT EXISTS karma_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(30) NOT NULL,
  description TEXT,
  reference_id UUID,
  reference_type VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Review Votes Table
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  review_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, voter_id)
);

-- Community Answers Table
CREATE TABLE IF NOT EXISTS community_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT FALSE,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_karma_user ON user_karma(user_id);
CREATE INDEX IF NOT EXISTS idx_user_karma_total ON user_karma(total_karma DESC);

CREATE INDEX IF NOT EXISTS idx_karma_transactions_user ON karma_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_karma_transactions_created ON karma_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);

CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user ON review_votes(review_user_id);

CREATE INDEX IF NOT EXISTS idx_community_answers_question ON community_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_community_answers_user ON community_answers(user_id);

-- RLS Policies
ALTER TABLE user_karma ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_answers ENABLE ROW LEVEL SECURITY;

-- Karma policies
CREATE POLICY "Anyone can view karma" ON user_karma
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can view their transactions" ON karma_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Anyone can view achievements" ON user_achievements
  FOR SELECT USING (TRUE);

-- Review votes policies
CREATE POLICY "Anyone can view votes" ON review_votes
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can vote" ON review_votes
  FOR INSERT WITH CHECK (voter_id = auth.uid());

-- Community answers policies
CREATE POLICY "Anyone can view answers" ON community_answers
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create answers" ON community_answers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their answers" ON community_answers
  FOR UPDATE USING (user_id = auth.uid());

-- Function to add karma
CREATE OR REPLACE FUNCTION add_karma(
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
  v_new_level INTEGER;
BEGIN
  -- Insert transaction
  INSERT INTO karma_transactions (user_id, amount, type, description, reference_id, reference_type)
  VALUES (p_user_id, p_amount, p_type, p_description, p_reference_id, p_reference_type);
  
  -- Update or insert user karma
  INSERT INTO user_karma (user_id, total_karma, lifetime_karma)
  VALUES (p_user_id, p_amount, GREATEST(p_amount, 0))
  ON CONFLICT (user_id) DO UPDATE
  SET total_karma = user_karma.total_karma + p_amount,
      lifetime_karma = user_karma.lifetime_karma + GREATEST(p_amount, 0),
      updated_at = NOW()
  RETURNING total_karma INTO v_new_total;
  
  -- Calculate new level
  v_new_level := CASE
    WHEN v_new_total >= 50000 THEN 7
    WHEN v_new_total >= 15000 THEN 6
    WHEN v_new_total >= 5000 THEN 5
    WHEN v_new_total >= 1500 THEN 4
    WHEN v_new_total >= 500 THEN 3
    WHEN v_new_total >= 100 THEN 2
    ELSE 1
  END;
  
  -- Update level if changed
  UPDATE user_karma SET level = v_new_level WHERE user_id = p_user_id AND level != v_new_level;
  
  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award achievement
CREATE OR REPLACE FUNCTION award_achievement(p_user_id UUID, p_achievement_id VARCHAR(50), p_karma_reward INTEGER DEFAULT 0)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM user_achievements
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id
  ) INTO v_exists;
  
  IF NOT v_exists THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (p_user_id, p_achievement_id);
    
    -- Award karma if specified
    IF p_karma_reward > 0 THEN
      PERFORM add_karma(p_user_id, p_karma_reward, 'achievement', 'Achievement: ' || p_achievement_id);
    END IF;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to award karma for helpful votes
CREATE OR REPLACE FUNCTION on_review_vote()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vote_type = 'helpful' THEN
    PERFORM add_karma(NEW.review_user_id, 5, 'helpful_vote', 'Received helpful vote');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER review_vote_karma
  AFTER INSERT ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION on_review_vote();

-- Updated at trigger
CREATE TRIGGER user_karma_updated_at
  BEFORE UPDATE ON user_karma
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER community_answers_updated_at
  BEFORE UPDATE ON community_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
