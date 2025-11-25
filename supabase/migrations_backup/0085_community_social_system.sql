-- Migration: Community & Social System
-- Description: Tables for user profiles, social features, reviews, and community engagement

-- User profiles table (enhanced)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) UNIQUE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  location TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  timezone TEXT,
  website TEXT,
  social_links JSONB,
  interests TEXT[],
  favorite_genres TEXT[],
  favorite_artists UUID[],
  favorite_venues UUID[],
  birth_date DATE,
  gender TEXT,
  phone TEXT,
  is_public BOOLEAN DEFAULT true,
  show_activity BOOLEAN DEFAULT true,
  show_favorites BOOLEAN DEFAULT true,
  show_reviews BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT true,
  events_attended INT DEFAULT 0,
  reviews_written INT DEFAULT 0,
  photos_uploaded INT DEFAULT 0,
  follower_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  reputation_score INT DEFAULT 0,
  badge_ids UUID[],
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(city, state);
CREATE INDEX IF NOT EXISTS idx_user_profiles_interests ON user_profiles USING gin(interests);

-- User connections (friends/following)
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES platform_users(id),
  following_id UUID NOT NULL REFERENCES platform_users(id),
  connection_type TEXT DEFAULT 'follow' CHECK (connection_type IN ('follow', 'friend', 'block')),
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_connections_follower ON user_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_following ON user_connections(following_id);

-- Event reviews table
CREATE TABLE IF NOT EXISTS event_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  ticket_id UUID REFERENCES tickets(id),
  overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  venue_rating INT CHECK (venue_rating BETWEEN 1 AND 5),
  sound_rating INT CHECK (sound_rating BETWEEN 1 AND 5),
  atmosphere_rating INT CHECK (atmosphere_rating BETWEEN 1 AND 5),
  value_rating INT CHECK (value_rating BETWEEN 1 AND 5),
  title TEXT,
  content TEXT,
  pros TEXT[],
  cons TEXT[],
  photos TEXT[],
  is_verified_attendee BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  report_count INT DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'flagged', 'removed')),
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_reviews_event ON event_reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reviews_user ON event_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reviews_rating ON event_reviews(overall_rating);
CREATE INDEX IF NOT EXISTS idx_event_reviews_status ON event_reviews(status);

-- Venue reviews table
CREATE TABLE IF NOT EXISTS venue_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  sound_rating INT CHECK (sound_rating BETWEEN 1 AND 5),
  sightlines_rating INT CHECK (sightlines_rating BETWEEN 1 AND 5),
  staff_rating INT CHECK (staff_rating BETWEEN 1 AND 5),
  cleanliness_rating INT CHECK (cleanliness_rating BETWEEN 1 AND 5),
  accessibility_rating INT CHECK (accessibility_rating BETWEEN 1 AND 5),
  parking_rating INT CHECK (parking_rating BETWEEN 1 AND 5),
  food_rating INT CHECK (food_rating BETWEEN 1 AND 5),
  title TEXT,
  content TEXT,
  best_sections TEXT[],
  worst_sections TEXT[],
  tips TEXT,
  photos TEXT[],
  helpful_count INT DEFAULT 0,
  report_count INT DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'flagged', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_venue_reviews_venue ON venue_reviews(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_reviews_user ON venue_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_venue_reviews_rating ON venue_reviews(overall_rating);

-- Review helpful votes
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  review_type TEXT NOT NULL CHECK (review_type IN ('event', 'venue')),
  event_review_id UUID REFERENCES event_reviews(id) ON DELETE CASCADE,
  venue_review_id UUID REFERENCES venue_reviews(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful', 'report')),
  report_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_review_id),
  UNIQUE(user_id, venue_review_id)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_user ON review_votes(user_id);

-- User activity feed
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('ticket_purchase', 'event_attend', 'review_post', 'photo_upload', 'follow_artist', 'follow_venue', 'follow_user', 'share_event', 'badge_earned', 'checkin')),
  event_id UUID REFERENCES events(id),
  artist_id UUID REFERENCES artists(id),
  venue_id UUID REFERENCES venues(id),
  target_user_id UUID REFERENCES platform_users(id),
  review_id UUID,
  description TEXT,
  metadata JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity(created_at);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  badge_type TEXT CHECK (badge_type IN ('achievement', 'milestone', 'special', 'seasonal', 'loyalty')),
  criteria JSONB,
  points INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges junction
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  badge_id UUID NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  event_id UUID REFERENCES events(id),
  metadata JSONB,
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);

-- Event check-ins
CREATE TABLE IF NOT EXISTS event_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  ticket_id UUID REFERENCES tickets(id),
  location_lat NUMERIC(10,7),
  location_lng NUMERIC(10,7),
  photo_url TEXT,
  message TEXT,
  is_public BOOLEAN DEFAULT true,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_checkins_event ON event_checkins(event_id);
CREATE INDEX IF NOT EXISTS idx_event_checkins_user ON event_checkins(user_id);

-- Event photos (user uploaded)
CREATE TABLE IF NOT EXISTS event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  tags TEXT[],
  location TEXT,
  taken_at TIMESTAMPTZ,
  like_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden', 'flagged', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_photos_event ON event_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_event_photos_user ON event_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_event_photos_featured ON event_photos(is_featured);

-- Photo likes
CREATE TABLE IF NOT EXISTS photo_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES event_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(photo_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_photo_likes_photo ON photo_likes(photo_id);

-- Function to update user profile stats
CREATE OR REPLACE FUNCTION update_user_profile_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_TABLE_NAME = 'event_reviews' THEN
    UPDATE user_profiles SET
      reviews_written = (SELECT COUNT(*) FROM event_reviews WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND status = 'published'),
      updated_at = NOW()
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
  ELSIF TG_TABLE_NAME = 'event_photos' THEN
    UPDATE user_profiles SET
      photos_uploaded = (SELECT COUNT(*) FROM event_photos WHERE user_id = COALESCE(NEW.user_id, OLD.user_id) AND status = 'published'),
      updated_at = NOW()
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
  ELSIF TG_TABLE_NAME = 'user_connections' THEN
    -- Update follower count
    UPDATE user_profiles SET
      follower_count = (SELECT COUNT(*) FROM user_connections WHERE following_id = COALESCE(NEW.following_id, OLD.following_id) AND status = 'active'),
      updated_at = NOW()
    WHERE user_id = COALESCE(NEW.following_id, OLD.following_id);
    -- Update following count
    UPDATE user_profiles SET
      following_count = (SELECT COUNT(*) FROM user_connections WHERE follower_id = COALESCE(NEW.follower_id, OLD.follower_id) AND status = 'active'),
      updated_at = NOW()
    WHERE user_id = COALESCE(NEW.follower_id, OLD.follower_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS user_reviews_stats_trigger ON event_reviews;
CREATE TRIGGER user_reviews_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile_stats();

DROP TRIGGER IF EXISTS user_photos_stats_trigger ON event_photos;
CREATE TRIGGER user_photos_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON event_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile_stats();

DROP TRIGGER IF EXISTS user_connections_stats_trigger ON user_connections;
CREATE TRIGGER user_connections_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile_stats();

-- Function to update review helpful count
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.event_review_id IS NOT NULL THEN
    UPDATE event_reviews SET
      helpful_count = (SELECT COUNT(*) FROM review_votes WHERE event_review_id = NEW.event_review_id AND vote_type = 'helpful'),
      report_count = (SELECT COUNT(*) FROM review_votes WHERE event_review_id = NEW.event_review_id AND vote_type = 'report')
    WHERE id = NEW.event_review_id;
  ELSIF NEW.venue_review_id IS NOT NULL THEN
    UPDATE venue_reviews SET
      helpful_count = (SELECT COUNT(*) FROM review_votes WHERE venue_review_id = NEW.venue_review_id AND vote_type = 'helpful'),
      report_count = (SELECT COUNT(*) FROM review_votes WHERE venue_review_id = NEW.venue_review_id AND vote_type = 'report')
    WHERE id = NEW.venue_review_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS review_votes_trigger ON review_votes;
CREATE TRIGGER review_votes_trigger
  AFTER INSERT OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_likes ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE ON event_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE ON venue_reviews TO authenticated;
GRANT SELECT, INSERT, DELETE ON review_votes TO authenticated;
GRANT SELECT, INSERT ON user_activity TO authenticated;
GRANT SELECT ON badges TO authenticated;
GRANT SELECT, INSERT ON user_badges TO authenticated;
GRANT SELECT, INSERT ON event_checkins TO authenticated;
GRANT SELECT, INSERT, UPDATE ON event_photos TO authenticated;
GRANT SELECT, INSERT, DELETE ON photo_likes TO authenticated;
