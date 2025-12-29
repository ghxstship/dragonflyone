-- Migration: Analytics & BI System
-- Description: Tables for BI tool integration, benchmarking, and advanced analytics

-- BI datasets
CREATE TABLE IF NOT EXISTS bi_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  source_tables TEXT[] NOT NULL,
  query TEXT,
  refresh_schedule TEXT DEFAULT 'daily' CHECK (refresh_schedule IN ('realtime', 'hourly', 'daily', 'weekly', 'manual')),
  last_refreshed_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT false,
  allowed_tools TEXT[],
  row_count INT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bi_datasets_org ON bi_datasets(organization_id);

-- BI API keys
CREATE TABLE IF NOT EXISTS bi_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  tool TEXT NOT NULL CHECK (tool IN ('tableau', 'powerbi', 'looker', 'metabase', 'custom')),
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  permissions TEXT[] DEFAULT ARRAY['read'],
  allowed_datasets UUID[],
  expires_at TIMESTAMPTZ,
  ip_whitelist TEXT[],
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  usage_count INT DEFAULT 0,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bi_api_keys_user ON bi_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_bi_api_keys_active ON bi_api_keys(is_active);

-- Industry benchmarks
CREATE TABLE IF NOT EXISTS industry_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('financial', 'operational', 'workforce', 'sales', 'customer', 'asset')),
  metric_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  region TEXT,
  company_size TEXT CHECK (company_size IN ('small', 'medium', 'large', 'enterprise')),
  benchmark_value NUMERIC(14,4) NOT NULL,
  unit TEXT NOT NULL,
  percentile_25 NUMERIC(14,4),
  percentile_50 NUMERIC(14,4),
  percentile_75 NUMERIC(14,4),
  percentile_90 NUMERIC(14,4),
  source TEXT,
  effective_date DATE NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_industry_benchmarks_category ON industry_benchmarks(category);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarks_industry ON industry_benchmarks(industry);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarks_metric ON industry_benchmarks(metric_name);

-- Benchmark analyses
CREATE TABLE IF NOT EXISTS benchmark_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  organization_id UUID REFERENCES organizations(id),
  industry TEXT NOT NULL,
  period TEXT,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_benchmark_analyses_user ON benchmark_analyses(user_id);

-- Data warehouse sync logs
CREATE TABLE IF NOT EXISTS data_warehouse_syncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  warehouse_type TEXT NOT NULL CHECK (warehouse_type IN ('snowflake', 'bigquery', 'redshift', 'databricks')),
  connection_name TEXT NOT NULL,
  tables_synced TEXT[],
  rows_synced INT,
  sync_started_at TIMESTAMPTZ NOT NULL,
  sync_completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_warehouse_syncs_org ON data_warehouse_syncs(organization_id);

-- Natural language queries
CREATE TABLE IF NOT EXISTS nl_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  query_text TEXT NOT NULL,
  generated_sql TEXT,
  result_summary TEXT,
  execution_time_ms INT,
  row_count INT,
  was_successful BOOLEAN,
  feedback TEXT CHECK (feedback IN ('helpful', 'not_helpful', 'incorrect')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nl_queries_user ON nl_queries(user_id);

-- Automated insights
CREATE TABLE IF NOT EXISTS automated_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  insight_type TEXT NOT NULL CHECK (insight_type IN ('anomaly', 'trend', 'correlation', 'forecast', 'recommendation')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  metric_name TEXT,
  metric_value NUMERIC(14,4),
  comparison_value NUMERIC(14,4),
  change_percent NUMERIC(8,2),
  data_points JSONB,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES platform_users(id),
  acknowledged_at TIMESTAMPTZ,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automated_insights_org ON automated_insights(organization_id);
CREATE INDEX IF NOT EXISTS idx_automated_insights_type ON automated_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_automated_insights_generated ON automated_insights(generated_at);

-- Function to get table columns for schema export
CREATE OR REPLACE FUNCTION get_table_columns(table_name TEXT)
RETURNS TABLE (
  column_name TEXT,
  data_type TEXT,
  is_nullable TEXT,
  column_default TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::TEXT,
    c.data_type::TEXT,
    c.is_nullable::TEXT,
    c.column_default::TEXT
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = get_table_columns.table_name
  ORDER BY c.ordinal_position;
END;
$$;

-- Function to generate automated insights
CREATE OR REPLACE FUNCTION generate_automated_insights(p_organization_id UUID)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INT := 0;
  v_avg_revenue NUMERIC;
  v_prev_avg_revenue NUMERIC;
  v_change_percent NUMERIC;
BEGIN
  -- Revenue trend insight
  SELECT AVG(total_amount) INTO v_avg_revenue
  FROM invoices
  WHERE organization_id = p_organization_id
    AND created_at > NOW() - INTERVAL '30 days';
  
  SELECT AVG(total_amount) INTO v_prev_avg_revenue
  FROM invoices
  WHERE organization_id = p_organization_id
    AND created_at BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days';
  
  IF v_prev_avg_revenue > 0 THEN
    v_change_percent := ((v_avg_revenue - v_prev_avg_revenue) / v_prev_avg_revenue * 100);
    
    IF ABS(v_change_percent) > 10 THEN
      INSERT INTO automated_insights (
        organization_id, insight_type, category, title, description,
        severity, metric_name, metric_value, comparison_value, change_percent
      )
      VALUES (
        p_organization_id,
        'trend',
        'financial',
        CASE WHEN v_change_percent > 0 THEN 'Revenue Increase Detected' ELSE 'Revenue Decrease Detected' END,
        'Average invoice amount has changed by ' || ROUND(v_change_percent, 1) || '% compared to previous period',
        CASE WHEN v_change_percent < -20 THEN 'critical' WHEN v_change_percent < -10 THEN 'warning' ELSE 'info' END,
        'average_invoice_amount',
        v_avg_revenue,
        v_prev_avg_revenue,
        v_change_percent
      );
      v_count := v_count + 1;
    END IF;
  END IF;
  
  RETURN v_count;
END;
$$;

-- RLS policies
ALTER TABLE bi_datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_warehouse_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nl_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_insights ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON bi_datasets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON bi_api_keys TO authenticated;
GRANT SELECT, INSERT, UPDATE ON industry_benchmarks TO authenticated;
GRANT SELECT, INSERT ON benchmark_analyses TO authenticated;
GRANT SELECT, INSERT ON data_warehouse_syncs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON nl_queries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON automated_insights TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_columns(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_automated_insights(UUID) TO authenticated;

-- Insert sample industry benchmarks
INSERT INTO industry_benchmarks (name, category, metric_name, industry, benchmark_value, unit, percentile_25, percentile_50, percentile_75, percentile_90, effective_date) VALUES
('Gross Margin - Events', 'financial', 'gross_margin', 'events', 35.0, 'percent', 25.0, 35.0, 45.0, 55.0, CURRENT_DATE),
('Win Rate - Events', 'sales', 'win_rate', 'events', 25.0, 'percent', 15.0, 25.0, 35.0, 45.0, CURRENT_DATE),
('Project On Budget Rate', 'operational', 'project_on_budget_rate', 'events', 70.0, 'percent', 55.0, 70.0, 80.0, 90.0, CURRENT_DATE),
('Asset Utilization', 'asset', 'asset_utilization', 'events', 65.0, 'percent', 45.0, 65.0, 75.0, 85.0, CURRENT_DATE),
('Average Deal Size', 'sales', 'average_deal_size', 'events', 50000.0, 'currency', 25000.0, 50000.0, 100000.0, 250000.0, CURRENT_DATE)
ON CONFLICT DO NOTHING;
