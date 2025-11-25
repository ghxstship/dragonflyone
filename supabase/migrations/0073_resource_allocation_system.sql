-- Migration: Resource Allocation System
-- Description: Tables for crew assignments, asset allocations, and resource planning

-- Crew assignments table
CREATE TABLE IF NOT EXISTS crew_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  crew_id UUID NOT NULL REFERENCES crew_members(id),
  role TEXT NOT NULL,
  department TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  shift_start TIME,
  shift_end TIME,
  hourly_rate NUMERIC(10,2),
  daily_rate NUMERIC(10,2),
  flat_rate NUMERIC(10,2),
  estimated_hours NUMERIC(6,2),
  actual_hours NUMERIC(6,2),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'checked_in', 'working', 'completed', 'cancelled', 'no_show')),
  confirmation_status TEXT DEFAULT 'pending' CHECK (confirmation_status IN ('pending', 'confirmed', 'declined')),
  confirmed_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ,
  notes TEXT,
  special_requirements TEXT,
  assigned_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, crew_id, start_date),
  CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_crew_assignments_org ON crew_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_project ON crew_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_event ON crew_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_crew ON crew_assignments(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_dates ON crew_assignments(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_status ON crew_assignments(status);

-- Asset assignments table
CREATE TABLE IF NOT EXISTS asset_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  quantity INT DEFAULT 1,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  pickup_location TEXT,
  return_location TEXT,
  pickup_time TIMESTAMPTZ,
  return_time TIMESTAMPTZ,
  daily_rate NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'checked_out', 'in_use', 'returned', 'cancelled', 'overdue')),
  condition_on_checkout TEXT,
  condition_on_return TEXT,
  checkout_by UUID REFERENCES platform_users(id),
  checkout_at TIMESTAMPTZ,
  return_by UUID REFERENCES platform_users(id),
  return_at TIMESTAMPTZ,
  notes TEXT,
  assigned_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_asset_assignments_org ON asset_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_project ON asset_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_event ON asset_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_dates ON asset_assignments(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_asset_assignments_status ON asset_assignments(status);

-- Resource requests table
CREATE TABLE IF NOT EXISTS resource_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  request_type TEXT NOT NULL CHECK (request_type IN ('crew', 'equipment', 'vehicle', 'space', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  quantity INT DEFAULT 1,
  role TEXT,
  skills_required TEXT[],
  equipment_type TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected', 'cancelled')),
  requested_by UUID NOT NULL REFERENCES platform_users(id),
  approved_by UUID REFERENCES platform_users(id),
  approved_at TIMESTAMPTZ,
  fulfilled_quantity INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resource_requests_org ON resource_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_resource_requests_project ON resource_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_resource_requests_status ON resource_requests(status);
CREATE INDEX IF NOT EXISTS idx_resource_requests_type ON resource_requests(request_type);

-- Resource conflicts table
CREATE TABLE IF NOT EXISTS resource_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('crew', 'equipment', 'venue', 'vehicle')),
  resource_id UUID NOT NULL,
  conflict_type TEXT NOT NULL CHECK (conflict_type IN ('double_booking', 'overlap', 'unavailable', 'maintenance', 'capacity')),
  assignment_1_id UUID,
  assignment_2_id UUID,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  status TEXT NOT NULL DEFAULT 'unresolved' CHECK (status IN ('unresolved', 'resolved', 'ignored')),
  resolution TEXT,
  resolved_by UUID REFERENCES platform_users(id),
  resolved_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resource_conflicts_org ON resource_conflicts(organization_id);
CREATE INDEX IF NOT EXISTS idx_resource_conflicts_resource ON resource_conflicts(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_conflicts_status ON resource_conflicts(status);

-- Resource availability table
CREATE TABLE IF NOT EXISTS resource_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('crew', 'equipment', 'venue', 'vehicle')),
  resource_id UUID NOT NULL,
  availability_type TEXT NOT NULL CHECK (availability_type IN ('available', 'unavailable', 'tentative', 'blocked')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  recurrence_rule TEXT,
  reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resource_availability_resource ON resource_availability(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_availability_dates ON resource_availability(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_resource_availability_type ON resource_availability(availability_type);

-- Function to check resource availability
CREATE OR REPLACE FUNCTION check_resource_availability(
  p_resource_type TEXT,
  p_resource_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  is_available BOOLEAN,
  conflicts JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_conflicts JSONB := '[]'::JSONB;
  v_is_available BOOLEAN := TRUE;
BEGIN
  -- Check crew assignments
  IF p_resource_type = 'crew' THEN
    SELECT jsonb_agg(jsonb_build_object(
      'type', 'crew_assignment',
      'project_id', project_id,
      'start_date', start_date,
      'end_date', end_date
    )) INTO v_conflicts
    FROM crew_assignments
    WHERE crew_id = p_resource_id
      AND status NOT IN ('cancelled', 'completed')
      AND (start_date, end_date) OVERLAPS (p_start_date, p_end_date);
  
  -- Check asset assignments
  ELSIF p_resource_type = 'equipment' THEN
    SELECT jsonb_agg(jsonb_build_object(
      'type', 'asset_assignment',
      'project_id', project_id,
      'start_date', start_date,
      'end_date', end_date
    )) INTO v_conflicts
    FROM asset_assignments
    WHERE asset_id = p_resource_id
      AND status NOT IN ('cancelled', 'returned')
      AND (start_date, end_date) OVERLAPS (p_start_date, p_end_date);
  END IF;
  
  -- Check availability blocks
  IF EXISTS (
    SELECT 1 FROM resource_availability
    WHERE resource_type = p_resource_type
      AND resource_id = p_resource_id
      AND availability_type IN ('unavailable', 'blocked')
      AND (start_date, COALESCE(end_date, '9999-12-31'::TIMESTAMPTZ)) OVERLAPS (p_start_date, p_end_date)
  ) THEN
    v_is_available := FALSE;
  END IF;
  
  IF v_conflicts IS NOT NULL AND jsonb_array_length(v_conflicts) > 0 THEN
    v_is_available := FALSE;
  END IF;
  
  RETURN QUERY SELECT v_is_available, COALESCE(v_conflicts, '[]'::JSONB);
END;
$$;

-- Function to detect conflicts for a project
CREATE OR REPLACE FUNCTION detect_resource_conflicts(p_project_id UUID)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INT := 0;
  v_assignment RECORD;
BEGIN
  -- Check crew double bookings
  FOR v_assignment IN
    SELECT ca1.id as assignment_1, ca2.id as assignment_2, ca1.crew_id, ca1.start_date, ca1.end_date
    FROM crew_assignments ca1
    JOIN crew_assignments ca2 ON ca1.crew_id = ca2.crew_id
      AND ca1.id < ca2.id
      AND ca1.project_id = p_project_id
      AND ca1.status NOT IN ('cancelled', 'completed')
      AND ca2.status NOT IN ('cancelled', 'completed')
      AND (ca1.start_date, ca1.end_date) OVERLAPS (ca2.start_date, ca2.end_date)
  LOOP
    INSERT INTO resource_conflicts (
      organization_id, resource_type, resource_id, conflict_type,
      assignment_1_id, assignment_2_id, start_date, end_date, severity
    )
    SELECT 
      ca.organization_id, 'crew', v_assignment.crew_id, 'double_booking',
      v_assignment.assignment_1, v_assignment.assignment_2,
      v_assignment.start_date, v_assignment.end_date, 'error'
    FROM crew_assignments ca WHERE ca.id = v_assignment.assignment_1
    ON CONFLICT DO NOTHING;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$;

-- Function to get resource utilization
CREATE OR REPLACE FUNCTION get_resource_utilization(
  p_org_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_resource_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  resource_type TEXT,
  total_resources INT,
  assigned_resources INT,
  utilization_rate NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH crew_stats AS (
    SELECT 
      'crew'::TEXT as resource_type,
      COUNT(DISTINCT cm.id)::INT as total,
      COUNT(DISTINCT ca.crew_id)::INT as assigned
    FROM crew_members cm
    LEFT JOIN crew_assignments ca ON cm.id = ca.crew_id
      AND ca.start_date::DATE <= p_end_date
      AND ca.end_date::DATE >= p_start_date
      AND ca.status NOT IN ('cancelled')
    WHERE cm.organization_id = p_org_id
      AND cm.status = 'active'
  ),
  equipment_stats AS (
    SELECT 
      'equipment'::TEXT as resource_type,
      COUNT(DISTINCT a.id)::INT as total,
      COUNT(DISTINCT aa.asset_id)::INT as assigned
    FROM assets a
    LEFT JOIN asset_assignments aa ON a.id = aa.asset_id
      AND aa.start_date::DATE <= p_end_date
      AND aa.end_date::DATE >= p_start_date
      AND aa.status NOT IN ('cancelled', 'returned')
    WHERE a.organization_id = p_org_id
      AND a.status = 'available'
  )
  SELECT 
    s.resource_type,
    s.total as total_resources,
    s.assigned as assigned_resources,
    CASE WHEN s.total > 0 THEN ROUND((s.assigned::NUMERIC / s.total) * 100, 2) ELSE 0 END as utilization_rate
  FROM (
    SELECT * FROM crew_stats
    UNION ALL
    SELECT * FROM equipment_stats
  ) s
  WHERE p_resource_type IS NULL OR s.resource_type = p_resource_type;
END;
$$;

-- RLS policies
ALTER TABLE crew_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_availability ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON crew_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON asset_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON resource_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON resource_conflicts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON resource_availability TO authenticated;
GRANT EXECUTE ON FUNCTION check_resource_availability(TEXT, UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_resource_conflicts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_resource_utilization(UUID, DATE, DATE, TEXT) TO authenticated;
