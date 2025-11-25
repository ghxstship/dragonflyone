-- Migration: User Favorites
-- Adds user favorites/wishlist functionality

-- User Favorites Table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_event ON user_favorites(event_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created ON user_favorites(created_at);

-- RLS Policies
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their favorites" ON user_favorites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites" ON user_favorites
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites" ON user_favorites
  FOR DELETE USING (user_id = auth.uid());

-- Function to get favorite count for an event
CREATE OR REPLACE FUNCTION get_event_favorite_count(p_event_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM user_favorites
  WHERE event_id = p_event_id;
$$ LANGUAGE SQL STABLE;

-- Function to check if user has favorited an event
CREATE OR REPLACE FUNCTION is_event_favorited(p_user_id UUID, p_event_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_favorites
    WHERE user_id = p_user_id AND event_id = p_event_id
  );
$$ LANGUAGE SQL STABLE;
