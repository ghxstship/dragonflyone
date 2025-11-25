-- Migration: Integrations & Sync System
-- Description: Tables for third-party integrations, webhooks, and data synchronization

-- Integration providers table
CREATE TABLE IF NOT EXISTS integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('payment', 'calendar', 'crm', 'accounting', 'marketing', 'communication', 'storage', 'analytics', 'ticketing', 'social', 'other')),
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  documentation_url TEXT,
  auth_type TEXT NOT NULL CHECK (auth_type IN ('oauth2', 'api_key', 'basic', 'jwt', 'custom')),
  oauth_config JSONB,
  api_base_url TEXT,
  supported_features TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integration_providers_category ON integration_providers(category);
CREATE INDEX IF NOT EXISTS idx_integration_providers_active ON integration_providers(is_active);

-- Organization integrations table
CREATE TABLE IF NOT EXISTS organization_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  provider_id UUID NOT NULL REFERENCES integration_providers(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'disconnected', 'error', 'expired')),
  credentials JSONB,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  external_account_id TEXT,
  external_account_name TEXT,
  settings JSONB DEFAULT '{}',
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT,
  last_error TEXT,
  error_count INT DEFAULT 0,
  connected_by UUID REFERENCES platform_users(id),
  connected_at TIMESTAMPTZ,
  disconnected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_integrations_org ON organization_integrations(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_integrations_provider ON organization_integrations(provider_id);
CREATE INDEX IF NOT EXISTS idx_organization_integrations_status ON organization_integrations(status);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] NOT NULL,
  headers JSONB,
  is_active BOOLEAN DEFAULT true,
  retry_count INT DEFAULT 3,
  timeout_seconds INT DEFAULT 30,
  last_triggered_at TIMESTAMPTZ,
  last_status_code INT,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhooks_org ON webhooks(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(is_active);
CREATE INDEX IF NOT EXISTS idx_webhooks_events ON webhooks USING gin(events);

-- Webhook deliveries table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  request_headers JSONB,
  response_status INT,
  response_body TEXT,
  response_headers JSONB,
  duration_ms INT,
  attempt_number INT DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  error_message TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created ON webhook_deliveries(created_at);

-- Sync jobs table
CREATE TABLE IF NOT EXISTS sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  integration_id UUID REFERENCES organization_integrations(id),
  job_type TEXT NOT NULL CHECK (job_type IN ('full_sync', 'incremental_sync', 'export', 'import', 'migration')),
  source_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  progress INT DEFAULT 0,
  total_records INT,
  processed_records INT DEFAULT 0,
  success_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  errors JSONB,
  config JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_jobs_org ON sync_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_integration ON sync_jobs(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);

-- Sync mappings table
CREATE TABLE IF NOT EXISTS sync_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  integration_id UUID NOT NULL REFERENCES organization_integrations(id),
  local_entity_type TEXT NOT NULL,
  local_entity_id UUID NOT NULL,
  external_entity_type TEXT NOT NULL,
  external_entity_id TEXT NOT NULL,
  sync_direction TEXT NOT NULL CHECK (sync_direction IN ('inbound', 'outbound', 'bidirectional')),
  last_synced_at TIMESTAMPTZ,
  local_updated_at TIMESTAMPTZ,
  external_updated_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict', 'error')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(integration_id, local_entity_type, local_entity_id, external_entity_type, external_entity_id)
);

CREATE INDEX IF NOT EXISTS idx_sync_mappings_integration ON sync_mappings(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_mappings_local ON sync_mappings(local_entity_type, local_entity_id);
CREATE INDEX IF NOT EXISTS idx_sync_mappings_external ON sync_mappings(external_entity_type, external_entity_id);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] NOT NULL,
  rate_limit INT DEFAULT 1000,
  rate_limit_window_seconds INT DEFAULT 3600,
  ip_whitelist TEXT[],
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES platform_users(id)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Integration logs table
CREATE TABLE IF NOT EXISTS integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  integration_id UUID REFERENCES organization_integrations(id),
  api_key_id UUID REFERENCES api_keys(id),
  action TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  endpoint TEXT,
  method TEXT,
  request_body JSONB,
  response_body JSONB,
  status_code INT,
  duration_ms INT,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_integration_logs_org ON integration_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration ON integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created ON integration_logs(created_at);

-- Function to refresh OAuth token
CREATE OR REPLACE FUNCTION refresh_integration_token(p_integration_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_integration RECORD;
BEGIN
  SELECT * INTO v_integration
  FROM organization_integrations
  WHERE id = p_integration_id;
  
  IF NOT FOUND OR v_integration.refresh_token IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Mark as needing refresh (actual refresh happens in application layer)
  UPDATE organization_integrations SET
    status = CASE WHEN token_expires_at < NOW() THEN 'expired' ELSE status END,
    updated_at = NOW()
  WHERE id = p_integration_id;
  
  RETURN TRUE;
END;
$$;

-- Function to log webhook delivery
CREATE OR REPLACE FUNCTION log_webhook_delivery(
  p_webhook_id UUID,
  p_event_type TEXT,
  p_payload JSONB,
  p_status TEXT,
  p_response_status INT DEFAULT NULL,
  p_response_body TEXT DEFAULT NULL,
  p_duration_ms INT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_delivery_id UUID;
BEGIN
  INSERT INTO webhook_deliveries (
    webhook_id, event_type, payload, status, 
    response_status, response_body, duration_ms, error_message,
    delivered_at
  ) VALUES (
    p_webhook_id, p_event_type, p_payload, p_status,
    p_response_status, p_response_body, p_duration_ms, p_error_message,
    CASE WHEN p_status IN ('success', 'failed') THEN NOW() ELSE NULL END
  ) RETURNING id INTO v_delivery_id;
  
  -- Update webhook stats
  IF p_status = 'success' THEN
    UPDATE webhooks SET
      last_triggered_at = NOW(),
      last_status_code = p_response_status,
      success_count = success_count + 1,
      updated_at = NOW()
    WHERE id = p_webhook_id;
  ELSIF p_status = 'failed' THEN
    UPDATE webhooks SET
      last_triggered_at = NOW(),
      last_status_code = p_response_status,
      failure_count = failure_count + 1,
      updated_at = NOW()
    WHERE id = p_webhook_id;
  END IF;
  
  RETURN v_delivery_id;
END;
$$;

-- RLS policies
ALTER TABLE integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_logs ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON integration_providers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON organization_integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON webhooks TO authenticated;
GRANT SELECT, INSERT ON webhook_deliveries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON sync_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sync_mappings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON api_keys TO authenticated;
GRANT SELECT, INSERT ON integration_logs TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_integration_token(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_webhook_delivery(UUID, TEXT, JSONB, TEXT, INT, TEXT, INT, TEXT) TO authenticated;
