-- ============================================================================
-- 0039_operational_tables.sql
-- 3NF Compliant Operational Tables
-- GHXSTSHIP Platform - Adding missing operational tables that don't violate 3NF
-- ============================================================================

-- ============================================================================
-- SECTION 1: USER PREFERENCES & SETTINGS
-- These tables extend platform_users with user-specific configurations
-- ============================================================================

-- Saved Filters: User-specific filter configurations
CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL,
  conditions JSONB NOT NULL DEFAULT '[]',
  sort_by TEXT,
  sort_order TEXT CHECK (sort_order IN ('asc', 'desc')),
  is_public BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_filters_user ON saved_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_filters_entity ON saved_filters(entity_type);
CREATE INDEX IF NOT EXISTS idx_saved_filters_org ON saved_filters(organization_id);

-- Saved Views: User-specific table view configurations
CREATE TABLE IF NOT EXISTS saved_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL,
  visible_columns TEXT[] NOT NULL DEFAULT '{}',
  column_order TEXT[] NOT NULL DEFAULT '{}',
  column_widths JSONB,
  filters JSONB,
  sort_by TEXT,
  sort_order TEXT CHECK (sort_order IN ('asc', 'desc')),
  page_size INTEGER DEFAULT 25,
  is_public BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_views_user ON saved_views(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_views_entity ON saved_views(entity_type);
CREATE INDEX IF NOT EXISTS idx_saved_views_org ON saved_views(organization_id);

-- User Preferences: General user preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'YYYY-MM-DD',
  time_format TEXT DEFAULT '24h',
  currency TEXT DEFAULT 'USD',
  notifications_enabled BOOLEAN DEFAULT true,
  email_digest TEXT DEFAULT 'daily',
  sidebar_collapsed BOOLEAN DEFAULT false,
  compact_mode BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- User Settings: Application-specific settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(setting_key);

-- User Notification Preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  in_app_enabled BOOLEAN DEFAULT true,
  digest_frequency TEXT DEFAULT 'daily',
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  channel_preferences JSONB DEFAULT '{}',
  event_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 2: WORKSPACE & TEAM MANAGEMENT
-- Organizational structure tables
-- ============================================================================

-- Teams: Organizational units within an organization
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES legend_departments(id) ON DELETE SET NULL,
  parent_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  avatar_url TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_teams_org ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_dept ON teams(department_id);
CREATE INDEX IF NOT EXISTS idx_teams_parent ON teams(parent_team_id);

-- Team Members: Junction table for team membership
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- Workspaces: Project groupings
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_workspaces_org ON workspaces(organization_id);

-- Workspace Projects: Junction table
CREATE TABLE IF NOT EXISTS workspace_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  added_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  UNIQUE(workspace_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_projects_workspace ON workspace_projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_projects_project ON workspace_projects(project_id);

-- ============================================================================
-- SECTION 3: API & WEBHOOKS
-- API management and webhook delivery
-- ============================================================================

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  rate_limit INTEGER DEFAULT 1000,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

-- API Key Usage
CREATE TABLE IF NOT EXISTS api_key_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_key_usage_key ON api_key_usage(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_created ON api_key_usage(created_at);

-- Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  headers JSONB DEFAULT '{}',
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_org ON webhooks(organization_id);

-- Webhook Deliveries
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  response_headers JSONB,
  attempt_count INTEGER DEFAULT 1,
  delivered_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created ON webhook_deliveries(created_at);

-- ============================================================================
-- SECTION 4: FEATURE FLAGS
-- Feature flag management
-- ============================================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  flag_type TEXT DEFAULT 'boolean' CHECK (flag_type IN ('boolean', 'percentage', 'variant')),
  default_value JSONB NOT NULL DEFAULT 'false',
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  variants JSONB DEFAULT '[]',
  targeting_rules JSONB DEFAULT '[]',
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, key)
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_org ON feature_flags(organization_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);

-- Feature Flag Overrides
CREATE TABLE IF NOT EXISTS flag_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  override_value JSONB NOT NULL,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flag_overrides_flag ON flag_overrides(flag_id);
CREATE INDEX IF NOT EXISTS idx_flag_overrides_user ON flag_overrides(user_id);

-- Feature Flag Evaluations (for analytics)
CREATE TABLE IF NOT EXISTS flag_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  evaluated_value JSONB NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flag_evaluations_flag ON flag_evaluations(flag_id);
CREATE INDEX IF NOT EXISTS idx_flag_evaluations_created ON flag_evaluations(created_at);

-- ============================================================================
-- SECTION 5: SEARCH & ANALYTICS
-- Search history and analytics
-- ============================================================================

-- Search History
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  entity_type TEXT,
  filters JSONB DEFAULT '{}',
  result_count INTEGER DEFAULT 0,
  selected_result_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at);

-- Search Index (for full-text search)
CREATE TABLE IF NOT EXISTS search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_search_index_org ON search_index(organization_id);
CREATE INDEX IF NOT EXISTS idx_search_index_entity ON search_index(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_search_index_vector ON search_index USING gin(search_vector);

-- ============================================================================
-- SECTION 6: IMPORT/EXPORT
-- Data import and export job tracking
-- ============================================================================

-- Import Jobs
CREATE TABLE IF NOT EXISTS import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  mapping JSONB DEFAULT '{}',
  options JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_import_jobs_org ON import_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_user ON import_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON import_jobs(status);

-- Import Templates
CREATE TABLE IF NOT EXISTS import_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  mapping JSONB NOT NULL,
  options JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_import_templates_org ON import_templates(organization_id);

-- Export Jobs
CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  format TEXT DEFAULT 'csv' CHECK (format IN ('csv', 'xlsx', 'json', 'pdf')),
  filters JSONB DEFAULT '{}',
  columns TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  file_url TEXT,
  file_size INTEGER,
  row_count INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_export_jobs_org ON export_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_user ON export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status);

-- Export Templates
CREATE TABLE IF NOT EXISTS export_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  format TEXT DEFAULT 'csv',
  columns TEXT[] NOT NULL,
  filters JSONB DEFAULT '{}',
  options JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_export_templates_org ON export_templates(organization_id);

-- ============================================================================
-- SECTION 7: SSO & AUTHENTICATION
-- Single Sign-On and 2FA
-- ============================================================================

-- SSO Providers
CREATE TABLE IF NOT EXISTS sso_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('saml', 'oidc', 'oauth2')),
  name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}',
  metadata_url TEXT,
  entity_id TEXT,
  sso_url TEXT,
  certificate TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sso_providers_org ON sso_providers(organization_id);

-- SSO Sessions
CREATE TABLE IF NOT EXISTS sso_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES sso_providers(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sso_sessions_user ON sso_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sso_sessions_provider ON sso_sessions(provider_id);

-- User 2FA Configuration
CREATE TABLE IF NOT EXISTS user_2fa_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE UNIQUE,
  method TEXT NOT NULL CHECK (method IN ('totp', 'sms', 'email', 'webauthn')),
  is_enabled BOOLEAN DEFAULT false,
  secret_encrypted TEXT,
  backup_codes_encrypted TEXT,
  phone_number TEXT,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_2fa_config_user ON user_2fa_config(user_id);

-- User 2FA Verification Log
CREATE TABLE IF NOT EXISTS user_2fa_verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_2fa_log_user ON user_2fa_verification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_log_created ON user_2fa_verification_log(created_at);

-- ============================================================================
-- SECTION 8: NOTIFICATIONS
-- Notification management
-- ============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Push Tokens
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_id TEXT,
  device_name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);

-- ============================================================================
-- SECTION 9: ACTIVATIONS (as Legend Event Profile)
-- Activations are events with specific activation profile
-- ============================================================================

-- Activations Profile (extends legend_events)
CREATE TABLE IF NOT EXISTS events_profile_activation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE UNIQUE,
  activation_type TEXT NOT NULL,
  brand_id UUID REFERENCES legend_organizations(id) ON DELETE SET NULL,
  campaign_id UUID,
  target_audience TEXT,
  engagement_goals JSONB DEFAULT '{}',
  kpis JSONB DEFAULT '{}',
  budget DECIMAL(12, 2),
  actual_spend DECIMAL(12, 2),
  roi_metrics JSONB DEFAULT '{}',
  assets JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_profile_activation_event ON events_profile_activation(event_id);
CREATE INDEX IF NOT EXISTS idx_events_profile_activation_brand ON events_profile_activation(brand_id);

-- ============================================================================
-- SECTION 10: AUDIT LOGS (Chronicle Profile already exists, add view)
-- ============================================================================

-- Audit Logs View (uses chronicle_entries with audit profile)
CREATE OR REPLACE VIEW audit_logs AS
SELECT 
  ce.id,
  ce.organization_id,
  ce.chronicle_type,
  ce.action,
  ce.action_category,
  ce.subject_entity_type AS resource_type,
  ce.subject_entity_id AS resource_id,
  ce.actor_id AS user_id,
  ce.before_state AS old_values,
  ce.after_state AS new_values,
  ce.metadata,
  ce.created_at,
  ce.source_ip AS ip_address,
  ce.source_user_agent AS user_agent,
  cpa.audit_type,
  cpa.table_name,
  cpa.record_id,
  cpa.field_changes,
  cpa.risk_level
FROM chronicle_entries ce
LEFT JOIN chronicle_profile_audit cpa ON ce.id = cpa.chronicle_id
WHERE ce.chronicle_type = 'audit';

-- ============================================================================
-- SECTION 11: RLS POLICIES
-- ============================================================================

ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE flag_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE flag_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa_verification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_profile_activation ENABLE ROW LEVEL SECURITY;

-- Saved Filters policies
CREATE POLICY saved_filters_select ON saved_filters FOR SELECT USING (
  user_id = current_platform_user_id() OR is_public = true OR org_matches(organization_id)
);
CREATE POLICY saved_filters_insert ON saved_filters FOR INSERT WITH CHECK (
  user_id = current_platform_user_id() AND org_matches(organization_id)
);
CREATE POLICY saved_filters_update ON saved_filters FOR UPDATE USING (
  user_id = current_platform_user_id()
);
CREATE POLICY saved_filters_delete ON saved_filters FOR DELETE USING (
  user_id = current_platform_user_id()
);

-- Saved Views policies
CREATE POLICY saved_views_select ON saved_views FOR SELECT USING (
  user_id = current_platform_user_id() OR is_public = true OR org_matches(organization_id)
);
CREATE POLICY saved_views_insert ON saved_views FOR INSERT WITH CHECK (
  user_id = current_platform_user_id() AND org_matches(organization_id)
);
CREATE POLICY saved_views_update ON saved_views FOR UPDATE USING (
  user_id = current_platform_user_id()
);
CREATE POLICY saved_views_delete ON saved_views FOR DELETE USING (
  user_id = current_platform_user_id()
);

-- User Preferences policies (user can only access their own)
CREATE POLICY user_preferences_select ON user_preferences FOR SELECT USING (
  user_id = current_platform_user_id()
);
CREATE POLICY user_preferences_insert ON user_preferences FOR INSERT WITH CHECK (
  user_id = current_platform_user_id()
);
CREATE POLICY user_preferences_update ON user_preferences FOR UPDATE USING (
  user_id = current_platform_user_id()
);
CREATE POLICY user_preferences_delete ON user_preferences FOR DELETE USING (
  user_id = current_platform_user_id()
);

-- User Settings policies
CREATE POLICY user_settings_select ON user_settings FOR SELECT USING (
  user_id = current_platform_user_id()
);
CREATE POLICY user_settings_insert ON user_settings FOR INSERT WITH CHECK (
  user_id = current_platform_user_id()
);
CREATE POLICY user_settings_update ON user_settings FOR UPDATE USING (
  user_id = current_platform_user_id()
);
CREATE POLICY user_settings_delete ON user_settings FOR DELETE USING (
  user_id = current_platform_user_id()
);

-- User Notification Preferences policies
CREATE POLICY user_notification_preferences_select ON user_notification_preferences FOR SELECT USING (
  user_id = current_platform_user_id()
);
CREATE POLICY user_notification_preferences_insert ON user_notification_preferences FOR INSERT WITH CHECK (
  user_id = current_platform_user_id()
);
CREATE POLICY user_notification_preferences_update ON user_notification_preferences FOR UPDATE USING (
  user_id = current_platform_user_id()
);
CREATE POLICY user_notification_preferences_delete ON user_notification_preferences FOR DELETE USING (
  user_id = current_platform_user_id()
);

-- Teams policies
CREATE POLICY teams_select ON teams FOR SELECT USING (org_matches(organization_id));
CREATE POLICY teams_insert ON teams FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY teams_update ON teams FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY teams_delete ON teams FOR DELETE USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);

-- Team Members policies
CREATE POLICY team_members_select ON team_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM teams t WHERE t.id = team_id AND org_matches(t.organization_id))
);
CREATE POLICY team_members_insert ON team_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM teams t WHERE t.id = team_id AND org_matches(t.organization_id))
);
CREATE POLICY team_members_update ON team_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM teams t WHERE t.id = team_id AND org_matches(t.organization_id))
);
CREATE POLICY team_members_delete ON team_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM teams t WHERE t.id = team_id AND org_matches(t.organization_id))
);

-- Workspaces policies
CREATE POLICY workspaces_select ON workspaces FOR SELECT USING (org_matches(organization_id));
CREATE POLICY workspaces_insert ON workspaces FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY workspaces_update ON workspaces FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY workspaces_delete ON workspaces FOR DELETE USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);

-- Workspace Projects policies
CREATE POLICY workspace_projects_select ON workspace_projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND org_matches(w.organization_id))
);
CREATE POLICY workspace_projects_insert ON workspace_projects FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND org_matches(w.organization_id))
);
CREATE POLICY workspace_projects_update ON workspace_projects FOR UPDATE USING (
  EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND org_matches(w.organization_id))
);
CREATE POLICY workspace_projects_delete ON workspace_projects FOR DELETE USING (
  EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND org_matches(w.organization_id))
);

-- API Keys policies (admin only)
CREATE POLICY api_keys_select ON api_keys FOR SELECT USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY api_keys_insert ON api_keys FOR INSERT WITH CHECK (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY api_keys_update ON api_keys FOR UPDATE USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY api_keys_delete ON api_keys FOR DELETE USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);

-- API Key Usage policies
CREATE POLICY api_key_usage_select ON api_key_usage FOR SELECT USING (
  EXISTS (SELECT 1 FROM api_keys ak WHERE ak.id = api_key_id AND org_matches(ak.organization_id))
);
CREATE POLICY api_key_usage_insert ON api_key_usage FOR INSERT WITH CHECK (true);

-- Webhooks policies
CREATE POLICY webhooks_select ON webhooks FOR SELECT USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY webhooks_insert ON webhooks FOR INSERT WITH CHECK (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY webhooks_update ON webhooks FOR UPDATE USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY webhooks_delete ON webhooks FOR DELETE USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);

-- Webhook Deliveries policies
CREATE POLICY webhook_deliveries_select ON webhook_deliveries FOR SELECT USING (
  EXISTS (SELECT 1 FROM webhooks w WHERE w.id = webhook_id AND org_matches(w.organization_id))
);
CREATE POLICY webhook_deliveries_insert ON webhook_deliveries FOR INSERT WITH CHECK (true);

-- Feature Flags policies
CREATE POLICY feature_flags_select ON feature_flags FOR SELECT USING (
  organization_id IS NULL OR org_matches(organization_id)
);
CREATE POLICY feature_flags_insert ON feature_flags FOR INSERT WITH CHECK (
  role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY feature_flags_update ON feature_flags FOR UPDATE USING (
  role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY feature_flags_delete ON feature_flags FOR DELETE USING (
  role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);

-- Flag Overrides policies
CREATE POLICY flag_overrides_select ON flag_overrides FOR SELECT USING (
  user_id = current_platform_user_id() OR org_matches(organization_id)
);
CREATE POLICY flag_overrides_insert ON flag_overrides FOR INSERT WITH CHECK (
  role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY flag_overrides_update ON flag_overrides FOR UPDATE USING (
  role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY flag_overrides_delete ON flag_overrides FOR DELETE USING (
  role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);

-- Flag Evaluations policies
CREATE POLICY flag_evaluations_select ON flag_evaluations FOR SELECT USING (
  user_id = current_platform_user_id() OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY flag_evaluations_insert ON flag_evaluations FOR INSERT WITH CHECK (true);

-- Search History policies
CREATE POLICY search_history_select ON search_history FOR SELECT USING (
  user_id = current_platform_user_id()
);
CREATE POLICY search_history_insert ON search_history FOR INSERT WITH CHECK (
  user_id = current_platform_user_id() AND org_matches(organization_id)
);
CREATE POLICY search_history_delete ON search_history FOR DELETE USING (
  user_id = current_platform_user_id()
);

-- Search Index policies
CREATE POLICY search_index_select ON search_index FOR SELECT USING (org_matches(organization_id));
CREATE POLICY search_index_insert ON search_index FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY search_index_update ON search_index FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY search_index_delete ON search_index FOR DELETE USING (org_matches(organization_id));

-- Import Jobs policies
CREATE POLICY import_jobs_select ON import_jobs FOR SELECT USING (
  user_id = current_platform_user_id() OR org_matches(organization_id)
);
CREATE POLICY import_jobs_insert ON import_jobs FOR INSERT WITH CHECK (
  user_id = current_platform_user_id() AND org_matches(organization_id)
);
CREATE POLICY import_jobs_update ON import_jobs FOR UPDATE USING (
  user_id = current_platform_user_id() OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);

-- Import Templates policies
CREATE POLICY import_templates_select ON import_templates FOR SELECT USING (org_matches(organization_id));
CREATE POLICY import_templates_insert ON import_templates FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY import_templates_update ON import_templates FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY import_templates_delete ON import_templates FOR DELETE USING (org_matches(organization_id));

-- Export Jobs policies
CREATE POLICY export_jobs_select ON export_jobs FOR SELECT USING (
  user_id = current_platform_user_id() OR org_matches(organization_id)
);
CREATE POLICY export_jobs_insert ON export_jobs FOR INSERT WITH CHECK (
  user_id = current_platform_user_id() AND org_matches(organization_id)
);
CREATE POLICY export_jobs_update ON export_jobs FOR UPDATE USING (
  user_id = current_platform_user_id() OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);

-- Export Templates policies
CREATE POLICY export_templates_select ON export_templates FOR SELECT USING (org_matches(organization_id));
CREATE POLICY export_templates_insert ON export_templates FOR INSERT WITH CHECK (org_matches(organization_id));
CREATE POLICY export_templates_update ON export_templates FOR UPDATE USING (org_matches(organization_id));
CREATE POLICY export_templates_delete ON export_templates FOR DELETE USING (org_matches(organization_id));

-- SSO Providers policies
CREATE POLICY sso_providers_select ON sso_providers FOR SELECT USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY sso_providers_insert ON sso_providers FOR INSERT WITH CHECK (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY sso_providers_update ON sso_providers FOR UPDATE USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY sso_providers_delete ON sso_providers FOR DELETE USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);

-- SSO Sessions policies
CREATE POLICY sso_sessions_select ON sso_sessions FOR SELECT USING (
  user_id = current_platform_user_id()
);
CREATE POLICY sso_sessions_insert ON sso_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY sso_sessions_delete ON sso_sessions FOR DELETE USING (
  user_id = current_platform_user_id()
);

-- User 2FA Config policies
CREATE POLICY user_2fa_config_select ON user_2fa_config FOR SELECT USING (
  user_id = current_platform_user_id()
);
CREATE POLICY user_2fa_config_insert ON user_2fa_config FOR INSERT WITH CHECK (
  user_id = current_platform_user_id()
);
CREATE POLICY user_2fa_config_update ON user_2fa_config FOR UPDATE USING (
  user_id = current_platform_user_id()
);
CREATE POLICY user_2fa_config_delete ON user_2fa_config FOR DELETE USING (
  user_id = current_platform_user_id()
);

-- User 2FA Verification Log policies
CREATE POLICY user_2fa_verification_log_select ON user_2fa_verification_log FOR SELECT USING (
  user_id = current_platform_user_id() OR role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN')
);
CREATE POLICY user_2fa_verification_log_insert ON user_2fa_verification_log FOR INSERT WITH CHECK (true);

-- Notifications policies
CREATE POLICY notifications_select ON notifications FOR SELECT USING (
  user_id = current_platform_user_id()
);
CREATE POLICY notifications_insert ON notifications FOR INSERT WITH CHECK (
  org_matches(organization_id)
);
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (
  user_id = current_platform_user_id()
);
CREATE POLICY notifications_delete ON notifications FOR DELETE USING (
  user_id = current_platform_user_id()
);

-- Push Tokens policies
CREATE POLICY push_tokens_select ON push_tokens FOR SELECT USING (
  user_id = current_platform_user_id()
);
CREATE POLICY push_tokens_insert ON push_tokens FOR INSERT WITH CHECK (
  user_id = current_platform_user_id()
);
CREATE POLICY push_tokens_update ON push_tokens FOR UPDATE USING (
  user_id = current_platform_user_id()
);
CREATE POLICY push_tokens_delete ON push_tokens FOR DELETE USING (
  user_id = current_platform_user_id()
);

-- Events Profile Activation policies
CREATE POLICY events_profile_activation_select ON events_profile_activation FOR SELECT USING (
  EXISTS (SELECT 1 FROM legend_events e WHERE e.id = event_id AND org_matches(e.organization_id))
);
CREATE POLICY events_profile_activation_insert ON events_profile_activation FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM legend_events e WHERE e.id = event_id AND org_matches(e.organization_id))
);
CREATE POLICY events_profile_activation_update ON events_profile_activation FOR UPDATE USING (
  EXISTS (SELECT 1 FROM legend_events e WHERE e.id = event_id AND org_matches(e.organization_id))
);
CREATE POLICY events_profile_activation_delete ON events_profile_activation FOR DELETE USING (
  EXISTS (SELECT 1 FROM legend_events e WHERE e.id = event_id AND org_matches(e.organization_id))
);

-- ============================================================================
-- SECTION 12: GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON saved_filters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_views TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_notification_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON teams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON team_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workspaces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workspace_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;
GRANT SELECT, INSERT ON api_key_usage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON webhooks TO authenticated;
GRANT SELECT, INSERT ON webhook_deliveries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON feature_flags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON flag_overrides TO authenticated;
GRANT SELECT, INSERT ON flag_evaluations TO authenticated;
GRANT SELECT, INSERT, DELETE ON search_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON search_index TO authenticated;
GRANT SELECT, INSERT, UPDATE ON import_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON import_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON export_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON export_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sso_providers TO authenticated;
GRANT SELECT, INSERT, DELETE ON sso_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_2fa_config TO authenticated;
GRANT SELECT, INSERT ON user_2fa_verification_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON push_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON events_profile_activation TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;

-- ============================================================================
-- SECTION 13: TRIGGERS
-- ============================================================================

CREATE TRIGGER saved_filters_updated_at BEFORE UPDATE ON saved_filters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER saved_views_updated_at BEFORE UPDATE ON saved_views
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_notification_preferences_updated_at BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER webhooks_updated_at BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER feature_flags_updated_at BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER search_index_updated_at BEFORE UPDATE ON search_index
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER import_templates_updated_at BEFORE UPDATE ON import_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER export_templates_updated_at BEFORE UPDATE ON export_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER sso_providers_updated_at BEFORE UPDATE ON sso_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_2fa_config_updated_at BEFORE UPDATE ON user_2fa_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER events_profile_activation_updated_at BEFORE UPDATE ON events_profile_activation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECTION 14: COMMENTS
-- ============================================================================

COMMENT ON TABLE saved_filters IS 'User-saved filter configurations for data tables';
COMMENT ON TABLE saved_views IS 'User-saved view configurations for data tables';
COMMENT ON TABLE user_preferences IS 'User-specific application preferences';
COMMENT ON TABLE user_settings IS 'User-specific key-value settings';
COMMENT ON TABLE user_notification_preferences IS 'User notification channel preferences';
COMMENT ON TABLE teams IS 'Organizational teams within an organization';
COMMENT ON TABLE team_members IS 'Team membership junction table';
COMMENT ON TABLE workspaces IS 'Project grouping workspaces';
COMMENT ON TABLE workspace_projects IS 'Workspace-project junction table';
COMMENT ON TABLE api_keys IS 'API key management for external integrations';
COMMENT ON TABLE api_key_usage IS 'API key usage tracking';
COMMENT ON TABLE webhooks IS 'Webhook endpoint configurations';
COMMENT ON TABLE webhook_deliveries IS 'Webhook delivery tracking';
COMMENT ON TABLE feature_flags IS 'Feature flag definitions';
COMMENT ON TABLE flag_overrides IS 'Feature flag user/org overrides';
COMMENT ON TABLE flag_evaluations IS 'Feature flag evaluation logs';
COMMENT ON TABLE search_history IS 'User search history';
COMMENT ON TABLE search_index IS 'Full-text search index';
COMMENT ON TABLE import_jobs IS 'Data import job tracking';
COMMENT ON TABLE import_templates IS 'Data import mapping templates';
COMMENT ON TABLE export_jobs IS 'Data export job tracking';
COMMENT ON TABLE export_templates IS 'Data export configuration templates';
COMMENT ON TABLE sso_providers IS 'SSO provider configurations';
COMMENT ON TABLE sso_sessions IS 'SSO session tracking';
COMMENT ON TABLE user_2fa_config IS 'User 2FA configuration';
COMMENT ON TABLE user_2fa_verification_log IS 'User 2FA verification audit log';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE push_tokens IS 'Push notification device tokens';
COMMENT ON TABLE events_profile_activation IS 'Activation-specific event profile (extends legend_events)';
COMMENT ON VIEW audit_logs IS 'View over chronicle_entries for audit log access';
