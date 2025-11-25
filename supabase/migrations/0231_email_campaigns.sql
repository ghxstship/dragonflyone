-- Migration: Advanced Marketing Tools - Email Campaigns
-- Description: Email campaign management, templates, and analytics

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(500) NOT NULL,
  preview_text VARCHAR(500),
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('promotional', 'transactional', 'newsletter', 'announcement', 'reminder', 'welcome', 'confirmation', 'custom')),
  category VARCHAR(100),
  
  -- Design
  thumbnail_url TEXT,
  design_json JSONB,
  
  -- Variables
  variables JSONB DEFAULT '[]',
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('one_time', 'automated', 'drip', 'triggered', 'ab_test')),
  
  -- Content
  subject VARCHAR(500) NOT NULL,
  preview_text VARCHAR(500),
  from_name VARCHAR(255) NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  reply_to VARCHAR(255),
  html_content TEXT NOT NULL,
  text_content TEXT,
  
  -- Audience
  audience_type VARCHAR(50) DEFAULT 'segment' CHECK (audience_type IN ('all', 'segment', 'list', 'manual')),
  audience_segment_id UUID,
  audience_list_ids JSONB DEFAULT '[]',
  audience_filters JSONB DEFAULT '{}',
  estimated_recipients INTEGER DEFAULT 0,
  
  -- Scheduling
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- A/B Testing
  is_ab_test BOOLEAN DEFAULT FALSE,
  ab_test_config JSONB,
  winning_variant VARCHAR(50),
  
  -- Analytics
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  total_complaints INTEGER DEFAULT 0,
  
  -- Rates (calculated)
  delivery_rate DECIMAL(5,2) DEFAULT 0,
  open_rate DECIMAL(5,2) DEFAULT 0,
  click_rate DECIMAL(5,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  unsubscribe_rate DECIMAL(5,2) DEFAULT 0,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Email campaign recipients
CREATE TABLE IF NOT EXISTS email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  guest_id UUID,
  
  -- Personalization
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  custom_fields JSONB DEFAULT '{}',
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  bounce_type VARCHAR(50),
  bounce_reason TEXT,
  
  -- Engagement
  opened_at TIMESTAMPTZ,
  open_count INTEGER DEFAULT 0,
  clicked_at TIMESTAMPTZ,
  click_count INTEGER DEFAULT 0,
  unsubscribed_at TIMESTAMPTZ,
  complained_at TIMESTAMPTZ,
  
  -- Tracking
  message_id VARCHAR(255),
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email click tracking
CREATE TABLE IF NOT EXISTS email_click_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES email_campaign_recipients(id) ON DELETE CASCADE,
  link_url TEXT NOT NULL,
  link_text VARCHAR(500),
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50),
  location_country VARCHAR(100),
  location_city VARCHAR(100)
);

-- Email automation workflows
CREATE TABLE IF NOT EXISTS email_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Trigger
  trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('event_signup', 'ticket_purchase', 'membership_signup', 'membership_renewal', 'birthday', 'inactivity', 'custom_event', 'date_based')),
  trigger_config JSONB DEFAULT '{}',
  
  -- Workflow
  workflow_steps JSONB DEFAULT '[]',
  
  -- Status
  is_active BOOLEAN DEFAULT FALSE,
  
  -- Analytics
  total_triggered INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Email lists/segments
CREATE TABLE IF NOT EXISTS email_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  list_type VARCHAR(50) DEFAULT 'static' CHECK (list_type IN ('static', 'dynamic')),
  
  -- Dynamic segment rules
  segment_rules JSONB DEFAULT '{}',
  
  -- Stats
  subscriber_count INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Email list subscribers
CREATE TABLE IF NOT EXISTS email_list_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES email_lists(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  custom_fields JSONB DEFAULT '{}',
  
  status VARCHAR(50) DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'bounced', 'cleaned')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  
  source VARCHAR(100),
  
  UNIQUE(list_id, email)
);

-- Unsubscribe preferences
CREATE TABLE IF NOT EXISTS email_unsubscribe_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  -- Preferences
  unsubscribed_all BOOLEAN DEFAULT FALSE,
  unsubscribed_categories JSONB DEFAULT '[]',
  
  unsubscribed_at TIMESTAMPTZ DEFAULT NOW(),
  reason VARCHAR(255),
  
  UNIQUE(organization_id, email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_org ON email_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_org ON email_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_event ON email_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON email_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_campaign ON email_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_email ON email_campaign_recipients(email);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_status ON email_campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_email_click_tracking_campaign ON email_click_tracking(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_automations_org ON email_automations(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_lists_org ON email_lists(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_list_subscribers_list ON email_list_subscribers(list_id);
CREATE INDEX IF NOT EXISTS idx_email_list_subscribers_email ON email_list_subscribers(email);

-- RLS Policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_click_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_list_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_unsubscribe_preferences ENABLE ROW LEVEL SECURITY;

-- Templates - org members can view, admins can manage
CREATE POLICY "email_templates_select" ON email_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = email_templates.organization_id
    )
  );

CREATE POLICY "email_templates_manage" ON email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = email_templates.organization_id
      AND pu.platform_roles && ARRAY['GVTEWAY_ADMIN', 'GVTEWAY_MARKETING_MANAGER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Campaigns - marketing team can manage
CREATE POLICY "email_campaigns_select" ON email_campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = email_campaigns.organization_id
    )
  );

CREATE POLICY "email_campaigns_manage" ON email_campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = email_campaigns.organization_id
      AND pu.platform_roles && ARRAY['GVTEWAY_ADMIN', 'GVTEWAY_MARKETING_MANAGER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Recipients - campaign managers can view
CREATE POLICY "email_campaign_recipients_select" ON email_campaign_recipients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM email_campaigns ec
      JOIN platform_users pu ON pu.organization_id = ec.organization_id
      WHERE ec.id = email_campaign_recipients.campaign_id
      AND pu.id = auth.uid()
    )
  );

-- Lists - org members can view
CREATE POLICY "email_lists_select" ON email_lists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = email_lists.organization_id
    )
  );

CREATE POLICY "email_lists_manage" ON email_lists
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = email_lists.organization_id
      AND pu.platform_roles && ARRAY['GVTEWAY_ADMIN', 'GVTEWAY_MARKETING_MANAGER', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Function to update campaign analytics
CREATE OR REPLACE FUNCTION update_campaign_analytics(p_campaign_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE email_campaigns
  SET 
    total_sent = (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND status IN ('sent', 'delivered', 'bounced')),
    total_delivered = (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND status = 'delivered'),
    total_bounced = (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND status = 'bounced'),
    total_opened = (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND opened_at IS NOT NULL),
    total_clicked = (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND clicked_at IS NOT NULL),
    total_unsubscribed = (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND unsubscribed_at IS NOT NULL),
    total_complaints = (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND complained_at IS NOT NULL),
    delivery_rate = CASE 
      WHEN (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND status IN ('sent', 'delivered', 'bounced')) = 0 THEN 0
      ELSE (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND status = 'delivered')::DECIMAL / 
           (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND status IN ('sent', 'delivered', 'bounced'))::DECIMAL * 100
    END,
    open_rate = CASE 
      WHEN (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND status = 'delivered') = 0 THEN 0
      ELSE (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND opened_at IS NOT NULL)::DECIMAL / 
           (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND status = 'delivered')::DECIMAL * 100
    END,
    click_rate = CASE 
      WHEN (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND opened_at IS NOT NULL) = 0 THEN 0
      ELSE (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND clicked_at IS NOT NULL)::DECIMAL / 
           (SELECT COUNT(*) FROM email_campaign_recipients WHERE campaign_id = p_campaign_id AND opened_at IS NOT NULL)::DECIMAL * 100
    END,
    updated_at = NOW()
  WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update list subscriber count
CREATE OR REPLACE FUNCTION update_list_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE email_lists
  SET subscriber_count = (
    SELECT COUNT(*) FROM email_list_subscribers 
    WHERE list_id = COALESCE(NEW.list_id, OLD.list_id) 
    AND status = 'subscribed'
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.list_id, OLD.list_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_list_subscriber_count_update
  AFTER INSERT OR UPDATE OR DELETE ON email_list_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_list_subscriber_count();
