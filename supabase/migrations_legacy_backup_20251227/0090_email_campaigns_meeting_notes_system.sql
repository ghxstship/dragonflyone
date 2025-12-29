-- Migration: Email Campaigns & Meeting Notes System
-- Description: Tables for mass email campaigns and meeting notes with action items

-- Email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to TEXT,
  template_id UUID,
  html_content TEXT,
  text_content TEXT,
  recipient_list_id UUID,
  recipient_filter JSONB,
  recipient_count INT DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  track_opens BOOLEAN DEFAULT true,
  track_clicks BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_org ON email_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created ON email_campaigns(created_at);

-- Email campaign stats
CREATE TABLE IF NOT EXISTS email_campaign_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE UNIQUE,
  sent INT DEFAULT 0,
  delivered INT DEFAULT 0,
  opened INT DEFAULT 0,
  unique_opens INT DEFAULT 0,
  clicked INT DEFAULT 0,
  unique_clicks INT DEFAULT 0,
  bounced INT DEFAULT 0,
  soft_bounced INT DEFAULT 0,
  hard_bounced INT DEFAULT 0,
  unsubscribed INT DEFAULT 0,
  complained INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_campaign_stats_campaign ON email_campaign_stats(campaign_id);

-- Email campaign recipients
CREATE TABLE IF NOT EXISTS email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  open_count INT DEFAULT 0,
  clicked_at TIMESTAMPTZ,
  click_count INT DEFAULT 0,
  bounced_at TIMESTAMPTZ,
  bounce_type TEXT,
  bounce_reason TEXT,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_campaign ON email_campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_contact ON email_campaign_recipients(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_recipients_status ON email_campaign_recipients(status);

-- Email campaign clicks
CREATE TABLE IF NOT EXISTS email_campaign_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES email_campaign_recipients(id) ON DELETE CASCADE,
  link_url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_campaign_clicks_campaign ON email_campaign_clicks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaign_clicks_recipient ON email_campaign_clicks(recipient_id);

-- Contact lists
CREATE TABLE IF NOT EXISTS contact_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'static' CHECK (type IN ('static', 'dynamic')),
  filter_criteria JSONB,
  member_count INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_lists_org ON contact_lists(organization_id);

-- Contact list members
CREATE TABLE IF NOT EXISTS contact_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES contact_lists(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_contact_list_members_list ON contact_list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_contact_list_members_contact ON contact_list_members(contact_id);

-- Meeting notes
CREATE TABLE IF NOT EXISTS meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  meeting_id UUID REFERENCES calendar_meetings(id),
  contact_id UUID REFERENCES contacts(id),
  deal_id UUID REFERENCES deals(id),
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  attendees JSONB,
  agenda TEXT[],
  notes TEXT NOT NULL,
  decisions TEXT[],
  next_steps TEXT[],
  follow_up_date DATE,
  tags TEXT[],
  is_shared BOOLEAN DEFAULT false,
  shared_with UUID[],
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meeting_notes_contact ON meeting_notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_deal ON meeting_notes(deal_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_project ON meeting_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_date ON meeting_notes(date);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_created_by ON meeting_notes(created_by);

-- Meeting action items
CREATE TABLE IF NOT EXISTS meeting_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_note_id UUID NOT NULL REFERENCES meeting_notes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  assigned_to UUID REFERENCES platform_users(id),
  assigned_to_name TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES platform_users(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meeting_action_items_note ON meeting_action_items(meeting_note_id);
CREATE INDEX IF NOT EXISTS idx_meeting_action_items_assigned ON meeting_action_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_meeting_action_items_status ON meeting_action_items(status);
CREATE INDEX IF NOT EXISTS idx_meeting_action_items_due ON meeting_action_items(due_date);

-- Function to increment campaign stat
CREATE OR REPLACE FUNCTION increment_campaign_stat(
  p_campaign_id UUID,
  p_stat TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format('UPDATE email_campaign_stats SET %I = %I + 1, updated_at = NOW() WHERE campaign_id = $1', p_stat, p_stat)
  USING p_campaign_id;
END;
$$;

-- Function to get campaign performance
CREATE OR REPLACE FUNCTION get_campaign_performance(p_campaign_id UUID)
RETURNS TABLE (
  open_rate NUMERIC,
  click_rate NUMERIC,
  bounce_rate NUMERIC,
  unsubscribe_rate NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_stats RECORD;
BEGIN
  SELECT * INTO v_stats FROM email_campaign_stats WHERE campaign_id = p_campaign_id;
  
  IF v_stats IS NULL OR v_stats.sent = 0 THEN
    RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
  ELSE
    RETURN QUERY SELECT 
      (v_stats.opened::NUMERIC / v_stats.sent * 100)::NUMERIC(5,2),
      (v_stats.clicked::NUMERIC / v_stats.sent * 100)::NUMERIC(5,2),
      (v_stats.bounced::NUMERIC / v_stats.sent * 100)::NUMERIC(5,2),
      (v_stats.unsubscribed::NUMERIC / v_stats.sent * 100)::NUMERIC(5,2);
  END IF;
END;
$$;

-- Function to get pending action items
CREATE OR REPLACE FUNCTION get_pending_action_items(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  description TEXT,
  due_date DATE,
  priority TEXT,
  meeting_title TEXT,
  contact_name TEXT,
  deal_name TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ai.id,
    ai.description,
    ai.due_date,
    ai.priority,
    mn.title as meeting_title,
    CONCAT(c.first_name, ' ', c.last_name) as contact_name,
    d.name as deal_name
  FROM meeting_action_items ai
  JOIN meeting_notes mn ON ai.meeting_note_id = mn.id
  LEFT JOIN contacts c ON mn.contact_id = c.id
  LEFT JOIN deals d ON mn.deal_id = d.id
  WHERE ai.assigned_to = p_user_id
    AND ai.status IN ('pending', 'in_progress')
  ORDER BY ai.due_date ASC NULLS LAST, ai.priority DESC;
END;
$$;

-- RLS policies
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_action_items ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON email_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE ON email_campaign_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON email_campaign_recipients TO authenticated;
GRANT SELECT, INSERT ON email_campaign_clicks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON contact_lists TO authenticated;
GRANT SELECT, INSERT, DELETE ON contact_list_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON meeting_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON meeting_action_items TO authenticated;
GRANT EXECUTE ON FUNCTION increment_campaign_stat(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_campaign_performance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_action_items(UUID) TO authenticated;
