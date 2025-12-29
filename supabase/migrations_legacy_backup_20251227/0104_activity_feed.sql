-- Migration: Activity Feed
-- Adds user activity tracking for social feed

-- User Activities Table
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('ticket_purchase', 'review', 'follow', 'favorite', 'check_in', 'share', 'comment')),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  content TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Follows Table (for social connections)
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, followed_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(type);
CREATE INDEX IF NOT EXISTS idx_user_activities_event ON user_activities(event_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created ON user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_public ON user_activities(is_public, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed ON user_follows(followed_id);

-- RLS Policies
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Activity policies
CREATE POLICY "Users can view public activities" ON user_activities
  FOR SELECT USING (is_public = TRUE OR user_id = auth.uid());

CREATE POLICY "Users can create their activities" ON user_activities
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their activities" ON user_activities
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their activities" ON user_activities
  FOR DELETE USING (user_id = auth.uid());

-- Follow policies
CREATE POLICY "Anyone can view follows" ON user_follows
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can follow others" ON user_follows
  FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can unfollow" ON user_follows
  FOR DELETE USING (follower_id = auth.uid());

-- Function to record activity
CREATE OR REPLACE FUNCTION record_user_activity(
  p_user_id UUID,
  p_type VARCHAR(30),
  p_event_id UUID DEFAULT NULL,
  p_artist_id UUID DEFAULT NULL,
  p_venue_id UUID DEFAULT NULL,
  p_content TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT TRUE
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO user_activities (user_id, type, event_id, artist_id, venue_id, content, is_public)
  VALUES (p_user_id, p_type, p_event_id, p_artist_id, p_venue_id, p_content, p_is_public)
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get follower count
CREATE OR REPLACE FUNCTION get_follower_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM user_follows
  WHERE followed_id = p_user_id;
$$ LANGUAGE SQL STABLE;

-- Function to get following count
CREATE OR REPLACE FUNCTION get_following_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM user_follows
  WHERE follower_id = p_user_id;
$$ LANGUAGE SQL STABLE;

-- Function to check if user follows another
CREATE OR REPLACE FUNCTION is_following(p_follower_id UUID, p_followed_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_follows
    WHERE follower_id = p_follower_id AND followed_id = p_followed_id
  );
$$ LANGUAGE SQL STABLE;
