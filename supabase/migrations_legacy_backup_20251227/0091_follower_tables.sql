-- Migration: Follower Tables for Artists and Venues
-- Enables users to follow artists and venues for notifications

-- Artist Followers Table
CREATE TABLE IF NOT EXISTS artist_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notify_new_events BOOLEAN DEFAULT TRUE,
  notify_announcements BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(artist_id, user_id)
);

-- Venue Followers Table
CREATE TABLE IF NOT EXISTS venue_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notify_new_events BOOLEAN DEFAULT TRUE,
  notify_announcements BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, user_id)
);

-- Add followers_count to artists if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'followers_count') THEN
    ALTER TABLE artists ADD COLUMN followers_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add followers_count to venues if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'followers_count') THEN
    ALTER TABLE venues ADD COLUMN followers_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_artist_followers_artist ON artist_followers(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_followers_user ON artist_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_followers_venue ON venue_followers(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_followers_user ON venue_followers(user_id);

-- RLS Policies
ALTER TABLE artist_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_followers ENABLE ROW LEVEL SECURITY;

-- Users can view their own follows
CREATE POLICY "Users can view their artist follows" ON artist_followers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their artist follows" ON artist_followers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their venue follows" ON venue_followers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their venue follows" ON venue_followers
  FOR ALL USING (user_id = auth.uid());

-- Functions to increment/decrement follower counts
CREATE OR REPLACE FUNCTION increment_artist_followers(p_artist_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE artists SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = p_artist_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_artist_followers(p_artist_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE artists SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) WHERE id = p_artist_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_venue_followers(p_venue_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE venues SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = p_venue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_venue_followers(p_venue_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE venues SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) WHERE id = p_venue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to auto-update follower counts
CREATE OR REPLACE FUNCTION update_artist_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE artists SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = NEW.artist_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE artists SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) WHERE id = OLD.artist_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER artist_follower_count_trigger
  AFTER INSERT OR DELETE ON artist_followers
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_follower_count();

CREATE OR REPLACE FUNCTION update_venue_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE venues SET followers_count = COALESCE(followers_count, 0) + 1 WHERE id = NEW.venue_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE venues SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) WHERE id = OLD.venue_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER venue_follower_count_trigger
  AFTER INSERT OR DELETE ON venue_followers
  FOR EACH ROW
  EXECUTE FUNCTION update_venue_follower_count();
