-- Migration: Enrich Shows and Cues System
-- Description: Enhanced show management and cue system from ExperienceGeneratorSchema

-- Add show status enum
DO $$ BEGIN
  CREATE TYPE show_status_enum AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add show type enum
DO $$ BEGIN
  CREATE TYPE show_type_enum AS ENUM ('preview', 'regular', 'final', 'special', 'private');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add cue type enum
DO $$ BEGIN
  CREATE TYPE cue_type_enum AS ENUM ('master', 'lighting', 'sound', 'video', 'sfx', 'scenic', 'action', 'note');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add trigger type enum
DO $$ BEGIN
  CREATE TYPE trigger_type_enum AS ENUM ('time', 'manual', 'sensor', 'previous_cue', 'conditional');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create shows table (enhanced version)
CREATE TABLE IF NOT EXISTS shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id UUID NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id),
  run_of_show_id UUID REFERENCES run_of_shows(id),
  show_number INTEGER,
  date DATE NOT NULL,
  doors_time TIME,
  start_time TIME NOT NULL,
  end_time TIME,
  actual_doors TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  status show_status_enum DEFAULT 'scheduled',
  show_type show_type_enum DEFAULT 'regular',
  capacity INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  tickets_comped INTEGER DEFAULT 0,
  attendance INTEGER,
  no_shows INTEGER DEFAULT 0,
  notes TEXT,
  internal_notes TEXT,
  weather_conditions TEXT,
  stage_manager_id UUID REFERENCES platform_users(id),
  house_manager_id UUID REFERENCES platform_users(id),
  call_time TIME,
  preset_time TIME,
  intermission_duration INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cues table (enhanced version)
CREATE TABLE IF NOT EXISTS cues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id UUID NOT NULL REFERENCES productions(id) ON DELETE CASCADE,
  show_id UUID REFERENCES shows(id),
  run_of_show_id UUID REFERENCES run_of_shows(id),
  cue_number VARCHAR(20) NOT NULL,
  sequence INTEGER,
  
  -- Time
  scheduled_time TIME,
  running_time INTERVAL,
  duration INTERVAL,
  actual_time TIME,
  variance_seconds INTEGER,
  
  -- Content
  activity TEXT NOT NULL,
  zone_id UUID REFERENCES zones(id),
  cue_type cue_type_enum,
  
  -- Department Cues
  audio_cue VARCHAR(50),
  audio_notes TEXT,
  lighting_cue VARCHAR(50),
  lighting_notes TEXT,
  video_cue VARCHAR(50),
  video_notes TEXT,
  sfx_cue VARCHAR(50),
  sfx_notes TEXT,
  scenic_cue VARCHAR(50),
  scenic_notes TEXT,
  
  -- Elements
  talent TEXT[] DEFAULT '{}',
  props TEXT[] DEFAULT '{}',
  costumes TEXT[] DEFAULT '{}',
  script_dialogue TEXT,
  blocking_notes TEXT,
  
  -- Operations
  ops_notes TEXT,
  safety_notes TEXT,
  
  -- Meta
  is_milestone BOOLEAN DEFAULT false,
  is_hold BOOLEAN DEFAULT false,
  is_standby BOOLEAN DEFAULT false,
  trigger_type trigger_type_enum DEFAULT 'manual',
  trigger_condition TEXT,
  depends_on_cue_id UUID REFERENCES cues(id),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'standby', 'go', 'completed', 'skipped', 'hold')),
  called_at TIMESTAMPTZ,
  called_by_id UUID REFERENCES platform_users(id),
  
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Show crew assignments
CREATE TABLE IF NOT EXISTS show_crew (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES crew_members(id),
  contact_id UUID REFERENCES contacts(id),
  role TEXT NOT NULL,
  department TEXT,
  call_time TIME,
  wrap_time TIME,
  actual_in TIMESTAMPTZ,
  actual_out TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'checked_in', 'working', 'wrapped', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT show_crew_person CHECK (crew_member_id IS NOT NULL OR contact_id IS NOT NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shows_production ON shows(production_id);
CREATE INDEX IF NOT EXISTS idx_shows_venue ON shows(venue_id);
CREATE INDEX IF NOT EXISTS idx_shows_date ON shows(date);
CREATE INDEX IF NOT EXISTS idx_shows_status ON shows(status);
CREATE INDEX IF NOT EXISTS idx_shows_type ON shows(show_type);
CREATE INDEX IF NOT EXISTS idx_shows_stage_manager ON shows(stage_manager_id);

CREATE INDEX IF NOT EXISTS idx_cues_production ON cues(production_id);
CREATE INDEX IF NOT EXISTS idx_cues_show ON cues(show_id);
CREATE INDEX IF NOT EXISTS idx_cues_ros ON cues(run_of_show_id);
CREATE INDEX IF NOT EXISTS idx_cues_sequence ON cues(sequence);
CREATE INDEX IF NOT EXISTS idx_cues_type ON cues(cue_type);
CREATE INDEX IF NOT EXISTS idx_cues_status ON cues(status);
CREATE INDEX IF NOT EXISTS idx_cues_zone ON cues(zone_id);

CREATE INDEX IF NOT EXISTS idx_show_crew_show ON show_crew(show_id);
CREATE INDEX IF NOT EXISTS idx_show_crew_member ON show_crew(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_show_crew_contact ON show_crew(contact_id);

-- Comments
COMMENT ON TABLE shows IS 'Individual show instances within a production';
COMMENT ON TABLE cues IS 'Cues for run of show with department-specific details';
COMMENT ON TABLE show_crew IS 'Crew assignments for specific shows';
COMMENT ON COLUMN cues.trigger_type IS 'How the cue is triggered: time, manual, sensor, previous_cue, conditional';

-- Function to calculate cue variance
CREATE OR REPLACE FUNCTION calculate_cue_variance_enhanced()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.actual_time IS NOT NULL AND NEW.scheduled_time IS NOT NULL THEN
    NEW.variance_seconds := EXTRACT(EPOCH FROM (NEW.actual_time - NEW.scheduled_time))::INTEGER;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cue_variance_enhanced_trigger ON cues;
CREATE TRIGGER cue_variance_enhanced_trigger
  BEFORE UPDATE ON cues
  FOR EACH ROW
  EXECUTE FUNCTION calculate_cue_variance_enhanced();

-- Function to get show summary
CREATE OR REPLACE FUNCTION get_show_summary(p_show_id UUID)
RETURNS TABLE (
  show_id UUID,
  show_number INTEGER,
  show_date DATE,
  show_type show_type_enum,
  status show_status_enum,
  capacity INTEGER,
  tickets_sold INTEGER,
  attendance INTEGER,
  fill_rate NUMERIC,
  cue_count INTEGER,
  cues_completed INTEGER,
  crew_count INTEGER,
  crew_checked_in INTEGER,
  stage_manager TEXT,
  venue_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.show_number,
    s.date,
    s.show_type,
    s.status,
    s.capacity,
    s.tickets_sold,
    s.attendance,
    CASE WHEN s.capacity > 0 THEN ROUND((COALESCE(s.attendance, s.tickets_sold)::NUMERIC / s.capacity) * 100, 2) ELSE 0 END AS fill_rate,
    (SELECT COUNT(*)::INTEGER FROM cues WHERE show_id = s.id OR run_of_show_id = s.run_of_show_id) AS cue_count,
    (SELECT COUNT(*)::INTEGER FROM cues WHERE (show_id = s.id OR run_of_show_id = s.run_of_show_id) AND status = 'completed') AS cues_completed,
    (SELECT COUNT(*)::INTEGER FROM show_crew WHERE show_id = s.id) AS crew_count,
    (SELECT COUNT(*)::INTEGER FROM show_crew WHERE show_id = s.id AND status IN ('checked_in', 'working', 'wrapped')) AS crew_checked_in,
    pu.full_name AS stage_manager,
    v.name AS venue_name
  FROM shows s
  LEFT JOIN platform_users pu ON s.stage_manager_id = pu.id
  LEFT JOIN venues v ON s.venue_id = v.id
  WHERE s.id = p_show_id;
END;
$$;

-- Function to get cue sheet for a show
CREATE OR REPLACE FUNCTION get_cue_sheet(p_show_id UUID)
RETURNS TABLE (
  cue_id UUID,
  cue_number VARCHAR(20),
  sequence INTEGER,
  scheduled_time TIME,
  activity TEXT,
  cue_type cue_type_enum,
  zone_name TEXT,
  audio_cue VARCHAR(50),
  lighting_cue VARCHAR(50),
  video_cue VARCHAR(50),
  sfx_cue VARCHAR(50),
  scenic_cue VARCHAR(50),
  talent TEXT[],
  props TEXT[],
  is_milestone BOOLEAN,
  trigger_type trigger_type_enum,
  status TEXT,
  actual_time TIME,
  variance_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ros_id UUID;
BEGIN
  -- Get run_of_show_id from show
  SELECT run_of_show_id INTO v_ros_id FROM shows WHERE id = p_show_id;
  
  RETURN QUERY
  SELECT 
    c.id,
    c.cue_number,
    c.sequence,
    c.scheduled_time,
    c.activity,
    c.cue_type,
    z.name AS zone_name,
    c.audio_cue,
    c.lighting_cue,
    c.video_cue,
    c.sfx_cue,
    c.scenic_cue,
    c.talent,
    c.props,
    c.is_milestone,
    c.trigger_type,
    c.status,
    c.actual_time,
    c.variance_seconds
  FROM cues c
  LEFT JOIN zones z ON c.zone_id = z.id
  WHERE c.show_id = p_show_id OR c.run_of_show_id = v_ros_id
  ORDER BY c.sequence, c.scheduled_time;
END;
$$;

-- Function to call a cue
CREATE OR REPLACE FUNCTION call_cue(
  p_cue_id UUID,
  p_called_by_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE cues
  SET 
    status = 'go',
    actual_time = CURRENT_TIME,
    called_at = NOW(),
    called_by_id = p_called_by_id,
    updated_at = NOW()
  WHERE id = p_cue_id
    AND status IN ('pending', 'standby');
  
  RETURN FOUND;
END;
$$;

-- Function to complete a cue
CREATE OR REPLACE FUNCTION complete_cue(p_cue_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE cues
  SET 
    status = 'completed',
    updated_at = NOW()
  WHERE id = p_cue_id
    AND status = 'go';
  
  RETURN FOUND;
END;
$$;

-- Function to get upcoming shows
CREATE OR REPLACE FUNCTION get_upcoming_shows(
  p_production_id UUID,
  p_days_ahead INTEGER DEFAULT 7
)
RETURNS TABLE (
  show_id UUID,
  show_number INTEGER,
  show_date DATE,
  start_time TIME,
  show_type show_type_enum,
  status show_status_enum,
  tickets_sold INTEGER,
  capacity INTEGER,
  venue_name TEXT,
  stage_manager TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.show_number,
    s.date,
    s.start_time,
    s.show_type,
    s.status,
    s.tickets_sold,
    s.capacity,
    v.name AS venue_name,
    pu.full_name AS stage_manager
  FROM shows s
  LEFT JOIN venues v ON s.venue_id = v.id
  LEFT JOIN platform_users pu ON s.stage_manager_id = pu.id
  WHERE s.production_id = p_production_id
    AND s.date BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_days_ahead)
    AND s.status NOT IN ('cancelled', 'completed')
  ORDER BY s.date, s.start_time;
END;
$$;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_shows_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS shows_updated_at_trigger ON shows;
CREATE TRIGGER shows_updated_at_trigger
  BEFORE UPDATE ON shows
  FOR EACH ROW
  EXECUTE FUNCTION update_shows_timestamp();

DROP TRIGGER IF EXISTS cues_updated_at_trigger ON cues;
CREATE TRIGGER cues_updated_at_trigger
  BEFORE UPDATE ON cues
  FOR EACH ROW
  EXECUTE FUNCTION update_shows_timestamp();

-- RLS Policies
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_crew ENABLE ROW LEVEL SECURITY;

CREATE POLICY shows_select ON shows
  FOR SELECT TO authenticated
  USING (production_id IN (SELECT id FROM productions WHERE org_matches(organization_id)));

CREATE POLICY shows_manage ON shows
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY cues_select ON cues
  FOR SELECT TO authenticated
  USING (production_id IN (SELECT id FROM productions WHERE org_matches(organization_id)));

CREATE POLICY cues_manage ON cues
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY show_crew_select ON show_crew
  FOR SELECT TO authenticated
  USING (show_id IN (SELECT id FROM shows WHERE production_id IN (SELECT id FROM productions WHERE org_matches(organization_id))));

CREATE POLICY show_crew_manage ON show_crew
  FOR ALL TO authenticated
  USING (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'))
  WITH CHECK (role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON shows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cues TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON show_crew TO authenticated;

GRANT EXECUTE ON FUNCTION get_show_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cue_sheet(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION call_cue(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_cue(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_shows(UUID, INTEGER) TO authenticated;
