-- Migration: Capacity Management System
-- Description: Tables for event capacity tracking, zones, and real-time monitoring

-- Capacity configurations table
CREATE TABLE IF NOT EXISTS capacity_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) UNIQUE,
  total_capacity INT NOT NULL,
  zones JSONB NOT NULL DEFAULT '[]',
  safety_threshold NUMERIC(5,2) DEFAULT 90,
  alert_thresholds JSONB DEFAULT '{"warning": 75, "critical": 90, "full": 95}',
  enable_waitlist BOOLEAN DEFAULT true,
  enable_real_time_tracking BOOLEAN DEFAULT true,
  counting_method TEXT CHECK (counting_method IN ('manual', 'scanner', 'sensor', 'hybrid')) DEFAULT 'scanner',
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capacity_configurations_event ON capacity_configurations(event_id);

-- Capacity logs table
CREATE TABLE IF NOT EXISTS capacity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  zone_name TEXT,
  action TEXT NOT NULL CHECK (action IN ('entry', 'exit', 'adjustment', 'reset')),
  count INT NOT NULL DEFAULT 1,
  gate_id TEXT,
  scanner_id TEXT,
  ticket_id UUID REFERENCES tickets(id),
  user_id UUID REFERENCES platform_users(id),
  logged_by UUID REFERENCES platform_users(id),
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_capacity_logs_event ON capacity_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_capacity_logs_zone ON capacity_logs(zone_name);
CREATE INDEX IF NOT EXISTS idx_capacity_logs_time ON capacity_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_capacity_logs_action ON capacity_logs(action);

-- Capacity snapshots table (for historical analysis)
CREATE TABLE IF NOT EXISTS capacity_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  total_occupancy INT NOT NULL,
  zone_occupancies JSONB NOT NULL,
  occupancy_percentage NUMERIC(5,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('normal', 'warning', 'critical', 'full')),
  snapshot_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capacity_snapshots_event ON capacity_snapshots(event_id);
CREATE INDEX IF NOT EXISTS idx_capacity_snapshots_time ON capacity_snapshots(snapshot_at);

-- Event zones table
CREATE TABLE IF NOT EXISTS event_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  zone_name TEXT NOT NULL,
  zone_type TEXT CHECK (zone_type IN ('general', 'vip', 'backstage', 'stage', 'bar', 'food', 'restroom', 'emergency', 'other')),
  capacity INT NOT NULL,
  current_occupancy INT DEFAULT 0,
  parent_zone_id UUID REFERENCES event_zones(id),
  floor_level INT,
  location_description TEXT,
  entry_gates TEXT[],
  exit_gates TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, zone_name)
);

CREATE INDEX IF NOT EXISTS idx_event_zones_event ON event_zones(event_id);

-- Capacity alerts table
CREATE TABLE IF NOT EXISTS capacity_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  zone_name TEXT,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('warning', 'critical', 'full', 'overcapacity', 'rapid_increase')),
  message TEXT NOT NULL,
  occupancy_percentage NUMERIC(5,2),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES platform_users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_capacity_alerts_event ON capacity_alerts(event_id);
CREATE INDEX IF NOT EXISTS idx_capacity_alerts_type ON capacity_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_capacity_alerts_acknowledged ON capacity_alerts(acknowledged);

-- Gate scanners table
CREATE TABLE IF NOT EXISTS gate_scanners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  gate_name TEXT NOT NULL,
  gate_type TEXT NOT NULL CHECK (gate_type IN ('entry', 'exit', 'bidirectional')),
  zone_name TEXT,
  scanner_device_id TEXT,
  is_active BOOLEAN DEFAULT true,
  last_scan_at TIMESTAMPTZ,
  total_scans INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, gate_name)
);

CREATE INDEX IF NOT EXISTS idx_gate_scanners_event ON gate_scanners(event_id);

-- Waitlist table
CREATE TABLE IF NOT EXISTS capacity_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  zone_name TEXT,
  ticket_type_id UUID REFERENCES event_ticket_types(id),
  quantity INT DEFAULT 1,
  position INT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'converted', 'expired', 'cancelled')),
  notified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id, zone_name)
);

CREATE INDEX IF NOT EXISTS idx_capacity_waitlist_event ON capacity_waitlist(event_id);
CREATE INDEX IF NOT EXISTS idx_capacity_waitlist_user ON capacity_waitlist(user_id);
CREATE INDEX IF NOT EXISTS idx_capacity_waitlist_status ON capacity_waitlist(status);

-- Function to update zone occupancy
CREATE OR REPLACE FUNCTION update_zone_occupancy()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.action = 'entry' THEN
    UPDATE event_zones SET
      current_occupancy = LEAST(current_occupancy + NEW.count, capacity)
    WHERE event_id = NEW.event_id AND zone_name = NEW.zone_name;
  ELSIF NEW.action = 'exit' THEN
    UPDATE event_zones SET
      current_occupancy = GREATEST(current_occupancy - NEW.count, 0)
    WHERE event_id = NEW.event_id AND zone_name = NEW.zone_name;
  ELSIF NEW.action = 'reset' THEN
    UPDATE event_zones SET
      current_occupancy = 0
    WHERE event_id = NEW.event_id AND (NEW.zone_name IS NULL OR zone_name = NEW.zone_name);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS capacity_log_zone_update ON capacity_logs;
CREATE TRIGGER capacity_log_zone_update
  AFTER INSERT ON capacity_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_zone_occupancy();

-- Function to check capacity thresholds and create alerts
CREATE OR REPLACE FUNCTION check_capacity_thresholds()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_config RECORD;
  v_total_occupancy INT;
  v_percentage NUMERIC;
  v_alert_type TEXT;
BEGIN
  -- Get configuration
  SELECT * INTO v_config
  FROM capacity_configurations
  WHERE event_id = NEW.event_id;
  
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Calculate total occupancy
  SELECT COALESCE(SUM(current_occupancy), 0) INTO v_total_occupancy
  FROM event_zones
  WHERE event_id = NEW.event_id;
  
  v_percentage := (v_total_occupancy::NUMERIC / v_config.total_capacity) * 100;
  
  -- Determine alert type
  IF v_percentage >= (v_config.alert_thresholds->>'full')::NUMERIC THEN
    v_alert_type := 'full';
  ELSIF v_percentage >= (v_config.alert_thresholds->>'critical')::NUMERIC THEN
    v_alert_type := 'critical';
  ELSIF v_percentage >= (v_config.alert_thresholds->>'warning')::NUMERIC THEN
    v_alert_type := 'warning';
  ELSE
    RETURN NEW;
  END IF;
  
  -- Check if similar alert exists in last 5 minutes
  IF NOT EXISTS (
    SELECT 1 FROM capacity_alerts
    WHERE event_id = NEW.event_id
      AND alert_type = v_alert_type
      AND created_at >= NOW() - INTERVAL '5 minutes'
  ) THEN
    INSERT INTO capacity_alerts (event_id, zone_name, alert_type, message, occupancy_percentage)
    VALUES (
      NEW.event_id,
      NEW.zone_name,
      v_alert_type,
      'Capacity at ' || ROUND(v_percentage, 1) || '%',
      v_percentage
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS capacity_threshold_check ON capacity_logs;
CREATE TRIGGER capacity_threshold_check
  AFTER INSERT ON capacity_logs
  FOR EACH ROW
  WHEN (NEW.action = 'entry')
  EXECUTE FUNCTION check_capacity_thresholds();

-- Function to get current capacity status
CREATE OR REPLACE FUNCTION get_capacity_status(p_event_id UUID)
RETURNS TABLE (
  total_capacity INT,
  current_occupancy INT,
  available_capacity INT,
  occupancy_percentage NUMERIC,
  status TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_config RECORD;
  v_occupancy INT;
  v_percentage NUMERIC;
  v_status TEXT;
BEGIN
  SELECT * INTO v_config
  FROM capacity_configurations
  WHERE event_id = p_event_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  SELECT COALESCE(SUM(ez.current_occupancy), 0) INTO v_occupancy
  FROM event_zones ez
  WHERE ez.event_id = p_event_id;
  
  v_percentage := (v_occupancy::NUMERIC / v_config.total_capacity) * 100;
  
  IF v_percentage >= (v_config.alert_thresholds->>'full')::NUMERIC THEN
    v_status := 'full';
  ELSIF v_percentage >= (v_config.alert_thresholds->>'critical')::NUMERIC THEN
    v_status := 'critical';
  ELSIF v_percentage >= (v_config.alert_thresholds->>'warning')::NUMERIC THEN
    v_status := 'warning';
  ELSE
    v_status := 'normal';
  END IF;
  
  RETURN QUERY SELECT
    v_config.total_capacity,
    v_occupancy,
    v_config.total_capacity - v_occupancy,
    v_percentage,
    v_status;
END;
$$;

-- RLS policies
ALTER TABLE capacity_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_scanners ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_waitlist ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON capacity_configurations TO authenticated;
GRANT SELECT, INSERT ON capacity_logs TO authenticated;
GRANT SELECT, INSERT ON capacity_snapshots TO authenticated;
GRANT SELECT, INSERT, UPDATE ON event_zones TO authenticated;
GRANT SELECT, INSERT, UPDATE ON capacity_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON gate_scanners TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON capacity_waitlist TO authenticated;
GRANT EXECUTE ON FUNCTION get_capacity_status(UUID) TO authenticated;
