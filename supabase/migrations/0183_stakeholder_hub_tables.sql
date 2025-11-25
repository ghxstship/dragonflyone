-- Migration: Stakeholder Hub Tables
-- Description: Tables for stakeholder communication hub with permission levels

-- Project stakeholders table
CREATE TABLE IF NOT EXISTS project_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'sponsor', 'executive', 'manager', 'contributor', 'observer', 'external')),
  permission_level VARCHAR(20) NOT NULL CHECK (permission_level IN ('full', 'edit', 'comment', 'view')),
  notification_preferences JSONB DEFAULT '{"email": true, "in_app": true, "sms": false, "digest_frequency": "daily"}',
  access_areas TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, contact_id)
);

-- Stakeholder communications table
CREATE TABLE IF NOT EXISTS stakeholder_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES platform_users(id),
  type VARCHAR(30) NOT NULL CHECK (type IN ('announcement', 'update', 'request', 'decision', 'milestone', 'alert')),
  subject VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_roles TEXT[],
  target_stakeholder_ids UUID[],
  attachments JSONB,
  requires_acknowledgment BOOLEAN DEFAULT FALSE,
  acknowledged_by_all TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('draft', 'scheduled', 'sent', 'archived')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication acknowledgments table
CREATE TABLE IF NOT EXISTS communication_acknowledgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  communication_id UUID NOT NULL REFERENCES stakeholder_communications(id) ON DELETE CASCADE,
  stakeholder_id UUID NOT NULL REFERENCES project_stakeholders(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMPTZ NOT NULL,
  UNIQUE(communication_id, stakeholder_id)
);

-- Stakeholder notifications table
CREATE TABLE IF NOT EXISTS stakeholder_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id UUID NOT NULL REFERENCES project_stakeholders(id) ON DELETE CASCADE,
  communication_id UUID REFERENCES stakeholder_communications(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stakeholder activity log
CREATE TABLE IF NOT EXISTS stakeholder_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_stakeholders_project ON project_stakeholders(project_id);
CREATE INDEX IF NOT EXISTS idx_project_stakeholders_contact ON project_stakeholders(contact_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_communications_project ON stakeholder_communications(project_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_communications_sender ON stakeholder_communications(sender_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_notifications_stakeholder ON stakeholder_notifications(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_activity_project ON stakeholder_activity(project_id);

-- RLS Policies
ALTER TABLE project_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_activity ENABLE ROW LEVEL SECURITY;

-- Stakeholders can view their own records
CREATE POLICY stakeholder_view_own ON project_stakeholders
  FOR SELECT USING (
    contact_id IN (SELECT id FROM contacts WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM platform_users 
      WHERE id = auth.uid() 
      AND 'ATLVS_ADMIN' = ANY(platform_roles)
    )
  );

-- Admins can manage stakeholders
CREATE POLICY stakeholder_admin_all ON project_stakeholders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users 
      WHERE id = auth.uid() 
      AND ('ATLVS_ADMIN' = ANY(platform_roles) OR 'LEGEND_ADMIN' = ANY(platform_roles))
    )
  );

-- Communications visible to stakeholders
CREATE POLICY communications_view ON stakeholder_communications
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_stakeholders ps
      JOIN contacts c ON ps.contact_id = c.id
      WHERE c.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM platform_users 
      WHERE id = auth.uid() 
      AND 'ATLVS_ADMIN' = ANY(platform_roles)
    )
  );
