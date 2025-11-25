-- Migration: Zapier Integration System
-- Description: Tables for webhook subscriptions, delivery logs, and action tracking

-- Webhook subscriptions
CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  organization_id UUID REFERENCES organizations(id),
  trigger_type TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  filters JSONB,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  deactivated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_user ON webhook_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_trigger ON webhook_subscriptions(trigger_type);
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_active ON webhook_subscriptions(is_active);

-- Webhook delivery logs
CREATE TABLE IF NOT EXISTS webhook_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  status_code INT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  response_body TEXT,
  retry_count INT DEFAULT 0,
  delivered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_delivery_logs_subscription ON webhook_delivery_logs(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_delivery_logs_delivered ON webhook_delivery_logs(delivered_at);
CREATE INDEX IF NOT EXISTS idx_webhook_delivery_logs_success ON webhook_delivery_logs(success);

-- Zapier action logs
CREATE TABLE IF NOT EXISTS zapier_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  action_type TEXT NOT NULL,
  request_data JSONB,
  response_data JSONB,
  success BOOLEAN,
  error_message TEXT,
  execution_time_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zapier_action_logs_user ON zapier_action_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_zapier_action_logs_action ON zapier_action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_zapier_action_logs_created ON zapier_action_logs(created_at);

-- Language profiles
CREATE TABLE IF NOT EXISTS language_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) UNIQUE,
  languages JSONB NOT NULL DEFAULT '[]',
  specialties TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_language_profiles_user ON language_profiles(user_id);

-- Content translations
CREATE TABLE IF NOT EXISTS content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  language_code TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  keywords TEXT[],
  is_machine_translated BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES platform_users(id),
  verified_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES platform_users(id),
  UNIQUE(content_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_content_translations_content ON content_translations(content_id);
CREATE INDEX IF NOT EXISTS idx_content_translations_language ON content_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_content_translations_type ON content_translations(content_type);

-- Event translations
CREATE TABLE IF NOT EXISTS event_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  venue_directions TEXT,
  parking_info TEXT,
  accessibility_info TEXT,
  terms_and_conditions TEXT,
  faq JSONB,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES platform_users(id),
  UNIQUE(event_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_event_translations_event ON event_translations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_translations_language ON event_translations(language_code);

-- Asset service tickets
CREATE TABLE IF NOT EXISTS asset_service_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending_parts', 'resolved', 'closed')),
  assigned_to UUID REFERENCES platform_users(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES platform_users(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_service_tickets_asset ON asset_service_tickets(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_service_tickets_status ON asset_service_tickets(status);
CREATE INDEX IF NOT EXISTS idx_asset_service_tickets_priority ON asset_service_tickets(priority);

-- Function to trigger webhooks on deal creation
CREATE OR REPLACE FUNCTION trigger_deal_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert into a queue table for async processing
  INSERT INTO webhook_queue (trigger_type, payload, created_at)
  VALUES (
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'new_deal'
      WHEN TG_OP = 'UPDATE' AND OLD.stage != NEW.stage THEN 'deal_stage_change'
      ELSE NULL
    END,
    jsonb_build_object(
      'id', NEW.id,
      'name', NEW.name,
      'value', NEW.value,
      'stage', NEW.stage,
      'previous_stage', CASE WHEN TG_OP = 'UPDATE' THEN OLD.stage ELSE NULL END,
      'contact_id', NEW.contact_id,
      'created_at', NEW.created_at
    ),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Webhook queue for async processing
CREATE TABLE IF NOT EXISTS webhook_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_queue_processed ON webhook_queue(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_queue_created ON webhook_queue(created_at);

-- Function to get webhook analytics
CREATE OR REPLACE FUNCTION get_webhook_analytics(p_user_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE (
  trigger_type TEXT,
  total_deliveries BIGINT,
  successful_deliveries BIGINT,
  failed_deliveries BIGINT,
  success_rate NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ws.trigger_type,
    COUNT(wdl.id) as total_deliveries,
    COUNT(CASE WHEN wdl.success THEN 1 END) as successful_deliveries,
    COUNT(CASE WHEN NOT wdl.success THEN 1 END) as failed_deliveries,
    CASE 
      WHEN COUNT(wdl.id) > 0 
      THEN ROUND(COUNT(CASE WHEN wdl.success THEN 1 END)::NUMERIC / COUNT(wdl.id) * 100, 2)
      ELSE 0 
    END as success_rate
  FROM webhook_subscriptions ws
  LEFT JOIN webhook_delivery_logs wdl ON ws.id = wdl.subscription_id
    AND wdl.delivered_at > NOW() - (p_days || ' days')::INTERVAL
  WHERE ws.user_id = p_user_id
  GROUP BY ws.trigger_type;
END;
$$;

-- RLS policies
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE zapier_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE language_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_queue ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON webhook_subscriptions TO authenticated;
GRANT SELECT, INSERT ON webhook_delivery_logs TO authenticated;
GRANT SELECT, INSERT ON zapier_action_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON language_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON content_translations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON event_translations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON asset_service_tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON webhook_queue TO authenticated;
GRANT EXECUTE ON FUNCTION get_webhook_analytics(UUID, INT) TO authenticated;
