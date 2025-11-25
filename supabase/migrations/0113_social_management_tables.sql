-- Migration: Social Management Tables
-- Description: Tables for sentiment alerts, crisis management, content calendar, and moderation

-- Sentiment alerts table
CREATE TABLE IF NOT EXISTS sentiment_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  name VARCHAR(200) NOT NULL,
  trigger_type VARCHAR(30) NOT NULL CHECK (trigger_type IN ('negative_spike', 'positive_spike', 'keyword', 'volume')),
  threshold DECIMAL(5, 2) NOT NULL,
  keywords TEXT[],
  notification_channels TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sentiment alert triggers table
CREATE TABLE IF NOT EXISTS sentiment_alert_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES sentiment_alerts(id),
  sentiment_score DECIMAL(5, 2),
  sample_content TEXT,
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ
);

-- Crisis incidents table
CREATE TABLE IF NOT EXISTS crisis_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  title VARCHAR(200) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category VARCHAR(30) NOT NULL CHECK (category IN ('pr', 'safety', 'technical', 'legal', 'financial', 'other')),
  description TEXT,
  affected_platforms TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved')),
  created_by UUID REFERENCES platform_users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crisis responses table
CREATE TABLE IF NOT EXISTS crisis_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crisis_id UUID NOT NULL REFERENCES crisis_incidents(id),
  content TEXT NOT NULL,
  platform VARCHAR(50),
  responded_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crisis response templates table
CREATE TABLE IF NOT EXISTS crisis_response_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  content TEXT NOT NULL,
  platforms TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled social posts table
CREATE TABLE IF NOT EXISTS scheduled_social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  platforms TEXT[] NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  media_urls TEXT[],
  hashtags TEXT[],
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'published', 'failed', 'cancelled')),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment filters table
CREATE TABLE IF NOT EXISTS comment_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  keywords TEXT[] NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('flag', 'hide', 'delete', 'notify')),
  platforms TEXT[],
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flagged comments table
CREATE TABLE IF NOT EXISTS flagged_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id VARCHAR(200),
  platform VARCHAR(50),
  content TEXT,
  reason TEXT,
  matched_keywords TEXT[],
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'removed')),
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  moderated_by UUID REFERENCES platform_users(id),
  moderated_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sentiment_alerts_event ON sentiment_alerts(event_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_triggers_alert ON sentiment_alert_triggers(alert_id);
CREATE INDEX IF NOT EXISTS idx_crisis_incidents_event ON crisis_incidents(event_id);
CREATE INDEX IF NOT EXISTS idx_crisis_incidents_status ON crisis_incidents(status);
CREATE INDEX IF NOT EXISTS idx_crisis_responses_crisis ON crisis_responses(crisis_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_event ON scheduled_social_posts(event_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled ON scheduled_social_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_flagged_comments_status ON flagged_comments(status);

-- RLS Policies
ALTER TABLE sentiment_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_alert_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE flagged_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY sentiment_alerts_view ON sentiment_alerts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY crisis_incidents_view ON crisis_incidents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY scheduled_posts_view ON scheduled_social_posts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY comment_filters_view ON comment_filters FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY flagged_comments_view ON flagged_comments FOR SELECT USING (auth.uid() IS NOT NULL);
