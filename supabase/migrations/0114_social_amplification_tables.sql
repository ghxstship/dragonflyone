-- Migration: Social Amplification Tables
-- Description: Tables for artist amplification, social takeovers, and live tweet walls

-- Amplification campaigns table
CREATE TABLE IF NOT EXISTS amplification_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id),
  event_id UUID REFERENCES events(id),
  name VARCHAR(200) NOT NULL,
  content_type VARCHAR(30) CHECK (content_type IN ('post', 'story', 'reel', 'video')),
  suggested_content TEXT,
  hashtags TEXT[],
  target_platforms TEXT[],
  share_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Amplification assets table
CREATE TABLE IF NOT EXISTS amplification_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id),
  event_id UUID REFERENCES events(id),
  asset_type VARCHAR(30) CHECK (asset_type IN ('image', 'video', 'gif', 'template')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Amplification shares table
CREATE TABLE IF NOT EXISTS amplification_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES amplification_campaigns(id),
  platform VARCHAR(50),
  shared_by UUID REFERENCES platform_users(id),
  post_url TEXT,
  shared_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social takeovers table
CREATE TABLE IF NOT EXISTS social_takeovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  artist_id UUID REFERENCES artists(id),
  title VARCHAR(200) NOT NULL,
  platforms TEXT[],
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  guidelines TEXT,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Takeover posts table
CREATE TABLE IF NOT EXISTS takeover_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  takeover_id UUID NOT NULL REFERENCES social_takeovers(id),
  content TEXT,
  media_url TEXT,
  platform VARCHAR(50),
  posted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tweet walls table
CREATE TABLE IF NOT EXISTS tweet_walls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  name VARCHAR(200) NOT NULL,
  hashtags TEXT[],
  moderation_enabled BOOLEAN DEFAULT TRUE,
  display_settings JSONB,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tweet wall posts table
CREATE TABLE IF NOT EXISTS tweet_wall_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wall_id UUID NOT NULL REFERENCES tweet_walls(id),
  platform VARCHAR(50) DEFAULT 'twitter',
  external_id VARCHAR(200),
  author_name VARCHAR(200),
  author_handle VARCHAR(200),
  content TEXT,
  media_url TEXT,
  posted_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_amplification_campaigns_artist ON amplification_campaigns(artist_id);
CREATE INDEX IF NOT EXISTS idx_amplification_campaigns_event ON amplification_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_amplification_assets_artist ON amplification_assets(artist_id);
CREATE INDEX IF NOT EXISTS idx_amplification_shares_campaign ON amplification_shares(campaign_id);
CREATE INDEX IF NOT EXISTS idx_social_takeovers_event ON social_takeovers(event_id);
CREATE INDEX IF NOT EXISTS idx_social_takeovers_artist ON social_takeovers(artist_id);
CREATE INDEX IF NOT EXISTS idx_takeover_posts_takeover ON takeover_posts(takeover_id);
CREATE INDEX IF NOT EXISTS idx_tweet_walls_event ON tweet_walls(event_id);
CREATE INDEX IF NOT EXISTS idx_tweet_wall_posts_wall ON tweet_wall_posts(wall_id);
CREATE INDEX IF NOT EXISTS idx_tweet_wall_posts_status ON tweet_wall_posts(status);

-- RLS Policies
ALTER TABLE amplification_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE amplification_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE amplification_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_takeovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE takeover_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweet_walls ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweet_wall_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY amplification_campaigns_view ON amplification_campaigns FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY amplification_assets_view ON amplification_assets FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY social_takeovers_view ON social_takeovers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY tweet_walls_view ON tweet_walls FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY tweet_wall_posts_view ON tweet_wall_posts FOR SELECT USING (status = 'approved' OR auth.uid() IS NOT NULL);
