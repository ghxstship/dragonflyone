-- Migration: Create missing GVTEWAY tables (Part 4 - Fan Features, Follows, Friends, Gamification)
-- These tables are referenced by API routes but don't exist in the schema

-- ============================================
-- FAN CHAPTER TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS fan_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  cover_image_url TEXT,
  member_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
  founded_date DATE,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fan_chapter_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES fan_chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'leader', 'founder')),
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'banned')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(chapter_id, user_id)
);

CREATE TABLE IF NOT EXISTS chapter_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES fan_chapters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'meetup' CHECK (event_type IN ('meetup', 'watch_party', 'concert', 'online', 'other')),
  location TEXT,
  date TIMESTAMPTZ NOT NULL,
  max_attendees INTEGER,
  rsvp_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- FAN CLUB TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS fan_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fan_club_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES fan_clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly', 'lifetime')),
  benefits JSONB DEFAULT '[]'::jsonb,
  max_members INTEGER,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fan_club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES fan_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES fan_club_tiers(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
  subscription_id TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  UNIQUE(club_id, user_id)
);

CREATE TABLE IF NOT EXISTS fan_club_access_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES fan_clubs(id) ON DELETE CASCADE,
  tier_id UUID REFERENCES fan_club_tiers(id),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('presale', 'exclusive', 'early_entry', 'meet_greet')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  max_tickets INTEGER,
  tickets_claimed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fan_club_access_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_window_id UUID NOT NULL REFERENCES fan_club_access_windows(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES fan_club_members(id) ON DELETE CASCADE,
  tickets_purchased INTEGER DEFAULT 0,
  used_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- FAN CONTENT TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS fan_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('photo', 'video', 'story', 'review', 'memory')),
  title TEXT,
  description TEXT,
  media_urls TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fan_content_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES fan_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(content_id, user_id)
);

CREATE TABLE IF NOT EXISTS fan_spotlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  story TEXT NOT NULL,
  media_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  featured_at TIMESTAMPTZ,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fan_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('event', 'artist', 'venue', 'genre')),
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

CREATE TABLE IF NOT EXISTS fan_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  location TEXT,
  favorite_genres TEXT[] DEFAULT '{}',
  favorite_artists UUID[] DEFAULT '{}',
  events_attended INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- FOLLOWS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS blocked_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'event', 'artist', 'venue', 'organization')),
  entity_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

-- ============================================
-- FRIENDS TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(user_id, friend_id),
  CHECK(user_id != friend_id)
);

CREATE TABLE IF NOT EXISTS friend_meetups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  meeting_point TEXT,
  meeting_time TIMESTAMPTZ,
  max_attendees INTEGER,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'twitter', 'instagram', 'spotify', 'apple_music')),
  platform_user_id TEXT NOT NULL,
  friend_platform_id TEXT NOT NULL,
  matched_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform, friend_platform_id)
);

-- ============================================
-- GAMIFICATION TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS gamification_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  category TEXT CHECK (category IN ('attendance', 'social', 'purchase', 'engagement', 'loyalty', 'referral')),
  max_per_day INTEGER,
  max_per_event INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES gamification_activities(id),
  event_id UUID REFERENCES events(id),
  points INTEGER NOT NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id),
  achievement_type TEXT NOT NULL,
  achievement_data JSONB DEFAULT '{}'::jsonb,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS user_gamification_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  events_attended INTEGER DEFAULT 0,
  badges_earned INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS karma_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN ('review', 'helpful', 'report', 'referral', 'attendance', 'admin')),
  source_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_karma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_karma INTEGER DEFAULT 0,
  positive_karma INTEGER DEFAULT 0,
  negative_karma INTEGER DEFAULT 0,
  level TEXT DEFAULT 'newcomer' CHECK (level IN ('newcomer', 'regular', 'trusted', 'veteran', 'legend')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE fan_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_chapter_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_club_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_club_access_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_club_access_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_content_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_spotlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_karma ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Authenticated users can read fan_chapters" ON fan_chapters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read fan_chapter_members" ON fan_chapter_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read chapter_events" ON chapter_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read fan_clubs" ON fan_clubs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read fan_club_tiers" ON fan_club_tiers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read fan_club_members" ON fan_club_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read fan_club_access_windows" ON fan_club_access_windows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read fan_club_access_usage" ON fan_club_access_usage FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read fan_content" ON fan_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read fan_content_likes" ON fan_content_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read fan_spotlights" ON fan_spotlights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their fan_favorites" ON fan_favorites FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read fan_profiles" ON fan_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read follows" ON follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their follows" ON follows FOR ALL TO authenticated USING (follower_id = auth.uid());
CREATE POLICY "Users can manage their blocked_users" ON blocked_users FOR ALL TO authenticated USING (blocker_id = auth.uid());
CREATE POLICY "Users can manage their blocked_entities" ON blocked_entities FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read friendships" ON friendships FOR SELECT TO authenticated USING (user_id = auth.uid() OR friend_id = auth.uid());
CREATE POLICY "Authenticated users can read friend_meetups" ON friend_meetups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their social_friends" ON social_friends FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read gamification_activities" ON gamification_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read their user_points" ON user_points FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can read their user_achievements" ON user_achievements FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read user_gamification_stats" ON user_gamification_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read their karma_transactions" ON karma_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read user_karma" ON user_karma FOR SELECT TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fan_chapters_artist_id ON fan_chapters(artist_id);
CREATE INDEX IF NOT EXISTS idx_fan_chapter_members_chapter_id ON fan_chapter_members(chapter_id);
CREATE INDEX IF NOT EXISTS idx_fan_clubs_artist_id ON fan_clubs(artist_id);
CREATE INDEX IF NOT EXISTS idx_fan_club_members_club_id ON fan_club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_fan_content_user_id ON fan_content(user_id);
CREATE INDEX IF NOT EXISTS idx_fan_content_event_id ON fan_content(event_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
