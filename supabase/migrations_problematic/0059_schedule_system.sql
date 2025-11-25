-- Migration: Schedule System
-- Description: Tables for production scheduling and crew assignments

-- Schedule items table
CREATE TABLE IF NOT EXISTS schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  location TEXT,
  venue_id UUID REFERENCES venues(id),
  type TEXT NOT NULL CHECK (type IN ('load_in', 'setup', 'soundcheck', 'rehearsal', 'show', 'intermission', 'load_out', 'strike', 'meeting', 'break', 'other')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed')),
  crew_roles_required TEXT[],
  equipment_required TEXT[],
  notes TEXT,
  color TEXT,
  sort_order INT DEFAULT 0,
  parent_id UUID REFERENCES schedule_items(id),
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedule_items_project ON schedule_items(project_id);
CREATE INDEX IF NOT EXISTS idx_schedule_items_event ON schedule_items(event_id);
CREATE INDEX IF NOT EXISTS idx_schedule_items_start_time ON schedule_items(start_time);
CREATE INDEX IF NOT EXISTS idx_schedule_items_status ON schedule_items(status);
CREATE INDEX IF NOT EXISTS idx_schedule_items_type ON schedule_items(type);

-- Schedule assignments (crew to schedule items)
CREATE TABLE IF NOT EXISTS schedule_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_item_id UUID NOT NULL REFERENCES schedule_items(id) ON DELETE CASCADE,
  crew_member_id UUID REFERENCES crew_members(id),
  employee_id UUID REFERENCES employees(id),
  role TEXT,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'checked_in', 'completed', 'no_show', 'cancelled')),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT assignment_person CHECK (crew_member_id IS NOT NULL OR employee_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_schedule_assignments_item ON schedule_assignments(schedule_item_id);
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_crew ON schedule_assignments(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_employee ON schedule_assignments(employee_id);

-- Schedule conflicts view
CREATE OR REPLACE VIEW schedule_conflicts AS
SELECT 
  a.id AS item_a_id,
  a.title AS item_a_title,
  b.id AS item_b_id,
  b.title AS item_b_title,
  sa.crew_member_id,
  cm.full_name AS crew_member_name,
  a.start_time AS item_a_start,
  a.end_time AS item_a_end,
  b.start_time AS item_b_start,
  b.end_time AS item_b_end
FROM schedule_items a
JOIN schedule_assignments sa ON a.id = sa.schedule_item_id
JOIN schedule_items b ON b.id != a.id
JOIN schedule_assignments sb ON b.id = sb.schedule_item_id AND sa.crew_member_id = sb.crew_member_id
LEFT JOIN crew_members cm ON sa.crew_member_id = cm.id
WHERE a.status NOT IN ('cancelled', 'completed')
  AND b.status NOT IN ('cancelled', 'completed')
  AND a.start_time < b.end_time 
  AND a.end_time > b.start_time
  AND a.id < b.id;

-- Function to check for schedule conflicts
CREATE OR REPLACE FUNCTION check_schedule_conflict(
  p_crew_member_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_exclude_item_id UUID DEFAULT NULL
)
RETURNS TABLE (
  conflicting_item_id UUID,
  conflicting_item_title TEXT,
  conflict_start TIMESTAMPTZ,
  conflict_end TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    si.id,
    si.title,
    si.start_time,
    si.end_time
  FROM schedule_items si
  JOIN schedule_assignments sa ON si.id = sa.schedule_item_id
  WHERE sa.crew_member_id = p_crew_member_id
    AND si.status NOT IN ('cancelled', 'completed')
    AND si.start_time < p_end_time
    AND si.end_time > p_start_time
    AND (p_exclude_item_id IS NULL OR si.id != p_exclude_item_id);
END;
$$;

-- Function to auto-assign available crew
CREATE OR REPLACE FUNCTION get_available_crew(
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_role TEXT DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
  crew_member_id UUID,
  full_name TEXT,
  role TEXT,
  skills TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.full_name,
    cm.role,
    cm.skills
  FROM crew_members cm
  WHERE cm.status = 'active'
    AND (p_organization_id IS NULL OR cm.organization_id = p_organization_id)
    AND (p_role IS NULL OR cm.role = p_role OR p_role = ANY(cm.skills))
    AND NOT EXISTS (
      SELECT 1 FROM schedule_assignments sa
      JOIN schedule_items si ON sa.schedule_item_id = si.id
      WHERE sa.crew_member_id = cm.id
        AND si.status NOT IN ('cancelled', 'completed')
        AND si.start_time < p_end_time
        AND si.end_time > p_start_time
    );
END;
$$;

-- RLS policies
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_assignments ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON schedule_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON schedule_assignments TO authenticated;
GRANT SELECT ON schedule_conflicts TO authenticated;
GRANT EXECUTE ON FUNCTION check_schedule_conflict(UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_crew(TIMESTAMPTZ, TIMESTAMPTZ, TEXT, UUID) TO authenticated;
