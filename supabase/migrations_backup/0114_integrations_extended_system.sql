-- Migration: Integrations Extended System
-- Description: Tables for Slack/Teams notifications, CRM sync, and third-party integrations

-- Notification configs
CREATE TABLE IF NOT EXISTS notification_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  platform TEXT NOT NULL CHECK (platform IN ('slack', 'teams', 'email')),
  webhook_url TEXT,
  channel_id TEXT,
  event_types TEXT[] NOT NULL,
  filters JSONB,
  throttle_minutes INT DEFAULT 0,
  privacy_filter BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_configs_platform ON notification_configs(platform);
CREATE INDEX IF NOT EXISTS idx_notification_configs_active ON notification_configs(is_active);

-- Notification logs
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES notification_configs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_config ON notification_logs(config_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent ON notification_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_event ON notification_logs(event_type);

-- CRM connections
CREATE TABLE IF NOT EXISTS crm_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  provider TEXT NOT NULL CHECK (provider IN ('salesforce', 'hubspot', 'pipedrive')),
  credentials JSONB NOT NULL,
  sync_settings JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crm_connections_provider ON crm_connections(provider);
CREATE INDEX IF NOT EXISTS idx_crm_connections_active ON crm_connections(is_active);

-- CRM field mappings
CREATE TABLE IF NOT EXISTS crm_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES crm_connections(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('contact', 'company', 'deal')),
  atlvs_field TEXT NOT NULL,
  crm_field TEXT NOT NULL,
  transform TEXT,
  is_required BOOLEAN DEFAULT false,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connection_id, entity_type, atlvs_field)
);

CREATE INDEX IF NOT EXISTS idx_crm_field_mappings_connection ON crm_field_mappings(connection_id);
CREATE INDEX IF NOT EXISTS idx_crm_field_mappings_entity ON crm_field_mappings(entity_type);

-- CRM sync logs
CREATE TABLE IF NOT EXISTS crm_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES crm_connections(id),
  entity_types TEXT[] NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('to_crm', 'from_crm', 'bidirectional')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  records_synced INT DEFAULT 0,
  records_failed INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  triggered_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_connection ON crm_sync_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_status ON crm_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_crm_sync_logs_started ON crm_sync_logs(started_at);

-- CRM sync conflicts
CREATE TABLE IF NOT EXISTS crm_sync_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES crm_connections(id),
  sync_log_id UUID REFERENCES crm_sync_logs(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  atlvs_data JSONB NOT NULL,
  crm_data JSONB NOT NULL,
  conflict_fields TEXT[] NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'ignored')),
  resolution TEXT CHECK (resolution IN ('crm_wins', 'atlvs_wins', 'manual')),
  resolved_data JSONB,
  resolved_by UUID REFERENCES platform_users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_sync_conflicts_connection ON crm_sync_conflicts(connection_id);
CREATE INDEX IF NOT EXISTS idx_crm_sync_conflicts_status ON crm_sync_conflicts(status);

-- ERP connections
CREATE TABLE IF NOT EXISTS erp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  provider TEXT NOT NULL CHECK (provider IN ('netsuite', 'quickbooks', 'xero')),
  credentials JSONB NOT NULL,
  sync_settings JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_erp_connections_provider ON erp_connections(provider);

-- ERP sync logs
CREATE TABLE IF NOT EXISTS erp_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES erp_connections(id),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('gl_export', 'ap_sync', 'ar_sync', 'currency_update', 'tax_update')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  records_processed INT DEFAULT 0,
  variance_amount NUMERIC(14,2),
  variance_percent NUMERIC(8,4),
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_erp_sync_logs_connection ON erp_sync_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_erp_sync_logs_type ON erp_sync_logs(sync_type);

-- Marketing platform connections
CREATE TABLE IF NOT EXISTS marketing_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  provider TEXT NOT NULL CHECK (provider IN ('mailchimp', 'klaviyo', 'ga4', 'facebook', 'google_ads')),
  credentials JSONB NOT NULL,
  sync_settings JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_connections_provider ON marketing_connections(provider);

-- Consent and subscription tracking
CREATE TABLE IF NOT EXISTS marketing_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id),
  email TEXT NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('email', 'sms', 'push', 'tracking')),
  is_consented BOOLEAN NOT NULL,
  source TEXT,
  ip_address TEXT,
  user_agent TEXT,
  consented_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_consents_email ON marketing_consents(email);
CREATE INDEX IF NOT EXISTS idx_marketing_consents_type ON marketing_consents(consent_type);

-- Attribution tracking
CREATE TABLE IF NOT EXISTS marketing_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id),
  session_id TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer TEXT,
  landing_page TEXT,
  conversion_event TEXT,
  conversion_value NUMERIC(12,2),
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_attributions_user ON marketing_attributions(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_attributions_campaign ON marketing_attributions(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_marketing_attributions_source ON marketing_attributions(utm_source);

-- Function to get notification stats
CREATE OR REPLACE FUNCTION get_notification_stats(p_config_id UUID, p_days INT DEFAULT 7)
RETURNS TABLE (
  total_sent BIGINT,
  successful BIGINT,
  failed BIGINT,
  success_rate NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_sent,
    COUNT(CASE WHEN success THEN 1 END) as successful,
    COUNT(CASE WHEN NOT success THEN 1 END) as failed,
    CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND(COUNT(CASE WHEN success THEN 1 END)::NUMERIC / COUNT(*) * 100, 2)
      ELSE 0 
    END as success_rate
  FROM notification_logs
  WHERE config_id = p_config_id
    AND sent_at > NOW() - (p_days || ' days')::INTERVAL;
END;
$$;

-- Function to check sync variance
CREATE OR REPLACE FUNCTION check_erp_sync_variance(p_connection_id UUID)
RETURNS TABLE (
  sync_type TEXT,
  last_variance_percent NUMERIC,
  needs_attention BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (esl.sync_type)
    esl.sync_type,
    esl.variance_percent as last_variance_percent,
    (esl.variance_percent > 1) as needs_attention
  FROM erp_sync_logs esl
  WHERE esl.connection_id = p_connection_id
    AND esl.status = 'completed'
  ORDER BY esl.sync_type, esl.completed_at DESC;
END;
$$;

-- RLS policies
ALTER TABLE notification_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_field_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sync_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_attributions ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_configs TO authenticated;
GRANT SELECT, INSERT ON notification_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON crm_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON crm_field_mappings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON crm_sync_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON crm_sync_conflicts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON erp_connections TO authenticated;
GRANT SELECT, INSERT ON erp_sync_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON marketing_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE ON marketing_consents TO authenticated;
GRANT SELECT, INSERT ON marketing_attributions TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_stats(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_erp_sync_variance(UUID) TO authenticated;
