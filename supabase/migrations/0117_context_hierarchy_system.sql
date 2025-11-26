-- 0117_context_hierarchy_system.sql
-- Unified context hierarchy for navigation: Organizations → Teams → Workspaces → Projects → Activations
-- Supports Vercel-style breadcrumb navigation across ATLVS and COMPVSS

-- =============================================================================
-- TEAMS TABLE
-- =============================================================================
-- Teams are groups of users within an organization (e.g., Production, Marketing, Finance)

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Lucide icon name or emoji
  color TEXT, -- Hex color for team badge
  is_default BOOLEAN DEFAULT false, -- Default team for new org members
  settings JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE INDEX idx_teams_org ON teams(organization_id);
CREATE INDEX idx_teams_slug ON teams(organization_id, slug);

-- Team membership (many-to-many with platform_users)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  platform_user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, platform_user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(platform_user_id);

-- =============================================================================
-- WORKSPACES TABLE
-- =============================================================================
-- Workspaces are project groupings within a team (e.g., "Q4 Tours", "Festival Season")

CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL, -- Optional team scope
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  visibility TEXT NOT NULL DEFAULT 'team', -- public, team, private
  settings JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE INDEX idx_workspaces_org ON workspaces(organization_id);
CREATE INDEX idx_workspaces_team ON workspaces(team_id);
CREATE INDEX idx_workspaces_slug ON workspaces(organization_id, slug);

-- Link projects to workspaces (many-to-many)
CREATE TABLE IF NOT EXISTS workspace_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, project_id)
);

CREATE INDEX idx_workspace_projects_workspace ON workspace_projects(workspace_id);
CREATE INDEX idx_workspace_projects_project ON workspace_projects(project_id);

-- =============================================================================
-- ACTIVATIONS TABLE
-- =============================================================================
-- Activations are real-world entities within events/projects
-- Examples: Stages, Amenities, Shops, Restaurants, Installations, Services, etc.

CREATE TYPE activation_category AS ENUM (
  'stage',           -- Performance stages
  'amenity',         -- Restrooms, water stations, first aid
  'food_beverage',   -- Restaurants, bars, food trucks
  'retail',          -- Merchandise, shops, vendors
  'installation',    -- Art installations, interactive experiences
  'service',         -- VIP services, concierge, transportation
  'hospitality',     -- Green rooms, artist lounges, VIP areas
  'production',      -- Sound, lighting, video equipment locations
  'safety',          -- Security checkpoints, emergency stations
  'infrastructure',  -- Power, water, communications
  'sponsor',         -- Sponsor activations, branded experiences
  'other'            -- Catch-all for custom types
);

CREATE TABLE IF NOT EXISTS activations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  
  -- Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  code TEXT, -- Short code for quick reference (e.g., "MAIN-STG", "VIP-1")
  description TEXT,
  
  -- Classification
  category activation_category NOT NULL DEFAULT 'other',
  subcategory TEXT, -- More specific type within category
  tags TEXT[],
  
  -- Location
  location_name TEXT, -- Human-readable location
  location_zone TEXT, -- Zone/area within venue
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  floor_level TEXT,
  map_coordinates JSONB, -- For custom venue maps
  
  -- Capacity & Specs
  capacity INTEGER,
  area_sqft NUMERIC(10, 2),
  specifications JSONB DEFAULT '{}'::jsonb, -- Technical specs
  
  -- Status & Scheduling
  status TEXT NOT NULL DEFAULT 'planned', -- planned, setup, active, teardown, completed
  setup_start TIMESTAMPTZ,
  activation_start TIMESTAMPTZ,
  activation_end TIMESTAMPTZ,
  teardown_end TIMESTAMPTZ,
  
  -- Ownership & Contacts
  owner_id UUID REFERENCES platform_users(id),
  vendor_id UUID REFERENCES vendors(id),
  contact_id UUID REFERENCES contacts(id),
  
  -- Visual
  icon TEXT,
  color TEXT,
  image_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(organization_id, slug)
);

CREATE INDEX idx_activations_org ON activations(organization_id);
CREATE INDEX idx_activations_project ON activations(project_id);
CREATE INDEX idx_activations_event ON activations(event_id);
CREATE INDEX idx_activations_category ON activations(category);
CREATE INDEX idx_activations_status ON activations(status);
CREATE INDEX idx_activations_slug ON activations(organization_id, slug);

-- Activation assignments (crew/resources assigned to activations)
CREATE TABLE IF NOT EXISTS activation_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activation_id UUID NOT NULL REFERENCES activations(id) ON DELETE CASCADE,
  assignee_type TEXT NOT NULL, -- crew_member, vendor, asset, team
  assignee_id UUID NOT NULL,
  role TEXT, -- Role in this activation
  shift_start TIMESTAMPTZ,
  shift_end TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(activation_id, assignee_type, assignee_id)
);

CREATE INDEX idx_activation_assignments_activation ON activation_assignments(activation_id);
CREATE INDEX idx_activation_assignments_assignee ON activation_assignments(assignee_type, assignee_id);

-- =============================================================================
-- USER CONTEXT PREFERENCES
-- =============================================================================
-- Stores user's last selected context for quick navigation

CREATE TABLE IF NOT EXISTS user_context_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- atlvs, compvss, gvteway
  last_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  last_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  last_workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  last_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  last_activation_id UUID REFERENCES activations(id) ON DELETE SET NULL,
  pinned_organizations UUID[] DEFAULT '{}',
  pinned_projects UUID[] DEFAULT '{}',
  recent_items JSONB DEFAULT '[]'::jsonb, -- Array of {type, id, timestamp}
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(platform_user_id, platform)
);

CREATE INDEX idx_user_context_prefs_user ON user_context_preferences(platform_user_id);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_context_preferences ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY teams_select ON teams
  FOR SELECT USING (org_matches(organization_id));

CREATE POLICY teams_manage ON teams
  FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'COMPVSS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Team members policies
CREATE POLICY team_members_select ON team_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM teams t WHERE t.id = team_id AND org_matches(t.organization_id))
  );

CREATE POLICY team_members_manage ON team_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM teams t WHERE t.id = team_id AND org_matches(t.organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'COMPVSS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  );

-- Workspaces policies
CREATE POLICY workspaces_select ON workspaces
  FOR SELECT USING (org_matches(organization_id));

CREATE POLICY workspaces_manage ON workspaces
  FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'COMPVSS_ADMIN', 'COMPVSS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

-- Workspace projects policies
CREATE POLICY workspace_projects_select ON workspace_projects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND org_matches(w.organization_id))
  );

CREATE POLICY workspace_projects_manage ON workspace_projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM workspaces w WHERE w.id = workspace_id AND org_matches(w.organization_id))
  );

-- Activations policies
CREATE POLICY activations_select ON activations
  FOR SELECT USING (org_matches(organization_id));

CREATE POLICY activations_manage ON activations
  FOR ALL USING (org_matches(organization_id));

-- Activation assignments policies
CREATE POLICY activation_assignments_select ON activation_assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM activations a WHERE a.id = activation_id AND org_matches(a.organization_id))
  );

CREATE POLICY activation_assignments_manage ON activation_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM activations a WHERE a.id = activation_id AND org_matches(a.organization_id))
  );

-- User context preferences policies
CREATE POLICY user_context_prefs_own ON user_context_preferences
  FOR ALL USING (
    platform_user_id IN (SELECT id FROM platform_users WHERE auth_user_id = auth.uid())
  );

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Get user's teams
CREATE OR REPLACE FUNCTION get_user_teams(p_user_id UUID)
RETURNS TABLE (
  team_id UUID,
  team_name TEXT,
  team_slug TEXT,
  organization_id UUID,
  organization_name TEXT,
  role TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    t.id,
    t.name,
    t.slug,
    t.organization_id,
    o.name,
    tm.role
  FROM team_members tm
  JOIN teams t ON t.id = tm.team_id
  JOIN organizations o ON o.id = t.organization_id
  WHERE tm.platform_user_id = p_user_id
  ORDER BY o.name, t.name;
$$;

-- Get activations for a project/event
CREATE OR REPLACE FUNCTION get_activations(
  p_org_id UUID,
  p_project_id UUID DEFAULT NULL,
  p_event_id UUID DEFAULT NULL,
  p_category activation_category DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  code TEXT,
  category activation_category,
  subcategory TEXT,
  status TEXT,
  location_name TEXT,
  location_zone TEXT,
  capacity INTEGER
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    a.id,
    a.name,
    a.slug,
    a.code,
    a.category,
    a.subcategory,
    a.status,
    a.location_name,
    a.location_zone,
    a.capacity
  FROM activations a
  WHERE a.organization_id = p_org_id
    AND (p_project_id IS NULL OR a.project_id = p_project_id)
    AND (p_event_id IS NULL OR a.event_id = p_event_id)
    AND (p_category IS NULL OR a.category = p_category)
  ORDER BY a.category, a.name;
$$;

-- Update user context preference
CREATE OR REPLACE FUNCTION update_user_context(
  p_platform TEXT,
  p_org_id UUID DEFAULT NULL,
  p_team_id UUID DEFAULT NULL,
  p_workspace_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_activation_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM platform_users WHERE auth_user_id = auth.uid();
  
  INSERT INTO user_context_preferences (
    platform_user_id, platform, 
    last_organization_id, last_team_id, last_workspace_id, 
    last_project_id, last_activation_id, updated_at
  )
  VALUES (
    v_user_id, p_platform,
    p_org_id, p_team_id, p_workspace_id,
    p_project_id, p_activation_id, now()
  )
  ON CONFLICT (platform_user_id, platform) DO UPDATE SET
    last_organization_id = COALESCE(p_org_id, user_context_preferences.last_organization_id),
    last_team_id = COALESCE(p_team_id, user_context_preferences.last_team_id),
    last_workspace_id = COALESCE(p_workspace_id, user_context_preferences.last_workspace_id),
    last_project_id = COALESCE(p_project_id, user_context_preferences.last_project_id),
    last_activation_id = COALESCE(p_activation_id, user_context_preferences.last_activation_id),
    updated_at = now();
END;
$$;

-- =============================================================================
-- GRANTS
-- =============================================================================

GRANT SELECT ON teams TO authenticated;
GRANT SELECT ON team_members TO authenticated;
GRANT SELECT ON workspaces TO authenticated;
GRANT SELECT ON workspace_projects TO authenticated;
GRANT SELECT ON activations TO authenticated;
GRANT SELECT ON activation_assignments TO authenticated;
GRANT ALL ON user_context_preferences TO authenticated;

GRANT EXECUTE ON FUNCTION get_user_teams TO authenticated;
GRANT EXECUTE ON FUNCTION get_activations TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_context TO authenticated;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE teams IS 'User groups within an organization for collaboration and access control';
COMMENT ON TABLE team_members IS 'Many-to-many relationship between teams and platform users';
COMMENT ON TABLE workspaces IS 'Project groupings for organizing related work';
COMMENT ON TABLE workspace_projects IS 'Many-to-many relationship between workspaces and projects';
COMMENT ON TABLE activations IS 'Real-world entities within events (stages, amenities, shops, etc.)';
COMMENT ON TABLE activation_assignments IS 'Resource assignments to activations';
COMMENT ON TABLE user_context_preferences IS 'User navigation context preferences per platform';
COMMENT ON TYPE activation_category IS 'Classification categories for activations';
