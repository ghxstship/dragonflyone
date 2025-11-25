-- Migration: Marketing Campaigns System
-- Description: Tables for marketing campaigns, automations, and analytics

-- Marketing campaigns table
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push', 'in_app', 'social')),
  event_id UUID REFERENCES events(id),
  target_audience JSONB NOT NULL,
  content JSONB NOT NULL,
  schedule JSONB,
  ab_test JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  estimated_recipients INT,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_org ON marketing_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_event ON marketing_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_scheduled ON marketing_campaigns(scheduled_at);

-- Campaign metrics table
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  sent_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  bounced_count INT DEFAULT 0,
  opened_count INT DEFAULT 0,
  clicked_count INT DEFAULT 0,
  unsubscribed_count INT DEFAULT 0,
  conversion_count INT DEFAULT 0,
  revenue_generated NUMERIC(15,2) DEFAULT 0,
  open_rate NUMERIC(5,2),
  click_rate NUMERIC(5,2),
  conversion_rate NUMERIC(5,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign ON campaign_metrics(campaign_id);

-- Campaign sends table
CREATE TABLE IF NOT EXISTS campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES platform_users(id),
  recipient_email TEXT,
  recipient_phone TEXT,
  variant TEXT DEFAULT 'A',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'delivered', 'bounced', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign ON campaign_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_recipient ON campaign_sends(recipient_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_status ON campaign_sends(status);

-- Marketing automations table
CREATE TABLE IF NOT EXISTS marketing_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  trigger TEXT NOT NULL CHECK (trigger IN ('event_published', 'ticket_purchased', 'event_reminder', 'abandoned_cart', 'post_event', 'wishlist_available', 'price_drop', 'birthday', 'membership_renewal')),
  conditions JSONB,
  actions JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_automations_org ON marketing_automations(organization_id);
CREATE INDEX IF NOT EXISTS idx_marketing_automations_trigger ON marketing_automations(trigger);
CREATE INDEX IF NOT EXISTS idx_marketing_automations_active ON marketing_automations(active);

-- Automation executions table
CREATE TABLE IF NOT EXISTS automation_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID NOT NULL REFERENCES marketing_automations(id) ON DELETE CASCADE,
  trigger_data JSONB,
  recipient_id UUID REFERENCES platform_users(id),
  actions_executed JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_executions_automation ON automation_executions(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  category TEXT CHECK (category IN ('transactional', 'marketing', 'notification', 'reminder')),
  variables TEXT[],
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_templates_org ON email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);

-- Subscriber preferences table
CREATE TABLE IF NOT EXISTS subscriber_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) UNIQUE,
  email_marketing BOOLEAN DEFAULT true,
  email_transactional BOOLEAN DEFAULT true,
  email_reminders BOOLEAN DEFAULT true,
  sms_marketing BOOLEAN DEFAULT false,
  sms_transactional BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  frequency_preference TEXT DEFAULT 'normal' CHECK (frequency_preference IN ('all', 'normal', 'minimal', 'none')),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriber_preferences_user ON subscriber_preferences(user_id);

-- Function to update campaign metrics
CREATE OR REPLACE FUNCTION update_campaign_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE campaign_metrics SET
    sent_count = (SELECT COUNT(*) FROM campaign_sends WHERE campaign_id = NEW.campaign_id AND status IN ('sent', 'delivered')),
    delivered_count = (SELECT COUNT(*) FROM campaign_sends WHERE campaign_id = NEW.campaign_id AND status = 'delivered'),
    bounced_count = (SELECT COUNT(*) FROM campaign_sends WHERE campaign_id = NEW.campaign_id AND status = 'bounced'),
    opened_count = (SELECT COUNT(*) FROM campaign_sends WHERE campaign_id = NEW.campaign_id AND opened_at IS NOT NULL),
    clicked_count = (SELECT COUNT(*) FROM campaign_sends WHERE campaign_id = NEW.campaign_id AND clicked_at IS NOT NULL),
    conversion_count = (SELECT COUNT(*) FROM campaign_sends WHERE campaign_id = NEW.campaign_id AND converted_at IS NOT NULL),
    updated_at = NOW()
  WHERE campaign_id = NEW.campaign_id;
  
  -- Calculate rates
  UPDATE campaign_metrics SET
    open_rate = CASE WHEN delivered_count > 0 THEN ROUND((opened_count::NUMERIC / delivered_count) * 100, 2) ELSE 0 END,
    click_rate = CASE WHEN opened_count > 0 THEN ROUND((clicked_count::NUMERIC / opened_count) * 100, 2) ELSE 0 END,
    conversion_rate = CASE WHEN clicked_count > 0 THEN ROUND((conversion_count::NUMERIC / clicked_count) * 100, 2) ELSE 0 END
  WHERE campaign_id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS campaign_sends_metrics_trigger ON campaign_sends;
CREATE TRIGGER campaign_sends_metrics_trigger
  AFTER INSERT OR UPDATE ON campaign_sends
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_metrics();

-- RLS policies
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_preferences ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON marketing_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE ON campaign_metrics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON campaign_sends TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON marketing_automations TO authenticated;
GRANT SELECT, INSERT ON automation_executions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON subscriber_preferences TO authenticated;
