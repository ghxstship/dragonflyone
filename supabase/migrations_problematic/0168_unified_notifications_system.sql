-- Migration: Unified Notifications System
-- Description: Cross-platform notification system for ATLVS, COMPVSS, and GVTEWAY

-- Unified notifications
CREATE TABLE IF NOT EXISTS unified_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'action_required')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  channels TEXT[] DEFAULT ARRAY['in_app'],
  link TEXT,
  source_platform TEXT NOT NULL CHECK (source_platform IN ('atlvs', 'compvss', 'gvteway', 'system')),
  source_entity_type TEXT,
  source_entity_id UUID,
  action_buttons JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  sent_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_unified_notifications_user ON unified_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_unified_notifications_platform ON unified_notifications(source_platform);
CREATE INDEX IF NOT EXISTS idx_unified_notifications_read ON unified_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_unified_notifications_created ON unified_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_unified_notifications_priority ON unified_notifications(priority);

-- Notification delivery queue
CREATE TABLE IF NOT EXISTS notification_delivery_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES unified_notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempts INT DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_queue_notification ON notification_delivery_queue(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_queue_status ON notification_delivery_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_queue_channel ON notification_delivery_queue(channel);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  email_digest TEXT DEFAULT 'instant' CHECK (email_digest IN ('instant', 'hourly', 'daily', 'weekly', 'none')),
  atlvs_notifications JSONB DEFAULT '{"deals": true, "invoices": true, "tasks": true}',
  compvss_notifications JSONB DEFAULT '{"projects": true, "schedule": true, "crew": true}',
  gvteway_notifications JSONB DEFAULT '{"tickets": true, "events": true, "orders": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('atlvs', 'compvss', 'gvteway', 'system')),
  event_type TEXT NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  default_channels TEXT[] DEFAULT ARRAY['in_app'],
  default_priority TEXT DEFAULT 'normal',
  variables JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_templates_platform ON notification_templates(platform);
CREATE INDEX IF NOT EXISTS idx_notification_templates_event ON notification_templates(event_type);

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS TABLE (
  platform TEXT,
  count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    un.source_platform as platform,
    COUNT(*) as count
  FROM unified_notifications un
  WHERE un.user_id = p_user_id
    AND un.is_read = FALSE
    AND un.dismissed = FALSE
    AND (un.expires_at IS NULL OR un.expires_at > NOW())
  GROUP BY un.source_platform;
END;
$$;

-- Function to send notification from template
CREATE OR REPLACE FUNCTION send_notification_from_template(
  p_template_name TEXT,
  p_user_id UUID,
  p_variables JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_template RECORD;
  v_notification_id UUID;
  v_title TEXT;
  v_message TEXT;
BEGIN
  -- Get template
  SELECT * INTO v_template
  FROM notification_templates
  WHERE name = p_template_name AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found: %', p_template_name;
  END IF;
  
  -- Simple variable substitution (in production, use proper templating)
  v_title := v_template.title_template;
  v_message := v_template.message_template;
  
  -- Create notification
  INSERT INTO unified_notifications (
    user_id,
    title,
    message,
    priority,
    channels,
    source_platform
  )
  VALUES (
    p_user_id,
    v_title,
    v_message,
    v_template.default_priority,
    v_template.default_channels,
    v_template.platform
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function to cleanup expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM unified_notifications
  WHERE expires_at < NOW()
    OR (is_read = TRUE AND created_at < NOW() - INTERVAL '30 days')
    OR (dismissed = TRUE AND dismissed_at < NOW() - INTERVAL '7 days');
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- RLS policies
ALTER TABLE unified_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON unified_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notification_delivery_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;
GRANT SELECT ON notification_templates TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION send_notification_from_template(TEXT, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_notifications() TO authenticated;

-- Insert default notification templates
INSERT INTO notification_templates (name, platform, event_type, title_template, message_template, default_channels, default_priority) VALUES
('deal_created', 'atlvs', 'deal.created', 'New Deal Created', 'A new deal "{{deal_name}}" has been created with value {{deal_value}}.', ARRAY['in_app', 'email'], 'normal'),
('deal_won', 'atlvs', 'deal.won', 'Deal Won! 🎉', 'Congratulations! Deal "{{deal_name}}" has been won.', ARRAY['in_app', 'email', 'push'], 'high'),
('invoice_overdue', 'atlvs', 'invoice.overdue', 'Invoice Overdue', 'Invoice {{invoice_number}} is now overdue. Amount: {{amount}}', ARRAY['in_app', 'email'], 'high'),
('project_assigned', 'compvss', 'project.assigned', 'New Project Assignment', 'You have been assigned to project "{{project_name}}".', ARRAY['in_app', 'email', 'push'], 'normal'),
('schedule_change', 'compvss', 'schedule.changed', 'Schedule Update', 'Your schedule for {{date}} has been updated.', ARRAY['in_app', 'push', 'sms'], 'high'),
('crew_call', 'compvss', 'crew.call', 'Crew Call Reminder', 'Reminder: Your call time for {{project_name}} is {{call_time}}.', ARRAY['in_app', 'push', 'sms'], 'urgent'),
('ticket_purchased', 'gvteway', 'ticket.purchased', 'Ticket Confirmation', 'Your tickets for {{event_name}} have been confirmed.', ARRAY['in_app', 'email'], 'normal'),
('event_reminder', 'gvteway', 'event.reminder', 'Event Reminder', '{{event_name}} is coming up on {{event_date}}!', ARRAY['in_app', 'email', 'push'], 'normal'),
('event_cancelled', 'gvteway', 'event.cancelled', 'Event Cancelled', '{{event_name}} has been cancelled. Refund details will follow.', ARRAY['in_app', 'email', 'push', 'sms'], 'urgent')
ON CONFLICT (name) DO NOTHING;
