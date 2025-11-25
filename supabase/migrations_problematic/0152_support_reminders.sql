-- Migration: Support Conversations and Event Reminders
-- Adds support chat system and user event reminders

-- Support Conversations Table
CREATE TABLE IF NOT EXISTS support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'waiting', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Messages Table
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'agent', 'system')),
  content TEXT NOT NULL,
  agent_name VARCHAR(100),
  attachments JSONB DEFAULT '[]',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Event Reminders Table
CREATE TABLE IF NOT EXISTS user_event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT TRUE,
  reminder_time VARCHAR(10) DEFAULT '24h',
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ticket_id)
);

-- Order Items Table (for order history)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  item_type VARCHAR(20) DEFAULT 'ticket' CHECK (item_type IN ('ticket', 'merchandise', 'addon', 'fee')),
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE SET NULL,
  product_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_conversations_user ON support_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_support_conversations_status ON support_conversations(status);
CREATE INDEX IF NOT EXISTS idx_support_conversations_agent ON support_conversations(assigned_agent_id);

CREATE INDEX IF NOT EXISTS idx_support_messages_conversation ON support_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created ON support_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_event_reminders_user ON user_event_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_event ON user_event_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_pending ON user_event_reminders(enabled, sent);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- RLS Policies
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own conversations
CREATE POLICY "Users can view their conversations" ON support_conversations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create conversations" ON support_conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can view messages in their conversations
CREATE POLICY "Users can view their messages" ON support_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_conversations
      WHERE support_conversations.id = support_messages.conversation_id
      AND support_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages" ON support_messages
  FOR INSERT WITH CHECK (
    sender = 'user' AND
    EXISTS (
      SELECT 1 FROM support_conversations
      WHERE support_conversations.id = support_messages.conversation_id
      AND support_conversations.user_id = auth.uid()
    )
  );

-- Users can manage their reminders
CREATE POLICY "Users can view their reminders" ON user_event_reminders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create reminders" ON user_event_reminders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their reminders" ON user_event_reminders
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their reminders" ON user_event_reminders
  FOR DELETE USING (user_id = auth.uid());

-- Users can view their order items
CREATE POLICY "Users can view their order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Agents can manage conversations
CREATE POLICY "Agents can manage conversations" ON support_conversations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'support_agent')
    )
  );

CREATE POLICY "Agents can manage messages" ON support_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin', 'support_agent')
    )
  );

-- Function to send reminder notifications
CREATE OR REPLACE FUNCTION process_event_reminders()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_reminder RECORD;
BEGIN
  FOR v_reminder IN
    SELECT 
      r.id,
      r.user_id,
      r.event_id,
      r.reminder_time,
      e.title,
      e.date,
      e.time,
      e.venue,
      p.email
    FROM user_event_reminders r
    JOIN events e ON e.id = r.event_id
    JOIN profiles p ON p.id = r.user_id
    WHERE r.enabled = TRUE
      AND r.sent = FALSE
      AND CASE r.reminder_time
        WHEN '1h' THEN e.date - INTERVAL '1 hour' <= NOW()
        WHEN '3h' THEN e.date - INTERVAL '3 hours' <= NOW()
        WHEN '24h' THEN e.date - INTERVAL '24 hours' <= NOW()
        WHEN '48h' THEN e.date - INTERVAL '48 hours' <= NOW()
        WHEN '1w' THEN e.date - INTERVAL '7 days' <= NOW()
        ELSE FALSE
      END
  LOOP
    -- Mark as sent (actual notification would be sent via edge function)
    UPDATE user_event_reminders
    SET sent = TRUE, sent_at = NOW()
    WHERE id = v_reminder.id;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated at triggers
CREATE TRIGGER support_conversations_updated_at
  BEFORE UPDATE ON support_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER event_reminders_updated_at
  BEFORE UPDATE ON user_event_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
