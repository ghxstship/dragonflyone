-- Migration: Artists & Performers System
-- Description: Tables for artists, performers, followers, and event lineups

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  short_bio TEXT,
  genres TEXT[],
  origin_city TEXT,
  origin_country TEXT,
  formed_year INT,
  website TEXT,
  social_links JSONB,
  profile_image TEXT,
  cover_image TEXT,
  gallery_images TEXT[],
  booking_email TEXT,
  management_contact TEXT,
  press_kit_url TEXT,
  rider_url TEXT,
  spotify_id TEXT,
  apple_music_id TEXT,
  soundcloud_url TEXT,
  bandcamp_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  follower_count INT DEFAULT 0,
  event_count INT DEFAULT 0,
  popularity_score NUMERIC(5,2) DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
CREATE INDEX IF NOT EXISTS idx_artists_genres ON artists USING gin(genres);
CREATE INDEX IF NOT EXISTS idx_artists_name ON artists USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_artists_verified ON artists(is_verified);
CREATE INDEX IF NOT EXISTS idx_artists_featured ON artists(is_featured);
CREATE INDEX IF NOT EXISTS idx_artists_popularity ON artists(popularity_score DESC);

-- Artist followers table
CREATE TABLE IF NOT EXISTS artist_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  notifications_enabled BOOLEAN DEFAULT true,
  UNIQUE(artist_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_artist_followers_artist ON artist_followers(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_followers_user ON artist_followers(user_id);

-- Artist members table (for bands/groups)
CREATE TABLE IF NOT EXISTS artist_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  bio TEXT,
  photo_url TEXT,
  is_current BOOLEAN DEFAULT true,
  joined_date DATE,
  left_date DATE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artist_members_artist ON artist_members(artist_id);

-- Event lineups table
CREATE TABLE IF NOT EXISTS event_lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id),
  stage_name TEXT,
  set_time TIMESTAMPTZ,
  set_duration_minutes INT,
  set_type TEXT CHECK (set_type IN ('headliner', 'co_headliner', 'support', 'opener', 'special_guest', 'dj_set', 'live_set', 'other')),
  billing_order INT,
  is_confirmed BOOLEAN DEFAULT false,
  is_announced BOOLEAN DEFAULT false,
  announced_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, artist_id)
);

CREATE INDEX IF NOT EXISTS idx_event_lineups_event ON event_lineups(event_id);
CREATE INDEX IF NOT EXISTS idx_event_lineups_artist ON event_lineups(artist_id);
CREATE INDEX IF NOT EXISTS idx_event_lineups_set_time ON event_lineups(set_time);

-- Artist tour dates table
CREATE TABLE IF NOT EXISTS artist_tour_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id),
  venue_id UUID REFERENCES venues(id),
  tour_name TEXT,
  date DATE NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('announced', 'confirmed', 'postponed', 'cancelled')),
  ticket_url TEXT,
  is_sold_out BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artist_tour_dates_artist ON artist_tour_dates(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_tour_dates_date ON artist_tour_dates(date);

-- Artist media table
CREATE TABLE IF NOT EXISTS artist_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'audio', 'press_photo', 'logo', 'stage_plot', 'tech_rider')),
  title TEXT,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artist_media_artist ON artist_media(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_media_type ON artist_media(media_type);

-- Artist notifications table
CREATE TABLE IF NOT EXISTS artist_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('new_event', 'tour_announcement', 'new_release', 'ticket_sale', 'meet_greet')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artist_notifications_artist ON artist_notifications(artist_id);

-- Function to increment artist followers
CREATE OR REPLACE FUNCTION increment_artist_followers(p_artist_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE artists SET
    follower_count = follower_count + 1,
    updated_at = NOW()
  WHERE id = p_artist_id;
END;
$$;

-- Function to decrement artist followers
CREATE OR REPLACE FUNCTION decrement_artist_followers(p_artist_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE artists SET
    follower_count = GREATEST(follower_count - 1, 0),
    updated_at = NOW()
  WHERE id = p_artist_id;
END;
$$;

-- Function to update artist event count
CREATE OR REPLACE FUNCTION update_artist_event_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE artists SET
      event_count = event_count + 1,
      updated_at = NOW()
    WHERE id = NEW.artist_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE artists SET
      event_count = GREATEST(event_count - 1, 0),
      updated_at = NOW()
    WHERE id = OLD.artist_id;
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS artist_event_count_trigger ON event_lineups;
CREATE TRIGGER artist_event_count_trigger
  AFTER INSERT OR DELETE ON event_lineups
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_event_count();

-- Function to notify artist followers
CREATE OR REPLACE FUNCTION notify_artist_followers(
  p_artist_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link_url TEXT DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INT;
BEGIN
  -- Create artist notification record
  INSERT INTO artist_notifications (artist_id, notification_type, title, message, link_url)
  VALUES (p_artist_id, p_notification_type, p_title, p_message, p_link_url);
  
  -- Create user notifications for followers with notifications enabled
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT 
    af.user_id,
    'artist_update',
    p_title,
    p_message,
    jsonb_build_object('artist_id', p_artist_id, 'notification_type', p_notification_type, 'link_url', p_link_url)
  FROM artist_followers af
  WHERE af.artist_id = p_artist_id
    AND af.notifications_enabled = TRUE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- RLS policies
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_tour_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_notifications ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON artists TO authenticated;
GRANT SELECT, INSERT, DELETE ON artist_followers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON artist_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON event_lineups TO authenticated;
GRANT SELECT, INSERT, UPDATE ON artist_tour_dates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON artist_media TO authenticated;
GRANT SELECT ON artist_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION increment_artist_followers(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_artist_followers(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION notify_artist_followers(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
