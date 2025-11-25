-- Migration: Run of Show & Event Operations System
-- Description: Tables for run-of-show management, cues, and event day operations

-- Run of shows table
CREATE TABLE IF NOT EXISTS run_of_shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  name TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  venue_id UUID REFERENCES venues(id),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'in_progress', 'completed', 'cancelled')),
  version INT DEFAULT 1,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES platform_users(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_run_of_shows_project ON run_of_shows(project_id);
CREATE INDEX IF NOT EXISTS idx_run_of_shows_event ON run_of_shows(event_id);
CREATE INDEX IF NOT EXISTS idx_run_of_shows_date ON run_of_shows(date);
CREATE INDEX IF NOT EXISTS idx_run_of_shows_status ON run_of_shows(status);

-- Run of show cues table
CREATE TABLE IF NOT EXISTS run_of_show_cues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_of_show_id UUID NOT NULL REFERENCES run_of_shows(id) ON DELETE CASCADE,
  cue_number TEXT NOT NULL,
  time TIME NOT NULL,
  description TEXT NOT NULL,
  department TEXT,
  assigned_to UUID REFERENCES platform_users(id),
  duration_minutes INT,
  notes TEXT,
  sort_order INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'standby', 'go', 'completed', 'skipped', 'hold')),
  actual_time TIME,
  variance_minutes INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_run_of_show_cues_ros ON run_of_show_cues(run_of_show_id);
CREATE INDEX IF NOT EXISTS idx_run_of_show_cues_time ON run_of_show_cues(time);
CREATE INDEX IF NOT EXISTS idx_run_of_show_cues_assigned ON run_of_show_cues(assigned_to);

-- Event check-ins table
CREATE TABLE IF NOT EXISTS event_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  person_type TEXT NOT NULL CHECK (person_type IN ('crew', 'artist', 'vip', 'vendor', 'staff')),
  person_id UUID,
  person_name TEXT NOT NULL,
  role TEXT,
  department TEXT,
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  badge_number TEXT,
  access_level TEXT,
  notes TEXT,
  checked_in_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_check_ins_event ON event_check_ins(event_id);
CREATE INDEX IF NOT EXISTS idx_event_check_ins_person ON event_check_ins(person_type, person_id);

-- Event incidents table
CREATE TABLE IF NOT EXISTS event_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  incident_type TEXT NOT NULL CHECK (incident_type IN ('medical', 'security', 'technical', 'weather', 'crowd', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  reported_by UUID REFERENCES platform_users(id),
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'escalated')),
  assigned_to UUID REFERENCES platform_users(id),
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES platform_users(id),
  photos TEXT[],
  witnesses TEXT[],
  follow_up_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_incidents_event ON event_incidents(event_id);
CREATE INDEX IF NOT EXISTS idx_event_incidents_type ON event_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_event_incidents_status ON event_incidents(status);

-- Show reports table
CREATE TABLE IF NOT EXISTS show_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  run_of_show_id UUID REFERENCES run_of_shows(id),
  report_type TEXT NOT NULL DEFAULT 'post_show' CHECK (report_type IN ('pre_show', 'post_show', 'daily')),
  doors_time TIMESTAMPTZ,
  show_start_time TIMESTAMPTZ,
  show_end_time TIMESTAMPTZ,
  attendance INT,
  capacity INT,
  attendance_percentage NUMERIC(5,2),
  weather_conditions TEXT,
  technical_issues TEXT,
  highlights TEXT,
  challenges TEXT,
  recommendations TEXT,
  crew_feedback TEXT,
  client_feedback TEXT,
  photos TEXT[],
  created_by UUID REFERENCES platform_users(id),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_show_reports_event ON show_reports(event_id);

-- Dressing room assignments table
CREATE TABLE IF NOT EXISTS dressing_room_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  room_name TEXT NOT NULL,
  room_number TEXT,
  assigned_to TEXT NOT NULL,
  assigned_type TEXT NOT NULL CHECK (assigned_type IN ('artist', 'crew', 'vip', 'production')),
  capacity INT,
  amenities TEXT[],
  special_requirements TEXT,
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dressing_room_assignments_event ON dressing_room_assignments(event_id);

-- Catering orders table
CREATE TABLE IF NOT EXISTS catering_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  vendor_id UUID ,
  order_type TEXT NOT NULL CHECK (order_type IN ('crew_meals', 'artist_hospitality', 'vip_catering', 'green_room', 'production_office')),
  delivery_time TIMESTAMPTZ,
  delivery_location TEXT,
  headcount INT,
  dietary_requirements JSONB,
  menu_items JSONB,
  total_cost NUMERIC(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catering_orders_event ON catering_orders(event_id);

-- Function to calculate cue variance
CREATE OR REPLACE FUNCTION calculate_cue_variance()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.actual_time IS NOT NULL AND NEW.time IS NOT NULL THEN
    NEW.variance_minutes := EXTRACT(EPOCH FROM (NEW.actual_time - NEW.time)) / 60;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cue_variance_trigger ON run_of_show_cues;
CREATE TRIGGER cue_variance_trigger
  BEFORE UPDATE ON run_of_show_cues
  FOR EACH ROW
  EXECUTE FUNCTION calculate_cue_variance();

-- Function to generate show report
CREATE OR REPLACE FUNCTION generate_show_report(p_event_id UUID, p_created_by UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_report_id UUID;
  v_event RECORD;
  v_ros RECORD;
  v_attendance INT;
BEGIN
  SELECT * INTO v_event FROM events WHERE id = p_event_id;
  SELECT * INTO v_ros FROM run_of_shows WHERE event_id = p_event_id ORDER BY date DESC LIMIT 1;
  SELECT COUNT(*) INTO v_attendance FROM orders WHERE event_id = p_event_id AND status = 'completed';
  
  INSERT INTO show_reports (
    event_id, run_of_show_id, report_type, attendance, capacity,
    attendance_percentage, created_by, status
  ) VALUES (
    p_event_id, v_ros.id, 'post_show', v_attendance, v_event.capacity,
    CASE WHEN v_event.capacity > 0 THEN ROUND((v_attendance::NUMERIC / v_event.capacity) * 100, 2) ELSE 0 END,
    p_created_by, 'draft'
  ) RETURNING id INTO v_report_id;
  
  RETURN v_report_id;
END;
$$;

-- RLS policies
ALTER TABLE run_of_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_of_show_cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dressing_room_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE catering_orders ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON run_of_shows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON run_of_show_cues TO authenticated;
GRANT SELECT, INSERT, UPDATE ON event_check_ins TO authenticated;
GRANT SELECT, INSERT, UPDATE ON event_incidents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON show_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dressing_room_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON catering_orders TO authenticated;
GRANT EXECUTE ON FUNCTION generate_show_report(UUID, UUID) TO authenticated;
