-- Migration: Batch Operations System
-- Description: Tables for batch processing, bulk operations, and job queues

-- Batch jobs table
CREATE TABLE IF NOT EXISTS batch_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  job_type TEXT NOT NULL CHECK (job_type IN ('import', 'export', 'update', 'delete', 'assign', 'notify', 'generate', 'sync', 'migrate', 'archive')),
  job_name TEXT NOT NULL,
  description TEXT,
  entity_type TEXT NOT NULL,
  total_items INT NOT NULL DEFAULT 0,
  processed_items INT NOT NULL DEFAULT 0,
  success_count INT NOT NULL DEFAULT 0,
  error_count INT NOT NULL DEFAULT 0,
  skipped_count INT NOT NULL DEFAULT 0,
  progress_percentage NUMERIC(5,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'running', 'paused', 'completed', 'failed', 'cancelled')),
  priority INT DEFAULT 5,
  config JSONB,
  input_data JSONB,
  output_data JSONB,
  errors JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_completion TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batch_jobs_org ON batch_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_type ON batch_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_created ON batch_jobs(created_at);

-- Batch job items table
CREATE TABLE IF NOT EXISTS batch_job_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_job_id UUID NOT NULL REFERENCES batch_jobs(id) ON DELETE CASCADE,
  item_index INT NOT NULL,
  entity_id UUID,
  input_data JSONB NOT NULL,
  output_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'error', 'skipped')),
  error_message TEXT,
  error_details JSONB,
  retry_count INT DEFAULT 0,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batch_job_items_job ON batch_job_items(batch_job_id);
CREATE INDEX IF NOT EXISTS idx_batch_job_items_status ON batch_job_items(status);
CREATE INDEX IF NOT EXISTS idx_batch_job_items_entity ON batch_job_items(entity_id);

-- Import templates table
CREATE TABLE IF NOT EXISTS import_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  description TEXT,
  field_mappings JSONB NOT NULL,
  validation_rules JSONB,
  default_values JSONB,
  file_format TEXT NOT NULL CHECK (file_format IN ('csv', 'xlsx', 'json', 'xml')),
  sample_file_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_import_templates_org ON import_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_import_templates_entity ON import_templates(entity_type);

-- Export templates table
CREATE TABLE IF NOT EXISTS export_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  description TEXT,
  fields TEXT[] NOT NULL,
  filters JSONB,
  sort_order JSONB,
  file_format TEXT NOT NULL CHECK (file_format IN ('csv', 'xlsx', 'json', 'pdf')),
  include_headers BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_templates_org ON export_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_export_templates_entity ON export_templates(entity_type);

-- Scheduled jobs table
CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  job_name TEXT NOT NULL,
  job_type TEXT NOT NULL,
  description TEXT,
  cron_expression TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  config JSONB,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  last_run_status TEXT,
  next_run_at TIMESTAMPTZ,
  run_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  retry_delay_seconds INT DEFAULT 60,
  notification_on_failure BOOLEAN DEFAULT true,
  notification_recipients UUID[],
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_org ON scheduled_jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_active ON scheduled_jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_next_run ON scheduled_jobs(next_run_at);

-- Job execution history table
CREATE TABLE IF NOT EXISTS job_execution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_job_id UUID REFERENCES scheduled_jobs(id),
  batch_job_id UUID REFERENCES batch_jobs(id),
  execution_type TEXT NOT NULL CHECK (execution_type IN ('scheduled', 'manual', 'retry')),
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms INT,
  items_processed INT,
  error_message TEXT,
  error_details JSONB,
  triggered_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_execution_history_scheduled ON job_execution_history(scheduled_job_id);
CREATE INDEX IF NOT EXISTS idx_job_execution_history_batch ON job_execution_history(batch_job_id);
CREATE INDEX IF NOT EXISTS idx_job_execution_history_started ON job_execution_history(started_at);

-- Function to update batch job progress
CREATE OR REPLACE FUNCTION update_batch_job_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total INT;
  v_processed INT;
  v_success INT;
  v_error INT;
  v_skipped INT;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status IN ('success', 'error', 'skipped')),
    COUNT(*) FILTER (WHERE status = 'success'),
    COUNT(*) FILTER (WHERE status = 'error'),
    COUNT(*) FILTER (WHERE status = 'skipped')
  INTO v_total, v_processed, v_success, v_error, v_skipped
  FROM batch_job_items
  WHERE batch_job_id = NEW.batch_job_id;
  
  UPDATE batch_jobs SET
    total_items = v_total,
    processed_items = v_processed,
    success_count = v_success,
    error_count = v_error,
    skipped_count = v_skipped,
    progress_percentage = CASE WHEN v_total > 0 THEN ROUND((v_processed::NUMERIC / v_total) * 100, 2) ELSE 0 END,
    status = CASE 
      WHEN v_processed = v_total AND v_total > 0 THEN 'completed'
      WHEN v_processed > 0 THEN 'running'
      ELSE status
    END,
    completed_at = CASE WHEN v_processed = v_total AND v_total > 0 THEN NOW() ELSE NULL END,
    updated_at = NOW()
  WHERE id = NEW.batch_job_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS batch_job_item_progress_trigger ON batch_job_items;
CREATE TRIGGER batch_job_item_progress_trigger
  AFTER INSERT OR UPDATE ON batch_job_items
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_job_progress();

-- Function to create batch job
CREATE OR REPLACE FUNCTION create_batch_job(
  p_org_id UUID,
  p_user_id UUID,
  p_job_type TEXT,
  p_job_name TEXT,
  p_entity_type TEXT,
  p_items JSONB,
  p_config JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_job_id UUID;
  v_item JSONB;
  v_index INT := 0;
BEGIN
  -- Create the batch job
  INSERT INTO batch_jobs (organization_id, job_type, job_name, entity_type, config, created_by, status)
  VALUES (p_org_id, p_job_type, p_job_name, p_entity_type, p_config, p_user_id, 'queued')
  RETURNING id INTO v_job_id;
  
  -- Create batch job items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO batch_job_items (batch_job_id, item_index, input_data)
    VALUES (v_job_id, v_index, v_item);
    v_index := v_index + 1;
  END LOOP;
  
  -- Update total items count
  UPDATE batch_jobs SET total_items = v_index WHERE id = v_job_id;
  
  RETURN v_job_id;
END;
$$;

-- Function to get batch job status
CREATE OR REPLACE FUNCTION get_batch_job_status(p_job_id UUID)
RETURNS TABLE (
  job_id UUID,
  job_name TEXT,
  status TEXT,
  total_items INT,
  processed_items INT,
  success_count INT,
  error_count INT,
  progress_percentage NUMERIC,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_completion TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bj.id,
    bj.job_name,
    bj.status,
    bj.total_items,
    bj.processed_items,
    bj.success_count,
    bj.error_count,
    bj.progress_percentage,
    bj.started_at,
    bj.completed_at,
    bj.estimated_completion
  FROM batch_jobs bj
  WHERE bj.id = p_job_id;
END;
$$;

-- RLS policies
ALTER TABLE batch_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_job_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_execution_history ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON batch_jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON batch_job_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON import_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON export_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON scheduled_jobs TO authenticated;
GRANT SELECT, INSERT ON job_execution_history TO authenticated;
GRANT EXECUTE ON FUNCTION create_batch_job(UUID, UUID, TEXT, TEXT, TEXT, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_batch_job_status(UUID) TO authenticated;
