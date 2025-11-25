-- 0055_webhooks_integrations.sql
-- Webhook and external integration support

-- Webhook configurations
CREATE TABLE IF NOT EXISTS webhook_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL, -- array of event types to trigger on
  headers jsonb DEFAULT '{}'::jsonb,
  secret text, -- for signature verification
  is_active boolean DEFAULT true,
  retry_count integer DEFAULT 3,
  timeout_seconds integer DEFAULT 30,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_triggered_at timestamptz,
  UNIQUE(organization_id, name)
);

-- Webhook delivery log
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_config_id uuid NOT NULL REFERENCES webhook_configs(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, sent, failed, retrying
  http_status integer,
  response_body text,
  error_message text,
  attempt_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  completed_at timestamptz
);

-- External integrations
CREATE TABLE IF NOT EXISTS external_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_type text NOT NULL, -- slack, teams, email, calendar, etc.
  name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  credentials jsonb, -- encrypted credentials
  is_active boolean DEFAULT true,
  sync_frequency text, -- hourly, daily, weekly, manual
  last_sync_at timestamptz,
  next_sync_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, integration_type, name)
);

-- Integration sync log
CREATE TABLE IF NOT EXISTS integration_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid NOT NULL REFERENCES external_integrations(id) ON DELETE CASCADE,
  sync_type text NOT NULL, -- import, export, sync
  status text NOT NULL DEFAULT 'in_progress', -- in_progress, completed, failed
  records_processed integer DEFAULT 0,
  records_succeeded integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_details jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_webhook_configs_org ON webhook_configs(organization_id);
CREATE INDEX idx_webhook_deliveries_config ON webhook_deliveries(webhook_config_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status, created_at);
CREATE INDEX idx_external_integrations_org ON external_integrations(organization_id);
CREATE INDEX idx_integration_sync_log_integration ON integration_sync_log(integration_id);

-- RLS policies
ALTER TABLE webhook_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY webhook_configs_manage ON webhook_configs
  FOR ALL USING (
    org_matches(organization_id) AND 
    role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY webhook_deliveries_view ON webhook_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM webhook_configs wc
      WHERE wc.id = webhook_deliveries.webhook_config_id
        AND org_matches(wc.organization_id)
        AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

CREATE POLICY external_integrations_manage ON external_integrations
  FOR ALL USING (
    org_matches(organization_id) AND 
    role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY integration_sync_log_view ON integration_sync_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM external_integrations ei
      WHERE ei.id = integration_sync_log.integration_id
        AND org_matches(ei.organization_id)
    )
  );

-- Function to queue webhook
CREATE OR REPLACE FUNCTION queue_webhook(
  p_org_id uuid,
  p_event_type text,
  p_payload jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_webhook record;
BEGIN
  FOR v_webhook IN
    SELECT id FROM webhook_configs
    WHERE organization_id = p_org_id
      AND is_active = true
      AND p_event_type = ANY(events)
  LOOP
    INSERT INTO webhook_deliveries (webhook_config_id, event_type, payload)
    VALUES (v_webhook.id, p_event_type, p_payload);
  END LOOP;
END;
$$;

-- Trigger webhook on project status change
CREATE OR REPLACE FUNCTION trigger_project_webhook()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM queue_webhook(
      NEW.organization_id,
      'project.status_changed',
      jsonb_build_object(
        'project_id', NEW.id,
        'project_name', NEW.name,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'changed_at', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_webhook_trigger
  AFTER UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_project_webhook();

-- Trigger webhook on task completion
CREATE OR REPLACE FUNCTION trigger_task_webhook()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id uuid;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'completed' THEN
    SELECT organization_id INTO v_org_id FROM projects WHERE id = NEW.project_id;
    
    PERFORM queue_webhook(
      v_org_id,
      'task.completed',
      jsonb_build_object(
        'task_id', NEW.id,
        'task_title', NEW.title,
        'project_id', NEW.project_id,
        'completed_at', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_webhook_trigger
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_task_webhook();

GRANT SELECT ON webhook_configs TO authenticated;
GRANT SELECT ON webhook_deliveries TO authenticated;
GRANT SELECT ON external_integrations TO authenticated;
GRANT SELECT ON integration_sync_log TO authenticated;
GRANT EXECUTE ON FUNCTION queue_webhook TO authenticated;

COMMENT ON TABLE webhook_configs IS 'Webhook configuration for external integrations';
COMMENT ON TABLE webhook_deliveries IS 'Log of webhook delivery attempts';
COMMENT ON TABLE external_integrations IS 'External system integrations configuration';
COMMENT ON TABLE integration_sync_log IS 'Log of integration sync operations';
COMMENT ON FUNCTION queue_webhook IS 'Queues a webhook for delivery';
