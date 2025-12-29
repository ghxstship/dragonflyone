-- ============================================================================
-- 0016_event_roles.sql
-- Event-Specific Roles and Assignments
-- GHXSTSHIP Platform - 3NF Gap Remediation
-- ============================================================================

-- ============================================================================
-- EVENT ROLE DEFINITIONS (Event-specific role hierarchy)
-- ============================================================================

CREATE TABLE event_role_definitions (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  level INTEGER NOT NULL,
  description TEXT,
  platforms TEXT[] NOT NULL DEFAULT ARRAY['ATLVS', 'COMPVSS', 'GVTEWAY'],
  permissions JSONB DEFAULT '[]'::jsonb,
  color TEXT,
  icon TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- EVENT ROLE HIERARCHY (Role inheritance)
-- ============================================================================

CREATE TABLE event_role_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_role_code TEXT NOT NULL REFERENCES event_role_definitions(code) ON DELETE CASCADE,
  child_role_code TEXT NOT NULL REFERENCES event_role_definitions(code) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_role_code, child_role_code)
);

CREATE INDEX idx_role_hierarchy_parent ON event_role_hierarchy(parent_role_code);
CREATE INDEX idx_role_hierarchy_child ON event_role_hierarchy(child_role_code);

-- ============================================================================
-- EVENT ROLE ASSIGNMENTS
-- ============================================================================

CREATE TABLE event_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES legend_events(id) ON DELETE CASCADE,
  platform_user_id UUID REFERENCES platform_users(id) ON DELETE CASCADE,
  person_id UUID REFERENCES legend_people(id) ON DELETE CASCADE,
  role_code TEXT NOT NULL REFERENCES event_role_definitions(code) ON DELETE CASCADE,
  assigned_by UUID REFERENCES platform_users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT event_role_user_or_person CHECK (platform_user_id IS NOT NULL OR person_id IS NOT NULL)
);

CREATE INDEX idx_event_roles_org ON event_role_assignments(organization_id);
CREATE INDEX idx_event_roles_event ON event_role_assignments(event_id);
CREATE INDEX idx_event_roles_user ON event_role_assignments(platform_user_id);
CREATE INDEX idx_event_roles_person ON event_role_assignments(person_id);
CREATE INDEX idx_event_roles_code ON event_role_assignments(role_code);
CREATE UNIQUE INDEX idx_event_roles_unique_user ON event_role_assignments(event_id, platform_user_id, role_code) WHERE platform_user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_event_roles_unique_person ON event_role_assignments(event_id, person_id, role_code) WHERE person_id IS NOT NULL;

-- ============================================================================
-- SEED EVENT ROLE DEFINITIONS
-- ============================================================================

INSERT INTO event_role_definitions (code, label, level, description, platforms, is_system) VALUES
  ('EXECUTIVE', 'Executive', 100, 'C-suite and executive leadership', ARRAY['ATLVS', 'COMPVSS', 'GVTEWAY'], true),
  ('CORE_AAA', 'Core AAA', 90, 'Core team with full access', ARRAY['ATLVS', 'COMPVSS', 'GVTEWAY'], true),
  ('AA', 'AA', 80, 'Senior team members', ARRAY['ATLVS', 'COMPVSS', 'GVTEWAY'], true),
  ('PRODUCTION', 'Production', 70, 'Production team', ARRAY['COMPVSS'], true),
  ('MANAGEMENT', 'Management', 60, 'Management team', ARRAY['ATLVS', 'COMPVSS'], true),
  ('CREW', 'Crew', 50, 'Event crew members', ARRAY['COMPVSS'], true),
  ('STAFF', 'Staff', 40, 'General staff', ARRAY['ATLVS', 'COMPVSS', 'GVTEWAY'], true),
  ('VENDOR', 'Vendor', 30, 'Vendor representatives', ARRAY['ATLVS', 'COMPVSS'], true),
  ('MEDIA', 'Media', 25, 'Media and press', ARRAY['GVTEWAY'], true),
  ('SPONSOR', 'Sponsor', 25, 'Sponsor representatives', ARRAY['ATLVS', 'GVTEWAY'], true),
  ('VIP_L1', 'VIP Level 1', 20, 'VIP guests - highest tier', ARRAY['GVTEWAY'], true),
  ('VIP_L2', 'VIP Level 2', 15, 'VIP guests - second tier', ARRAY['GVTEWAY'], true),
  ('VIP_L3', 'VIP Level 3', 12, 'VIP guests - third tier', ARRAY['GVTEWAY'], true),
  ('GA_L1', 'General Admission L1', 10, 'General admission - premium', ARRAY['GVTEWAY'], true),
  ('GA_L2', 'General Admission L2', 5, 'General admission - standard', ARRAY['GVTEWAY'], true),
  ('GUEST', 'Guest', 1, 'General guest', ARRAY['GVTEWAY'], true)
ON CONFLICT (code) DO UPDATE SET
  label = EXCLUDED.label,
  level = EXCLUDED.level,
  description = EXCLUDED.description,
  platforms = EXCLUDED.platforms;

-- Set up role hierarchy
INSERT INTO event_role_hierarchy (parent_role_code, child_role_code) VALUES
  ('EXECUTIVE', 'CORE_AAA'),
  ('CORE_AAA', 'AA'),
  ('AA', 'PRODUCTION'),
  ('AA', 'MANAGEMENT'),
  ('PRODUCTION', 'CREW'),
  ('MANAGEMENT', 'STAFF'),
  ('VIP_L1', 'VIP_L2'),
  ('VIP_L2', 'VIP_L3'),
  ('VIP_L3', 'GA_L1'),
  ('GA_L1', 'GA_L2'),
  ('GA_L2', 'GUEST')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE event_role_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_role_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_role_assignments ENABLE ROW LEVEL SECURITY;

-- Role Definitions policies (read for all authenticated)
CREATE POLICY event_role_defs_select ON event_role_definitions FOR SELECT USING (true);
CREATE POLICY event_role_defs_manage ON event_role_definitions FOR ALL USING (role_in('LEGEND_SUPER_ADMIN'));

-- Role Hierarchy policies
CREATE POLICY event_role_hierarchy_select ON event_role_hierarchy FOR SELECT USING (true);
CREATE POLICY event_role_hierarchy_manage ON event_role_hierarchy FOR ALL USING (role_in('LEGEND_SUPER_ADMIN'));

-- Role Assignments policies
CREATE POLICY event_role_assignments_select ON event_role_assignments FOR SELECT USING (
  org_matches(organization_id) OR 
  platform_user_id = current_platform_user_id()
);
CREATE POLICY event_role_assignments_insert ON event_role_assignments FOR INSERT WITH CHECK (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN')
);
CREATE POLICY event_role_assignments_update ON event_role_assignments FOR UPDATE USING (
  org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN')
);
CREATE POLICY event_role_assignments_delete ON event_role_assignments FOR DELETE USING (
  org_matches(organization_id) AND role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON event_role_definitions TO authenticated;
GRANT SELECT ON event_role_hierarchy TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON event_role_assignments TO authenticated;

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE OR REPLACE VIEW user_event_roles AS
SELECT
  era.id,
  era.organization_id,
  era.event_id,
  e.name AS event_name,
  era.platform_user_id,
  pu.email AS user_email,
  pu.full_name AS user_name,
  era.person_id,
  lp.display_name AS person_name,
  era.role_code,
  erd.label AS role_label,
  erd.level AS role_level,
  era.assigned_at,
  era.valid_from,
  era.valid_until
FROM event_role_assignments era
JOIN event_role_definitions erd ON erd.code = era.role_code
JOIN legend_events e ON e.id = era.event_id
LEFT JOIN platform_users pu ON pu.id = era.platform_user_id
LEFT JOIN legend_people lp ON lp.id = era.person_id;

GRANT SELECT ON user_event_roles TO authenticated;

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_role_claims(p_auth_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_platform_user_id UUID;
  v_platform_roles JSONB;
  v_event_roles JSONB;
  v_result JSONB;
BEGIN
  SELECT id INTO v_platform_user_id
  FROM platform_users
  WHERE auth_user_id = p_auth_user_id
  LIMIT 1;

  IF v_platform_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'platform_roles', '[]'::jsonb,
      'event_roles', '[]'::jsonb,
      'highest_role', NULL
    );
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'role_code', ur.role_code,
    'organization_id', ur.organization_id,
    'level', rd.level,
    'hierarchy_rank', rd.hierarchy_rank
  )), '[]'::jsonb)
  INTO v_platform_roles
  FROM user_roles ur
  JOIN role_definitions rd ON rd.code = ur.role_code
  WHERE ur.platform_user_id = v_platform_user_id
    AND (ur.expires_at IS NULL OR ur.expires_at > now());

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'role_code', era.role_code,
    'event_id', era.event_id,
    'level', erd.level
  )), '[]'::jsonb)
  INTO v_event_roles
  FROM event_role_assignments era
  JOIN event_role_definitions erd ON erd.code = era.role_code
  WHERE era.platform_user_id = v_platform_user_id
    AND (era.valid_until IS NULL OR era.valid_until > now());

  SELECT jsonb_build_object(
    'platform_roles', v_platform_roles,
    'event_roles', v_event_roles,
    'highest_role', (
      SELECT rd.code
      FROM user_roles ur
      JOIN role_definitions rd ON rd.code = ur.role_code
      WHERE ur.platform_user_id = v_platform_user_id
      ORDER BY rd.hierarchy_rank DESC
      LIMIT 1
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_role_claims(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION rpc_assign_event_roles(
  p_event_id UUID,
  p_assignments JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_assignment JSONB;
  v_count INTEGER := 0;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM legend_events
  WHERE id = p_event_id;

  IF NOT org_matches(v_org_id) OR NOT role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'GVTEWAY_ADMIN', 'LEGEND_SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  FOR v_assignment IN SELECT * FROM jsonb_array_elements(p_assignments)
  LOOP
    INSERT INTO event_role_assignments (
      organization_id,
      event_id,
      platform_user_id,
      person_id,
      role_code,
      assigned_by,
      notes
    ) VALUES (
      v_org_id,
      p_event_id,
      (v_assignment->>'platform_user_id')::UUID,
      (v_assignment->>'person_id')::UUID,
      v_assignment->>'role_code',
      current_platform_user_id(),
      v_assignment->>'notes'
    )
    ON CONFLICT DO NOTHING;
    
    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'event_id', p_event_id,
    'assignments_processed', v_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION rpc_assign_event_roles(UUID, JSONB) TO authenticated;
