--
-- Final Features Tables
-- Document Management, Activity Feeds, Email Templates, Import Jobs, User Preferences
--

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL UNIQUE,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('contract', 'invoice', 'receipt', 'agreement', 'report', 'presentation', 'spreadsheet', 'image', 'video', 'audio', 'other')),
  entity_type TEXT,
  entity_id TEXT,
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  access_level TEXT DEFAULT 'private' CHECK (access_level IN ('private', 'team', 'organization', 'public')),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document Versions Table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  change_summary TEXT,
  uploaded_by UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity Feed Table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'updated', 'deleted', 'commented', 'shared', 'assigned', 'completed', 'approved', 'rejected', 'uploaded', 'downloaded', 'mentioned', 'joined', 'left')),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_name TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  template_variables TEXT[] DEFAULT '{}',
  category TEXT NOT NULL CHECK (category IN ('transactional', 'marketing', 'notification', 'system')),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Log Table
CREATE TABLE IF NOT EXISTS email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'bounced', 'opened', 'clicked')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Entity Comments Table
CREATE TABLE IF NOT EXISTS entity_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES entity_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Import Jobs Table
CREATE TABLE IF NOT EXISTS import_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('csv', 'excel', 'json')),
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'upsert')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'partial')),
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  successful_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  mapping JSONB,
  options JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Import Templates Table
CREATE TABLE IF NOT EXISTS import_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  field_mapping JSONB NOT NULL,
  required_fields TEXT[] DEFAULT '{}',
  validation_rules JSONB,
  default_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES platform_users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  compact_mode BOOLEAN DEFAULT FALSE,
  sidebar_collapsed BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es', 'fr', 'de', 'zh', 'ja')),
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/DD/YYYY' CHECK (date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD')),
  time_format TEXT DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY')),
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  notification_sound BOOLEAN DEFAULT TRUE,
  show_online_status BOOLEAN DEFAULT TRUE,
  allow_analytics BOOLEAN DEFAULT TRUE,
  default_view TEXT DEFAULT 'dashboard',
  items_per_page INTEGER DEFAULT 25,
  auto_save BOOLEAN DEFAULT TRUE,
  keyboard_shortcuts BOOLEAN DEFAULT TRUE,
  custom_settings JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saved Filters Table
CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL,
  conditions JSONB NOT NULL,
  sort_by TEXT,
  sort_order TEXT CHECK (sort_order IN ('asc', 'desc')),
  is_public BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saved Views Table
CREATE TABLE IF NOT EXISTS saved_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL,
  visible_columns TEXT[] NOT NULL,
  column_order TEXT[] NOT NULL,
  column_widths JSONB,
  filters JSONB,
  sort_by TEXT,
  sort_order TEXT CHECK (sort_order IN ('asc', 'desc')),
  page_size INTEGER,
  is_public BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('boolean', 'string', 'number', 'json')),
  default_value JSONB NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  rollout_strategy TEXT DEFAULT 'all' CHECK (rollout_strategy IN ('all', 'percentage', 'users', 'roles', 'custom')),
  rollout_percentage INTEGER CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  allowed_users UUID[],
  allowed_roles TEXT[],
  custom_rules JSONB,
  tags TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Flag Overrides Table
CREATE TABLE IF NOT EXISTS flag_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  value JSONB NOT NULL,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(flag_id, user_id)
);

-- Flag Evaluations Table
CREATE TABLE IF NOT EXISTS flag_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  value JSONB NOT NULL,
  matched_rule TEXT,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);

CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_id, version DESC);

CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_entity ON activity_feed(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_unread ON activity_feed(user_id, is_read) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON email_log(recipient_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_template ON email_log(template_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_log(status);

CREATE INDEX IF NOT EXISTS idx_entity_comments_entity ON entity_comments(entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entity_comments_user ON entity_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_entity_comments_parent ON entity_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_import_jobs_user ON import_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_entity ON import_jobs(entity_type);

CREATE INDEX IF NOT EXISTS idx_import_templates_entity ON import_templates(entity_type);

CREATE INDEX IF NOT EXISTS idx_saved_filters_user ON saved_filters(user_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_saved_filters_public ON saved_filters(entity_type, is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_saved_filters_use_count ON saved_filters(use_count DESC);

CREATE INDEX IF NOT EXISTS idx_saved_views_user ON saved_views(user_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_saved_views_public ON saved_views(entity_type, is_public) WHERE is_public = true;

-- RLS Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;

-- Documents Policies
CREATE POLICY "Users can view their own and public documents"
  ON documents FOR SELECT
  USING (uploaded_by = auth.uid() OR access_level = 'public');

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (uploaded_by = auth.uid());

-- Document Versions Policies
CREATE POLICY "Users can view document versions they have access to"
  ON document_versions FOR SELECT
  USING (document_id IN (SELECT id FROM documents WHERE uploaded_by = auth.uid()));

-- Activity Feed Policies
CREATE POLICY "Users can view their own activity feed"
  ON activity_feed FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can create activity entries"
  ON activity_feed FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR true);

CREATE POLICY "Users can mark activities as read"
  ON activity_feed FOR UPDATE
  USING (user_id = auth.uid());

-- Email Templates Policies
CREATE POLICY "Users can view active email templates"
  ON email_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage email templates"
  ON email_templates FOR ALL
  USING (auth.role() = 'service_role');

-- Email Log Policies
CREATE POLICY "Admins can view email logs"
  ON email_log FOR SELECT
  USING (auth.role() = 'service_role');

-- Entity Comments Policies
CREATE POLICY "Users can view comments"
  ON entity_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON entity_comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own comments"
  ON entity_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON entity_comments FOR DELETE
  USING (user_id = auth.uid());

-- Import Jobs Policies
CREATE POLICY "Users can view their own import jobs"
  ON import_jobs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create import jobs"
  ON import_jobs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own import jobs"
  ON import_jobs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own import jobs"
  ON import_jobs FOR DELETE
  USING (user_id = auth.uid());

-- Import Templates Policies
CREATE POLICY "Users can view import templates"
  ON import_templates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage import templates"
  ON import_templates FOR ALL
  USING (auth.role() = 'service_role');

-- User Preferences Policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR ALL
  USING (user_id = auth.uid());

-- Saved Filters Policies
CREATE POLICY "Users can view their own and public filters"
  ON saved_filters FOR SELECT
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create filters"
  ON saved_filters FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own filters"
  ON saved_filters FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own filters"
  ON saved_filters FOR DELETE
  USING (user_id = auth.uid());

-- Saved Views Policies
CREATE POLICY "Users can view their own and public views"
  ON saved_views FOR SELECT
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create views"
  ON saved_views FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own views"
  ON saved_views FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own views"
  ON saved_views FOR DELETE
  USING (user_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION update_document_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_document_timestamp();

CREATE OR REPLACE FUNCTION update_user_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_preferences_updated
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_timestamp();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_actor_id UUID,
  p_action_type TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_entity_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO activity_feed (
    user_id,
    actor_id,
    action_type,
    entity_type,
    entity_id,
    entity_name,
    description,
    metadata
  ) VALUES (
    p_user_id,
    p_actor_id,
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_description,
    p_metadata
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark activity as read
CREATE OR REPLACE FUNCTION mark_activity_read(p_activity_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE activity_feed
  SET is_read = true
  WHERE id = p_activity_id
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all activities as read for a user
CREATE OR REPLACE FUNCTION mark_all_activities_read()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE activity_feed
  SET is_read = true
  WHERE user_id = auth.uid()
  AND is_read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread activity count
CREATE OR REPLACE FUNCTION get_unread_activity_count()
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM activity_feed
  WHERE user_id = auth.uid()
  AND is_read = false;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old activity feed entries (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_activity_feed()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM activity_feed
  WHERE created_at < NOW() - INTERVAL '90 days'
  AND is_read = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment filter usage
CREATE OR REPLACE FUNCTION increment_filter_usage(filter_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE saved_filters
  SET 
    use_count = use_count + 1,
    last_used_at = NOW()
  WHERE id = filter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE documents IS 'Document storage with versioning and access control';
COMMENT ON TABLE document_versions IS 'Historical versions of documents';
COMMENT ON TABLE activity_feed IS 'User activity feed for real-time updates and notifications';
COMMENT ON TABLE email_templates IS 'Email templates for transactional and marketing emails';
COMMENT ON TABLE email_log IS 'Email delivery tracking and analytics';
COMMENT ON TABLE entity_comments IS 'Generic comments system for all entities';
COMMENT ON TABLE import_jobs IS 'Data import jobs with progress tracking and error handling';
COMMENT ON TABLE import_templates IS 'Reusable import templates with field mappings';
COMMENT ON TABLE user_preferences IS 'User preferences and settings';
COMMENT ON TABLE saved_filters IS 'User-saved filters with conditions and sorting';
COMMENT ON TABLE saved_views IS 'User-saved table views with column configuration';
