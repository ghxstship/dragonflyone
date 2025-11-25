-- Migration: Events & Venues System
-- Description: Tables for events, venues, artists, and event management

-- Venues table (enhanced)
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  slug TEXT,
  venue_type TEXT CHECK (venue_type IN ('arena', 'stadium', 'theater', 'club', 'outdoor', 'convention_center', 'restaurant', 'bar', 'other')),
  description TEXT,
  address TEXT NOT NULL,
  address_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT,
  country TEXT DEFAULT 'USA',
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  timezone TEXT DEFAULT 'America/New_York',
  phone TEXT,
  email TEXT,
  website TEXT,
  capacity INT,
  seated_capacity INT,
  standing_capacity INT,
  parking_capacity INT,
  parking_info TEXT,
  accessibility_info TEXT,
  ada_compliant BOOLEAN DEFAULT true,
  age_restriction TEXT,
  alcohol_served BOOLEAN DEFAULT false,
  food_available BOOLEAN DEFAULT false,
  smoking_allowed BOOLEAN DEFAULT false,
  outdoor_area BOOLEAN DEFAULT false,
  amenities TEXT[],
  house_rules TEXT,
  load_in_info TEXT,
  stage_dimensions JSONB,
  power_info TEXT,
  wifi_available BOOLEAN DEFAULT true,
  wifi_network TEXT,
  wifi_password TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  booking_contact TEXT,
  technical_contact TEXT,
  social_media JSONB,
  photos TEXT[],
  floor_plan_url TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  rating NUMERIC(3,2),
  review_count INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_venues_org ON venues(organization_id);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_state ON venues(state);
CREATE INDEX IF NOT EXISTS idx_venues_type ON venues(venue_type);
CREATE INDEX IF NOT EXISTS idx_venues_location ON venues USING gist (
  ll_to_earth(latitude, longitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Artists/Performers table
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  artist_type TEXT CHECK (artist_type IN ('musician', 'band', 'dj', 'comedian', 'speaker', 'performer', 'team', 'other')),
  genre TEXT[],
  bio TEXT,
  short_bio TEXT,
  hometown TEXT,
  country TEXT,
  website TEXT,
  social_media JSONB,
  spotify_id TEXT,
  apple_music_id TEXT,
  youtube_channel TEXT,
  profile_image_url TEXT,
  cover_image_url TEXT,
  photos TEXT[],
  videos TEXT[],
  management_company TEXT,
  management_contact TEXT,
  booking_agent TEXT,
  booking_contact TEXT,
  press_contact TEXT,
  technical_rider_url TEXT,
  hospitality_rider_url TEXT,
  follower_count INT DEFAULT 0,
  monthly_listeners INT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);
CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
CREATE INDEX IF NOT EXISTS idx_artists_type ON artists(artist_type);
CREATE INDEX IF NOT EXISTS idx_artists_genre ON artists USING gin(genre);

-- Events table (enhanced)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  venue_id UUID REFERENCES venues(id),
  name TEXT NOT NULL,
  slug TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('concert', 'festival', 'conference', 'theater', 'sports', 'comedy', 'nightlife', 'experiential', 'workshop', 'other')),
  description TEXT,
  short_description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  doors_time TIMESTAMPTZ,
  show_time TIMESTAMPTZ,
  curfew_time TIMESTAMPTZ,
  timezone TEXT DEFAULT 'America/New_York',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'on_sale', 'sold_out', 'postponed', 'cancelled', 'completed')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted', 'password_protected')),
  access_password TEXT,
  age_restriction TEXT,
  dress_code TEXT,
  location TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  capacity INT,
  tickets_sold INT DEFAULT 0,
  tickets_available INT,
  min_price NUMERIC(10,2),
  max_price NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  is_free BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  featured_until TIMESTAMPTZ,
  cover_image_url TEXT,
  thumbnail_url TEXT,
  photos TEXT[],
  videos TEXT[],
  tags TEXT[],
  categories TEXT[],
  genres TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  social_share_image TEXT,
  facebook_event_id TEXT,
  external_url TEXT,
  stream_url TEXT,
  is_virtual BOOLEAN DEFAULT false,
  is_hybrid BOOLEAN DEFAULT false,
  refund_policy TEXT,
  terms_conditions TEXT,
  covid_policy TEXT,
  parking_info TEXT,
  accessibility_info TEXT,
  weather_policy TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  organizer_name TEXT,
  organizer_id UUID REFERENCES platform_users(id),
  promoter_id UUID,
  project_id UUID REFERENCES projects(id),
  view_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  favorite_count INT DEFAULT 0,
  metadata JSONB,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_events_org ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_tags ON events USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_events_genres ON events USING gin(genres);

-- Event artists junction table
CREATE TABLE IF NOT EXISTS event_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id),
  performance_type TEXT DEFAULT 'performer' CHECK (performance_type IN ('headliner', 'support', 'opener', 'special_guest', 'performer', 'dj', 'host', 'speaker')),
  set_time TIMESTAMPTZ,
  set_duration_minutes INT,
  stage TEXT,
  billing_order INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, artist_id)
);

CREATE INDEX IF NOT EXISTS idx_event_artists_event ON event_artists(event_id);
CREATE INDEX IF NOT EXISTS idx_event_artists_artist ON event_artists(artist_id);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  favorite_type TEXT NOT NULL CHECK (favorite_type IN ('event', 'artist', 'venue')),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, favorite_type, event_id),
  UNIQUE(user_id, favorite_type, artist_id),
  UNIQUE(user_id, favorite_type, venue_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_event ON user_favorites(event_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_artist ON user_favorites(artist_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_venue ON user_favorites(venue_id);

-- User follows table
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  follow_type TEXT NOT NULL CHECK (follow_type IN ('artist', 'venue', 'organizer')),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  organizer_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  notify_new_events BOOLEAN DEFAULT true,
  notify_presales BOOLEAN DEFAULT true,
  notify_announcements BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, follow_type, artist_id),
  UNIQUE(user_id, follow_type, venue_id),
  UNIQUE(user_id, follow_type, organizer_id)
);

CREATE INDEX IF NOT EXISTS idx_user_follows_user ON user_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_artist ON user_follows(artist_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_venue ON user_follows(venue_id);

-- Price alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id UUID REFERENCES ticket_types(id),
  target_price NUMERIC(10,2) NOT NULL,
  current_price NUMERIC(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'expired', 'cancelled')),
  triggered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id, ticket_type_id)
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_event ON price_alerts(event_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_status ON price_alerts(status);

-- Saved searches table
CREATE TABLE IF NOT EXISTS user_saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  name TEXT NOT NULL,
  search_query TEXT,
  filters JSONB NOT NULL,
  notify_new_results BOOLEAN DEFAULT true,
  notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('instant', 'daily', 'weekly')),
  last_notified_at TIMESTAMPTZ,
  result_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_saved_searches_user ON user_saved_searches(user_id);

-- Function to update event ticket stats
CREATE OR REPLACE FUNCTION update_event_ticket_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_sold INT;
  v_available INT;
  v_min_price NUMERIC;
  v_max_price NUMERIC;
BEGIN
  SELECT 
    COALESCE(SUM(sold), 0),
    COALESCE(SUM(available), 0),
    MIN(price),
    MAX(price)
  INTO v_sold, v_available, v_min_price, v_max_price
  FROM ticket_types
  WHERE event_id = COALESCE(NEW.event_id, OLD.event_id)
    AND is_active = TRUE;
  
  UPDATE events SET
    tickets_sold = v_sold,
    tickets_available = v_available,
    min_price = v_min_price,
    max_price = v_max_price,
    status = CASE 
      WHEN v_available = 0 AND v_sold > 0 THEN 'sold_out'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.event_id, OLD.event_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS event_ticket_stats_trigger ON ticket_types;
CREATE TRIGGER event_ticket_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ticket_types
  FOR EACH ROW
  EXECUTE FUNCTION update_event_ticket_stats();

-- Function to update artist follower count
CREATE OR REPLACE FUNCTION update_artist_followers()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE artists SET follower_count = follower_count + 1 WHERE id = NEW.artist_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE artists SET follower_count = follower_count - 1 WHERE id = OLD.artist_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS artist_followers_trigger ON user_follows;
CREATE TRIGGER artist_followers_trigger
  AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW
  WHEN (COALESCE(NEW.artist_id, OLD.artist_id) IS NOT NULL)
  EXECUTE FUNCTION update_artist_followers();

-- RLS policies
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_searches ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON venues TO authenticated;
GRANT SELECT, INSERT, UPDATE ON artists TO authenticated;
GRANT SELECT, INSERT, UPDATE ON events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON event_artists TO authenticated;
GRANT SELECT, INSERT, DELETE ON user_favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_follows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON price_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_saved_searches TO authenticated;
