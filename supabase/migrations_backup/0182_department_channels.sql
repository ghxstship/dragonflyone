-- Migration: Department-Specific Channels and Groups System
-- Description: Communication channels and groups organized by department with role-based access

-- Communication channels
CREATE TABLE IF NOT EXISTS communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  description TEXT,
  channel_type VARCHAR(50) NOT NULL CHECK (channel_type IN ('department', 'project', 'event', 'team', 'announcement', 'general', 'private')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  visibility VARCHAR(50) DEFAULT 'members' CHECK (visibility IN ('public', 'members', 'private', 'restricted')),
  is_archived BOOLEAN DEFAULT FALSE,
  is_readonly BOOLEAN DEFAULT FALSE,
  allow_threads BOOLEAN DEFAULT TRUE,
  allow_reactions BOOLEAN DEFAULT TRUE,
  allow_file_uploads BOOLEAN DEFAULT TRUE,
  max_file_size_mb INTEGER DEFAULT 25,
  retention_days INTEGER,
  auto_archive_days INTEGER,
  icon VARCHAR(50),
  color VARCHAR(7),
  pinned_messages JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  member_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Channel memberships
CREATE TABLE IF NOT EXISTS channel_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES communication_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member', 'guest')),
  notification_preference VARCHAR(50) DEFAULT 'all' CHECK (notification_preference IN ('all', 'mentions', 'none')),
  is_muted BOOLEAN DEFAULT FALSE,
  muted_until TIMESTAMPTZ,
  last_read_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES platform_users(id),
  UNIQUE(channel_id, user_id)
);

-- Channel messages
CREATE TABLE IF NOT EXISTS channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES communication_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE SET NULL,
  parent_message_id UUID REFERENCES channel_messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_type VARCHAR(50) DEFAULT 'text' CHECK (content_type IN ('text', 'rich_text', 'system', 'file', 'image', 'video', 'audio', 'link')),
  attachments JSONB DEFAULT '[]',
  mentions JSONB DEFAULT '[]',
  reactions JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES platform_users(id),
  thread_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Department groups
CREATE TABLE IF NOT EXISTS department_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_type VARCHAR(50) DEFAULT 'team' CHECK (group_type IN ('team', 'committee', 'working_group', 'task_force', 'project_team', 'leadership')),
  parent_group_id UUID REFERENCES department_groups(id) ON DELETE SET NULL,
  lead_user_id UUID REFERENCES platform_users(id),
  is_active BOOLEAN DEFAULT TRUE,
  visibility VARCHAR(50) DEFAULT 'department' CHECK (visibility IN ('public', 'department', 'private')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Group memberships
CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES department_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('lead', 'co_lead', 'member', 'advisor', 'observer')),
  responsibilities TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES platform_users(id),
  UNIQUE(group_id, user_id)
);

-- Channel invitations
CREATE TABLE IF NOT EXISTS channel_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES communication_channels(id) ON DELETE CASCADE,
  invited_user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  invited_email VARCHAR(255),
  invited_by UUID NOT NULL REFERENCES platform_users(id),
  role VARCHAR(50) DEFAULT 'member',
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT invitation_target CHECK (invited_user_id IS NOT NULL OR invited_email IS NOT NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_channels_department ON communication_channels(department_id);
CREATE INDEX IF NOT EXISTS idx_channels_project ON communication_channels(project_id);
CREATE INDEX IF NOT EXISTS idx_channels_event ON communication_channels(event_id);
CREATE INDEX IF NOT EXISTS idx_channels_type ON communication_channels(channel_type);
CREATE INDEX IF NOT EXISTS idx_channel_memberships_channel ON channel_memberships(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_memberships_user ON channel_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_channel ON channel_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_user ON channel_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_parent ON channel_messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_channel_messages_created ON channel_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_department_groups_department ON department_groups(department_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);

-- RLS Policies
ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_invitations ENABLE ROW LEVEL SECURITY;

-- Channel policies
CREATE POLICY "channels_select" ON communication_channels
  FOR SELECT USING (
    visibility = 'public'
    OR EXISTS (
      SELECT 1 FROM channel_memberships cm
      WHERE cm.channel_id = id AND cm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "channels_insert" ON communication_channels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'COMPVSS_ADMIN', 'COMPVSS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "channels_update" ON communication_channels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM channel_memberships cm
      WHERE cm.channel_id = id AND cm.user_id = auth.uid() AND cm.role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Membership policies
CREATE POLICY "memberships_select" ON channel_memberships
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM channel_memberships cm
      WHERE cm.channel_id = channel_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "memberships_insert" ON channel_memberships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM channel_memberships cm
      WHERE cm.channel_id = channel_id AND cm.user_id = auth.uid() AND cm.role IN ('owner', 'admin', 'moderator')
    )
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Message policies
CREATE POLICY "messages_select" ON channel_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM channel_memberships cm
      WHERE cm.channel_id = channel_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert" ON channel_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM channel_memberships cm
      JOIN communication_channels cc ON cc.id = cm.channel_id
      WHERE cm.channel_id = channel_id 
      AND cm.user_id = auth.uid()
      AND cc.is_readonly = FALSE
    )
  );

CREATE POLICY "messages_update" ON channel_messages
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM channel_memberships cm
      WHERE cm.channel_id = channel_id AND cm.user_id = auth.uid() AND cm.role IN ('owner', 'admin', 'moderator')
    )
  );

-- Group policies
CREATE POLICY "groups_select" ON department_groups
  FOR SELECT USING (
    visibility = 'public'
    OR EXISTS (
      SELECT 1 FROM group_memberships gm
      WHERE gm.group_id = id AND gm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "groups_manage" ON department_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Group membership policies
CREATE POLICY "group_memberships_select" ON group_memberships
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM group_memberships gm
      WHERE gm.group_id = group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "group_memberships_manage" ON group_memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM group_memberships gm
      WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role IN ('lead', 'co_lead')
    )
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Invitation policies
CREATE POLICY "invitations_select" ON channel_invitations
  FOR SELECT USING (
    invited_user_id = auth.uid()
    OR invited_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM channel_memberships cm
      WHERE cm.channel_id = channel_id AND cm.user_id = auth.uid() AND cm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "invitations_insert" ON channel_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM channel_memberships cm
      WHERE cm.channel_id = channel_id AND cm.user_id = auth.uid() AND cm.role IN ('owner', 'admin', 'moderator')
    )
  );

-- Triggers for updating counts
CREATE OR REPLACE FUNCTION update_channel_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communication_channels SET member_count = member_count + 1 WHERE id = NEW.channel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communication_channels SET member_count = member_count - 1 WHERE id = OLD.channel_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER channel_member_count_trigger
  AFTER INSERT OR DELETE ON channel_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_channel_member_count();

CREATE OR REPLACE FUNCTION update_channel_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communication_channels 
    SET message_count = message_count + 1, last_activity_at = NOW() 
    WHERE id = NEW.channel_id;
    
    -- Update thread count if this is a reply
    IF NEW.parent_message_id IS NOT NULL THEN
      UPDATE channel_messages SET thread_count = thread_count + 1 WHERE id = NEW.parent_message_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER channel_message_count_trigger
  AFTER INSERT ON channel_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_channel_message_count();
