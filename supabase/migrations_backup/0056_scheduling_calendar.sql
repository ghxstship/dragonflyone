-- 0056_scheduling_calendar.sql
-- Advanced scheduling and calendar management

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_type text NOT NULL, -- meeting, deadline, milestone, rehearsal, performance, etc.
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text,
  is_all_day boolean DEFAULT false,
  recurrence_rule text, -- iCal RRULE format
  attendees uuid[], -- array of user/staff IDs
  reminder_minutes integer[], -- array of reminder times before event
  status text DEFAULT 'scheduled', -- scheduled, cancelled, completed, rescheduled
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

-- Staff availability/unavailability
CREATE TABLE IF NOT EXISTS staff_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  availability_type text NOT NULL, -- available, busy, out_of_office, vacation
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  reason text,
  is_recurring boolean DEFAULT false,
  recurrence_rule text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

-- Resource bookings (venues, equipment, etc.)
CREATE TABLE IF NOT EXISTS resource_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resource_type text NOT NULL, -- venue, equipment, vehicle, etc.
  resource_id uuid, -- references asset or custom resource
  resource_name text NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  booked_by uuid REFERENCES auth.users(id),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'confirmed', -- pending, confirmed, cancelled
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

CREATE INDEX idx_calendar_events_org ON calendar_events(organization_id);
CREATE INDEX idx_calendar_events_project ON calendar_events(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_calendar_events_time ON calendar_events(start_time, end_time);
CREATE INDEX idx_staff_availability_staff ON staff_availability(staff_id);
CREATE INDEX idx_staff_availability_time ON staff_availability(start_time, end_time);
CREATE INDEX idx_resource_bookings_org ON resource_bookings(organization_id);
CREATE INDEX idx_resource_bookings_time ON resource_bookings(start_time, end_time);

-- RLS policies
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY calendar_events_select ON calendar_events
  FOR SELECT USING (org_matches(organization_id));

CREATE POLICY calendar_events_manage ON calendar_events
  FOR ALL USING (
    org_matches(organization_id) AND
    role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY staff_availability_select ON staff_availability
  FOR SELECT USING (
    org_matches(organization_id) OR
    staff_id IN (SELECT id FROM staff WHERE auth.uid() IN (SELECT user_id FROM staff WHERE id = staff_availability.staff_id))
  );

CREATE POLICY staff_availability_manage ON staff_availability
  FOR ALL USING (
    org_matches(organization_id) AND
    (role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN') OR
     staff_id IN (SELECT id FROM staff WHERE auth.uid() IN (SELECT user_id FROM staff WHERE id = staff_availability.staff_id)))
  );

CREATE POLICY resource_bookings_select ON resource_bookings
  FOR SELECT USING (org_matches(organization_id));

CREATE POLICY resource_bookings_manage ON resource_bookings
  FOR ALL USING (
    org_matches(organization_id) AND
    role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Get calendar events for date range
CREATE OR REPLACE FUNCTION get_calendar_events(
  p_org_id uuid,
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_project_id uuid DEFAULT NULL,
  p_event_types text[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  event_type text,
  start_time timestamptz,
  end_time timestamptz,
  location text,
  project_name text,
  attendee_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ce.id,
    ce.title,
    ce.description,
    ce.event_type,
    ce.start_time,
    ce.end_time,
    ce.location,
    p.name as project_name,
    COALESCE(array_length(ce.attendees, 1), 0) as attendee_count
  FROM calendar_events ce
  LEFT JOIN projects p ON p.id = ce.project_id
  WHERE ce.organization_id = p_org_id
    AND ce.start_time <= p_end_date
    AND ce.end_time >= p_start_date
    AND (p_project_id IS NULL OR ce.project_id = p_project_id)
    AND (p_event_types IS NULL OR ce.event_type = ANY(p_event_types))
    AND ce.status != 'cancelled'
  ORDER BY ce.start_time;
END;
$$;

-- Check staff availability
CREATE OR REPLACE FUNCTION is_staff_available(
  p_staff_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_unavailable_count integer;
BEGIN
  SELECT COUNT(*)
  INTO v_unavailable_count
  FROM staff_availability
  WHERE staff_id = p_staff_id
    AND availability_type IN ('busy', 'out_of_office', 'vacation')
    AND start_time < p_end_time
    AND end_time > p_start_time;
  
  RETURN v_unavailable_count = 0;
END;
$$;

-- Check resource availability
CREATE OR REPLACE FUNCTION is_resource_available(
  p_resource_type text,
  p_resource_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_exclude_booking_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conflict_count integer;
BEGIN
  SELECT COUNT(*)
  INTO v_conflict_count
  FROM resource_bookings
  WHERE resource_type = p_resource_type
    AND resource_id = p_resource_id
    AND status IN ('pending', 'confirmed')
    AND start_time < p_end_time
    AND end_time > p_start_time
    AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id);
  
  RETURN v_conflict_count = 0;
END;
$$;

-- Find available staff for time slot
CREATE OR REPLACE FUNCTION find_available_staff(
  p_org_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_role text DEFAULT NULL,
  p_department text DEFAULT NULL
)
RETURNS TABLE (
  staff_id uuid,
  name text,
  role text,
  department text,
  current_allocation numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.first_name || ' ' || s.last_name,
    s.role,
    s.department,
    COALESCE(SUM(sa.allocation_percentage), 0)
  FROM staff s
  LEFT JOIN staff_assignments sa ON sa.staff_id = s.id
  WHERE s.organization_id = p_org_id
    AND (p_role IS NULL OR s.role = p_role)
    AND (p_department IS NULL OR s.department = p_department)
    AND is_staff_available(s.id, p_start_time, p_end_time)
  GROUP BY s.id, s.first_name, s.last_name, s.role, s.department
  HAVING COALESCE(SUM(sa.allocation_percentage), 0) < 100
  ORDER BY COALESCE(SUM(sa.allocation_percentage), 0);
END;
$$;

GRANT SELECT ON calendar_events TO authenticated;
GRANT SELECT ON staff_availability TO authenticated;
GRANT SELECT ON resource_bookings TO authenticated;
GRANT EXECUTE ON FUNCTION get_calendar_events TO authenticated;
GRANT EXECUTE ON FUNCTION is_staff_available TO authenticated;
GRANT EXECUTE ON FUNCTION is_resource_available TO authenticated;
GRANT EXECUTE ON FUNCTION find_available_staff TO authenticated;

COMMENT ON TABLE calendar_events IS 'Calendar events and scheduling';
COMMENT ON TABLE staff_availability IS 'Staff availability and time off tracking';
COMMENT ON TABLE resource_bookings IS 'Resource booking and scheduling';
COMMENT ON FUNCTION get_calendar_events IS 'Retrieves calendar events for date range';
COMMENT ON FUNCTION is_staff_available IS 'Checks if staff member is available';
COMMENT ON FUNCTION is_resource_available IS 'Checks if resource is available for booking';
COMMENT ON FUNCTION find_available_staff IS 'Finds available staff for time slot';
