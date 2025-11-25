-- Migration: Extended Analytics Tables
-- Description: Tables for anomaly detection, scheduled reports, and data exports

-- Anomaly alerts table
CREATE TABLE IF NOT EXISTS anomaly_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric VARCHAR(100) NOT NULL,
  threshold JSONB NOT NULL,
  notification_channels TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anomaly events table
CREATE TABLE IF NOT EXISTS anomaly_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES anomaly_alerts(id),
  metric VARCHAR(100) NOT NULL,
  detected_value DECIMAL(14, 2) NOT NULL,
  expected_value DECIMAL(14, 2),
  deviation DECIMAL(10, 2),
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved', 'false_positive')),
  metadata JSONB,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_by UUID REFERENCES platform_users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- Scheduled reports table
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  parameters JSONB,
  schedule_cron VARCHAR(100) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  recipients JSONB NOT NULL,
  delivery_channels TEXT[] DEFAULT ARRAY['email'],
  format VARCHAR(20) DEFAULT 'pdf' CHECK (format IN ('pdf', 'csv', 'excel', 'json')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report executions table
CREATE TABLE IF NOT EXISTS report_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_report_id UUID REFERENCES scheduled_reports(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  file_url TEXT,
  file_size INTEGER,
  error_message TEXT,
  recipients_notified INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data exports table
CREATE TABLE IF NOT EXISTS data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type VARCHAR(50) NOT NULL,
  parameters JSONB,
  format VARCHAR(20) NOT NULL CHECK (format IN ('csv', 'excel', 'json', 'pdf')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_url TEXT,
  file_size INTEGER,
  row_count INTEGER,
  requested_by UUID REFERENCES platform_users(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add diversity_classification to vendors if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'diversity_classification') THEN
    ALTER TABLE vendors ADD COLUMN diversity_classification VARCHAR(50);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_metric ON anomaly_alerts(metric);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_status ON anomaly_alerts(status);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_alert ON anomaly_events(alert_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_detected ON anomaly_events(detected_at);
CREATE INDEX IF NOT EXISTS idx_anomaly_events_status ON anomaly_events(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_status ON scheduled_reports(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON scheduled_reports(next_run_at);
CREATE INDEX IF NOT EXISTS idx_report_executions_report ON report_executions(scheduled_report_id);
CREATE INDEX IF NOT EXISTS idx_data_exports_user ON data_exports(requested_by);
CREATE INDEX IF NOT EXISTS idx_data_exports_status ON data_exports(status);

-- RLS Policies
ALTER TABLE anomaly_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY anomaly_alerts_view ON anomaly_alerts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY anomaly_events_view ON anomaly_events FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY scheduled_reports_view ON scheduled_reports FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY report_executions_view ON report_executions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY data_exports_view ON data_exports FOR SELECT USING (
  requested_by = auth.uid() OR
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

CREATE POLICY anomaly_alerts_manage ON anomaly_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

CREATE POLICY scheduled_reports_manage ON scheduled_reports FOR ALL USING (
  created_by = auth.uid() OR
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);

CREATE POLICY data_exports_manage ON data_exports FOR ALL USING (
  requested_by = auth.uid() OR
  EXISTS (SELECT 1 FROM platform_users WHERE id = auth.uid() AND 'ATLVS_ADMIN' = ANY(platform_roles))
);
