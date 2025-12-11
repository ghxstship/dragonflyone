-- Migration: Create missing GVTEWAY tables (Part 7 - Reviews, RFID, Social, Streaming, Surveys)
-- These tables are referenced by API routes but don't exist in the schema

-- ============================================
-- REVIEW TABLES (extended)
-- ============================================

CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  refund_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RFID TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS rfid_wristbands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  wristband_id TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'unassigned' CHECK (status IN ('unassigned', 'active', 'deactivated', 'lost', 'replaced')),
  balance DECIMAL(12,2) DEFAULT 0,
  ticket_id UUID,
  assigned_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rfid_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wristband_id UUID NOT NULL REFERENCES rfid_wristbands(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('topup', 'purchase', 'refund', 'transfer', 'adjustment')),
  amount DECIMAL(12,2) NOT NULL,
  balance_after DECIMAL(12,2) NOT NULL,
  vendor_id UUID,
  terminal_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scalping_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('bulk_purchase', 'rapid_resale', 'price_gouging', 'bot_activity', 'suspicious_pattern')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  affected_tickets INTEGER,
  user_ids UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS protection_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('purchase_limit', 'velocity_check', 'ip_block', 'device_fingerprint', 'captcha')),
  rule_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SOCIAL TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'photo', 'video', 'story', 'live')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  location TEXT,
  hashtags TEXT[] DEFAULT '{}',
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry')),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT reaction_target CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'twitter', 'instagram', 'spotify', 'apple_music', 'tiktok')),
  platform_user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  profile_data JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);

CREATE TABLE IF NOT EXISTS social_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'pinterest')),
  shop_id TEXT,
  is_active BOOLEAN DEFAULT true,
  catalog_synced_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_message_id TEXT,
  sender_id TEXT,
  sender_name TEXT,
  sender_avatar TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'story_reply', 'story_mention')),
  content TEXT,
  media_url TEXT,
  is_read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false,
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES auth.users(id),
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_inbox_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES social_inbox_messages(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  post_url TEXT,
  author_id TEXT,
  author_name TEXT,
  author_avatar TEXT,
  content TEXT,
  media_url TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  reach INTEGER,
  engagement INTEGER,
  is_responded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  monitor_type TEXT NOT NULL CHECK (monitor_type IN ('hashtag', 'mention', 'keyword', 'competitor')),
  value TEXT NOT NULL,
  platforms TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  platforms TEXT[] DEFAULT '{}',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  goals JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES social_campaigns(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platforms TEXT[] NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
  published_at TIMESTAMPTZ,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bulk_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platforms TEXT[] NOT NULL,
  post_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bulk_post_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulk_post_id UUID NOT NULL REFERENCES bulk_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  platform_post_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_post_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  platform TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_post_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_proof_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN ('recent_purchases', 'live_viewers', 'social_feed', 'countdown', 'reviews')),
  configuration JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_feed_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  platforms TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  moderation_enabled BOOLEAN DEFAULT true,
  auto_approve BOOLEAN DEFAULT false,
  display_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES social_feed_config(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_post_id TEXT,
  author_name TEXT,
  author_avatar TEXT,
  content TEXT,
  media_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STREAMING TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS streaming_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  concurrent_viewers INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  average_watch_time INTEGER DEFAULT 0,
  chat_messages INTEGER DEFAULT 0,
  reactions INTEGER DEFAULT 0,
  quality_metrics JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS stream_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  start_time INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  clip_url TEXT,
  thumbnail_url TEXT,
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'twitch', 'facebook', 'custom')),
  stream_key TEXT,
  rtmp_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SURVEY TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  survey_type TEXT DEFAULT 'post_event' CHECK (survey_type IN ('pre_event', 'post_event', 'nps', 'feedback', 'custom')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_anonymous BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  response_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  nps_score INTEGER CHECK (nps_score BETWEEN 0 AND 10),
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS survey_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfid_wristbands ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfid_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scalping_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE protection_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_inbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_inbox_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_post_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_proof_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_feed_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaming_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_answers ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Users can read their refund_requests" ON refund_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read rfid_wristbands" ON rfid_wristbands FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read rfid_transactions" ON rfid_transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read scalping_alerts" ON scalping_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read protection_rules" ON protection_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read social_posts" ON social_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read post_comments" ON post_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read post_reactions" ON post_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage their social_connections" ON social_connections FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can read social_shops" ON social_shops FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read social_inbox_messages" ON social_inbox_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read social_inbox_responses" ON social_inbox_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read social_mentions" ON social_mentions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read social_monitors" ON social_monitors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read social_campaigns" ON social_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read scheduled_posts" ON scheduled_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read bulk_posts" ON bulk_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read bulk_post_results" ON bulk_post_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read social_post_metrics" ON social_post_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read social_post_templates" ON social_post_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read social_proof_widgets" ON social_proof_widgets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read social_feed_config" ON social_feed_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read social_feed_posts" ON social_feed_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read streaming_analytics" ON streaming_analytics FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read stream_clips" ON stream_clips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read stream_destinations" ON stream_destinations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read surveys" ON surveys FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read survey_responses" ON survey_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read survey_answers" ON survey_answers FOR SELECT TO authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rfid_wristbands_event_id ON rfid_wristbands(event_id);
CREATE INDEX IF NOT EXISTS idx_rfid_wristbands_user_id ON rfid_wristbands(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_id ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_event_id ON social_posts(event_id);
CREATE INDEX IF NOT EXISTS idx_social_inbox_messages_organization_id ON social_inbox_messages(organization_id);
CREATE INDEX IF NOT EXISTS idx_surveys_event_id ON surveys(event_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
