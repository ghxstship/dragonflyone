-- 0048_advanced_permissions.sql
-- Advanced permission management and team-based access control

-- Team permissions table
CREATE TABLE IF NOT EXISTS team_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  description text,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, team_name)
);

-- User team memberships
CREATE TABLE IF NOT EXISTS user_team_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_permission_id uuid NOT NULL REFERENCES team_permissions(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, team_permission_id)
);

-- Indexes
CREATE INDEX idx_team_permissions_org ON team_permissions(organization_id);
CREATE INDEX idx_user_team_memberships_user ON user_team_memberships(user_id);

-- RLS policies
ALTER TABLE team_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_team_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY team_permissions_select ON team_permissions
  FOR SELECT USING (org_matches(organization_id));

CREATE POLICY team_permissions_manage ON team_permissions
  FOR ALL USING (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));

CREATE POLICY user_team_memberships_select ON user_team_memberships
  FOR SELECT USING (auth.uid() = user_id OR (org_matches(organization_id) AND role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN')));

-- Grant team permission function
CREATE OR REPLACE FUNCTION assign_user_to_team(
  p_user_id uuid,
  p_team_id uuid,
  p_org_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_membership_id uuid;
BEGIN
  INSERT INTO user_team_memberships (user_id, team_permission_id, organization_id)
  VALUES (p_user_id, p_team_id, p_org_id)
  ON CONFLICT (user_id, team_permission_id) DO NOTHING
  RETURNING id INTO v_membership_id;
  RETURN v_membership_id;
END;
$$;

GRANT SELECT ON team_permissions TO authenticated;
GRANT SELECT ON user_team_memberships TO authenticated;
GRANT EXECUTE ON FUNCTION assign_user_to_team TO authenticated;

COMMENT ON TABLE team_permissions IS 'Team-based permission templates';
COMMENT ON TABLE user_team_memberships IS 'User assignments to teams';
