-- ============================================================================
-- 0014_integration_sync.sql
-- Integration and Synchronization Tables
-- GHXSTSHIP Platform - 3NF Gap Remediation
-- ============================================================================

-- ============================================================================
-- ENUM TYPES FOR INTEGRATION
-- ============================================================================

CREATE TYPE sync_status AS ENUM ('pending', 'in_progress', 'synced', 'failed', 'active', 'inactive');
CREATE TYPE sync_direction AS ENUM ('inbound', 'outbound', 'bidirectional');

-- ============================================================================
-- INTEGRATION DEAL LINKS (ATLVS <-> External CRM)
-- ============================================================================

CREATE TABLE integration_deal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  atlvs_deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  compvss_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  external_system TEXT,
  external_id TEXT,
  sync_status sync_status NOT NULL DEFAULT 'active',
  sync_direction sync_direction DEFAULT 'bidirectional',
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  field_mappings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deal_links_org ON integration_deal_links(organization_id);
CREATE INDEX idx_deal_links_deal ON integration_deal_links(atlvs_deal_id);
CREATE INDEX idx_deal_links_project ON integration_deal_links(compvss_project_id);
CREATE INDEX idx_deal_links_external ON integration_deal_links(external_system, external_id);
CREATE INDEX idx_deal_links_status ON integration_deal_links(sync_status);

-- ============================================================================
-- INTEGRATION PROJECT LINKS (COMPVSS <-> External PM)
-- ============================================================================

CREATE TABLE integration_project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  compvss_project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  external_system TEXT NOT NULL,
  external_id TEXT NOT NULL,
  external_url TEXT,
  sync_status sync_status NOT NULL DEFAULT 'active',
  sync_direction sync_direction DEFAULT 'bidirectional',
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  field_mappings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, external_system, external_id)
);

CREATE INDEX idx_project_links_org ON integration_project_links(organization_id);
CREATE INDEX idx_project_links_project ON integration_project_links(compvss_project_id);
CREATE INDEX idx_project_links_external ON integration_project_links(external_system, external_id);

-- ============================================================================
-- INTEGRATION EVENT LINKS (GVTEWAY <-> External Ticketing)
-- ============================================================================

CREATE TABLE integration_event_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  gvteway_event_id UUID REFERENCES legend_events(id) ON DELETE CASCADE,
  external_system TEXT NOT NULL,
  external_id TEXT NOT NULL,
  external_url TEXT,
  sync_status sync_status NOT NULL DEFAULT 'active',
  sync_direction sync_direction DEFAULT 'bidirectional',
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  ticket_types_synced INTEGER DEFAULT 0,
  total_tickets_synced INTEGER DEFAULT 0,
  revenue_synced NUMERIC(14,2) DEFAULT 0,
  field_mappings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, external_system, external_id)
);

CREATE INDEX idx_event_links_org ON integration_event_links(organization_id);
CREATE INDEX idx_event_links_event ON integration_event_links(gvteway_event_id);
CREATE INDEX idx_event_links_external ON integration_event_links(external_system, external_id);

-- ============================================================================
-- INTEGRATION ASSET LINKS (Inventory <-> External Systems)
-- ============================================================================

CREATE TABLE integration_asset_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  external_system TEXT NOT NULL,
  external_id TEXT NOT NULL,
  external_url TEXT,
  sync_status sync_status NOT NULL DEFAULT 'active',
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, asset_id, external_system)
);

CREATE INDEX idx_asset_links_org ON integration_asset_links(organization_id);
CREATE INDEX idx_asset_links_asset ON integration_asset_links(asset_id);
CREATE INDEX idx_asset_links_external ON integration_asset_links(external_system, external_id);

-- ============================================================================
-- INTEGRATION SYNC JOBS (Background Sync Queue)
-- ============================================================================

CREATE TABLE integration_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  external_system TEXT NOT NULL,
  direction sync_direction NOT NULL DEFAULT 'outbound',
  priority INTEGER DEFAULT 0,
  status sync_status NOT NULL DEFAULT 'pending',
  payload JSONB DEFAULT '{}'::jsonb,
  result JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sync_jobs_org ON integration_sync_jobs(organization_id);
CREATE INDEX idx_sync_jobs_status ON integration_sync_jobs(status, scheduled_at);
CREATE INDEX idx_sync_jobs_entity ON integration_sync_jobs(entity_type, entity_id);
CREATE INDEX idx_sync_jobs_pending ON integration_sync_jobs(status, priority DESC, scheduled_at) WHERE status = 'pending';

-- ============================================================================
-- TICKET REVENUE INGESTIONS (External Ticketing Data)
-- ============================================================================

CREATE TABLE ticket_revenue_ingestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_link_id UUID REFERENCES integration_event_links(id) ON DELETE SET NULL,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  external_system TEXT NOT NULL,
  external_event_id TEXT,
  ingestion_date DATE NOT NULL,
  ticket_type TEXT,
  tickets_sold INTEGER DEFAULT 0,
  tickets_comped INTEGER DEFAULT 0,
  tickets_refunded INTEGER DEFAULT 0,
  gross_revenue NUMERIC(12,2) DEFAULT 0,
  net_revenue NUMERIC(12,2) DEFAULT 0,
  fees NUMERIC(10,2) DEFAULT 0,
  taxes NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  raw_data JSONB,
  processed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_revenue_ingestions_org ON ticket_revenue_ingestions(organization_id, ingestion_date DESC);
CREATE INDEX idx_revenue_ingestions_event ON ticket_revenue_ingestions(event_id);
CREATE INDEX idx_revenue_ingestions_link ON ticket_revenue_ingestions(event_link_id);
CREATE INDEX idx_revenue_ingestions_external ON ticket_revenue_ingestions(external_system, external_event_id);

-- ============================================================================
-- WEBHOOK ENDPOINTS (Incoming Webhooks)
-- ============================================================================

CREATE TABLE webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  endpoint_path TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  source_system TEXT,
  event_types TEXT[],
  is_active BOOLEAN DEFAULT true,
  verify_signature BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, endpoint_path)
);

CREATE INDEX idx_webhook_endpoints_org ON webhook_endpoints(organization_id);
CREATE INDEX idx_webhook_endpoints_active ON webhook_endpoints(is_active) WHERE is_active = true;

-- ============================================================================
-- WEBHOOK EVENT LOGS
-- ============================================================================

CREATE TABLE webhook_event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  endpoint_id UUID REFERENCES webhook_endpoints(id) ON DELETE SET NULL,
  source_system TEXT,
  event_type TEXT,
  event_id TEXT,
  payload JSONB NOT NULL,
  headers JSONB,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed', 'ignored')),
  processing_error TEXT,
  processed_at TIMESTAMPTZ,
  ip_address INET,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_webhook_logs_org ON webhook_event_logs(organization_id, received_at DESC);
CREATE INDEX idx_webhook_logs_endpoint ON webhook_event_logs(endpoint_id);
CREATE INDEX idx_webhook_logs_status ON webhook_event_logs(status);
CREATE INDEX idx_webhook_logs_event ON webhook_event_logs(source_system, event_type);

-- Partition webhook logs by month for better performance (optional, can be enabled later)
-- CREATE TABLE webhook_event_logs_archive (LIKE webhook_event_logs INCLUDING ALL);

-- ============================================================================
-- DATA SOURCES (External Data Connections)
-- ============================================================================

CREATE TABLE data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('api', 'database', 'file', 'webhook', 'manual')),
  connection_config JSONB DEFAULT '{}'::jsonb,
  credentials_encrypted TEXT,
  is_active BOOLEAN DEFAULT true,
  last_connected_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  sync_frequency TEXT DEFAULT 'manual' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_data_sources_org ON data_sources(organization_id);
CREATE INDEX idx_data_sources_type ON data_sources(source_type);
CREATE INDEX idx_data_sources_active ON data_sources(is_active) WHERE is_active = true;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE integration_deal_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_event_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_asset_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_revenue_ingestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

-- Deal Links policies
CREATE POLICY deal_links_select ON integration_deal_links FOR SELECT USING (org_matches(organization_id));
CREATE POLICY deal_links_manage ON integration_deal_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Project Links policies
CREATE POLICY project_links_select ON integration_project_links FOR SELECT USING (org_matches(organization_id));
CREATE POLICY project_links_manage ON integration_project_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Event Links policies
CREATE POLICY event_links_select ON integration_event_links FOR SELECT USING (org_matches(organization_id));
CREATE POLICY event_links_manage ON integration_event_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Asset Links policies
CREATE POLICY asset_links_select ON integration_asset_links FOR SELECT USING (org_matches(organization_id));
CREATE POLICY asset_links_manage ON integration_asset_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Sync Jobs policies
CREATE POLICY sync_jobs_select ON integration_sync_jobs FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY sync_jobs_manage ON integration_sync_jobs FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Revenue Ingestions policies
CREATE POLICY revenue_ingestions_select ON ticket_revenue_ingestions FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY revenue_ingestions_manage ON ticket_revenue_ingestions FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Webhook Endpoints policies
CREATE POLICY webhook_endpoints_select ON webhook_endpoints FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY webhook_endpoints_manage ON webhook_endpoints FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Webhook Logs policies
CREATE POLICY webhook_logs_select ON webhook_event_logs FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY webhook_logs_insert ON webhook_event_logs FOR INSERT WITH CHECK (org_matches(organization_id));

-- Data Sources policies
CREATE POLICY data_sources_select ON data_sources FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY data_sources_manage ON data_sources FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON integration_deal_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_project_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_event_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_asset_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_sync_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ticket_revenue_ingestions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON webhook_endpoints TO authenticated;
GRANT SELECT, INSERT ON webhook_event_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_sources TO authenticated;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER deal_links_updated_at BEFORE UPDATE ON integration_deal_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER project_links_updated_at BEFORE UPDATE ON integration_project_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER event_links_updated_at BEFORE UPDATE ON integration_event_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER asset_links_updated_at BEFORE UPDATE ON integration_asset_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER webhook_endpoints_updated_at BEFORE UPDATE ON webhook_endpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER data_sources_updated_at BEFORE UPDATE ON data_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_enqueue_sync_job(
  p_org_id UUID,
  p_job_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_external_system TEXT,
  p_direction sync_direction DEFAULT 'outbound',
  p_payload JSONB DEFAULT '{}'::jsonb,
  p_priority INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_id UUID;
BEGIN
  IF NOT org_matches(p_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  INSERT INTO integration_sync_jobs (
    organization_id,
    job_type,
    entity_type,
    entity_id,
    external_system,
    direction,
    priority,
    payload,
    created_by
  ) VALUES (
    p_org_id,
    p_job_type,
    p_entity_type,
    p_entity_id,
    p_external_system,
    p_direction,
    p_priority,
    p_payload,
    current_platform_user_id()
  ) RETURNING id INTO v_job_id;

  RETURN v_job_id;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_enqueue_sync_job TO authenticated;

CREATE OR REPLACE FUNCTION rpc_ingest_ticket_revenue(
  p_org_id UUID,
  p_external_system TEXT,
  p_external_event_id TEXT,
  p_event_id UUID,
  p_ingestion_date DATE,
  p_ticket_type TEXT,
  p_tickets_sold INTEGER,
  p_tickets_comped INTEGER DEFAULT 0,
  p_tickets_refunded INTEGER DEFAULT 0,
  p_gross_revenue NUMERIC DEFAULT 0,
  p_net_revenue NUMERIC DEFAULT 0,
  p_fees NUMERIC DEFAULT 0,
  p_taxes NUMERIC DEFAULT 0,
  p_raw_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_link_id UUID;
BEGIN
  IF NOT org_matches(p_org_id) OR NOT role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  SELECT id INTO v_link_id
  FROM integration_event_links
  WHERE organization_id = p_org_id
    AND external_system = p_external_system
    AND external_id = p_external_event_id
  LIMIT 1;

  INSERT INTO ticket_revenue_ingestions (
    organization_id,
    event_link_id,
    event_id,
    external_system,
    external_event_id,
    ingestion_date,
    ticket_type,
    tickets_sold,
    tickets_comped,
    tickets_refunded,
    gross_revenue,
    net_revenue,
    fees,
    taxes,
    raw_data
  ) VALUES (
    p_org_id,
    v_link_id,
    p_event_id,
    p_external_system,
    p_external_event_id,
    p_ingestion_date,
    p_ticket_type,
    p_tickets_sold,
    p_tickets_comped,
    p_tickets_refunded,
    p_gross_revenue,
    p_net_revenue,
    p_fees,
    p_taxes,
    p_raw_data
  ) RETURNING id INTO v_id;

  IF v_link_id IS NOT NULL THEN
    UPDATE integration_event_links
    SET total_tickets_synced = total_tickets_synced + p_tickets_sold,
        revenue_synced = revenue_synced + p_net_revenue,
        last_sync_at = now()
    WHERE id = v_link_id;
  END IF;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_ingest_ticket_revenue TO authenticated;

-- ============================================================================
-- INTEGRATION PROVIDERS CATALOG (Master list of supported integrations)
-- ============================================================================

CREATE TYPE integration_category AS ENUM (
  'crm', 'project_management', 'ticketing', 'scheduling', 'payroll', 'accounting',
  'file_storage', 'communication', 'automation', 'social_media', 'email_marketing',
  'analytics', 'ecommerce', 'payment', 'hr', 'inventory', 'streaming', 'venue',
  'catering', 'transportation', 'security', 'custom'
);

CREATE TYPE integration_auth_type AS ENUM (
  'oauth2', 'api_key', 'basic_auth', 'bearer_token', 'webhook_secret', 'custom'
);

CREATE TABLE integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category integration_category NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  documentation_url TEXT,
  auth_type integration_auth_type NOT NULL DEFAULT 'oauth2',
  oauth_config JSONB DEFAULT '{}'::jsonb,
  api_base_url TEXT,
  supported_features TEXT[] DEFAULT '{}',
  required_scopes TEXT[] DEFAULT '{}',
  webhook_support BOOLEAN DEFAULT false,
  realtime_support BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  setup_instructions TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_providers_category ON integration_providers(category);
CREATE INDEX idx_providers_slug ON integration_providers(slug);
CREATE INDEX idx_providers_active ON integration_providers(is_active) WHERE is_active = true;

-- ============================================================================
-- ORGANIZATION INTEGRATIONS (Connected integrations per org)
-- ============================================================================

CREATE TABLE organization_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES integration_providers(id) ON DELETE CASCADE,
  display_name TEXT,
  status sync_status NOT NULL DEFAULT 'inactive',
  auth_type integration_auth_type NOT NULL,
  credentials_encrypted TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  api_key_encrypted TEXT,
  webhook_secret TEXT,
  custom_config JSONB DEFAULT '{}'::jsonb,
  field_mappings JSONB DEFAULT '{}'::jsonb,
  sync_settings JSONB DEFAULT '{}'::jsonb,
  last_auth_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  error_count INTEGER DEFAULT 0,
  connected_by UUID REFERENCES platform_users(id),
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, provider_id)
);

CREATE INDEX idx_org_integrations_org ON organization_integrations(organization_id);
CREATE INDEX idx_org_integrations_provider ON organization_integrations(provider_id);
CREATE INDEX idx_org_integrations_status ON organization_integrations(status);

-- ============================================================================
-- INTEGRATION WORKFORCE LINKS (Crew Scheduling & Payroll)
-- ============================================================================

CREATE TABLE integration_workforce_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES workforce_employees(id) ON DELETE CASCADE,
  person_id UUID REFERENCES legend_people(id) ON DELETE CASCADE,
  external_employee_id TEXT,
  external_user_id TEXT,
  sync_status sync_status NOT NULL DEFAULT 'active',
  sync_direction sync_direction DEFAULT 'bidirectional',
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  field_mappings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, integration_id, external_employee_id)
);

CREATE INDEX idx_workforce_links_org ON integration_workforce_links(organization_id);
CREATE INDEX idx_workforce_links_integration ON integration_workforce_links(integration_id);
CREATE INDEX idx_workforce_links_employee ON integration_workforce_links(employee_id);

-- ============================================================================
-- INTEGRATION SCHEDULE LINKS (Shift/Schedule Sync)
-- ============================================================================

CREATE TABLE integration_schedule_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES workforce_shifts(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  external_schedule_id TEXT,
  external_shift_id TEXT,
  sync_status sync_status NOT NULL DEFAULT 'active',
  sync_direction sync_direction DEFAULT 'bidirectional',
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, integration_id, external_shift_id)
);

CREATE INDEX idx_schedule_links_org ON integration_schedule_links(organization_id);
CREATE INDEX idx_schedule_links_shift ON integration_schedule_links(shift_id);
CREATE INDEX idx_schedule_links_event ON integration_schedule_links(event_id);

-- ============================================================================
-- INTEGRATION PAYROLL LINKS (Payroll/Time Sync)
-- ============================================================================

CREATE TABLE integration_payroll_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  time_entry_id UUID REFERENCES workforce_time_entries(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES workforce_employees(id) ON DELETE CASCADE,
  external_timecard_id TEXT,
  external_payroll_id TEXT,
  pay_period_start DATE,
  pay_period_end DATE,
  hours_synced NUMERIC(10,2),
  amount_synced NUMERIC(12,2),
  sync_status sync_status NOT NULL DEFAULT 'pending',
  sync_direction sync_direction DEFAULT 'outbound',
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payroll_links_org ON integration_payroll_links(organization_id);
CREATE INDEX idx_payroll_links_employee ON integration_payroll_links(employee_id);
CREATE INDEX idx_payroll_links_period ON integration_payroll_links(pay_period_start, pay_period_end);

-- ============================================================================
-- INTEGRATION FILE LINKS (File Storage Sync)
-- ============================================================================

CREATE TABLE integration_file_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  local_file_path TEXT,
  local_file_name TEXT,
  local_file_size BIGINT,
  local_mime_type TEXT,
  external_file_id TEXT NOT NULL,
  external_file_path TEXT,
  external_file_url TEXT,
  external_folder_id TEXT,
  sync_status sync_status NOT NULL DEFAULT 'synced',
  sync_direction sync_direction DEFAULT 'bidirectional',
  last_sync_at TIMESTAMPTZ DEFAULT now(),
  version INTEGER DEFAULT 1,
  checksum TEXT,
  sync_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, integration_id, external_file_id)
);

CREATE INDEX idx_file_links_org ON integration_file_links(organization_id);
CREATE INDEX idx_file_links_entity ON integration_file_links(entity_type, entity_id);
CREATE INDEX idx_file_links_external ON integration_file_links(integration_id, external_file_id);

-- ============================================================================
-- INTEGRATION COMMUNICATION CHANNELS (Slack, Teams, Discord)
-- ============================================================================

CREATE TABLE integration_communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('channel', 'group', 'dm', 'thread')),
  channel_name TEXT,
  external_channel_id TEXT NOT NULL,
  external_workspace_id TEXT,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  is_default BOOLEAN DEFAULT false,
  notification_types TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, integration_id, external_channel_id)
);

CREATE INDEX idx_comm_channels_org ON integration_communication_channels(organization_id);
CREATE INDEX idx_comm_channels_entity ON integration_communication_channels(linked_entity_type, linked_entity_id);
CREATE INDEX idx_comm_channels_default ON integration_communication_channels(organization_id, is_default) WHERE is_default = true;

-- ============================================================================
-- INTEGRATION MESSAGE LOG (Communication History)
-- ============================================================================

CREATE TABLE integration_message_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES integration_communication_channels(id) ON DELETE SET NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'rich', 'file', 'notification', 'alert')),
  external_message_id TEXT,
  external_thread_id TEXT,
  content TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  sender_type TEXT CHECK (sender_type IN ('user', 'bot', 'system')),
  sender_id UUID REFERENCES platform_users(id),
  external_sender_id TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  status TEXT DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_log_org ON integration_message_log(organization_id, sent_at DESC);
CREATE INDEX idx_message_log_channel ON integration_message_log(channel_id);
CREATE INDEX idx_message_log_entity ON integration_message_log(related_entity_type, related_entity_id);

-- ============================================================================
-- INTEGRATION AUTOMATION WORKFLOWS (Zapier, Make, n8n)
-- ============================================================================

CREATE TABLE integration_automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  external_workflow_id TEXT,
  external_workflow_url TEXT,
  trigger_type TEXT NOT NULL,
  trigger_entity_type TEXT,
  trigger_conditions JSONB DEFAULT '{}'::jsonb,
  action_config JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_automation_workflows_org ON integration_automation_workflows(organization_id);
CREATE INDEX idx_automation_workflows_trigger ON integration_automation_workflows(trigger_type, trigger_entity_type);
CREATE INDEX idx_automation_workflows_active ON integration_automation_workflows(is_active) WHERE is_active = true;

-- ============================================================================
-- INTEGRATION SOCIAL ACCOUNTS
-- ============================================================================

CREATE TABLE integration_social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  account_type TEXT DEFAULT 'page' CHECK (account_type IN ('page', 'profile', 'group', 'channel')),
  account_name TEXT,
  account_handle TEXT,
  external_account_id TEXT NOT NULL,
  external_page_id TEXT,
  profile_url TEXT,
  profile_image_url TEXT,
  follower_count INTEGER,
  is_verified BOOLEAN DEFAULT false,
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_post_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, integration_id, external_account_id)
);

CREATE INDEX idx_social_accounts_org ON integration_social_accounts(organization_id);
CREATE INDEX idx_social_accounts_platform ON integration_social_accounts(platform);

-- ============================================================================
-- INTEGRATION SOCIAL POSTS (Scheduled & Published)
-- ============================================================================

CREATE TABLE integration_social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES integration_social_accounts(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  post_type TEXT DEFAULT 'post' CHECK (post_type IN ('post', 'story', 'reel', 'video', 'event', 'poll')),
  content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  link_url TEXT,
  external_post_id TEXT,
  external_post_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'deleted')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  engagement_likes INTEGER DEFAULT 0,
  engagement_comments INTEGER DEFAULT 0,
  engagement_shares INTEGER DEFAULT 0,
  engagement_views INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  error_message TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_social_posts_org ON integration_social_posts(organization_id, created_at DESC);
CREATE INDEX idx_social_posts_account ON integration_social_posts(account_id);
CREATE INDEX idx_social_posts_status ON integration_social_posts(status);
CREATE INDEX idx_social_posts_scheduled ON integration_social_posts(scheduled_at) WHERE status = 'scheduled';

-- ============================================================================
-- INTEGRATION ACCOUNTING LINKS (QuickBooks, Xero, FreshBooks)
-- ============================================================================

CREATE TABLE integration_accounting_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('invoice', 'bill', 'expense', 'payment', 'customer', 'vendor', 'account', 'journal')),
  local_entity_id UUID NOT NULL,
  external_entity_id TEXT NOT NULL,
  external_entity_number TEXT,
  sync_status sync_status NOT NULL DEFAULT 'synced',
  sync_direction sync_direction DEFAULT 'bidirectional',
  last_sync_at TIMESTAMPTZ DEFAULT now(),
  local_updated_at TIMESTAMPTZ,
  external_updated_at TIMESTAMPTZ,
  sync_error TEXT,
  field_mappings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, integration_id, entity_type, external_entity_id)
);

CREATE INDEX idx_accounting_links_org ON integration_accounting_links(organization_id);
CREATE INDEX idx_accounting_links_entity ON integration_accounting_links(entity_type, local_entity_id);
CREATE INDEX idx_accounting_links_external ON integration_accounting_links(integration_id, external_entity_id);

-- ============================================================================
-- INTEGRATION EMAIL MARKETING (Mailchimp, Constant Contact, SendGrid)
-- ============================================================================

CREATE TABLE integration_email_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  list_name TEXT NOT NULL,
  external_list_id TEXT NOT NULL,
  subscriber_count INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  sync_contacts BOOLEAN DEFAULT true,
  sync_events BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, integration_id, external_list_id)
);

CREATE INDEX idx_email_lists_org ON integration_email_lists(organization_id);

-- ============================================================================
-- INTEGRATION CONTACT SYNC (CRM/Contact Sync)
-- ============================================================================

CREATE TABLE integration_contact_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  person_id UUID REFERENCES legend_people(id) ON DELETE CASCADE,
  external_contact_id TEXT NOT NULL,
  external_contact_email TEXT,
  sync_status sync_status NOT NULL DEFAULT 'synced',
  sync_direction sync_direction DEFAULT 'bidirectional',
  last_sync_at TIMESTAMPTZ DEFAULT now(),
  sync_error TEXT,
  field_mappings JSONB DEFAULT '{}'::jsonb,
  tags_synced TEXT[] DEFAULT '{}',
  lists_synced TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, integration_id, external_contact_id)
);

CREATE INDEX idx_contact_links_org ON integration_contact_links(organization_id);
CREATE INDEX idx_contact_links_contact ON integration_contact_links(contact_id);
CREATE INDEX idx_contact_links_person ON integration_contact_links(person_id);

-- ============================================================================
-- INTEGRATION PAYMENT LINKS (Stripe, Square, PayPal)
-- ============================================================================

CREATE TABLE integration_payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('order', 'invoice', 'subscription', 'refund', 'payout')),
  local_entity_id UUID NOT NULL,
  external_payment_id TEXT,
  external_customer_id TEXT,
  external_invoice_id TEXT,
  payment_method TEXT,
  amount NUMERIC(12,2),
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled')),
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  fee_amount NUMERIC(10,2),
  net_amount NUMERIC(12,2),
  receipt_url TEXT,
  sync_status sync_status NOT NULL DEFAULT 'synced',
  last_sync_at TIMESTAMPTZ DEFAULT now(),
  sync_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_links_org ON integration_payment_links(organization_id);
CREATE INDEX idx_payment_links_entity ON integration_payment_links(entity_type, local_entity_id);
CREATE INDEX idx_payment_links_external ON integration_payment_links(integration_id, external_payment_id);

-- ============================================================================
-- INTEGRATION STREAMING LINKS (YouTube, Twitch, Vimeo)
-- ============================================================================

CREATE TABLE integration_streaming_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  stream_type TEXT DEFAULT 'live' CHECK (stream_type IN ('live', 'vod', 'premiere', 'simulcast')),
  stream_title TEXT,
  stream_description TEXT,
  external_stream_id TEXT,
  external_broadcast_id TEXT,
  external_stream_url TEXT,
  embed_url TEXT,
  rtmp_url TEXT,
  stream_key_encrypted TEXT,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'ready', 'live', 'ended', 'failed')),
  scheduled_start TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  viewer_count_peak INTEGER DEFAULT 0,
  viewer_count_average INTEGER DEFAULT 0,
  chat_enabled BOOLEAN DEFAULT true,
  recording_enabled BOOLEAN DEFAULT true,
  recording_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_streaming_links_org ON integration_streaming_links(organization_id);
CREATE INDEX idx_streaming_links_event ON integration_streaming_links(event_id);
CREATE INDEX idx_streaming_links_status ON integration_streaming_links(status);

-- ============================================================================
-- INTEGRATION VENUE/BOOKING LINKS
-- ============================================================================

CREATE TABLE integration_venue_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES legend_places(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  external_venue_id TEXT,
  external_booking_id TEXT,
  external_contract_id TEXT,
  booking_status TEXT DEFAULT 'inquiry' CHECK (booking_status IN ('inquiry', 'hold', 'confirmed', 'cancelled')),
  booking_start TIMESTAMPTZ,
  booking_end TIMESTAMPTZ,
  spaces_booked TEXT[] DEFAULT '{}',
  catering_included BOOLEAN DEFAULT false,
  total_cost NUMERIC(12,2),
  deposit_amount NUMERIC(10,2),
  deposit_paid BOOLEAN DEFAULT false,
  contract_signed BOOLEAN DEFAULT false,
  sync_status sync_status NOT NULL DEFAULT 'active',
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_venue_links_org ON integration_venue_links(organization_id);
CREATE INDEX idx_venue_links_venue ON integration_venue_links(venue_id);
CREATE INDEX idx_venue_links_event ON integration_venue_links(event_id);

-- ============================================================================
-- INTEGRATION TRANSPORTATION LINKS
-- ============================================================================

CREATE TABLE integration_transportation_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES organization_integrations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES legend_events(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  transport_type TEXT NOT NULL CHECK (transport_type IN ('ground', 'air', 'rail', 'shuttle', 'rideshare')),
  external_booking_id TEXT,
  external_confirmation TEXT,
  pickup_location TEXT,
  dropoff_location TEXT,
  pickup_time TIMESTAMPTZ,
  passenger_count INTEGER,
  vehicle_type TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  status TEXT DEFAULT 'booked' CHECK (status IN ('requested', 'booked', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  total_cost NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  tracking_url TEXT,
  sync_status sync_status NOT NULL DEFAULT 'active',
  last_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transport_links_org ON integration_transportation_links(organization_id);
CREATE INDEX idx_transport_links_event ON integration_transportation_links(event_id);
CREATE INDEX idx_transport_links_pickup ON integration_transportation_links(pickup_time);

-- ============================================================================
-- INTEGRATION API LOGS (Detailed API Call Logging)
-- ============================================================================

CREATE TABLE integration_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES organization_integrations(id) ON DELETE SET NULL,
  provider_slug TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  method TEXT,
  endpoint TEXT,
  request_headers JSONB,
  request_body JSONB,
  response_status INTEGER,
  response_headers JSONB,
  response_body JSONB,
  duration_ms INTEGER,
  error_message TEXT,
  retry_of UUID REFERENCES integration_api_logs(id),
  correlation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_logs_org ON integration_api_logs(organization_id, created_at DESC);
CREATE INDEX idx_api_logs_integration ON integration_api_logs(integration_id, created_at DESC);
CREATE INDEX idx_api_logs_correlation ON integration_api_logs(correlation_id);
CREATE INDEX idx_api_logs_errors ON integration_api_logs(response_status) WHERE response_status >= 400;

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================

ALTER TABLE integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_workforce_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_schedule_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_payroll_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_file_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_message_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_accounting_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_email_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_contact_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_streaming_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_venue_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_transportation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_api_logs ENABLE ROW LEVEL SECURITY;

-- Providers (read for all authenticated)
CREATE POLICY providers_select ON integration_providers FOR SELECT USING (true);
CREATE POLICY providers_manage ON integration_providers FOR ALL USING (role_in('LEGEND_SUPER_ADMIN'));

-- Organization Integrations
CREATE POLICY org_integrations_select ON organization_integrations FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY org_integrations_manage ON organization_integrations FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Workforce Links
CREATE POLICY workforce_links_select ON integration_workforce_links FOR SELECT USING (org_matches(organization_id));
CREATE POLICY workforce_links_manage ON integration_workforce_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN'));

-- Schedule Links
CREATE POLICY schedule_links_select ON integration_schedule_links FOR SELECT USING (org_matches(organization_id));
CREATE POLICY schedule_links_manage ON integration_schedule_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Payroll Links
CREATE POLICY payroll_links_select ON integration_payroll_links FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY payroll_links_manage ON integration_payroll_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- File Links
CREATE POLICY file_links_select ON integration_file_links FOR SELECT USING (org_matches(organization_id));
CREATE POLICY file_links_manage ON integration_file_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Communication Channels
CREATE POLICY comm_channels_select ON integration_communication_channels FOR SELECT USING (org_matches(organization_id));
CREATE POLICY comm_channels_manage ON integration_communication_channels FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Message Log
CREATE POLICY message_log_select ON integration_message_log FOR SELECT USING (org_matches(organization_id));
CREATE POLICY message_log_insert ON integration_message_log FOR INSERT WITH CHECK (org_matches(organization_id));

-- Automation Workflows
CREATE POLICY automation_workflows_select ON integration_automation_workflows FOR SELECT USING (org_matches(organization_id));
CREATE POLICY automation_workflows_manage ON integration_automation_workflows FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Social Accounts
CREATE POLICY social_accounts_select ON integration_social_accounts FOR SELECT USING (org_matches(organization_id));
CREATE POLICY social_accounts_manage ON integration_social_accounts FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Social Posts
CREATE POLICY social_posts_select ON integration_social_posts FOR SELECT USING (org_matches(organization_id));
CREATE POLICY social_posts_manage ON integration_social_posts FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Accounting Links
CREATE POLICY accounting_links_select ON integration_accounting_links FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY accounting_links_manage ON integration_accounting_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Email Lists
CREATE POLICY email_lists_select ON integration_email_lists FOR SELECT USING (org_matches(organization_id));
CREATE POLICY email_lists_manage ON integration_email_lists FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Contact Links
CREATE POLICY contact_links_select ON integration_contact_links FOR SELECT USING (org_matches(organization_id));
CREATE POLICY contact_links_manage ON integration_contact_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Payment Links
CREATE POLICY payment_links_select ON integration_payment_links FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY payment_links_manage ON integration_payment_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'FINANCE_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Streaming Links
CREATE POLICY streaming_links_select ON integration_streaming_links FOR SELECT USING (org_matches(organization_id));
CREATE POLICY streaming_links_manage ON integration_streaming_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Venue Links
CREATE POLICY venue_links_select ON integration_venue_links FOR SELECT USING (org_matches(organization_id));
CREATE POLICY venue_links_manage ON integration_venue_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Transportation Links
CREATE POLICY transport_links_select ON integration_transportation_links FOR SELECT USING (org_matches(organization_id));
CREATE POLICY transport_links_manage ON integration_transportation_links FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- API Logs
CREATE POLICY api_logs_select ON integration_api_logs FOR SELECT USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
CREATE POLICY api_logs_insert ON integration_api_logs FOR INSERT WITH CHECK (org_matches(organization_id));

-- ============================================================================
-- GRANTS FOR NEW TABLES
-- ============================================================================

GRANT SELECT ON integration_providers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON organization_integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_workforce_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_schedule_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_payroll_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_file_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_communication_channels TO authenticated;
GRANT SELECT, INSERT ON integration_message_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_automation_workflows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_social_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_social_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_accounting_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_email_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_contact_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_payment_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_streaming_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_venue_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON integration_transportation_links TO authenticated;
GRANT SELECT, INSERT ON integration_api_logs TO authenticated;

-- ============================================================================
-- TRIGGERS FOR NEW TABLES
-- ============================================================================

CREATE TRIGGER providers_updated_at BEFORE UPDATE ON integration_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER org_integrations_updated_at BEFORE UPDATE ON organization_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER workforce_links_updated_at BEFORE UPDATE ON integration_workforce_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER schedule_links_updated_at BEFORE UPDATE ON integration_schedule_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER payroll_links_updated_at BEFORE UPDATE ON integration_payroll_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER file_links_updated_at BEFORE UPDATE ON integration_file_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER comm_channels_updated_at BEFORE UPDATE ON integration_communication_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER automation_workflows_updated_at BEFORE UPDATE ON integration_automation_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER social_accounts_updated_at BEFORE UPDATE ON integration_social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER social_posts_updated_at BEFORE UPDATE ON integration_social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER accounting_links_updated_at BEFORE UPDATE ON integration_accounting_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER email_lists_updated_at BEFORE UPDATE ON integration_email_lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER contact_links_updated_at BEFORE UPDATE ON integration_contact_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER payment_links_updated_at BEFORE UPDATE ON integration_payment_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER streaming_links_updated_at BEFORE UPDATE ON integration_streaming_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER venue_links_updated_at BEFORE UPDATE ON integration_venue_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER transport_links_updated_at BEFORE UPDATE ON integration_transportation_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED INTEGRATION PROVIDERS CATALOG
-- ============================================================================

INSERT INTO integration_providers (slug, name, description, category, auth_type, webhook_support, realtime_support, supported_features) VALUES
-- CRM
('salesforce', 'Salesforce', 'Enterprise CRM platform', 'crm', 'oauth2', true, true, ARRAY['contacts', 'deals', 'accounts', 'tasks', 'reports']),
('hubspot', 'HubSpot', 'Inbound marketing and CRM', 'crm', 'oauth2', true, true, ARRAY['contacts', 'deals', 'companies', 'tickets', 'marketing']),
('pipedrive', 'Pipedrive', 'Sales CRM for small teams', 'crm', 'oauth2', true, false, ARRAY['contacts', 'deals', 'activities', 'products']),
('zoho_crm', 'Zoho CRM', 'Cloud-based CRM', 'crm', 'oauth2', true, false, ARRAY['contacts', 'deals', 'accounts', 'campaigns']),
('copper', 'Copper', 'Google Workspace CRM', 'crm', 'oauth2', true, false, ARRAY['contacts', 'deals', 'companies', 'tasks']),

-- Project Management
('asana', 'Asana', 'Work management platform', 'project_management', 'oauth2', true, true, ARRAY['projects', 'tasks', 'teams', 'portfolios']),
('monday', 'Monday.com', 'Work OS platform', 'project_management', 'oauth2', true, true, ARRAY['boards', 'items', 'updates', 'files']),
('trello', 'Trello', 'Visual project management', 'project_management', 'oauth2', true, true, ARRAY['boards', 'cards', 'lists', 'checklists']),
('jira', 'Jira', 'Issue and project tracking', 'project_management', 'oauth2', true, true, ARRAY['issues', 'projects', 'sprints', 'boards']),
('basecamp', 'Basecamp', 'Project management and team communication', 'project_management', 'oauth2', true, false, ARRAY['projects', 'todos', 'messages', 'files']),
('notion', 'Notion', 'All-in-one workspace', 'project_management', 'oauth2', false, false, ARRAY['pages', 'databases', 'blocks']),
('clickup', 'ClickUp', 'Productivity platform', 'project_management', 'oauth2', true, true, ARRAY['tasks', 'lists', 'folders', 'goals']),
('wrike', 'Wrike', 'Collaborative work management', 'project_management', 'oauth2', true, false, ARRAY['projects', 'tasks', 'folders', 'timelog']),
('smartsheet', 'Smartsheet', 'Enterprise work management', 'project_management', 'oauth2', true, false, ARRAY['sheets', 'rows', 'columns', 'reports']),
('airtable', 'Airtable', 'Spreadsheet-database hybrid', 'project_management', 'oauth2', true, true, ARRAY['bases', 'tables', 'records', 'views']),

-- Ticketing
('eventbrite', 'Eventbrite', 'Event ticketing platform', 'ticketing', 'oauth2', true, false, ARRAY['events', 'tickets', 'orders', 'attendees']),
('ticketmaster', 'Ticketmaster', 'Live entertainment ticketing', 'ticketing', 'api_key', true, false, ARRAY['events', 'tickets', 'venues', 'sales']),
('dice', 'DICE', 'Music event ticketing', 'ticketing', 'oauth2', true, false, ARRAY['events', 'tickets', 'fans', 'analytics']),
('seetickets', 'See Tickets', 'Event ticketing solution', 'ticketing', 'api_key', true, false, ARRAY['events', 'tickets', 'orders']),
('universe', 'Universe', 'Event ticketing and RSVP', 'ticketing', 'oauth2', true, false, ARRAY['events', 'tickets', 'guests', 'check-in']),
('tixr', 'Tixr', 'Premium event ticketing', 'ticketing', 'api_key', true, false, ARRAY['events', 'tickets', 'tables', 'vip']),
('shotgun', 'Shotgun', 'Electronic music ticketing', 'ticketing', 'oauth2', true, false, ARRAY['events', 'tickets', 'artists']),
('resident_advisor', 'Resident Advisor', 'Electronic music platform', 'ticketing', 'api_key', true, false, ARRAY['events', 'tickets', 'artists', 'venues']),

-- Crew Scheduling
('homebase', 'Homebase', 'Employee scheduling and time tracking', 'scheduling', 'oauth2', true, false, ARRAY['schedules', 'timesheets', 'employees', 'messaging']),
('deputy', 'Deputy', 'Workforce management', 'scheduling', 'oauth2', true, true, ARRAY['schedules', 'timesheets', 'employees', 'tasks']),
('when_i_work', 'When I Work', 'Employee scheduling', 'scheduling', 'oauth2', true, false, ARRAY['schedules', 'shifts', 'employees', 'messaging']),
('sling', 'Sling', 'Shift scheduling', 'scheduling', 'api_key', true, false, ARRAY['schedules', 'shifts', 'employees', 'labor_costs']),
('7shifts', '7shifts', 'Restaurant scheduling', 'scheduling', 'oauth2', true, false, ARRAY['schedules', 'shifts', 'employees', 'labor']),
('shiftboard', 'Shiftboard', 'Workforce scheduling', 'scheduling', 'api_key', true, false, ARRAY['schedules', 'shifts', 'employees', 'credentials']),
('connecteam', 'Connecteam', 'All-in-one employee app', 'scheduling', 'api_key', true, false, ARRAY['schedules', 'timeclock', 'tasks', 'communication']),
('planday', 'Planday', 'Workforce management', 'scheduling', 'oauth2', true, false, ARRAY['schedules', 'shifts', 'employees', 'payroll']),
('humanity', 'Humanity', 'Employee scheduling', 'scheduling', 'oauth2', true, false, ARRAY['schedules', 'shifts', 'employees', 'leave']),

-- Payroll
('gusto', 'Gusto', 'Payroll and HR platform', 'payroll', 'oauth2', true, false, ARRAY['payroll', 'employees', 'benefits', 'taxes']),
('adp', 'ADP', 'HR and payroll services', 'payroll', 'oauth2', true, false, ARRAY['payroll', 'employees', 'time', 'benefits']),
('paychex', 'Paychex', 'Payroll and HR solutions', 'payroll', 'oauth2', true, false, ARRAY['payroll', 'employees', 'time', 'hr']),
('quickbooks_payroll', 'QuickBooks Payroll', 'Small business payroll', 'payroll', 'oauth2', true, false, ARRAY['payroll', 'employees', 'taxes']),
('rippling', 'Rippling', 'HR, IT, and Finance', 'payroll', 'oauth2', true, false, ARRAY['payroll', 'employees', 'benefits', 'devices']),
('paylocity', 'Paylocity', 'Payroll and HCM', 'payroll', 'oauth2', true, false, ARRAY['payroll', 'employees', 'time', 'talent']),
('square_payroll', 'Square Payroll', 'Payroll for small business', 'payroll', 'oauth2', true, false, ARRAY['payroll', 'employees', 'contractors']),
('onpay', 'OnPay', 'Payroll and HR', 'payroll', 'oauth2', true, false, ARRAY['payroll', 'employees', 'benefits']),

-- Accounting
('quickbooks', 'QuickBooks Online', 'Small business accounting', 'accounting', 'oauth2', true, false, ARRAY['invoices', 'expenses', 'customers', 'vendors', 'reports']),
('xero', 'Xero', 'Cloud accounting software', 'accounting', 'oauth2', true, false, ARRAY['invoices', 'bills', 'contacts', 'bank', 'reports']),
('freshbooks', 'FreshBooks', 'Invoicing and accounting', 'accounting', 'oauth2', true, false, ARRAY['invoices', 'expenses', 'clients', 'time']),
('wave', 'Wave', 'Free accounting software', 'accounting', 'oauth2', true, false, ARRAY['invoices', 'receipts', 'reports']),
('sage', 'Sage', 'Business management software', 'accounting', 'oauth2', true, false, ARRAY['invoices', 'expenses', 'banking', 'reports']),
('netsuite', 'NetSuite', 'Enterprise ERP', 'accounting', 'oauth2', true, false, ARRAY['financials', 'inventory', 'orders', 'crm']),
('zoho_books', 'Zoho Books', 'Online accounting', 'accounting', 'oauth2', true, false, ARRAY['invoices', 'expenses', 'banking', 'inventory']),

-- File Storage
('dropbox', 'Dropbox', 'Cloud file storage', 'file_storage', 'oauth2', true, false, ARRAY['files', 'folders', 'sharing', 'sync']),
('google_drive', 'Google Drive', 'Cloud storage and collaboration', 'file_storage', 'oauth2', true, true, ARRAY['files', 'folders', 'docs', 'sharing']),
('onedrive', 'OneDrive', 'Microsoft cloud storage', 'file_storage', 'oauth2', true, true, ARRAY['files', 'folders', 'sharing', 'sync']),
('box', 'Box', 'Enterprise content management', 'file_storage', 'oauth2', true, true, ARRAY['files', 'folders', 'collaboration', 'workflows']),
('sharepoint', 'SharePoint', 'Microsoft collaboration platform', 'file_storage', 'oauth2', true, true, ARRAY['files', 'sites', 'lists', 'pages']),
('frame_io', 'Frame.io', 'Video collaboration platform', 'file_storage', 'oauth2', true, true, ARRAY['videos', 'comments', 'approvals', 'versions']),
('wetransfer', 'WeTransfer', 'File transfer service', 'file_storage', 'api_key', false, false, ARRAY['transfers', 'files']),

-- Communication
('slack', 'Slack', 'Team messaging platform', 'communication', 'oauth2', true, true, ARRAY['messages', 'channels', 'files', 'reactions']),
('microsoft_teams', 'Microsoft Teams', 'Team collaboration hub', 'communication', 'oauth2', true, true, ARRAY['messages', 'channels', 'meetings', 'files']),
('discord', 'Discord', 'Community communication', 'communication', 'oauth2', true, true, ARRAY['messages', 'channels', 'voice', 'roles']),
('zoom', 'Zoom', 'Video conferencing', 'communication', 'oauth2', true, true, ARRAY['meetings', 'webinars', 'recordings', 'chat']),
('google_meet', 'Google Meet', 'Video meetings', 'communication', 'oauth2', true, false, ARRAY['meetings', 'recordings']),
('twilio', 'Twilio', 'Communication APIs', 'communication', 'api_key', true, true, ARRAY['sms', 'voice', 'video', 'chat']),
('intercom', 'Intercom', 'Customer messaging', 'communication', 'oauth2', true, true, ARRAY['conversations', 'contacts', 'articles']),
('whatsapp_business', 'WhatsApp Business', 'Business messaging', 'communication', 'api_key', true, true, ARRAY['messages', 'templates', 'contacts']),
('telegram', 'Telegram', 'Messaging platform', 'communication', 'api_key', true, true, ARRAY['messages', 'channels', 'bots']),

-- Automation
('zapier', 'Zapier', 'Workflow automation', 'automation', 'oauth2', true, false, ARRAY['zaps', 'triggers', 'actions']),
('make', 'Make (Integromat)', 'Visual automation platform', 'automation', 'oauth2', true, false, ARRAY['scenarios', 'modules', 'webhooks']),
('n8n', 'n8n', 'Workflow automation tool', 'automation', 'api_key', true, false, ARRAY['workflows', 'nodes', 'webhooks']),
('workato', 'Workato', 'Enterprise automation', 'automation', 'oauth2', true, false, ARRAY['recipes', 'connections', 'triggers']),
('tray_io', 'Tray.io', 'General automation platform', 'automation', 'oauth2', true, false, ARRAY['workflows', 'connectors']),
('power_automate', 'Power Automate', 'Microsoft automation', 'automation', 'oauth2', true, true, ARRAY['flows', 'triggers', 'actions']),
('ifttt', 'IFTTT', 'Simple automation', 'automation', 'oauth2', true, false, ARRAY['applets', 'triggers', 'actions']),

-- Social Media
('facebook', 'Facebook/Meta', 'Social networking', 'social_media', 'oauth2', true, true, ARRAY['pages', 'posts', 'events', 'ads', 'insights']),
('instagram', 'Instagram', 'Photo and video sharing', 'social_media', 'oauth2', true, true, ARRAY['posts', 'stories', 'reels', 'insights']),
('twitter', 'X (Twitter)', 'Microblogging platform', 'social_media', 'oauth2', true, true, ARRAY['tweets', 'followers', 'analytics']),
('linkedin', 'LinkedIn', 'Professional networking', 'social_media', 'oauth2', true, false, ARRAY['posts', 'pages', 'ads', 'analytics']),
('tiktok', 'TikTok', 'Short-form video', 'social_media', 'oauth2', true, false, ARRAY['videos', 'analytics', 'ads']),
('youtube', 'YouTube', 'Video sharing platform', 'social_media', 'oauth2', true, true, ARRAY['videos', 'channels', 'playlists', 'analytics', 'live']),
('pinterest', 'Pinterest', 'Visual discovery', 'social_media', 'oauth2', true, false, ARRAY['pins', 'boards', 'analytics']),
('snapchat', 'Snapchat', 'Multimedia messaging', 'social_media', 'oauth2', true, false, ARRAY['stories', 'ads', 'analytics']),
('threads', 'Threads', 'Text-based social app', 'social_media', 'oauth2', true, false, ARRAY['posts', 'replies']),
('bluesky', 'Bluesky', 'Decentralized social network', 'social_media', 'api_key', true, false, ARRAY['posts', 'follows']),

-- Email Marketing
('mailchimp', 'Mailchimp', 'Email marketing platform', 'email_marketing', 'oauth2', true, false, ARRAY['campaigns', 'lists', 'templates', 'analytics']),
('constant_contact', 'Constant Contact', 'Email marketing', 'email_marketing', 'oauth2', true, false, ARRAY['campaigns', 'contacts', 'events']),
('sendgrid', 'SendGrid', 'Email delivery service', 'email_marketing', 'api_key', true, false, ARRAY['emails', 'templates', 'analytics']),
('klaviyo', 'Klaviyo', 'E-commerce email marketing', 'email_marketing', 'api_key', true, false, ARRAY['campaigns', 'flows', 'segments']),
('mailerlite', 'MailerLite', 'Email marketing', 'email_marketing', 'api_key', true, false, ARRAY['campaigns', 'subscribers', 'automations']),
('convertkit', 'ConvertKit', 'Creator email marketing', 'email_marketing', 'api_key', true, false, ARRAY['broadcasts', 'sequences', 'subscribers']),
('activecampaign', 'ActiveCampaign', 'Marketing automation', 'email_marketing', 'api_key', true, false, ARRAY['campaigns', 'automations', 'contacts', 'deals']),

-- Analytics
('google_analytics', 'Google Analytics', 'Web analytics', 'analytics', 'oauth2', false, false, ARRAY['reports', 'events', 'conversions']),
('mixpanel', 'Mixpanel', 'Product analytics', 'analytics', 'api_key', false, false, ARRAY['events', 'funnels', 'cohorts']),
('amplitude', 'Amplitude', 'Product analytics', 'analytics', 'api_key', false, false, ARRAY['events', 'charts', 'cohorts']),
('segment', 'Segment', 'Customer data platform', 'analytics', 'api_key', true, false, ARRAY['sources', 'destinations', 'events']),
('heap', 'Heap', 'Digital insights platform', 'analytics', 'api_key', false, false, ARRAY['events', 'funnels', 'retention']),
('hotjar', 'Hotjar', 'Behavior analytics', 'analytics', 'api_key', false, false, ARRAY['heatmaps', 'recordings', 'surveys']),

-- E-commerce
('shopify', 'Shopify', 'E-commerce platform', 'ecommerce', 'oauth2', true, true, ARRAY['products', 'orders', 'customers', 'inventory']),
('woocommerce', 'WooCommerce', 'WordPress e-commerce', 'ecommerce', 'api_key', true, false, ARRAY['products', 'orders', 'customers']),
('bigcommerce', 'BigCommerce', 'E-commerce platform', 'ecommerce', 'oauth2', true, false, ARRAY['products', 'orders', 'customers']),
('squarespace', 'Squarespace', 'Website and e-commerce', 'ecommerce', 'oauth2', true, false, ARRAY['products', 'orders', 'inventory']),
('etsy', 'Etsy', 'Handmade marketplace', 'ecommerce', 'oauth2', true, false, ARRAY['listings', 'orders', 'receipts']),
('printful', 'Printful', 'Print-on-demand', 'ecommerce', 'api_key', true, false, ARRAY['products', 'orders', 'shipping']),

-- Payment
('stripe', 'Stripe', 'Payment processing', 'payment', 'api_key', true, true, ARRAY['payments', 'subscriptions', 'invoices', 'customers']),
('square', 'Square', 'Payment and POS', 'payment', 'oauth2', true, true, ARRAY['payments', 'orders', 'customers', 'inventory']),
('paypal', 'PayPal', 'Online payments', 'payment', 'oauth2', true, true, ARRAY['payments', 'invoices', 'subscriptions']),
('braintree', 'Braintree', 'Payment gateway', 'payment', 'api_key', true, false, ARRAY['payments', 'subscriptions', 'customers']),
('authorize_net', 'Authorize.Net', 'Payment gateway', 'payment', 'api_key', true, false, ARRAY['payments', 'subscriptions']),
('venmo', 'Venmo', 'Mobile payments', 'payment', 'oauth2', true, false, ARRAY['payments', 'requests']),

-- HR
('bamboohr', 'BambooHR', 'HR software', 'hr', 'api_key', true, false, ARRAY['employees', 'time_off', 'onboarding', 'reports']),
('workday', 'Workday', 'Enterprise HR', 'hr', 'oauth2', true, false, ARRAY['employees', 'payroll', 'benefits', 'talent']),
('namely', 'Namely', 'HR platform', 'hr', 'oauth2', true, false, ARRAY['employees', 'payroll', 'benefits', 'time']),
('zenefits', 'Zenefits', 'HR and benefits', 'hr', 'oauth2', true, false, ARRAY['employees', 'benefits', 'payroll', 'compliance']),
('lever', 'Lever', 'Recruiting software', 'hr', 'oauth2', true, false, ARRAY['candidates', 'jobs', 'interviews']),
('greenhouse', 'Greenhouse', 'Recruiting software', 'hr', 'oauth2', true, false, ARRAY['candidates', 'jobs', 'scorecards']),

-- Streaming
('twitch', 'Twitch', 'Live streaming platform', 'streaming', 'oauth2', true, true, ARRAY['streams', 'chat', 'clips', 'analytics']),
('vimeo', 'Vimeo', 'Video hosting', 'streaming', 'oauth2', true, false, ARRAY['videos', 'live', 'analytics']),
('streamyard', 'StreamYard', 'Live streaming studio', 'streaming', 'api_key', true, true, ARRAY['broadcasts', 'destinations']),
('restream', 'Restream', 'Multistreaming platform', 'streaming', 'oauth2', true, true, ARRAY['streams', 'chat', 'analytics']),
('obs_websocket', 'OBS WebSocket', 'Streaming software control', 'streaming', 'custom', false, true, ARRAY['scenes', 'sources', 'streaming']),

-- Venue
('tripleseat', 'Tripleseat', 'Event venue management', 'venue', 'api_key', true, false, ARRAY['events', 'leads', 'bookings', 'documents']),
('cvent', 'Cvent', 'Event management platform', 'venue', 'oauth2', true, false, ARRAY['events', 'venues', 'registrations']),
('eventtemple', 'Event Temple', 'Venue management', 'venue', 'api_key', true, false, ARRAY['bookings', 'leads', 'documents']),
('splacer', 'Splacer', 'Venue marketplace', 'venue', 'api_key', false, false, ARRAY['venues', 'bookings']),
('peerspace', 'Peerspace', 'Venue marketplace', 'venue', 'api_key', false, false, ARRAY['venues', 'bookings']),

-- Catering
('catertrax', 'CaterTrax', 'Catering management', 'catering', 'api_key', true, false, ARRAY['orders', 'menus', 'customers']),
('total_party_planner', 'Total Party Planner', 'Catering software', 'catering', 'api_key', false, false, ARRAY['events', 'proposals', 'invoices']),
('nowsta', 'Nowsta', 'Hospitality staffing', 'catering', 'api_key', true, false, ARRAY['shifts', 'staff', 'timesheets']),

-- Transportation
('uber_business', 'Uber for Business', 'Corporate transportation', 'transportation', 'oauth2', true, true, ARRAY['rides', 'receipts', 'reports']),
('lyft_business', 'Lyft Business', 'Corporate transportation', 'transportation', 'oauth2', true, true, ARRAY['rides', 'receipts', 'programs']),
('blacklane', 'Blacklane', 'Chauffeur service', 'transportation', 'api_key', true, false, ARRAY['rides', 'bookings']),
('groundlink', 'GroundLink', 'Ground transportation', 'transportation', 'api_key', true, false, ARRAY['rides', 'bookings', 'invoices']),
('flightaware', 'FlightAware', 'Flight tracking', 'transportation', 'api_key', false, true, ARRAY['flights', 'alerts', 'tracking']),

-- Security
('okta', 'Okta', 'Identity management', 'security', 'oauth2', true, false, ARRAY['users', 'groups', 'apps', 'logs']),
('auth0', 'Auth0', 'Identity platform', 'security', 'api_key', true, false, ARRAY['users', 'connections', 'logs']),
('onelogin', 'OneLogin', 'Identity management', 'security', 'oauth2', true, false, ARRAY['users', 'apps', 'events']);

-- ============================================================================
-- RPC FUNCTIONS FOR INTEGRATIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION rpc_list_integration_providers(
  p_category integration_category DEFAULT NULL,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  name TEXT,
  description TEXT,
  category integration_category,
  auth_type integration_auth_type,
  webhook_support BOOLEAN,
  realtime_support BOOLEAN,
  supported_features TEXT[],
  is_premium BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ip.id, ip.slug, ip.name, ip.description, ip.category, ip.auth_type,
    ip.webhook_support, ip.realtime_support, ip.supported_features, ip.is_premium
  FROM integration_providers ip
  WHERE ip.is_active = true
    AND (p_category IS NULL OR ip.category = p_category)
    AND (p_search IS NULL OR ip.name ILIKE '%' || p_search || '%' OR ip.description ILIKE '%' || p_search || '%')
  ORDER BY ip.category, ip.name;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_list_integration_providers TO authenticated;

CREATE OR REPLACE FUNCTION rpc_connect_integration(
  p_org_id UUID,
  p_provider_slug TEXT,
  p_display_name TEXT DEFAULT NULL,
  p_custom_config JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider_id UUID;
  v_auth_type integration_auth_type;
  v_integration_id UUID;
BEGIN
  IF NOT org_matches(p_org_id) OR NOT role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  SELECT id, auth_type INTO v_provider_id, v_auth_type
  FROM integration_providers
  WHERE slug = p_provider_slug AND is_active = true;

  IF v_provider_id IS NULL THEN
    RAISE EXCEPTION 'Integration provider not found: %', p_provider_slug;
  END IF;

  INSERT INTO organization_integrations (
    organization_id, provider_id, display_name, auth_type, custom_config, connected_by, connected_at
  ) VALUES (
    p_org_id, v_provider_id, COALESCE(p_display_name, p_provider_slug), v_auth_type, p_custom_config, current_platform_user_id(), now()
  )
  ON CONFLICT (organization_id, provider_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, organization_integrations.display_name),
    custom_config = EXCLUDED.custom_config,
    updated_at = now()
  RETURNING id INTO v_integration_id;

  RETURN v_integration_id;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_connect_integration TO authenticated;

CREATE OR REPLACE FUNCTION rpc_disconnect_integration(
  p_org_id UUID,
  p_integration_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT org_matches(p_org_id) OR NOT role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  UPDATE organization_integrations
  SET status = 'inactive',
      access_token_encrypted = NULL,
      refresh_token_encrypted = NULL,
      api_key_encrypted = NULL,
      updated_at = now()
  WHERE id = p_integration_id AND organization_id = p_org_id;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_disconnect_integration TO authenticated;

CREATE OR REPLACE FUNCTION rpc_get_org_integrations(
  p_org_id UUID,
  p_category integration_category DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  provider_slug TEXT,
  provider_name TEXT,
  display_name TEXT,
  category integration_category,
  status sync_status,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  connected_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT org_matches(p_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  RETURN QUERY
  SELECT 
    oi.id, ip.slug, ip.name, oi.display_name, ip.category, oi.status,
    oi.last_sync_at, oi.last_error, oi.connected_at
  FROM organization_integrations oi
  JOIN integration_providers ip ON ip.id = oi.provider_id
  WHERE oi.organization_id = p_org_id
    AND (p_category IS NULL OR ip.category = p_category)
  ORDER BY ip.category, ip.name;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_get_org_integrations TO authenticated;

CREATE OR REPLACE FUNCTION rpc_sync_workforce_to_external(
  p_org_id UUID,
  p_integration_id UUID,
  p_employee_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link_id UUID;
BEGIN
  IF NOT org_matches(p_org_id) OR NOT role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'WORKFORCE_MANAGER', 'LEGEND_SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  INSERT INTO integration_workforce_links (organization_id, integration_id, employee_id, sync_status, sync_direction)
  VALUES (p_org_id, p_integration_id, p_employee_id, 'pending', 'outbound')
  ON CONFLICT (organization_id, integration_id, external_employee_id) DO UPDATE SET
    sync_status = 'pending',
    updated_at = now()
  RETURNING id INTO v_link_id;

  PERFORM rpc_enqueue_sync_job(
    p_org_id, 'sync_employee', 'workforce_employee', p_employee_id,
    (SELECT ip.slug FROM organization_integrations oi JOIN integration_providers ip ON ip.id = oi.provider_id WHERE oi.id = p_integration_id),
    'outbound', jsonb_build_object('link_id', v_link_id)
  );

  RETURN v_link_id;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_sync_workforce_to_external TO authenticated;

CREATE OR REPLACE FUNCTION rpc_send_slack_notification(
  p_org_id UUID,
  p_channel_id UUID,
  p_message TEXT,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id UUID;
  v_integration_id UUID;
BEGIN
  IF NOT org_matches(p_org_id) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  SELECT integration_id INTO v_integration_id
  FROM integration_communication_channels
  WHERE id = p_channel_id AND organization_id = p_org_id;

  IF v_integration_id IS NULL THEN
    RAISE EXCEPTION 'Channel not found';
  END IF;

  INSERT INTO integration_message_log (
    organization_id, integration_id, channel_id, direction, message_type,
    content, sender_type, sender_id, related_entity_type, related_entity_id, status
  ) VALUES (
    p_org_id, v_integration_id, p_channel_id, 'outbound', 'notification',
    p_message, 'system', current_platform_user_id(), p_related_entity_type, p_related_entity_id, 'pending'
  ) RETURNING id INTO v_message_id;

  PERFORM rpc_enqueue_sync_job(
    p_org_id, 'send_message', 'message', v_message_id, 'slack', 'outbound',
    jsonb_build_object('channel_id', p_channel_id, 'message', p_message)
  );

  RETURN v_message_id;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_send_slack_notification TO authenticated;

CREATE OR REPLACE FUNCTION rpc_schedule_social_post(
  p_org_id UUID,
  p_account_id UUID,
  p_content TEXT,
  p_scheduled_at TIMESTAMPTZ,
  p_post_type TEXT DEFAULT 'post',
  p_media_urls TEXT[] DEFAULT '{}',
  p_hashtags TEXT[] DEFAULT '{}',
  p_event_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id UUID;
BEGIN
  IF NOT org_matches(p_org_id) OR NOT role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  INSERT INTO integration_social_posts (
    organization_id, account_id, event_id, post_type, content, media_urls,
    hashtags, status, scheduled_at, created_by
  ) VALUES (
    p_org_id, p_account_id, p_event_id, p_post_type, p_content, p_media_urls,
    p_hashtags, 'scheduled', p_scheduled_at, current_platform_user_id()
  ) RETURNING id INTO v_post_id;

  RETURN v_post_id;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_schedule_social_post TO authenticated;

CREATE OR REPLACE FUNCTION rpc_log_api_call(
  p_org_id UUID,
  p_integration_id UUID,
  p_direction TEXT,
  p_method TEXT,
  p_endpoint TEXT,
  p_request_body JSONB DEFAULT NULL,
  p_response_status INTEGER DEFAULT NULL,
  p_response_body JSONB DEFAULT NULL,
  p_duration_ms INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_correlation_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
  v_provider_slug TEXT;
BEGIN
  SELECT ip.slug INTO v_provider_slug
  FROM organization_integrations oi
  JOIN integration_providers ip ON ip.id = oi.provider_id
  WHERE oi.id = p_integration_id;

  INSERT INTO integration_api_logs (
    organization_id, integration_id, provider_slug, direction, method, endpoint,
    request_body, response_status, response_body, duration_ms, error_message, correlation_id
  ) VALUES (
    p_org_id, p_integration_id, v_provider_slug, p_direction, p_method, p_endpoint,
    p_request_body, p_response_status, p_response_body, p_duration_ms, p_error_message, p_correlation_id
  ) RETURNING id INTO v_log_id;

  IF p_response_status >= 400 THEN
    UPDATE organization_integrations
    SET error_count = error_count + 1,
        last_error = p_error_message,
        updated_at = now()
    WHERE id = p_integration_id;
  END IF;

  RETURN v_log_id;
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_log_api_call TO authenticated;
