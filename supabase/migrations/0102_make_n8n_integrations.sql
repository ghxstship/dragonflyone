-- Migration: Make and n8n Integrations
-- Description: Tables for Make (Integromat) and n8n automation platform integrations

-- Make webhooks
CREATE TABLE IF NOT EXISTS make_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  organization_id UUID REFERENCES organizations(id),
  event_type TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_make_webhooks_user ON make_webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_make_webhooks_event ON make_webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_make_webhooks_active ON make_webhooks(is_active);

-- Make scenario logs
CREATE TABLE IF NOT EXISTS make_scenario_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  scenario_id TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  status TEXT DEFAULT 'started' CHECK (status IN ('started', 'running', 'completed', 'failed')),
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_make_scenario_logs_user ON make_scenario_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_make_scenario_logs_scenario ON make_scenario_logs(scenario_id);
CREATE INDEX IF NOT EXISTS idx_make_scenario_logs_status ON make_scenario_logs(status);

-- n8n credentials
CREATE TABLE IF NOT EXISTS n8n_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  organization_id UUID REFERENCES organizations(id),
  credential_type TEXT NOT NULL CHECK (credential_type IN ('oauth2', 'api_key')),
  name TEXT NOT NULL,
  scopes TEXT[],
  encrypted_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_n8n_credentials_user ON n8n_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_n8n_credentials_type ON n8n_credentials(credential_type);

-- n8n workflow registrations
CREATE TABLE IF NOT EXISTS n8n_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  organization_id UUID REFERENCES organizations(id),
  workflow_name TEXT NOT NULL,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('asset_maintenance', 'finance_reconciliation', 'crew_onboarding', 'ticket_escalation', 'marketing_drip', 'compliance_alerts', 'inventory_sync', 'vip_concierge', 'custom')),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('webhook', 'polling', 'schedule')),
  trigger_config JSONB,
  is_active BOOLEAN DEFAULT true,
  last_executed_at TIMESTAMPTZ,
  execution_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_n8n_workflows_user ON n8n_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_type ON n8n_workflows(workflow_type);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_active ON n8n_workflows(is_active);

-- n8n execution logs
CREATE TABLE IF NOT EXISTS n8n_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES n8n_workflows(id),
  execution_id TEXT NOT NULL,
  trigger_data JSONB,
  output_data JSONB,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INT
);

CREATE INDEX IF NOT EXISTS idx_n8n_execution_logs_workflow ON n8n_execution_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_execution_logs_status ON n8n_execution_logs(status);
CREATE INDEX IF NOT EXISTS idx_n8n_execution_logs_started ON n8n_execution_logs(started_at);

-- OpenAPI specs registry
CREATE TABLE IF NOT EXISTS openapi_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('atlvs', 'compvss', 'gvteway')),
  version TEXT NOT NULL,
  spec_content JSONB NOT NULL,
  changelog TEXT,
  deprecations JSONB,
  is_current BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, version)
);

CREATE INDEX IF NOT EXISTS idx_openapi_specs_platform ON openapi_specs(platform);
CREATE INDEX IF NOT EXISTS idx_openapi_specs_current ON openapi_specs(is_current);

-- API keys for developer portal
CREATE TABLE IF NOT EXISTS developer_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read'],
  rate_limit_per_minute INT DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  usage_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_developer_api_keys_user ON developer_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_developer_api_keys_prefix ON developer_api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_developer_api_keys_active ON developer_api_keys(is_active);

-- Webhook catalog
CREATE TABLE IF NOT EXISTS webhook_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('atlvs', 'compvss', 'gvteway')),
  payload_schema JSONB NOT NULL,
  example_payload JSONB NOT NULL,
  retry_policy JSONB DEFAULT '{"max_retries": 3, "backoff_seconds": [10, 60, 300]}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_catalog_platform ON webhook_catalog(platform);
CREATE INDEX IF NOT EXISTS idx_webhook_catalog_active ON webhook_catalog(is_active);

-- Function to get n8n workflow stats
CREATE OR REPLACE FUNCTION get_n8n_workflow_stats(p_workflow_id UUID)
RETURNS TABLE (
  total_executions BIGINT,
  successful_executions BIGINT,
  failed_executions BIGINT,
  avg_duration_ms NUMERIC,
  success_rate NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_executions,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_executions,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_executions,
    ROUND(AVG(duration_ms), 2) as avg_duration_ms,
    CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END)::NUMERIC / COUNT(*) * 100, 2)
      ELSE 0 
    END as success_rate
  FROM n8n_execution_logs
  WHERE workflow_id = p_workflow_id;
END;
$$;

-- RLS policies
ALTER TABLE make_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE make_scenario_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE openapi_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_catalog ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON make_webhooks TO authenticated;
GRANT SELECT, INSERT ON make_scenario_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON n8n_credentials TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON n8n_workflows TO authenticated;
GRANT SELECT, INSERT, UPDATE ON n8n_execution_logs TO authenticated;
GRANT SELECT ON openapi_specs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON developer_api_keys TO authenticated;
GRANT SELECT ON webhook_catalog TO authenticated;
GRANT EXECUTE ON FUNCTION get_n8n_workflow_stats(UUID) TO authenticated;

-- Insert webhook catalog entries
INSERT INTO webhook_catalog (event_name, description, platform, payload_schema, example_payload) VALUES
('deal.created', 'Triggered when a new deal is created', 'atlvs', 
  '{"type": "object", "properties": {"id": {"type": "string"}, "name": {"type": "string"}, "value": {"type": "number"}, "stage": {"type": "string"}}}',
  '{"id": "deal_123", "name": "Sample Deal", "value": 50000, "stage": "proposal", "created_at": "2024-01-01T00:00:00Z"}'
),
('invoice.paid', 'Triggered when an invoice is paid', 'atlvs',
  '{"type": "object", "properties": {"id": {"type": "string"}, "invoice_number": {"type": "string"}, "amount": {"type": "number"}}}',
  '{"id": "inv_123", "invoice_number": "INV-2024-001", "amount": 10000, "paid_at": "2024-01-01T00:00:00Z"}'
),
('project.started', 'Triggered when a project starts', 'compvss',
  '{"type": "object", "properties": {"id": {"type": "string"}, "name": {"type": "string"}, "start_date": {"type": "string"}}}',
  '{"id": "proj_123", "name": "Summer Festival", "start_date": "2024-06-01", "status": "active"}'
),
('crew.assigned', 'Triggered when crew is assigned to a project', 'compvss',
  '{"type": "object", "properties": {"assignment_id": {"type": "string"}, "crew_id": {"type": "string"}, "project_id": {"type": "string"}}}',
  '{"assignment_id": "assign_123", "crew_id": "crew_456", "project_id": "proj_789", "role": "Stage Manager"}'
),
('ticket.sold', 'Triggered when a ticket is sold', 'gvteway',
  '{"type": "object", "properties": {"ticket_id": {"type": "string"}, "event_id": {"type": "string"}, "quantity": {"type": "number"}}}',
  '{"ticket_id": "tkt_123", "event_id": "evt_456", "quantity": 2, "total_amount": 150}'
),
('event.sold_out', 'Triggered when an event sells out', 'gvteway',
  '{"type": "object", "properties": {"event_id": {"type": "string"}, "event_name": {"type": "string"}, "total_sold": {"type": "number"}}}',
  '{"event_id": "evt_123", "event_name": "Rock Concert", "total_sold": 5000, "sold_out_at": "2024-01-01T00:00:00Z"}'
)
ON CONFLICT (event_name) DO NOTHING;
