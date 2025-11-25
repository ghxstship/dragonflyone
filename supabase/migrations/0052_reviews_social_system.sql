-- Migration: Reviews & Social System
-- Description: Tables for reviews, ratings, social features, and community

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  review_type TEXT NOT NULL CHECK (review_type IN ('event', 'venue', 'artist', 'experience', 'merchandise', 'service')),
  target_id UUID NOT NULL,
  order_id UUID REFERENCES orders(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  venue_rating INT CHECK (venue_rating >= 1 AND venue_rating <= 5),
  production_rating INT CHECK (production_rating >= 1 AND production_rating <= 5),
  value_rating INT CHECK (value_rating >= 1 AND value_rating <= 5),
  photos TEXT[],
  event_date DATE,
  tags TEXT[],
  verified_purchase BOOLEAN DEFAULT false,
  verified_attendee BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged', 'hidden')),
  moderation_notes TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES platform_users(id),
  helpful_count INT DEFAULT 0,
  report_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, review_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_target ON reviews(review_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Review responses table
CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  responder_type TEXT NOT NULL CHECK (responder_type IN ('owner', 'staff', 'user')),
  content TEXT NOT NULL,
  is_official BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_responses_review ON review_responses(review_id);

-- Review helpfulness votes
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful', 'report')),
  report_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id, vote_type)
);

-- Review statistics (materialized for performance)
CREATE TABLE IF NOT EXISTS review_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  total_reviews INT DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0,
  rating_distribution JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}',
  average_venue_rating NUMERIC(3,2),
  average_production_rating NUMERIC(3,2),
  average_value_rating NUMERIC(3,2),
  verified_review_count INT DEFAULT 0,
  featured_review_count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(target_type, target_id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  item_type TEXT NOT NULL CHECK (item_type IN ('event', 'venue', 'artist', 'merchandise')),
  item_id UUID NOT NULL,
  price_alert BOOLEAN DEFAULT false,
  price_threshold NUMERIC(10,2),
  notes TEXT,
  notify_on_sale BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_item ON wishlists(item_type, item_id);

-- Social follows
CREATE TABLE IF NOT EXISTS social_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES platform_users(id),
  following_type TEXT NOT NULL CHECK (following_type IN ('user', 'artist', 'venue', 'event_series')),
  following_id UUID NOT NULL,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_type, following_id)
);

CREATE INDEX IF NOT EXISTS idx_social_follows_follower ON social_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_social_follows_following ON social_follows(following_type, following_id);

-- Community forums
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES forum_categories(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  last_reply_at TIMESTAMPTZ,
  last_reply_by UUID REFERENCES platform_users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON forum_posts(user_id);

CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  content TEXT NOT NULL,
  parent_reply_id UUID REFERENCES forum_replies(id),
  is_solution BOOLEAN DEFAULT false,
  like_count INT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id);

-- Community groups
CREATE TABLE IF NOT EXISTS community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image TEXT,
  group_type TEXT NOT NULL CHECK (group_type IN ('public', 'private', 'secret')),
  category TEXT,
  member_count INT DEFAULT 0,
  created_by UUID NOT NULL REFERENCES platform_users(id),
  is_official BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rules TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'banned')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);

-- Function to update review statistics
CREATE OR REPLACE FUNCTION update_review_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_target_type TEXT;
  v_target_id UUID;
BEGIN
  v_target_type := COALESCE(NEW.review_type, OLD.review_type);
  v_target_id := COALESCE(NEW.target_id, OLD.target_id);
  
  INSERT INTO review_statistics (target_type, target_id, total_reviews, average_rating, verified_review_count)
  SELECT 
    v_target_type,
    v_target_id,
    COUNT(*),
    ROUND(AVG(rating)::NUMERIC, 2),
    COUNT(*) FILTER (WHERE verified_purchase = true)
  FROM reviews
  WHERE review_type = v_target_type 
    AND target_id = v_target_id 
    AND status = 'approved'
  ON CONFLICT (target_type, target_id) 
  DO UPDATE SET
    total_reviews = EXCLUDED.total_reviews,
    average_rating = EXCLUDED.average_rating,
    verified_review_count = EXCLUDED.verified_review_count,
    updated_at = NOW();
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS review_statistics_trigger ON reviews;
CREATE TRIGGER review_statistics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_review_statistics();

-- RLS policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON reviews TO authenticated;
GRANT INSERT, UPDATE ON reviews TO authenticated;
GRANT SELECT, INSERT ON review_responses TO authenticated;
GRANT SELECT, INSERT ON review_votes TO authenticated;
GRANT SELECT ON review_statistics TO authenticated;
GRANT SELECT, INSERT, DELETE ON wishlists TO authenticated;
GRANT SELECT, INSERT, DELETE ON social_follows TO authenticated;
GRANT SELECT ON forum_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE ON forum_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON forum_replies TO authenticated;
GRANT SELECT ON community_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON group_members TO authenticated;
