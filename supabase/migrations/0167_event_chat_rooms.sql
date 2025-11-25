-- Migration: Event Chat Rooms
-- Adds event-specific chat functionality with auto-archive

-- Event Chat Rooms Table
CREATE TABLE IF NOT EXISTS event_chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
  rules TEXT[],
  moderators UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Chat Messages Table
CREATE TABLE IF NOT EXISTS event_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID NOT NULL REFERENCES event_chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_by UUID REFERENCES profiles(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_chat_rooms_event ON event_chat_rooms(event_id);
CREATE INDEX IF NOT EXISTS idx_event_chat_rooms_status ON event_chat_rooms(status);

CREATE INDEX IF NOT EXISTS idx_event_chat_messages_room ON event_chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_event_chat_messages_user ON event_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_event_chat_messages_created ON event_chat_messages(created_at DESC);

-- RLS Policies
ALTER TABLE event_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can view active chat rooms
CREATE POLICY "Anyone can view chat rooms" ON event_chat_rooms
  FOR SELECT USING (TRUE);

-- Anyone can view messages in active rooms
CREATE POLICY "Anyone can view messages" ON event_chat_messages
  FOR SELECT USING (is_deleted = FALSE);

-- Authenticated users can send messages
CREATE POLICY "Users can send messages" ON event_chat_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM event_chat_rooms
      WHERE event_chat_rooms.id = event_chat_messages.chat_room_id
      AND event_chat_rooms.status = 'active'
    )
  );

-- Admins and moderators can manage
CREATE POLICY "Admins can manage chat rooms" ON event_chat_rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

CREATE POLICY "Admins can manage messages" ON event_chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Function to auto-archive chat rooms after event ends
CREATE OR REPLACE FUNCTION archive_expired_chat_rooms()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE event_chat_rooms
  SET status = 'archived', archived_at = NOW(), updated_at = NOW()
  WHERE status = 'active'
    AND EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_chat_rooms.event_id
      AND events.date < NOW() - INTERVAL '24 hours'
    );
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at trigger
CREATE TRIGGER event_chat_rooms_updated_at
  BEFORE UPDATE ON event_chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
