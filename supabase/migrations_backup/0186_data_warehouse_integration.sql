-- Migration: Data Warehouse Integration System
-- Description: ETL pipelines, data exports, and warehouse sync for BI tools

-- Data warehouse connections
CREATE TABLE IF NOT EXISTS warehouse_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  connection_type VARCHAR(50) NOT NULL CHECK (connection_type IN ('snowflake', 'bigquery', 'redshift', 'databricks', 's3', 'azure_blob', 'gcs')),
  connection_config JSONB NOT NULL DEFAULT '{}',
  credentials_encrypted TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  sync_status VARCHAR(50) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'failed', 'paused')),
  sync_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- ETL pipeline definitions
CREATE TABLE IF NOT EXISTS etl_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('table', 'view', 'query', 'api')),
  source_config JSONB NOT NULL DEFAULT '{}',
  destination_connection_id UUID REFERENCES warehouse_connections(id) ON DELETE SET NULL,
  destination_table VARCHAR(255),
  transformation_config JSONB DEFAULT '{}',
  schedule_cron VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  last_run_status VARCHAR(50) CHECK (last_run_status IN ('success', 'failed', 'partial', 'running')),
  last_run_records INTEGER,
  last_run_duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- ETL run history
CREATE TABLE IF NOT EXISTS etl_run_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES etl_pipelines(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'success', 'failed', 'partial', 'cancelled')),
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  bytes_transferred BIGINT DEFAULT 0,
  duration_ms INTEGER,
  error_message TEXT,
  error_details JSONB,
  metadata JSONB DEFAULT '{}'
);

-- Data export jobs
CREATE TABLE IF NOT EXISTS data_export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  export_type VARCHAR(50) NOT NULL CHECK (export_type IN ('full', 'incremental', 'snapshot')),
  tables_included JSONB NOT NULL DEFAULT '[]',
  format VARCHAR(50) DEFAULT 'parquet' CHECK (format IN ('parquet', 'csv', 'json', 'avro')),
  compression VARCHAR(50) DEFAULT 'gzip' CHECK (compression IN ('none', 'gzip', 'snappy', 'zstd')),
  destination_connection_id UUID REFERENCES warehouse_connections(id),
  destination_path VARCHAR(500),
  schedule_cron VARCHAR(100),
  retention_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  last_export_at TIMESTAMPTZ,
  last_export_status VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Data export history
CREATE TABLE IF NOT EXISTS data_export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES data_export_jobs(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL CHECK (status IN ('running', 'success', 'failed', 'cancelled')),
  file_count INTEGER DEFAULT 0,
  total_rows BIGINT DEFAULT 0,
  total_bytes BIGINT DEFAULT 0,
  files_manifest JSONB DEFAULT '[]',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BI tool API keys
CREATE TABLE IF NOT EXISTS bi_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  key_prefix VARCHAR(20) NOT NULL,
  tool_type VARCHAR(50) CHECK (tool_type IN ('tableau', 'powerbi', 'looker', 'metabase', 'custom')),
  permissions JSONB DEFAULT '["read"]',
  rate_limit_per_minute INTEGER DEFAULT 60,
  allowed_tables JSONB DEFAULT '[]',
  allowed_ip_ranges JSONB DEFAULT '[]',
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- BI query logs
CREATE TABLE IF NOT EXISTS bi_query_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES bi_api_keys(id) ON DELETE SET NULL,
  query_type VARCHAR(50) NOT NULL,
  tables_accessed JSONB DEFAULT '[]',
  query_hash VARCHAR(64),
  execution_time_ms INTEGER,
  rows_returned INTEGER,
  bytes_scanned BIGINT,
  client_ip INET,
  user_agent TEXT,
  status VARCHAR(50) CHECK (status IN ('success', 'failed', 'timeout', 'rate_limited')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materialized views for warehouse sync
CREATE TABLE IF NOT EXISTS warehouse_materialized_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  view_name VARCHAR(255) NOT NULL UNIQUE,
  source_query TEXT NOT NULL,
  refresh_schedule VARCHAR(100),
  last_refresh_at TIMESTAMPTZ,
  refresh_duration_ms INTEGER,
  row_count BIGINT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_warehouse_connections_type ON warehouse_connections(connection_type);
CREATE INDEX IF NOT EXISTS idx_warehouse_connections_status ON warehouse_connections(sync_status);
CREATE INDEX IF NOT EXISTS idx_etl_pipelines_destination ON etl_pipelines(destination_connection_id);
CREATE INDEX IF NOT EXISTS idx_etl_pipelines_active ON etl_pipelines(is_active);
CREATE INDEX IF NOT EXISTS idx_etl_run_history_pipeline ON etl_run_history(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_etl_run_history_started ON etl_run_history(started_at);
CREATE INDEX IF NOT EXISTS idx_data_export_jobs_active ON data_export_jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_data_export_history_job ON data_export_history(job_id);
CREATE INDEX IF NOT EXISTS idx_bi_api_keys_hash ON bi_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_bi_query_logs_key ON bi_query_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_bi_query_logs_created ON bi_query_logs(created_at);

-- RLS Policies
ALTER TABLE warehouse_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE etl_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE etl_run_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_materialized_views ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for warehouse management
CREATE POLICY "warehouse_connections_admin" ON warehouse_connections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "etl_pipelines_admin" ON etl_pipelines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "etl_run_history_admin" ON etl_run_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "data_export_jobs_admin" ON data_export_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "data_export_history_admin" ON data_export_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "bi_api_keys_admin" ON bi_api_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "bi_query_logs_admin" ON bi_query_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "warehouse_views_admin" ON warehouse_materialized_views
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_bi_api_key()
RETURNS TABLE(key TEXT, key_hash TEXT, key_prefix TEXT) AS $$
DECLARE
  raw_key TEXT;
  hashed TEXT;
  prefix TEXT;
BEGIN
  raw_key := 'ghx_bi_' || encode(gen_random_bytes(32), 'hex');
  hashed := encode(sha256(raw_key::bytea), 'hex');
  prefix := substring(raw_key from 1 for 12);
  
  RETURN QUERY SELECT raw_key, hashed, prefix;
END;
$$ LANGUAGE plpgsql;

-- View for ETL pipeline status dashboard
CREATE OR REPLACE VIEW etl_pipeline_status AS
SELECT 
  p.id,
  p.name,
  p.source_type,
  p.is_active,
  p.last_run_at,
  p.last_run_status,
  p.last_run_records,
  p.last_run_duration_ms,
  wc.name as destination_name,
  wc.connection_type,
  (
    SELECT COUNT(*) FROM etl_run_history rh
    WHERE rh.pipeline_id = p.id AND rh.status = 'failed'
    AND rh.started_at > NOW() - INTERVAL '7 days'
  ) as failures_last_7_days,
  (
    SELECT AVG(duration_ms) FROM etl_run_history rh
    WHERE rh.pipeline_id = p.id AND rh.status = 'success'
    AND rh.started_at > NOW() - INTERVAL '30 days'
  ) as avg_duration_30_days
FROM etl_pipelines p
LEFT JOIN warehouse_connections wc ON wc.id = p.destination_connection_id
ORDER BY p.last_run_at DESC NULLS LAST;
