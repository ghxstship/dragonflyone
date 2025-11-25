-- Migration: Advanced AI Features
-- Description: Tables for social commerce, resource optimization, portfolio planning, and competitive intelligence

-- Shoppable posts
CREATE TABLE IF NOT EXISTS shoppable_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  content TEXT NOT NULL,
  media_urls TEXT[],
  event_id UUID REFERENCES events(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'hidden')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shoppable_posts_user ON shoppable_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_shoppable_posts_status ON shoppable_posts(status);

-- Shoppable post products
CREATE TABLE IF NOT EXISTS shoppable_post_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES shoppable_posts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES merchandise_products(id),
  position JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shoppable_post_products_post ON shoppable_post_products(post_id);

-- Shoppable post likes
CREATE TABLE IF NOT EXISTS shoppable_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES shoppable_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Shoppable post comments
CREATE TABLE IF NOT EXISTS shoppable_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES shoppable_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shoppable_post_comments_post ON shoppable_post_comments(post_id);

-- Product social stats
CREATE TABLE IF NOT EXISTS product_social_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES merchandise_products(id) UNIQUE,
  views INT DEFAULT 0,
  shares INT DEFAULT 0,
  saves INT DEFAULT 0,
  purchases INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Influencer recommendations
CREATE TABLE IF NOT EXISTS influencer_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES platform_users(id),
  product_id UUID NOT NULL REFERENCES merchandise_products(id),
  recommendation_text TEXT,
  engagement_score NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_influencer_recommendations_influencer ON influencer_recommendations(influencer_id);

-- Live shopping sessions
CREATE TABLE IF NOT EXISTS live_shopping_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES platform_users(id),
  title TEXT NOT NULL,
  description TEXT,
  stream_key TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  viewer_count INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_shopping_sessions_status ON live_shopping_sessions(status);

-- Live shopping products
CREATE TABLE IF NOT EXISTS live_shopping_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES live_shopping_sessions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES merchandise_products(id),
  display_order INT DEFAULT 0,
  featured_at TIMESTAMPTZ
);

-- Social wishlists
CREATE TABLE IF NOT EXISTS social_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  product_id UUID NOT NULL REFERENCES merchandise_products(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_social_wishlists_user ON social_wishlists(user_id);

-- Shared carts
CREATE TABLE IF NOT EXISTS shared_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES platform_users(id),
  name TEXT,
  share_code TEXT NOT NULL UNIQUE,
  is_public BOOLEAN DEFAULT false,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_carts_code ON shared_carts(share_code);

-- Shared cart items
CREATE TABLE IF NOT EXISTS shared_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES shared_carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES merchandise_products(id),
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social product reviews
CREATE TABLE IF NOT EXISTS social_product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES merchandise_products(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  media_urls TEXT[],
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_product_reviews_product ON social_product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_social_product_reviews_status ON social_product_reviews(status);

-- Product rating summary
CREATE TABLE IF NOT EXISTS product_rating_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES merchandise_products(id) UNIQUE,
  average_rating NUMERIC(2,1),
  total_reviews INT DEFAULT 0,
  rating_distribution JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group buy campaigns
CREATE TABLE IF NOT EXISTS group_buy_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES merchandise_products(id),
  title TEXT NOT NULL,
  description TEXT,
  target_quantity INT NOT NULL,
  discount_percent NUMERIC(5,2),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  participants_count INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_buy_campaigns_status ON group_buy_campaigns(status);

-- Group buy participants
CREATE TABLE IF NOT EXISTS group_buy_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES group_buy_campaigns(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  quantity INT DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

-- Product shares
CREATE TABLE IF NOT EXISTS product_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES merchandise_products(id),
  user_id UUID REFERENCES platform_users(id),
  platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_shares_product ON product_shares(product_id);

-- Strategic goals
CREATE TABLE IF NOT EXISTS strategic_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_budget NUMERIC(14,2),
  target_date DATE,
  metrics JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimization logs
CREATE TABLE IF NOT EXISTS optimization_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  applied_by UUID REFERENCES platform_users(id),
  status TEXT DEFAULT 'applied',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitors
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  industry TEXT NOT NULL,
  description TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  market_share NUMERIC(5,2),
  pricing_tier TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitors_active ON competitors(is_active);

-- Competitive updates
CREATE TABLE IF NOT EXISTS competitive_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id),
  update_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  source TEXT,
  impact TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitive_updates_competitor ON competitive_updates(competitor_id);

-- Competitor pricing
CREATE TABLE IF NOT EXISTS competitor_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id),
  product_category TEXT NOT NULL,
  price NUMERIC(10,2),
  features JSONB,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(competitor_id, product_category)
);

-- Competitor features
CREATE TABLE IF NOT EXISTS competitor_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id),
  feature_name TEXT NOT NULL,
  has_feature BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market trends
CREATE TABLE IF NOT EXISTS market_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  impact_score INT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market data
CREATE TABLE IF NOT EXISTS market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT NOT NULL,
  market_size NUMERIC(14,2),
  growth_rate NUMERIC(5,2),
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market segments
CREATE TABLE IF NOT EXISTS market_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  size NUMERIC(14,2),
  growth_rate NUMERIC(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SWOT analysis
CREATE TABLE IF NOT EXISTS swot_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('internal', 'external')),
  category TEXT NOT NULL CHECK (category IN ('strength', 'weakness', 'opportunity', 'threat')),
  description TEXT NOT NULL,
  impact_score INT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitive alerts
CREATE TABLE IF NOT EXISTS competitive_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES competitors(id),
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitive_alerts_status ON competitive_alerts(status);

-- Add fields to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS strategic_goal_ids UUID[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS strategic_importance INT DEFAULT 3;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS urgency INT DEFAULT 3;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS required_skills TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_size INT;

-- Add fields to deals
ALTER TABLE deals ADD COLUMN IF NOT EXISTS competitor_id UUID REFERENCES competitors(id);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS win_reason TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS loss_reason TEXT;

-- Add social_score to merchandise_products
ALTER TABLE merchandise_products ADD COLUMN IF NOT EXISTS social_score NUMERIC(10,2) DEFAULT 0;

-- Functions
CREATE OR REPLACE FUNCTION increment_group_buy_participants(p_campaign_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE group_buy_campaigns
  SET participants_count = participants_count + 1
  WHERE id = p_campaign_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_product_shares(p_product_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE product_social_stats
  SET shares = shares + 1, updated_at = NOW()
  WHERE product_id = p_product_id;
  
  IF NOT FOUND THEN
    INSERT INTO product_social_stats (product_id, shares)
    VALUES (p_product_id, 1);
  END IF;
  
  UPDATE merchandise_products
  SET social_score = social_score + 1
  WHERE id = p_product_id;
END;
$$;

-- RLS policies
ALTER TABLE shoppable_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoppable_post_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoppable_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoppable_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_social_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_shopping_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_shopping_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_rating_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_buy_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_buy_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitive_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE swot_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitive_alerts ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON shoppable_posts TO authenticated;
GRANT SELECT, INSERT, DELETE ON shoppable_post_products TO authenticated;
GRANT SELECT, INSERT, DELETE ON shoppable_post_likes TO authenticated;
GRANT SELECT, INSERT ON shoppable_post_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON product_social_stats TO authenticated;
GRANT SELECT ON influencer_recommendations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON live_shopping_sessions TO authenticated;
GRANT SELECT, INSERT ON live_shopping_products TO authenticated;
GRANT SELECT, INSERT, DELETE ON social_wishlists TO authenticated;
GRANT SELECT, INSERT, UPDATE ON shared_carts TO authenticated;
GRANT SELECT, INSERT, DELETE ON shared_cart_items TO authenticated;
GRANT SELECT, INSERT ON social_product_reviews TO authenticated;
GRANT SELECT ON product_rating_summary TO authenticated;
GRANT SELECT, INSERT ON group_buy_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE ON group_buy_participants TO authenticated;
GRANT SELECT, INSERT ON product_shares TO authenticated;
GRANT SELECT, INSERT, UPDATE ON strategic_goals TO authenticated;
GRANT SELECT, INSERT ON optimization_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON competitors TO authenticated;
GRANT SELECT, INSERT ON competitive_updates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON competitor_pricing TO authenticated;
GRANT SELECT, INSERT ON competitor_features TO authenticated;
GRANT SELECT, INSERT ON market_trends TO authenticated;
GRANT SELECT, INSERT ON market_data TO authenticated;
GRANT SELECT, INSERT ON market_segments TO authenticated;
GRANT SELECT, INSERT ON swot_analysis TO authenticated;
GRANT SELECT, INSERT, UPDATE ON competitive_alerts TO authenticated;
GRANT EXECUTE ON FUNCTION increment_group_buy_participants(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_product_shares(UUID) TO authenticated;
