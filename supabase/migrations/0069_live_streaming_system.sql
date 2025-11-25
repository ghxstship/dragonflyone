-- Migration: Live Streaming System
-- Description: Tables for live streams, viewers, chat, and analytics

-- Live streams table
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  title TEXT NOT NULL,
  description TEXT,
  stream_type TEXT NOT NULL CHECK (stream_type IN ('live', 'replay', 'virtual', 'hybrid')),
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'twitch', 'vimeo', 'custom', 'native')),
  stream_url TEXT,
  stream_key TEXT,
  embed_code TEXT,
  thumbnail_url TEXT,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  access_type TEXT NOT NULL DEFAULT 'ticketed' CHECK (access_type IN ('public', 'ticketed', 'members_only', 'vip', 'private')),
  price NUMERIC(10,2),
  max_viewers INT,
  chat_enabled BOOLEAN DEFAULT true,
  reactions_enabled BOOLEAN DEFAULT true,
  recording_enabled BOOLEAN DEFAULT true,
  dvr_enabled BOOLEAN DEFAULT false,
  quality_options TEXT[],
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'preparing', 'live', 'paused', 'ended', 'cancelled')),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_streams_event ON live_streams(event_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON live_streams(status);
CREATE INDEX IF NOT EXISTS idx_live_streams_scheduled ON live_streams(scheduled_start);

-- Stream viewers table
CREATE TABLE IF NOT EXISTS stream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id),
  session_id TEXT,
  device_type TEXT,
  browser TEXT,
  ip_address INET,
  country TEXT,
  quality_watched TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  watch_duration_seconds INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_viewers_stream ON stream_viewers(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_viewers_user ON stream_viewers(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_viewers_active ON stream_viewers(stream_id, is_active);

-- Stream analytics table
CREATE TABLE IF NOT EXISTS stream_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE UNIQUE,
  peak_viewers INT DEFAULT 0,
  total_views INT DEFAULT 0,
  unique_viewers INT DEFAULT 0,
  average_watch_time INT DEFAULT 0,
  total_watch_time INT DEFAULT 0,
  chat_messages_count INT DEFAULT 0,
  reactions_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  quality_breakdown JSONB,
  device_breakdown JSONB,
  country_breakdown JSONB,
  engagement_score NUMERIC(5,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_analytics_stream ON stream_analytics(stream_id);

-- Stream chat messages table
CREATE TABLE IF NOT EXISTS stream_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id),
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'emoji', 'gif', 'tip', 'poll', 'announcement')),
  is_pinned BOOLEAN DEFAULT false,
  is_highlighted BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_by UUID REFERENCES platform_users(id),
  tip_amount NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_chat_messages_stream ON stream_chat_messages(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_messages_user ON stream_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_messages_time ON stream_chat_messages(stream_id, created_at);

-- Stream reactions table
CREATE TABLE IF NOT EXISTS stream_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id),
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'fire', 'clap', 'wow', 'sad')),
  timestamp_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_reactions_stream ON stream_reactions(stream_id);

-- Stream recordings table
CREATE TABLE IF NOT EXISTS stream_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  recording_url TEXT NOT NULL,
  duration_seconds INT,
  file_size_bytes BIGINT,
  quality TEXT,
  format TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed', 'deleted')),
  is_public BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_recordings_stream ON stream_recordings(stream_id);

-- Stream access tokens table
CREATE TABLE IF NOT EXISTS stream_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id),
  token TEXT NOT NULL UNIQUE,
  access_type TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stream_access_tokens_stream ON stream_access_tokens(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_access_tokens_token ON stream_access_tokens(token);

-- Function to update stream analytics
CREATE OR REPLACE FUNCTION update_stream_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_viewers INT;
  v_peak_viewers INT;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_active = TRUE THEN
    -- Count current active viewers
    SELECT COUNT(*) INTO v_current_viewers
    FROM stream_viewers
    WHERE stream_id = NEW.stream_id AND is_active = TRUE;
    
    -- Get current peak
    SELECT peak_viewers INTO v_peak_viewers
    FROM stream_analytics
    WHERE stream_id = NEW.stream_id;
    
    -- Update analytics
    UPDATE stream_analytics SET
      total_views = total_views + 1,
      peak_viewers = GREATEST(COALESCE(v_peak_viewers, 0), v_current_viewers),
      updated_at = NOW()
    WHERE stream_id = NEW.stream_id;
    
  ELSIF TG_OP = 'UPDATE' AND OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
    -- Update watch time when viewer leaves
    UPDATE stream_analytics SET
      total_watch_time = total_watch_time + NEW.watch_duration_seconds,
      updated_at = NOW()
    WHERE stream_id = NEW.stream_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stream_viewers_analytics_trigger ON stream_viewers;
CREATE TRIGGER stream_viewers_analytics_trigger
  AFTER INSERT OR UPDATE ON stream_viewers
  FOR EACH ROW
  EXECUTE FUNCTION update_stream_analytics();

-- Function to update chat message count
CREATE OR REPLACE FUNCTION update_stream_chat_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE stream_analytics SET
    chat_messages_count = chat_messages_count + 1,
    updated_at = NOW()
  WHERE stream_id = NEW.stream_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stream_chat_count_trigger ON stream_chat_messages;
CREATE TRIGGER stream_chat_count_trigger
  AFTER INSERT ON stream_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_stream_chat_count();

-- RLS policies
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_access_tokens ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON live_streams TO authenticated;
GRANT SELECT, INSERT, UPDATE ON stream_viewers TO authenticated;
GRANT SELECT, UPDATE ON stream_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON stream_chat_messages TO authenticated;
GRANT SELECT, INSERT ON stream_reactions TO authenticated;
GRANT SELECT ON stream_recordings TO authenticated;
GRANT SELECT, INSERT ON stream_access_tokens TO authenticated;
