-- Migration: OAuth System for Third-Party Integrations
-- Description: OAuth 2.0 infrastructure for Zapier, Make, and other integrations

-- OAuth clients (registered applications)
CREATE TABLE IF NOT EXISTS oauth_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id VARCHAR(64) NOT NULL UNIQUE,
  client_secret_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  redirect_uris JSONB DEFAULT '[]',
  allowed_scopes JSONB DEFAULT '["read"]',
  grant_types JSONB DEFAULT '["authorization_code", "refresh_token"]',
  is_active BOOLEAN DEFAULT TRUE,
  is_first_party BOOLEAN DEFAULT FALSE,
  rate_limit_per_minute INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- OAuth authorization codes (temporary, for code exchange)
CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(255) NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES oauth_clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  redirect_uri TEXT NOT NULL,
  scope TEXT,
  state TEXT,
  code_challenge TEXT,
  code_challenge_method VARCHAR(10),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth access tokens
CREATE TABLE IF NOT EXISTS oauth_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES oauth_clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  scope TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth refresh tokens
CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES oauth_clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  scope TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integration usage analytics
CREATE TABLE IF NOT EXISTS integration_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES oauth_clients(id) ON DELETE SET NULL,
  user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  integration_type VARCHAR(50) NOT NULL CHECK (integration_type IN ('zapier', 'make', 'n8n', 'api', 'webhook')),
  action_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success', 'error', 'rate_limited')),
  error_message TEXT,
  request_duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integration analytics aggregates (daily)
CREATE TABLE IF NOT EXISTS integration_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  client_id UUID REFERENCES oauth_clients(id) ON DELETE CASCADE,
  integration_type VARCHAR(50) NOT NULL,
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  rate_limited_requests INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  avg_duration_ms INTEGER,
  top_actions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, client_id, integration_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_oauth_clients_client_id ON oauth_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_auth_codes_code ON oauth_authorization_codes(code);
CREATE INDEX IF NOT EXISTS idx_oauth_auth_codes_expires ON oauth_authorization_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_hash ON oauth_access_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_expires ON oauth_access_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_hash ON oauth_refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_expires ON oauth_refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_integration_usage_logs_client ON integration_usage_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_integration_usage_logs_type ON integration_usage_logs(integration_type);
CREATE INDEX IF NOT EXISTS idx_integration_usage_logs_created ON integration_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_integration_analytics_date ON integration_analytics_daily(date);
CREATE INDEX IF NOT EXISTS idx_integration_analytics_client ON integration_analytics_daily(client_id);

-- RLS Policies
ALTER TABLE oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_authorization_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_analytics_daily ENABLE ROW LEVEL SECURITY;

-- OAuth clients - admin only
CREATE POLICY "oauth_clients_select" ON oauth_clients
  FOR SELECT USING (
    is_active = TRUE
    OR EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

CREATE POLICY "oauth_clients_manage" ON oauth_clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Authorization codes - system only
CREATE POLICY "oauth_auth_codes_insert" ON oauth_authorization_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "oauth_auth_codes_select" ON oauth_authorization_codes
  FOR SELECT USING (user_id = auth.uid());

-- Access tokens - user can see their own
CREATE POLICY "oauth_access_tokens_select" ON oauth_access_tokens
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "oauth_access_tokens_insert" ON oauth_access_tokens
  FOR INSERT WITH CHECK (true);

-- Refresh tokens - user can see their own
CREATE POLICY "oauth_refresh_tokens_select" ON oauth_refresh_tokens
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "oauth_refresh_tokens_insert" ON oauth_refresh_tokens
  FOR INSERT WITH CHECK (true);

-- Usage logs - admin only
CREATE POLICY "integration_usage_logs_insert" ON integration_usage_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "integration_usage_logs_select" ON integration_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Analytics - admin only
CREATE POLICY "integration_analytics_select" ON integration_analytics_daily
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN']::text[]
    )
  );

-- Seed Zapier OAuth client
INSERT INTO oauth_clients (
  client_id, 
  client_secret_hash, 
  name, 
  description,
  redirect_uris,
  allowed_scopes,
  is_first_party
) VALUES (
  'zapier_ghxstship',
  -- This is a placeholder hash - generate real secret in production
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  'Zapier Integration',
  'Official Zapier integration for GHXSTSHIP',
  '["https://zapier.com/dashboard/auth/oauth/return/App123GHXSTSHIP/"]',
  '["read", "write", "triggers", "actions"]',
  TRUE
) ON CONFLICT (client_id) DO NOTHING;

-- Seed Make OAuth client
INSERT INTO oauth_clients (
  client_id, 
  client_secret_hash, 
  name, 
  description,
  redirect_uris,
  allowed_scopes,
  is_first_party
) VALUES (
  'make_ghxstship',
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  'Make (Integromat) Integration',
  'Official Make integration for GHXSTSHIP',
  '["https://www.integromat.com/oauth/cb/ghxstship"]',
  '["read", "write", "triggers", "actions"]',
  TRUE
) ON CONFLICT (client_id) DO NOTHING;

-- Function to log integration usage
CREATE OR REPLACE FUNCTION log_integration_usage(
  p_client_id UUID,
  p_user_id UUID,
  p_integration_type VARCHAR,
  p_action_type VARCHAR,
  p_resource_type VARCHAR DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_status VARCHAR DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL,
  p_duration_ms INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO integration_usage_logs (
    client_id, user_id, integration_type, action_type,
    resource_type, resource_id, status, error_message,
    request_duration_ms, metadata
  ) VALUES (
    p_client_id, p_user_id, p_integration_type, p_action_type,
    p_resource_type, p_resource_id, p_status, p_error_message,
    p_duration_ms, p_metadata
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate daily analytics
CREATE OR REPLACE FUNCTION aggregate_integration_analytics(p_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO integration_analytics_daily (
    date, client_id, integration_type,
    total_requests, successful_requests, failed_requests, rate_limited_requests,
    unique_users, avg_duration_ms, top_actions
  )
  SELECT 
    p_date,
    client_id,
    integration_type,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status = 'success') as successful_requests,
    COUNT(*) FILTER (WHERE status = 'error') as failed_requests,
    COUNT(*) FILTER (WHERE status = 'rate_limited') as rate_limited_requests,
    COUNT(DISTINCT user_id) as unique_users,
    AVG(request_duration_ms)::INTEGER as avg_duration_ms,
    jsonb_object_agg(action_type, action_count) as top_actions
  FROM (
    SELECT 
      client_id, integration_type, user_id, status, request_duration_ms, action_type,
      COUNT(*) OVER (PARTITION BY client_id, integration_type, action_type) as action_count
    FROM integration_usage_logs
    WHERE DATE(created_at) = p_date
  ) sub
  GROUP BY client_id, integration_type
  ON CONFLICT (date, client_id, integration_type) 
  DO UPDATE SET
    total_requests = EXCLUDED.total_requests,
    successful_requests = EXCLUDED.successful_requests,
    failed_requests = EXCLUDED.failed_requests,
    rate_limited_requests = EXCLUDED.rate_limited_requests,
    unique_users = EXCLUDED.unique_users,
    avg_duration_ms = EXCLUDED.avg_duration_ms,
    top_actions = EXCLUDED.top_actions;
END;
$$ LANGUAGE plpgsql;
