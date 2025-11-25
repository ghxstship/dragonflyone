-- Migration: System Status and Incidents
-- Description: Track system status, incidents, and maintenance windows

-- System incidents
CREATE TABLE IF NOT EXISTS system_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'investigating' CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  severity VARCHAR(50) NOT NULL DEFAULT 'minor' CHECK (severity IN ('minor', 'major', 'critical')),
  affected_services JSONB DEFAULT '[]',
  impact_description TEXT,
  root_cause TEXT,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id)
);

-- Incident updates
CREATE TABLE IF NOT EXISTS incident_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES system_incidents(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Maintenance windows
CREATE TABLE IF NOT EXISTS maintenance_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  affected_services JSONB DEFAULT '[]',
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notification_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES platform_users(id)
);

-- Service health metrics (for historical tracking)
CREATE TABLE IF NOT EXISTS service_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  response_time_ms INTEGER,
  error_count INTEGER DEFAULT 0,
  request_count INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uptime records (daily aggregates)
CREATE TABLE IF NOT EXISTS uptime_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  uptime_percentage DECIMAL(5,2) NOT NULL,
  total_minutes INTEGER DEFAULT 1440,
  downtime_minutes INTEGER DEFAULT 0,
  incident_count INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_name, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_system_incidents_status ON system_incidents(status);
CREATE INDEX IF NOT EXISTS idx_system_incidents_severity ON system_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_system_incidents_created ON system_incidents(created_at);
CREATE INDEX IF NOT EXISTS idx_incident_updates_incident ON incident_updates(incident_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_windows_status ON maintenance_windows(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_windows_scheduled ON maintenance_windows(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_service_health_metrics_service ON service_health_metrics(service_name);
CREATE INDEX IF NOT EXISTS idx_service_health_metrics_recorded ON service_health_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_uptime_records_service ON uptime_records(service_name);
CREATE INDEX IF NOT EXISTS idx_uptime_records_date ON uptime_records(date);

-- RLS Policies
ALTER TABLE system_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE uptime_records ENABLE ROW LEVEL SECURITY;

-- Public read access for status information
CREATE POLICY "incidents_select" ON system_incidents FOR SELECT USING (true);
CREATE POLICY "incident_updates_select" ON incident_updates FOR SELECT USING (true);
CREATE POLICY "maintenance_windows_select" ON maintenance_windows FOR SELECT USING (true);
CREATE POLICY "uptime_records_select" ON uptime_records FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "incidents_manage" ON system_incidents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "incident_updates_manage" ON incident_updates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "maintenance_windows_manage" ON maintenance_windows
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

CREATE POLICY "service_health_metrics_insert" ON service_health_metrics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_health_metrics_select" ON service_health_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM platform_users pu
      WHERE pu.id = auth.uid()
      AND pu.platform_roles && ARRAY['ATLVS_ADMIN', 'LEGEND_SUPER_ADMIN', 'LEGEND_ADMIN']::text[]
    )
  );

-- Function to calculate uptime for a service
CREATE OR REPLACE FUNCTION calculate_service_uptime(
  p_service_name VARCHAR,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
  v_total_minutes INTEGER;
  v_downtime_minutes INTEGER;
BEGIN
  SELECT 
    SUM(total_minutes),
    SUM(downtime_minutes)
  INTO v_total_minutes, v_downtime_minutes
  FROM uptime_records
  WHERE service_name = p_service_name
  AND date BETWEEN p_start_date AND p_end_date;
  
  IF v_total_minutes IS NULL OR v_total_minutes = 0 THEN
    RETURN 100.00;
  END IF;
  
  RETURN ROUND(((v_total_minutes - COALESCE(v_downtime_minutes, 0))::DECIMAL / v_total_minutes) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update incident timestamp
CREATE OR REPLACE FUNCTION update_incident_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER incident_timestamp_trigger
  BEFORE UPDATE ON system_incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_incident_timestamp();

-- Trigger to update maintenance window timestamp
CREATE OR REPLACE FUNCTION update_maintenance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status = 'in_progress' AND OLD.status = 'scheduled' THEN
    NEW.actual_start = NOW();
  END IF;
  IF NEW.status = 'completed' AND OLD.status = 'in_progress' THEN
    NEW.actual_end = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintenance_timestamp_trigger
  BEFORE UPDATE ON maintenance_windows
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_timestamp();
