-- 0042_enhanced_rls_policies.sql
-- Comprehensive RLS policies for all major tables

-- Enhanced Projects RLS
DROP POLICY IF EXISTS projects_select ON projects;
DROP POLICY IF EXISTS projects_insert ON projects;
DROP POLICY IF EXISTS projects_update ON projects;
DROP POLICY IF EXISTS projects_delete ON projects;

CREATE POLICY projects_select ON projects
  FOR SELECT USING (
    org_matches(organization_id) AND
    role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY projects_insert ON projects
  FOR INSERT WITH CHECK (
    org_matches(organization_id) AND
    role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY projects_update ON projects
  FOR UPDATE USING (
    org_matches(organization_id) AND
    role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY projects_delete ON projects
  FOR DELETE USING (
    org_matches(organization_id) AND
    role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Enhanced Tasks RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tasks_select ON tasks;
DROP POLICY IF EXISTS tasks_insert ON tasks;
DROP POLICY IF EXISTS tasks_update ON tasks;
DROP POLICY IF EXISTS tasks_delete ON tasks;

CREATE POLICY tasks_select ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tasks.project_id
      AND org_matches(p.organization_id)
      AND role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

CREATE POLICY tasks_insert ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tasks.project_id
      AND org_matches(p.organization_id)
      AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

CREATE POLICY tasks_update ON tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tasks.project_id
      AND org_matches(p.organization_id)
      AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

CREATE POLICY tasks_delete ON tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tasks.project_id
      AND org_matches(p.organization_id)
      AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

-- Enhanced Contacts RLS
DROP POLICY IF EXISTS contacts_select ON contacts;
DROP POLICY IF EXISTS contacts_manage ON contacts;

CREATE POLICY contacts_select ON contacts
  FOR SELECT USING (
    org_matches(organization_id) AND
    role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY contacts_insert ON contacts
  FOR INSERT WITH CHECK (
    org_matches(organization_id) AND
    role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY contacts_update ON contacts
  FOR UPDATE USING (
    org_matches(organization_id) AND
    role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY contacts_delete ON contacts
  FOR DELETE USING (
    org_matches(organization_id) AND
    role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Enhanced Vendors RLS  
DROP POLICY IF EXISTS vendors_select ON vendors;
DROP POLICY IF EXISTS vendors_manage ON vendors;

CREATE POLICY vendors_select ON vendors
  FOR SELECT USING (
    org_matches(organization_id) AND
    role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY vendors_insert ON vendors
  FOR INSERT WITH CHECK (
    org_matches(organization_id) AND
    role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY vendors_update ON vendors
  FOR UPDATE USING (
    org_matches(organization_id) AND
    role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY vendors_delete ON vendors
  FOR DELETE USING (
    org_matches(organization_id) AND
    role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Enhanced Assets RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS assets_select ON assets;
DROP POLICY IF EXISTS assets_manage ON assets;

CREATE POLICY assets_select ON assets
  FOR SELECT USING (
    org_matches(organization_id) AND
    role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY assets_insert ON assets
  FOR INSERT WITH CHECK (
    org_matches(organization_id) AND
    role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY assets_update ON assets
  FOR UPDATE USING (
    org_matches(organization_id) AND
    role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

CREATE POLICY assets_delete ON assets
  FOR DELETE USING (
    org_matches(organization_id) AND
    role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
  );

-- Budget Line Items RLS
DROP POLICY IF EXISTS budget_line_items_select ON budget_line_items;
DROP POLICY IF EXISTS budget_line_items_manage ON budget_line_items;

CREATE POLICY budget_line_items_select ON budget_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = budget_line_items.project_id
      AND org_matches(p.organization_id)
      AND role_in('ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

CREATE POLICY budget_line_items_insert ON budget_line_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = budget_line_items.project_id
      AND org_matches(p.organization_id)
      AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

CREATE POLICY budget_line_items_update ON budget_line_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = budget_line_items.project_id
      AND org_matches(p.organization_id)
      AND role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

CREATE POLICY budget_line_items_delete ON budget_line_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = budget_line_items.project_id
      AND org_matches(p.organization_id)
      AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')
    )
  );

-- Add helpful comments
COMMENT ON POLICY projects_select ON projects IS 'All authenticated users in org can view projects';
COMMENT ON POLICY projects_insert ON projects IS 'Team members and above can create projects';
COMMENT ON POLICY projects_update ON projects IS 'Team members and above can update projects';
COMMENT ON POLICY projects_delete ON projects IS 'Only admins can delete projects';
