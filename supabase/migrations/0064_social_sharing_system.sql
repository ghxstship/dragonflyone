-- Migration: Social Sharing System
-- Description: Tables for social media accounts, shares, and analytics

-- Social accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'youtube', 'snapchat')),
  account_name TEXT NOT NULL,
  account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  account_metadata JSONB,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, account_id)
);

CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);

-- Social shares table
CREATE TABLE IF NOT EXISTS social_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  account_id UUID REFERENCES social_accounts(id),
  content_type TEXT NOT NULL CHECK (content_type IN ('event', 'ticket', 'achievement', 'review', 'custom', 'photo', 'video')),
  content_id UUID,
  platform TEXT NOT NULL,
  message TEXT,
  media_urls TEXT[],
  hashtags TEXT[],
  link_url TEXT,
  schedule_time TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  external_post_id TEXT,
  external_post_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'posting', 'posted', 'failed', 'cancelled')),
  error_message TEXT,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  shares INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_shares_user ON social_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_social_shares_status ON social_shares(status);
CREATE INDEX IF NOT EXISTS idx_social_shares_content ON social_shares(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_scheduled ON social_shares(schedule_time) WHERE status = 'scheduled';

-- Social share templates table
CREATE TABLE IF NOT EXISTS social_share_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  platform TEXT,
  message_template TEXT NOT NULL,
  hashtags TEXT[],
  media_placeholders TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_share_templates_org ON social_share_templates(organization_id);

-- Social engagement tracking table
CREATE TABLE IF NOT EXISTS social_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES social_shares(id) ON DELETE CASCADE,
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('impression', 'click', 'share', 'like', 'comment', 'save')),
  count INT DEFAULT 1,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_engagements_share ON social_engagements(share_id);

-- User generated content table
CREATE TABLE IF NOT EXISTS user_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  event_id UUID REFERENCES events(id),
  content_type TEXT NOT NULL CHECK (content_type IN ('photo', 'video', 'story', 'review')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  hashtags TEXT[],
  location TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  likes_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_generated_content_user ON user_generated_content(user_id);
CREATE INDEX IF NOT EXISTS idx_user_generated_content_event ON user_generated_content(event_id);
CREATE INDEX IF NOT EXISTS idx_user_generated_content_status ON user_generated_content(status);

-- Hashtag campaigns table
CREATE TABLE IF NOT EXISTS hashtag_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  event_id UUID REFERENCES events(id),
  hashtag TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  prize_description TEXT,
  is_active BOOLEAN DEFAULT true,
  post_count INT DEFAULT 0,
  unique_users INT DEFAULT 0,
  total_reach INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hashtag_campaigns_hashtag ON hashtag_campaigns(hashtag);
CREATE INDEX IF NOT EXISTS idx_hashtag_campaigns_event ON hashtag_campaigns(event_id);

-- Function to update share engagement metrics
CREATE OR REPLACE FUNCTION update_share_engagement_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE social_shares SET
    impressions = (SELECT COALESCE(SUM(count), 0) FROM social_engagements WHERE share_id = NEW.share_id AND engagement_type = 'impression'),
    clicks = (SELECT COALESCE(SUM(count), 0) FROM social_engagements WHERE share_id = NEW.share_id AND engagement_type = 'click'),
    shares = (SELECT COALESCE(SUM(count), 0) FROM social_engagements WHERE share_id = NEW.share_id AND engagement_type = 'share'),
    likes = (SELECT COALESCE(SUM(count), 0) FROM social_engagements WHERE share_id = NEW.share_id AND engagement_type = 'like'),
    comments = (SELECT COALESCE(SUM(count), 0) FROM social_engagements WHERE share_id = NEW.share_id AND engagement_type = 'comment'),
    updated_at = NOW()
  WHERE id = NEW.share_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS share_engagement_trigger ON social_engagements;
CREATE TRIGGER share_engagement_trigger
  AFTER INSERT ON social_engagements
  FOR EACH ROW
  EXECUTE FUNCTION update_share_engagement_metrics();

-- RLS policies
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_share_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtag_campaigns ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON social_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON social_shares TO authenticated;
GRANT SELECT, INSERT, UPDATE ON social_share_templates TO authenticated;
GRANT SELECT, INSERT ON social_engagements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_generated_content TO authenticated;
GRANT SELECT, INSERT, UPDATE ON hashtag_campaigns TO authenticated;
