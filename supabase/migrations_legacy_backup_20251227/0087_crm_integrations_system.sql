-- Migration: CRM Integrations System
-- Description: Tables for email and calendar integrations with auto-logging

-- Email accounts
CREATE TABLE IF NOT EXISTS email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook', 'exchange', 'imap')),
  email_address TEXT NOT NULL,
  display_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  auto_log BOOLEAN DEFAULT true,
  sync_contacts BOOLEAN DEFAULT true,
  sync_calendar BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  sync_cursor TEXT,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  disconnected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_accounts_user ON email_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_email ON email_accounts(email_address);

-- Email logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  account_id UUID REFERENCES email_accounts(id),
  contact_id UUID REFERENCES contacts(id),
  deal_id UUID REFERENCES deals(id),
  project_id UUID REFERENCES projects(id),
  subject TEXT NOT NULL,
  body_preview TEXT,
  body_html TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT[] NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  sent_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ,
  thread_id TEXT,
  message_id TEXT UNIQUE,
  in_reply_to TEXT,
  has_attachments BOOLEAN DEFAULT false,
  attachments JSONB,
  labels TEXT[],
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_user ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_contact ON email_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_deal ON email_logs(deal_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_thread ON email_logs(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at);

-- Calendar accounts
CREATE TABLE IF NOT EXISTS calendar_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'apple', 'caldav')),
  email_address TEXT NOT NULL,
  calendar_id TEXT,
  calendar_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  sync_direction TEXT DEFAULT 'two_way' CHECK (sync_direction IN ('one_way', 'two_way')),
  default_reminder_minutes INT DEFAULT 30,
  last_sync_at TIMESTAMPTZ,
  sync_token TEXT,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  disconnected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_accounts_user ON calendar_accounts(user_id);

-- Calendar meetings
CREATE TABLE IF NOT EXISTS calendar_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  account_id UUID REFERENCES calendar_accounts(id),
  external_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'America/New_York',
  location TEXT,
  is_virtual BOOLEAN DEFAULT false,
  meeting_url TEXT,
  meeting_provider TEXT CHECK (meeting_provider IN ('zoom', 'teams', 'meet', 'webex', 'other')),
  contact_id UUID REFERENCES contacts(id),
  deal_id UUID REFERENCES deals(id),
  project_id UUID REFERENCES projects(id),
  reminder_minutes INT,
  recurrence JSONB,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show')),
  outcome TEXT,
  notes TEXT,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calendar_meetings_user ON calendar_meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_meetings_contact ON calendar_meetings(contact_id);
CREATE INDEX IF NOT EXISTS idx_calendar_meetings_deal ON calendar_meetings(deal_id);
CREATE INDEX IF NOT EXISTS idx_calendar_meetings_time ON calendar_meetings(start_time, end_time);

-- Meeting attendees
CREATE TABLE IF NOT EXISTS meeting_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES calendar_meetings(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  response_status TEXT DEFAULT 'pending' CHECK (response_status IN ('pending', 'accepted', 'declined', 'tentative')),
  is_organizer BOOLEAN DEFAULT false,
  is_optional BOOLEAN DEFAULT false,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting ON meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_email ON meeting_attendees(email);

-- User availability
CREATE TABLE IF NOT EXISTS user_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone TEXT DEFAULT 'America/New_York',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_user_availability_user ON user_availability(user_id);

-- Task follow-ups
CREATE TABLE IF NOT EXISTS crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  assigned_to UUID REFERENCES platform_users(id),
  contact_id UUID REFERENCES contacts(id),
  deal_id UUID REFERENCES deals(id),
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT DEFAULT 'follow_up' CHECK (task_type IN ('follow_up', 'call', 'email', 'meeting', 'task', 'deadline', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  reminder_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'deferred')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES platform_users(id),
  recurrence JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_tasks_user ON crm_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_assigned ON crm_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_contact ON crm_tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_deal ON crm_tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due ON crm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON crm_tasks(status);

-- Function to auto-create follow-up task
CREATE OR REPLACE FUNCTION create_follow_up_task(
  p_user_id UUID,
  p_contact_id UUID,
  p_title TEXT,
  p_due_date TIMESTAMPTZ,
  p_deal_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_task_id UUID;
BEGIN
  INSERT INTO crm_tasks (user_id, assigned_to, contact_id, deal_id, title, task_type, due_date)
  VALUES (p_user_id, p_user_id, p_contact_id, p_deal_id, p_title, 'follow_up', p_due_date)
  RETURNING id INTO v_task_id;
  
  RETURN v_task_id;
END;
$$;

-- Function to get communication timeline
CREATE OR REPLACE FUNCTION get_communication_timeline(
  p_contact_id UUID,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  occurred_at TIMESTAMPTZ,
  direction TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  (
    SELECT 
      e.id,
      'email'::TEXT as type,
      e.subject as title,
      e.body_preview as description,
      e.sent_at as occurred_at,
      e.direction,
      jsonb_build_object('from', e.from_email, 'to', e.to_emails) as metadata
    FROM email_logs e
    WHERE e.contact_id = p_contact_id
  )
  UNION ALL
  (
    SELECT 
      m.id,
      'meeting'::TEXT as type,
      m.title,
      m.description,
      m.start_time as occurred_at,
      NULL as direction,
      jsonb_build_object('location', m.location, 'status', m.status) as metadata
    FROM calendar_meetings m
    WHERE m.contact_id = p_contact_id
  )
  ORDER BY occurred_at DESC
  LIMIT p_limit;
END;
$$;

-- RLS policies
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON email_accounts TO authenticated;
GRANT SELECT, INSERT ON email_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON calendar_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON calendar_meetings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON meeting_attendees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_availability TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON crm_tasks TO authenticated;
GRANT EXECUTE ON FUNCTION create_follow_up_task(UUID, UUID, TEXT, TIMESTAMPTZ, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_communication_timeline(UUID, INT) TO authenticated;
