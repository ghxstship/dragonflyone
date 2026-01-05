-- Migration: 0054_integration_webhooks.sql
-- Description: BACK-111 - Integration Connector APIs for Zapier/n8n
-- Creates webhook subscriptions and integration metrics tables
-- 3NF Compliant: No transitive dependencies, proper normalization
-- SSOT Compliant: Single source for integration data

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE webhook_status AS ENUM ('active', 'paused', 'failed', 'deleted');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE integration_provider AS ENUM ('zapier', 'n8n', 'make', 'custom');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE webhook_event_type AS ENUM (
    'deal.created', 'deal.updated', 'deal.won', 'deal.lost',
    'contact.created', 'contact.updated',
    'project.created', 'project.updated', 'project.completed',
    'invoice.created', 'invoice.paid', 'invoice.overdue',
    'event.created', 'event.updated', 'event.cancelled',
    'ticket.sold', 'ticket.transferred', 'ticket.refunded',
    'order.created', 'order.completed', 'order.cancelled',
    'crew.assigned', 'crew.checked_in', 'crew.checked_out',
    'asset.checked_out', 'asset.returned', 'asset.maintenance_due'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- WEBHOOK SUBSCRIPTIONS TABLE (3NF Compliant)
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys (SSOT - references existing tables)
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES platform_users(id) ON DELETE SET NULL,
  
  -- Subscription Details
  name TEXT NOT NULL,
  description TEXT,
  provider integration_provider NOT NULL DEFAULT 'custom',
  
  -- Webhook Configuration
  target_url TEXT NOT NULL,
  secret_key TEXT, -- For HMAC signature verification
  event_types webhook_event_type[] NOT NULL,
  
  -- Filtering (optional - filter which records trigger the webhook)
  filter_conditions JSONB DEFAULT '{}',
  
  -- Status and Health
  status webhook_status NOT NULL DEFAULT 'active',
  last_triggered_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  failure_count INTEGER NOT NULL DEFAULT 0,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  
  -- Rate Limiting
  rate_limit_per_minute INTEGER DEFAULT 60,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_target_url CHECK (target_url ~ '^https?://'),
  CONSTRAINT valid_rate_limit CHECK (rate_limit_per_minute > 0 AND rate_limit_per_minute <= 1000)
);

-- ============================================================================
-- WEBHOOK DELIVERIES TABLE (Audit Log)
-- ============================================================================

-- Check if table exists with old schema, if so update it
DO $$
BEGIN
  -- Check if webhook_deliveries table exists with webhook_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'webhook_deliveries' 
    AND column_name = 'webhook_id'
  ) THEN
    -- Add missing columns to existing table
    ALTER TABLE webhook_deliveries ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES webhook_subscriptions(id) ON DELETE CASCADE;
    ALTER TABLE webhook_deliveries ADD COLUMN IF NOT EXISTS event_id TEXT;
    ALTER TABLE webhook_deliveries ADD COLUMN IF NOT EXISTS request_url TEXT;
    ALTER TABLE webhook_deliveries ADD COLUMN IF NOT EXISTS request_headers JSONB;
    ALTER TABLE webhook_deliveries ADD COLUMN IF NOT EXISTS request_body JSONB;
    ALTER TABLE webhook_deliveries ADD COLUMN IF NOT EXISTS duration_ms INTEGER;
    ALTER TABLE webhook_deliveries ADD COLUMN IF NOT EXISTS success BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE webhook_deliveries ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0;
    
    -- Update existing records
    UPDATE webhook_deliveries SET 
      request_body = payload,
      success = CASE WHEN response_status BETWEEN 200 AND 299 THEN true ELSE false END,
      retry_count = attempt_count
    WHERE request_body IS NULL;
    
  ELSE
    -- Create new table if it doesn't exist
    CREATE TABLE webhook_deliveries (
      -- Primary Key
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      
      -- Foreign Keys
      subscription_id UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
      
      -- Delivery Details
      event_type webhook_event_type NOT NULL,
      event_id TEXT NOT NULL, -- ID of the record that triggered the webhook
      
      -- Request Details
      request_url TEXT NOT NULL,
      request_headers JSONB,
      request_body JSONB NOT NULL,
      
      -- Response Details
      response_status INTEGER,
      response_headers JSONB,
      response_body TEXT,
      
      -- Timing
      duration_ms INTEGER,
      
      -- Status
      success BOOLEAN NOT NULL DEFAULT false,
      error_message TEXT,
      retry_count INTEGER NOT NULL DEFAULT 0,
      
      -- Timestamps
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      delivered_at TIMESTAMPTZ
    );
  END IF;
END $$;

-- ============================================================================
-- INTEGRATION METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS integration_metrics (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES webhook_subscriptions(id) ON DELETE SET NULL,
  
  -- Metric Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Counts
  total_events INTEGER NOT NULL DEFAULT 0,
  successful_deliveries INTEGER NOT NULL DEFAULT 0,
  failed_deliveries INTEGER NOT NULL DEFAULT 0,
  retried_deliveries INTEGER NOT NULL DEFAULT 0,
  
  -- Timing
  avg_response_time_ms INTEGER,
  max_response_time_ms INTEGER,
  min_response_time_ms INTEGER,
  
  -- By Event Type
  events_by_type JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint for period
  CONSTRAINT unique_metric_period UNIQUE (organization_id, subscription_id, period_start, period_end)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_org ON webhook_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_status ON webhook_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_provider ON webhook_subscriptions(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_event_types ON webhook_subscriptions USING GIN(event_types);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_subscription ON webhook_deliveries(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event_type ON webhook_deliveries(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created ON webhook_deliveries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_success ON webhook_deliveries(success);

CREATE INDEX IF NOT EXISTS idx_integration_metrics_org ON integration_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_integration_metrics_period ON integration_metrics(period_start, period_end);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_webhook_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_webhook_subscriptions_updated_at ON webhook_subscriptions;
CREATE TRIGGER trigger_webhook_subscriptions_updated_at
  BEFORE UPDATE ON webhook_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_subscriptions_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_metrics ENABLE ROW LEVEL SECURITY;

-- Webhook Subscriptions Policies
CREATE POLICY "Users can view org webhook subscriptions"
  ON webhook_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = webhook_subscriptions.organization_id
    )
  );

CREATE POLICY "Admins can manage org webhook subscriptions"
  ON webhook_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = webhook_subscriptions.organization_id
      AND 'admin' = ANY(pu.platform_roles)
    )
  );

-- Webhook Deliveries Policies
CREATE POLICY "Users can view org webhook deliveries"
  ON webhook_deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM webhook_subscriptions ws
      JOIN platform_users pu ON pu.organization_id = ws.organization_id
      WHERE ws.id = webhook_deliveries.subscription_id
      AND pu.id = auth.uid()
    )
  );

-- Integration Metrics Policies
CREATE POLICY "Users can view org integration metrics"
  ON integration_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.organization_id = integration_metrics.organization_id
    )
  );

-- Service role full access
CREATE POLICY "Service role full access webhooks"
  ON webhook_subscriptions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access deliveries"
  ON webhook_deliveries FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access metrics"
  ON integration_metrics FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON webhook_subscriptions TO authenticated;
GRANT SELECT, INSERT ON webhook_deliveries TO authenticated;
GRANT SELECT ON integration_metrics TO authenticated;
GRANT ALL ON webhook_subscriptions, webhook_deliveries, integration_metrics TO service_role;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to record a webhook delivery
CREATE OR REPLACE FUNCTION record_webhook_delivery(
  p_subscription_id UUID,
  p_event_type webhook_event_type,
  p_event_id TEXT,
  p_request_url TEXT,
  p_request_headers JSONB,
  p_request_body JSONB,
  p_response_status INTEGER,
  p_response_headers JSONB,
  p_response_body TEXT,
  p_duration_ms INTEGER,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_delivery_id UUID;
BEGIN
  INSERT INTO webhook_deliveries (
    subscription_id,
    event_type,
    event_id,
    request_url,
    request_headers,
    request_body,
    response_status,
    response_headers,
    response_body,
    duration_ms,
    success,
    error_message,
    delivered_at
  ) VALUES (
    p_subscription_id,
    p_event_type,
    p_event_id,
    p_request_url,
    p_request_headers,
    p_request_body,
    p_response_status,
    p_response_headers,
    p_response_body,
    p_duration_ms,
    p_success,
    p_error_message,
    NOW()
  )
  RETURNING id INTO v_delivery_id;

  -- Update subscription stats
  IF p_success THEN
    UPDATE webhook_subscriptions
    SET 
      last_triggered_at = NOW(),
      last_success_at = NOW(),
      consecutive_failures = 0
    WHERE id = p_subscription_id;
  ELSE
    UPDATE webhook_subscriptions
    SET 
      last_triggered_at = NOW(),
      last_failure_at = NOW(),
      failure_count = failure_count + 1,
      consecutive_failures = consecutive_failures + 1,
      status = CASE 
        WHEN consecutive_failures >= 10 THEN 'failed'::webhook_status
        ELSE status
      END
    WHERE id = p_subscription_id;
  END IF;

  RETURN v_delivery_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get integration health
CREATE OR REPLACE FUNCTION get_integration_health(
  p_organization_id UUID
)
RETURNS TABLE (
  total_subscriptions INTEGER,
  active_subscriptions INTEGER,
  failed_subscriptions INTEGER,
  total_deliveries_24h INTEGER,
  successful_deliveries_24h INTEGER,
  failed_deliveries_24h INTEGER,
  success_rate NUMERIC,
  avg_response_time_ms INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM webhook_subscriptions WHERE organization_id = p_organization_id),
    (SELECT COUNT(*)::INTEGER FROM webhook_subscriptions WHERE organization_id = p_organization_id AND status = 'active'),
    (SELECT COUNT(*)::INTEGER FROM webhook_subscriptions WHERE organization_id = p_organization_id AND status = 'failed'),
    (SELECT COUNT(*)::INTEGER FROM webhook_deliveries wd
     JOIN webhook_subscriptions ws ON ws.id = wd.subscription_id
     WHERE ws.organization_id = p_organization_id AND wd.created_at > NOW() - INTERVAL '24 hours'),
    (SELECT COUNT(*)::INTEGER FROM webhook_deliveries wd
     JOIN webhook_subscriptions ws ON ws.id = wd.subscription_id
     WHERE ws.organization_id = p_organization_id AND wd.created_at > NOW() - INTERVAL '24 hours' AND wd.success = true),
    (SELECT COUNT(*)::INTEGER FROM webhook_deliveries wd
     JOIN webhook_subscriptions ws ON ws.id = wd.subscription_id
     WHERE ws.organization_id = p_organization_id AND wd.created_at > NOW() - INTERVAL '24 hours' AND wd.success = false),
    (SELECT COALESCE(
      ROUND(
        (COUNT(*) FILTER (WHERE wd.success = true)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100,
        2
      ),
      100
    )
     FROM webhook_deliveries wd
     JOIN webhook_subscriptions ws ON ws.id = wd.subscription_id
     WHERE ws.organization_id = p_organization_id AND wd.created_at > NOW() - INTERVAL '24 hours'),
    (SELECT COALESCE(AVG(wd.duration_ms)::INTEGER, 0)
     FROM webhook_deliveries wd
     JOIN webhook_subscriptions ws ON ws.id = wd.subscription_id
     WHERE ws.organization_id = p_organization_id AND wd.created_at > NOW() - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION record_webhook_delivery TO authenticated;
GRANT EXECUTE ON FUNCTION get_integration_health TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE webhook_subscriptions IS 'Stores webhook subscriptions for Zapier/n8n/Make integrations (BACK-111)';
COMMENT ON TABLE webhook_deliveries IS 'Audit log of webhook delivery attempts';
COMMENT ON TABLE integration_metrics IS 'Aggregated metrics for integration performance monitoring';
COMMENT ON COLUMN webhook_subscriptions.secret_key IS 'Secret for HMAC signature verification of webhook payloads';
COMMENT ON COLUMN webhook_subscriptions.consecutive_failures IS 'Auto-pauses subscription after 10 consecutive failures';
