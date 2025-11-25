-- Migration: Direct Messaging
-- Adds direct messaging between fans

-- Direct Message Conversations Table
CREATE TABLE IF NOT EXISTS direct_message_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant1_id, participant2_id)
);

-- Direct Messages Table
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES direct_message_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dm_conversations_participant1 ON direct_message_conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_dm_conversations_participant2 ON direct_message_conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_dm_conversations_last_message ON direct_message_conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation ON direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_unread ON direct_messages(conversation_id, read) WHERE read = FALSE;

-- RLS Policies
ALTER TABLE direct_message_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their conversations
CREATE POLICY "Users can view their conversations" ON direct_message_conversations
  FOR SELECT USING (participant1_id = auth.uid() OR participant2_id = auth.uid());

CREATE POLICY "Users can create conversations" ON direct_message_conversations
  FOR INSERT WITH CHECK (participant1_id = auth.uid() OR participant2_id = auth.uid());

-- Users can view messages in their conversations
CREATE POLICY "Users can view their messages" ON direct_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM direct_message_conversations
      WHERE direct_message_conversations.id = direct_messages.conversation_id
      AND (direct_message_conversations.participant1_id = auth.uid() 
           OR direct_message_conversations.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON direct_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM direct_message_conversations
      WHERE direct_message_conversations.id = direct_messages.conversation_id
      AND (direct_message_conversations.participant1_id = auth.uid() 
           OR direct_message_conversations.participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can mark messages as read" ON direct_messages
  FOR UPDATE USING (
    sender_id != auth.uid() AND
    EXISTS (
      SELECT 1 FROM direct_message_conversations
      WHERE direct_message_conversations.id = direct_messages.conversation_id
      AND (direct_message_conversations.participant1_id = auth.uid() 
           OR direct_message_conversations.participant2_id = auth.uid())
    )
  );

-- Updated at trigger
CREATE TRIGGER dm_conversations_updated_at
  BEFORE UPDATE ON direct_message_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
