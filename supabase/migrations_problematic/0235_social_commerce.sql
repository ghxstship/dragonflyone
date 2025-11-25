-- Migration: Social Commerce
-- Description: Social shopping, influencer marketing, and community-driven commerce

-- Social shops (user-created storefronts)
CREATE TABLE IF NOT EXISTS social_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  -- Branding
  logo_url TEXT,
  banner_url TEXT,
  theme_color VARCHAR(7),
  
  -- Social links
  instagram_handle VARCHAR(100),
  tiktok_handle VARCHAR(100),
  youtube_channel VARCHAR(255),
  twitter_handle VARCHAR(100),
  
  -- Settings
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Stats
  follower_count INTEGER DEFAULT 0,
  total_sales DECIMAL(12,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'closed')),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES platform_users(id),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shop followers
CREATE TABLE IF NOT EXISTS social_shop_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES social_shops(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  UNIQUE(shop_id, user_id)
);

-- Curated collections
CREATE TABLE IF NOT EXISTS social_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES social_shops(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  
  -- Visibility
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  
  sort_order INTEGER DEFAULT 0,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection items
CREATE TABLE IF NOT EXISTS social_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES social_collections(id) ON DELETE CASCADE,
  
  -- Can link to various product types
  product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('ticket', 'merchandise', 'experience', 'membership')),
  product_id UUID NOT NULL,
  
  -- Curator notes
  curator_note TEXT,
  
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social posts (shoppable content)
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES social_shops(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT,
  media_urls JSONB DEFAULT '[]',
  media_type VARCHAR(50) CHECK (media_type IN ('image', 'video', 'carousel', 'story')),
  
  -- Tagged products
  tagged_products JSONB DEFAULT '[]',
  
  -- Engagement
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  
  -- Conversion
  click_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'removed')),
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post interactions
CREATE TABLE IF NOT EXISTS social_post_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  
  interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('like', 'save', 'share', 'click', 'purchase')),
  
  -- For purchases
  order_id UUID,
  amount DECIMAL(10,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(post_id, user_id, interaction_type) WHERE interaction_type IN ('like', 'save')
);

-- Post comments
CREATE TABLE IF NOT EXISTS social_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES social_post_comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  like_count INTEGER DEFAULT 0,
  
  is_pinned BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Influencer/affiliate links
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES social_shops(id) ON DELETE CASCADE,
  
  -- Link details
  code VARCHAR(50) NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  
  -- Product association
  product_type VARCHAR(50),
  product_id UUID,
  
  -- Commission
  commission_type VARCHAR(50) DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'fixed')),
  commission_value DECIMAL(10,2) NOT NULL,
  
  -- Tracking
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_commission DECIMAL(12,2) DEFAULT 0,
  
  -- Validity
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate conversions
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES affiliate_links(id) ON DELETE CASCADE,
  order_id UUID NOT NULL,
  
  order_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  
  -- Payout
  payout_status VARCHAR(50) DEFAULT 'pending' CHECK (payout_status IN ('pending', 'approved', 'paid', 'rejected')),
  paid_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live shopping events
CREATE TABLE IF NOT EXISTS live_shopping_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES social_shops(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  
  -- Streaming
  stream_url TEXT,
  stream_key TEXT,
  platform VARCHAR(50) CHECK (platform IN ('internal', 'youtube', 'instagram', 'tiktok', 'facebook')),
  
  -- Schedule
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  
  -- Products to feature
  featured_products JSONB DEFAULT '[]',
  
  -- Stats
  peak_viewers INTEGER DEFAULT 0,
  total_viewers INTEGER DEFAULT 0,
  total_sales DECIMAL(12,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User wishlists (social)
CREATE TABLE IF NOT EXISTS social_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Sharing
  share_code VARCHAR(50) UNIQUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist items
CREATE TABLE IF NOT EXISTS social_wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID NOT NULL REFERENCES social_wishlists(id) ON DELETE CASCADE,
  
  product_type VARCHAR(50) NOT NULL,
  product_id UUID NOT NULL,
  
  -- Price tracking
  added_price DECIMAL(10,2),
  current_price DECIMAL(10,2),
  price_drop_alert BOOLEAN DEFAULT TRUE,
  
  notes TEXT,
  priority INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(wishlist_id, product_type, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_shops_owner ON social_shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_social_shops_slug ON social_shops(slug);
CREATE INDEX IF NOT EXISTS idx_social_shops_status ON social_shops(status);
CREATE INDEX IF NOT EXISTS idx_social_shop_followers_shop ON social_shop_followers(shop_id);
CREATE INDEX IF NOT EXISTS idx_social_shop_followers_user ON social_shop_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_social_collections_shop ON social_collections(shop_id);
CREATE INDEX IF NOT EXISTS idx_social_collection_items_collection ON social_collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_shop ON social_posts(shop_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_author ON social_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_post_interactions_post ON social_post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_social_post_interactions_user ON social_post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_social_post_comments_post ON social_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_shop ON affiliate_links(shop_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_code ON affiliate_links(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_link ON affiliate_conversions(link_id);
CREATE INDEX IF NOT EXISTS idx_live_shopping_shop ON live_shopping_events(shop_id);
CREATE INDEX IF NOT EXISTS idx_live_shopping_status ON live_shopping_events(status);
CREATE INDEX IF NOT EXISTS idx_social_wishlists_user ON social_wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_social_wishlist_items_wishlist ON social_wishlist_items(wishlist_id);

-- RLS Policies
ALTER TABLE social_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shop_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_shopping_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_wishlist_items ENABLE ROW LEVEL SECURITY;

-- Shops - public read for active, owner can manage
CREATE POLICY "social_shops_select" ON social_shops
  FOR SELECT USING (status = 'active' OR owner_id = auth.uid());

CREATE POLICY "social_shops_manage" ON social_shops
  FOR ALL USING (owner_id = auth.uid());

-- Followers - public read, users manage their own
CREATE POLICY "social_shop_followers_select" ON social_shop_followers
  FOR SELECT USING (true);

CREATE POLICY "social_shop_followers_manage" ON social_shop_followers
  FOR ALL USING (user_id = auth.uid());

-- Collections - public read for public collections
CREATE POLICY "social_collections_select" ON social_collections
  FOR SELECT USING (
    is_public = TRUE
    OR EXISTS (SELECT 1 FROM social_shops ss WHERE ss.id = social_collections.shop_id AND ss.owner_id = auth.uid())
  );

CREATE POLICY "social_collections_manage" ON social_collections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM social_shops ss WHERE ss.id = social_collections.shop_id AND ss.owner_id = auth.uid())
  );

-- Posts - public read for published
CREATE POLICY "social_posts_select" ON social_posts
  FOR SELECT USING (status = 'published' OR author_id = auth.uid());

CREATE POLICY "social_posts_manage" ON social_posts
  FOR ALL USING (author_id = auth.uid());

-- Interactions - users manage their own
CREATE POLICY "social_post_interactions_select" ON social_post_interactions
  FOR SELECT USING (true);

CREATE POLICY "social_post_interactions_manage" ON social_post_interactions
  FOR ALL USING (user_id = auth.uid());

-- Comments - public read, users manage their own
CREATE POLICY "social_post_comments_select" ON social_post_comments
  FOR SELECT USING (NOT is_hidden);

CREATE POLICY "social_post_comments_manage" ON social_post_comments
  FOR ALL USING (user_id = auth.uid());

-- Affiliate links - shop owners manage
CREATE POLICY "affiliate_links_select" ON affiliate_links
  FOR SELECT USING (
    is_active = TRUE
    OR EXISTS (SELECT 1 FROM social_shops ss WHERE ss.id = affiliate_links.shop_id AND ss.owner_id = auth.uid())
  );

CREATE POLICY "affiliate_links_manage" ON affiliate_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM social_shops ss WHERE ss.id = affiliate_links.shop_id AND ss.owner_id = auth.uid())
  );

-- Live shopping - public read for scheduled/live
CREATE POLICY "live_shopping_select" ON live_shopping_events
  FOR SELECT USING (status IN ('scheduled', 'live') OR host_id = auth.uid());

CREATE POLICY "live_shopping_manage" ON live_shopping_events
  FOR ALL USING (host_id = auth.uid());

-- Wishlists - owner manages, public can view public wishlists
CREATE POLICY "social_wishlists_select" ON social_wishlists
  FOR SELECT USING (is_public = TRUE OR user_id = auth.uid());

CREATE POLICY "social_wishlists_manage" ON social_wishlists
  FOR ALL USING (user_id = auth.uid());

-- Wishlist items
CREATE POLICY "social_wishlist_items_select" ON social_wishlist_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM social_wishlists sw WHERE sw.id = social_wishlist_items.wishlist_id AND (sw.is_public = TRUE OR sw.user_id = auth.uid()))
  );

CREATE POLICY "social_wishlist_items_manage" ON social_wishlist_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM social_wishlists sw WHERE sw.id = social_wishlist_items.wishlist_id AND sw.user_id = auth.uid())
  );

-- Function to update shop stats
CREATE OR REPLACE FUNCTION update_shop_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE social_shops
  SET follower_count = (
    SELECT COUNT(*) FROM social_shop_followers WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shop_follower_count_update
  AFTER INSERT OR DELETE ON social_shop_followers
  FOR EACH ROW
  EXECUTE FUNCTION update_shop_follower_count();

-- Function to update post engagement counts
CREATE OR REPLACE FUNCTION update_post_engagement()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE social_posts
  SET 
    like_count = (SELECT COUNT(*) FROM social_post_interactions WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) AND interaction_type = 'like'),
    save_count = (SELECT COUNT(*) FROM social_post_interactions WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) AND interaction_type = 'save'),
    share_count = (SELECT COUNT(*) FROM social_post_interactions WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) AND interaction_type = 'share'),
    click_count = (SELECT COUNT(*) FROM social_post_interactions WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) AND interaction_type = 'click'),
    purchase_count = (SELECT COUNT(*) FROM social_post_interactions WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) AND interaction_type = 'purchase'),
    revenue_generated = (SELECT COALESCE(SUM(amount), 0) FROM social_post_interactions WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) AND interaction_type = 'purchase'),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_engagement_update
  AFTER INSERT OR DELETE ON social_post_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_engagement();
