-- 0050_webhook_endpoints.sql
-- User-configurable webhook endpoints for outbound event notifications

-- Webhook endpoint status
DO $$ BEGIN
  CREATE TYPE webhook_endpoint_status AS ENUM ('active', 'paused', 'failed', 'disabled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Webhook event types that can be subscribed to
DO $$ BEGIN
  CREATE TYPE webhook_event_type AS ENUM (
  'order.created',
  'order.completed',
  'order.cancelled',
  'order.refunded',
  'ticket.transferred',
  'ticket.scanned',
  'event.published',
  'event.updated',
  'event.cancelled',
  'payment.succeeded',
  'payment.failed',
  'customer.created',
  'customer.updated'
);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- User-configured webhook endpoints
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  secret TEXT NOT NULL,
  events webhook_event_type[] NOT NULL DEFAULT '{}',
  status webhook_endpoint_status NOT NULL DEFAULT 'active',
  headers JSONB NOT NULL DEFAULT '{}'::jsonb,
  retry_count INTEGER NOT NULL DEFAULT 3,
  timeout_ms INTEGER NOT NULL DEFAULT 30000,
  last_triggered_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  failure_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT webhook_url_valid CHECK (url ~ '^https?://')
);

-- Webhook delivery logs
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id) ON DELETE CASCADE,
  event_type webhook_event_type NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API keys for developer access
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User sessions for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_name TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  ip_address INET,
  location TEXT,
  is_current BOOLEAN NOT NULL DEFAULT false,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Connected OAuth applications
CREATE TABLE IF NOT EXISTS connected_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  app_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  access_token_hash TEXT,
  refresh_token_hash TEXT,
  token_expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, app_id)
);

-- Add missing columns to existing tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webhook_deliveries' AND column_name = 'endpoint_id') THEN
    ALTER TABLE webhook_deliveries ADD COLUMN endpoint_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webhook_endpoints' AND column_name = 'user_id') THEN
    ALTER TABLE webhook_endpoints ADD COLUMN user_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'api_keys' AND column_name = 'user_id') THEN
    ALTER TABLE api_keys ADD COLUMN user_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_id') THEN
    ALTER TABLE user_sessions ADD COLUMN user_id UUID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'connected_apps' AND column_name = 'user_id') THEN
    ALTER TABLE connected_apps ADD COLUMN user_id UUID;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_apps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhook_endpoints
DROP POLICY IF EXISTS webhook_endpoints_select ON webhook_endpoints;
CREATE POLICY webhook_endpoints_select ON webhook_endpoints
  FOR SELECT USING (user_id = auth.uid() OR role_in('LEGEND_SUPER_ADMIN', 'GVTEWAY_ADMIN'));

DROP POLICY IF EXISTS webhook_endpoints_insert ON webhook_endpoints;
CREATE POLICY webhook_endpoints_insert ON webhook_endpoints
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS webhook_endpoints_update ON webhook_endpoints;
CREATE POLICY webhook_endpoints_update ON webhook_endpoints
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS webhook_endpoints_delete ON webhook_endpoints;
CREATE POLICY webhook_endpoints_delete ON webhook_endpoints
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for webhook_deliveries
DROP POLICY IF EXISTS webhook_deliveries_select ON webhook_deliveries;
CREATE POLICY webhook_deliveries_select ON webhook_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM webhook_endpoints 
      WHERE webhook_endpoints.id = webhook_deliveries.endpoint_id 
      AND webhook_endpoints.user_id = auth.uid()
    ) OR role_in('LEGEND_SUPER_ADMIN', 'GVTEWAY_ADMIN')
  );

-- RLS Policies for api_keys
DROP POLICY IF EXISTS api_keys_select ON api_keys;
CREATE POLICY api_keys_select ON api_keys
  FOR SELECT USING (user_id = auth.uid() OR role_in('LEGEND_SUPER_ADMIN'));

DROP POLICY IF EXISTS api_keys_insert ON api_keys;
CREATE POLICY api_keys_insert ON api_keys
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS api_keys_update ON api_keys;
CREATE POLICY api_keys_update ON api_keys
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS api_keys_delete ON api_keys;
CREATE POLICY api_keys_delete ON api_keys
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for user_sessions
DROP POLICY IF EXISTS user_sessions_select ON user_sessions;
CREATE POLICY user_sessions_select ON user_sessions
  FOR SELECT USING (user_id = auth.uid() OR role_in('LEGEND_SUPER_ADMIN'));

DROP POLICY IF EXISTS user_sessions_delete ON user_sessions;
CREATE POLICY user_sessions_delete ON user_sessions
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for connected_apps
DROP POLICY IF EXISTS connected_apps_select ON connected_apps;
CREATE POLICY connected_apps_select ON connected_apps
  FOR SELECT USING (user_id = auth.uid() OR role_in('LEGEND_SUPER_ADMIN'));

DROP POLICY IF EXISTS connected_apps_insert ON connected_apps;
CREATE POLICY connected_apps_insert ON connected_apps
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS connected_apps_delete ON connected_apps;
CREATE POLICY connected_apps_delete ON connected_apps
  FOR DELETE USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS webhook_endpoints_user_idx ON webhook_endpoints(user_id);
CREATE INDEX IF NOT EXISTS webhook_endpoints_status_idx ON webhook_endpoints(status);
CREATE INDEX IF NOT EXISTS webhook_deliveries_endpoint_idx ON webhook_deliveries(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS api_keys_user_idx ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS api_keys_prefix_idx ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS user_sessions_user_idx ON user_sessions(user_id, last_active_at DESC);
CREATE INDEX IF NOT EXISTS connected_apps_user_idx ON connected_apps(user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_webhook_endpoints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS webhook_endpoints_updated_at ON webhook_endpoints;
CREATE TRIGGER webhook_endpoints_updated_at
  BEFORE UPDATE ON webhook_endpoints
  FOR EACH ROW EXECUTE FUNCTION update_webhook_endpoints_updated_at();

DROP TRIGGER IF EXISTS api_keys_updated_at ON api_keys;
CREATE TRIGGER api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_webhook_endpoints_updated_at();

-- Function to generate webhook secret
CREATE OR REPLACE FUNCTION generate_webhook_secret()
RETURNS TEXT AS $$
BEGIN
  RETURN 'whsec_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to test webhook endpoint
CREATE OR REPLACE FUNCTION test_webhook_endpoint(endpoint_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- This would be called from the application layer
  -- Returns test payload structure
  result := jsonb_build_object(
    'endpoint_id', endpoint_id,
    'test', true,
    'timestamp', now()
  );
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
