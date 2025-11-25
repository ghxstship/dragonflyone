-- Migration: Real-time Communication System
-- Description: Real-time messaging, presence, and collaboration features

-- Chat rooms/conversations
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('direct', 'group', 'project', 'event', 'department', 'broadcast')),
  name VARCHAR(255),
  description TEXT,
  avatar_url TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{
    "allow_reactions": true,
    "allow_threads": true,
    "allow_file_sharing": true,
    "message_retention_days": null
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Chat room members
CREATE TABLE IF NOT EXISTS chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  nickname VARCHAR(100),
  notification_preference VARCHAR(50) DEFAULT 'all' CHECK (notification_preference IN ('all', 'mentions', 'none')),
  is_muted BOOLEAN DEFAULT FALSE,
  muted_until TIMESTAMPTZ,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(room_id, user_id)
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'audio', 'video', 'system', 'poll', 'location')),
  content TEXT,
  formatted_content TEXT,
  attachments JSONB DEFAULT '[]',
  mentions JSONB DEFAULT '[]',
  reactions JSONB DEFAULT '{}',
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message read receipts
CREATE TABLE IF NOT EXISTS message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- User presence/status
CREATE TABLE IF NOT EXISTS user_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE UNIQUE,
  status VARCHAR(50) DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'dnd', 'offline')),
  status_text VARCHAR(255),
  status_emoji VARCHAR(10),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  current_room_id UUID REFERENCES chat_rooms(id) ON DELETE SET NULL,
  device_info JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Typing indicators (ephemeral, but stored for sync)
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 seconds',
  UNIQUE(room_id, user_id)
);

-- Pinned messages
CREATE TABLE IF NOT EXISTS pinned_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  pinned_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  pinned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, message_id)
);

-- Voice/video calls
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE SET NULL,
  call_type VARCHAR(50) NOT NULL CHECK (call_type IN ('audio', 'video', 'screen_share')),
  status VARCHAR(50) DEFAULT 'ringing' CHECK (status IN ('ringing', 'ongoing', 'ended', 'missed', 'declined')),
  initiated_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  recording_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call participants
CREATE TABLE IF NOT EXISTS call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'invited' CHECK (status IN ('invited', 'ringing', 'joined', 'left', 'declined', 'missed')),
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  is_muted BOOLEAN DEFAULT FALSE,
  is_video_off BOOLEAN DEFAULT FALSE,
  is_screen_sharing BOOLEAN DEFAULT FALSE,
  UNIQUE(call_id, user_id)
);

-- Broadcast messages (announcements)
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_audience JSONB DEFAULT '{"all": true}',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  read_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_rooms_org ON chat_rooms(organization_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_project ON chat_rooms(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_event ON chat_rooms(event_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user ON chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_parent ON chat_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_user ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_room ON typing_indicators(room_id);
CREATE INDEX IF NOT EXISTS idx_calls_room ON calls(room_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_call ON call_participants(call_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_org ON broadcast_messages(organization_id);

-- RLS Policies
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE pinned_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;

-- Chat rooms - members can see rooms they belong to
CREATE POLICY "chat_rooms_select" ON chat_rooms
  FOR SELECT USING (
    NOT is_private
    OR EXISTS (
      SELECT 1 FROM chat_room_members crm
      WHERE crm.room_id = chat_rooms.id
      AND crm.user_id = auth.uid()
      AND crm.left_at IS NULL
    )
  );

CREATE POLICY "chat_rooms_insert" ON chat_rooms
  FOR INSERT WITH CHECK (true);

-- Chat room members
CREATE POLICY "chat_room_members_select" ON chat_room_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM chat_room_members crm
      WHERE crm.room_id = chat_room_members.room_id
      AND crm.user_id = auth.uid()
      AND crm.left_at IS NULL
    )
  );

CREATE POLICY "chat_room_members_manage" ON chat_room_members
  FOR ALL USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM chat_room_members crm
      WHERE crm.room_id = chat_room_members.room_id
      AND crm.user_id = auth.uid()
      AND crm.role IN ('owner', 'admin')
      AND crm.left_at IS NULL
    )
  );

-- Chat messages - room members can see and send
CREATE POLICY "chat_messages_select" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_room_members crm
      WHERE crm.room_id = chat_messages.room_id
      AND crm.user_id = auth.uid()
      AND crm.left_at IS NULL
    )
  );

CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_room_members crm
      WHERE crm.room_id = chat_messages.room_id
      AND crm.user_id = auth.uid()
      AND crm.left_at IS NULL
    )
  );

CREATE POLICY "chat_messages_update" ON chat_messages
  FOR UPDATE USING (sender_id = auth.uid());

-- User presence - public read, own write
CREATE POLICY "user_presence_select" ON user_presence FOR SELECT USING (true);
CREATE POLICY "user_presence_manage" ON user_presence
  FOR ALL USING (user_id = auth.uid());

-- Typing indicators
CREATE POLICY "typing_indicators_select" ON typing_indicators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_room_members crm
      WHERE crm.room_id = typing_indicators.room_id
      AND crm.user_id = auth.uid()
    )
  );

CREATE POLICY "typing_indicators_manage" ON typing_indicators
  FOR ALL USING (user_id = auth.uid());

-- Calls
CREATE POLICY "calls_select" ON calls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM call_participants cp
      WHERE cp.call_id = calls.id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "calls_insert" ON calls
  FOR INSERT WITH CHECK (initiated_by = auth.uid());

-- Call participants
CREATE POLICY "call_participants_select" ON call_participants
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM call_participants cp
      WHERE cp.call_id = call_participants.call_id
      AND cp.user_id = auth.uid()
    )
  );

-- Broadcast messages
CREATE POLICY "broadcast_messages_select" ON broadcast_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = broadcast_messages.organization_id
    )
  );

CREATE POLICY "broadcast_messages_manage" ON broadcast_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = broadcast_messages.organization_id
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Enable realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE calls;

-- Function to update room's updated_at on new message
CREATE OR REPLACE FUNCTION update_room_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms SET updated_at = NOW() WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_message_update_room
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_room_on_message();

-- Function to clean up expired typing indicators
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM typing_indicators WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
