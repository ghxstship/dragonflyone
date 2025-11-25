-- Migration: Social Commerce Tables
-- Description: Tables for bulk posting, social inbox, and shoppable posts

-- Bulk posts table
CREATE TABLE IF NOT EXISTS bulk_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  platforms TEXT[] NOT NULL,
  media_urls TEXT[],
  hashtags TEXT[],
  event_id UUID REFERENCES events(id),
  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'partial', 'failed')),
  created_by UUID REFERENCES platform_users(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bulk post results table
CREATE TABLE IF NOT EXISTS bulk_post_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulk_post_id UUID NOT NULL REFERENCES bulk_posts(id),
  platform VARCHAR(50) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('success', 'failed', 'pending')),
  post_id VARCHAR(200),
  post_url TEXT,
  error_message TEXT,
  posted_at TIMESTAMPTZ
);

-- Social inbox messages table
CREATE TABLE IF NOT EXISTS social_inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL,
  external_id VARCHAR(200),
  sender_name VARCHAR(200),
  sender_handle VARCHAR(200),
  content TEXT,
  message_type VARCHAR(30) CHECK (message_type IN ('comment', 'dm', 'mention', 'review')),
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'pending', 'responded', 'archived')),
  assigned_to UUID REFERENCES platform_users(id),
  received_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- Social inbox responses table
CREATE TABLE IF NOT EXISTS social_inbox_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES social_inbox_messages(id),
  content TEXT NOT NULL,
  responded_by UUID REFERENCES platform_users(id),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shoppable posts table
CREATE TABLE IF NOT EXISTS shoppable_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL,
  post_url TEXT,
  image_url TEXT NOT NULL,
  caption TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shoppable post tags table
CREATE TABLE IF NOT EXISTS shoppable_post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shoppable_post_id UUID NOT NULL REFERENCES shoppable_posts(id),
  product_id UUID NOT NULL REFERENCES products(id),
  x_position DECIMAL(5, 2),
  y_position DECIMAL(5, 2)
);

-- Fan spotlight table
CREATE TABLE IF NOT EXISTS fan_spotlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id),
  event_id UUID REFERENCES events(id),
  content_type VARCHAR(30) CHECK (content_type IN ('photo', 'video', 'story', 'review')),
  content_url TEXT,
  caption TEXT,
  featured_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'featured', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social proof widgets table
CREATE TABLE IF NOT EXISTS social_proof_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  widget_type VARCHAR(30) CHECK (widget_type IN ('attendee_count', 'trending', 'recent_purchases', 'reviews')),
  settings JSONB,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bulk_posts_event ON bulk_posts(event_id);
CREATE INDEX IF NOT EXISTS idx_bulk_post_results_post ON bulk_post_results(bulk_post_id);
CREATE INDEX IF NOT EXISTS idx_social_inbox_status ON social_inbox_messages(status);
CREATE INDEX IF NOT EXISTS idx_social_inbox_platform ON social_inbox_messages(platform);
CREATE INDEX IF NOT EXISTS idx_social_inbox_assigned ON social_inbox_messages(assigned_to);
CREATE INDEX IF NOT EXISTS idx_shoppable_posts_platform ON shoppable_posts(platform);
CREATE INDEX IF NOT EXISTS idx_shoppable_tags_post ON shoppable_post_tags(shoppable_post_id);
CREATE INDEX IF NOT EXISTS idx_shoppable_tags_product ON shoppable_post_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_fan_spotlights_event ON fan_spotlights(event_id);
CREATE INDEX IF NOT EXISTS idx_social_proof_event ON social_proof_widgets(event_id);

-- RLS Policies
ALTER TABLE bulk_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_post_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_inbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_inbox_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoppable_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shoppable_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_spotlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_proof_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY bulk_posts_view ON bulk_posts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY social_inbox_view ON social_inbox_messages FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY shoppable_posts_view ON shoppable_posts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY fan_spotlights_view ON fan_spotlights FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY social_proof_view ON social_proof_widgets FOR SELECT USING (auth.uid() IS NOT NULL);
