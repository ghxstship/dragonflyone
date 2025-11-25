-- Migration: Notifications System
-- Description: Tables for notifications, preferences, and push tokens

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('price_drop', 'event_reminder', 'ticket_confirmed', 'event_update', 'system', 'order', 'follow', 'review', 'message', 'waitlist', 'promo', 'transfer', 'refund', 'security')),
  category TEXT CHECK (category IN ('events', 'orders', 'social', 'account', 'marketing', 'system')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  image_url TEXT,
  action_type TEXT,
  action_data JSONB,
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  delivery_channels TEXT[] DEFAULT ARRAY['in_app'],
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  push_sent BOOLEAN DEFAULT false,
  push_sent_at TIMESTAMPTZ,
  sms_sent BOOLEAN DEFAULT false,
  sms_sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_reference ON notifications(reference_type, reference_id);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  in_app_enabled BOOLEAN DEFAULT true,
  email_frequency TEXT DEFAULT 'instant' CHECK (email_frequency IN ('instant', 'daily', 'weekly', 'never')),
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone TEXT DEFAULT 'America/New_York',
  preferences_by_type JSONB DEFAULT '{
    "price_drop": {"email": true, "push": true, "sms": false},
    "event_reminder": {"email": true, "push": true, "sms": false},
    "ticket_confirmed": {"email": true, "push": true, "sms": true},
    "event_update": {"email": true, "push": true, "sms": false},
    "order": {"email": true, "push": true, "sms": false},
    "follow": {"email": false, "push": true, "sms": false},
    "review": {"email": false, "push": true, "sms": false},
    "message": {"email": true, "push": true, "sms": false},
    "marketing": {"email": true, "push": false, "sms": false},
    "system": {"email": true, "push": true, "sms": false}
  }',
  unsubscribed_categories TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);

-- Push tokens table
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_id TEXT,
  device_name TEXT,
  device_model TEXT,
  app_version TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_tokens(user_id, is_active);

-- Notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  email_subject_template TEXT,
  email_body_template TEXT,
  push_title_template TEXT,
  push_body_template TEXT,
  sms_template TEXT,
  variables TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_notification_templates_org ON notification_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_code ON notification_templates(code);

-- Notification batches (for bulk sends)
CREATE TABLE IF NOT EXISTS notification_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  template_id UUID REFERENCES notification_templates(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  target_audience JSONB,
  total_recipients INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  opened_count INT DEFAULT 0,
  clicked_count INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_batches_org ON notification_batches(organization_id);
CREATE INDEX IF NOT EXISTS idx_notification_batches_status ON notification_batches(status);

-- Function to send notification
CREATE OR REPLACE FUNCTION send_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_notification_id UUID;
  v_prefs RECORD;
  v_channels TEXT[];
BEGIN
  -- Get user preferences
  SELECT * INTO v_prefs FROM notification_preferences WHERE user_id = p_user_id;
  
  -- Determine delivery channels
  v_channels := ARRAY['in_app'];
  IF v_prefs IS NOT NULL THEN
    IF v_prefs.email_enabled AND (v_prefs.preferences_by_type->p_type->>'email')::BOOLEAN THEN
      v_channels := v_channels || 'email';
    END IF;
    IF v_prefs.push_enabled AND (v_prefs.preferences_by_type->p_type->>'push')::BOOLEAN THEN
      v_channels := v_channels || 'push';
    END IF;
    IF v_prefs.sms_enabled AND (v_prefs.preferences_by_type->p_type->>'sms')::BOOLEAN THEN
      v_channels := v_channels || 'sms';
    END IF;
  END IF;
  
  -- Create notification
  INSERT INTO notifications (
    user_id, type, title, message, link, reference_type, reference_id, priority, delivery_channels
  )
  VALUES (
    p_user_id, p_type, p_title, p_message, p_link, p_reference_type, p_reference_id, p_priority, v_channels
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
    AND is_read = FALSE
    AND is_archived = FALSE
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN v_count;
END;
$$;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  p_user_id UUID,
  p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated INT;
BEGIN
  IF p_notification_ids IS NULL THEN
    UPDATE notifications SET
      is_read = TRUE,
      read_at = NOW()
    WHERE user_id = p_user_id
      AND is_read = FALSE;
  ELSE
    UPDATE notifications SET
      is_read = TRUE,
      read_at = NOW()
    WHERE user_id = p_user_id
      AND id = ANY(p_notification_ids)
      AND is_read = FALSE;
  END IF;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

-- Insert default notification templates
INSERT INTO notification_templates (code, name, type, category, title_template, message_template, email_subject_template)
VALUES 
  ('ticket_confirmed', 'Ticket Confirmed', 'ticket_confirmed', 'orders', 'Ticket Confirmed!', 'Your tickets for {{event_name}} have been confirmed.', 'Your tickets are confirmed - {{event_name}}'),
  ('event_reminder_24h', 'Event Reminder 24h', 'event_reminder', 'events', 'Event Tomorrow!', '{{event_name}} starts in 24 hours. Don''t forget your tickets!', 'Reminder: {{event_name}} is tomorrow!'),
  ('event_reminder_1h', 'Event Reminder 1h', 'event_reminder', 'events', 'Event Starting Soon!', '{{event_name}} starts in 1 hour. Time to head out!', 'Starting soon: {{event_name}}'),
  ('price_drop', 'Price Drop Alert', 'price_drop', 'events', 'Price Drop!', 'Tickets for {{event_name}} just dropped to {{new_price}}!', 'Price drop alert: {{event_name}}'),
  ('order_confirmed', 'Order Confirmed', 'order', 'orders', 'Order Confirmed', 'Your order #{{order_number}} has been confirmed.', 'Order confirmed - #{{order_number}}'),
  ('refund_processed', 'Refund Processed', 'refund', 'orders', 'Refund Processed', 'Your refund of {{amount}} has been processed.', 'Refund processed - {{amount}}')
ON CONFLICT DO NOTHING;

-- RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_batches ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON push_tokens TO authenticated;
GRANT SELECT ON notification_templates TO authenticated;
GRANT SELECT ON notification_batches TO authenticated;
GRANT EXECUTE ON FUNCTION send_notification(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notifications_read(UUID, UUID[]) TO authenticated;
