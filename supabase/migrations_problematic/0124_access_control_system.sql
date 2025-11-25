-- Migration: Access Control System
-- Description: Tables for roles, permissions, and access management

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  role_type TEXT NOT NULL CHECK (role_type IN ('system', 'organization', 'project', 'event', 'custom')),
  permissions TEXT[] NOT NULL DEFAULT '{}',
  parent_role_id UUID REFERENCES roles(id),
  is_system BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  priority INT DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_roles_org ON roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_roles_type ON roles(role_type);
CREATE INDEX IF NOT EXISTS idx_roles_system ON roles(is_system);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  is_system BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);

-- User roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  organization_id UUID REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  event_id UUID REFERENCES events(id),
  granted_by UUID REFERENCES platform_users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  UNIQUE(user_id, role_id, organization_id, project_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org ON user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(is_active);

-- Role invitations table
CREATE TABLE IF NOT EXISTS role_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  role_id UUID NOT NULL REFERENCES roles(id),
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES platform_users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'revoked')),
  invite_token TEXT UNIQUE,
  message TEXT,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_role_invitations_org ON role_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_role_invitations_email ON role_invitations(email);
CREATE INDEX IF NOT EXISTS idx_role_invitations_token ON role_invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_role_invitations_status ON role_invitations(status);

-- Access logs table
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id),
  organization_id UUID REFERENCES organizations(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  permission_checked TEXT,
  access_granted BOOLEAN NOT NULL,
  denial_reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  request_path TEXT,
  request_method TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_org ON access_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON access_logs(action);
CREATE INDEX IF NOT EXISTS idx_access_logs_resource ON access_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created ON access_logs(created_at);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES platform_users(id),
  name TEXT NOT NULL,
  description TEXT,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  permissions TEXT[],
  scopes TEXT[],
  rate_limit INT DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  usage_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES platform_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES platform_users(id)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- Function to check user permission
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_permission TEXT,
  p_organization_id UUID DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_has_permission BOOLEAN := FALSE;
BEGIN
  -- Check if user has the permission through any of their roles
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
      AND ur.is_active = TRUE
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND (p_organization_id IS NULL OR ur.organization_id = p_organization_id OR ur.organization_id IS NULL)
      AND (p_permission = ANY(r.permissions) OR '*' = ANY(r.permissions))
  ) INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(
  p_user_id UUID,
  p_organization_id UUID DEFAULT NULL
)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
  v_permissions TEXT[];
BEGIN
  SELECT ARRAY_AGG(DISTINCT perm)
  INTO v_permissions
  FROM (
    SELECT UNNEST(r.permissions) as perm
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
      AND ur.is_active = TRUE
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
      AND (p_organization_id IS NULL OR ur.organization_id = p_organization_id OR ur.organization_id IS NULL)
  ) perms;
  
  RETURN COALESCE(v_permissions, '{}');
END;
$$;

-- Function to get user roles
CREATE OR REPLACE FUNCTION get_user_roles(
  p_user_id UUID,
  p_organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
  role_id UUID,
  role_name TEXT,
  role_type TEXT,
  permissions TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.role_type,
    r.permissions
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = p_user_id
    AND ur.is_active = TRUE
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    AND (p_organization_id IS NULL OR ur.organization_id = p_organization_id OR ur.organization_id IS NULL);
END;
$$;

-- Insert default system roles
INSERT INTO roles (name, display_name, description, role_type, permissions, is_system, priority)
VALUES 
  ('super_admin', 'Super Administrator', 'Full system access', 'system', ARRAY['*'], true, 100),
  ('org_admin', 'Organization Admin', 'Full organization access', 'organization', ARRAY['org:*', 'users:*', 'events:*', 'tickets:*', 'reports:*'], true, 90),
  ('org_manager', 'Organization Manager', 'Manage organization operations', 'organization', ARRAY['events:*', 'tickets:*', 'reports:read'], true, 80),
  ('event_manager', 'Event Manager', 'Manage events', 'event', ARRAY['events:read', 'events:update', 'tickets:*', 'attendees:*'], true, 70),
  ('box_office', 'Box Office', 'Ticket sales and check-in', 'event', ARRAY['tickets:read', 'tickets:sell', 'attendees:checkin'], true, 60),
  ('viewer', 'Viewer', 'Read-only access', 'organization', ARRAY['events:read', 'reports:read'], true, 10)
ON CONFLICT DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, display_name, description, category, resource, action)
VALUES 
  ('events:create', 'Create Events', 'Create new events', 'Events', 'events', 'create'),
  ('events:read', 'View Events', 'View event details', 'Events', 'events', 'read'),
  ('events:update', 'Update Events', 'Modify event details', 'Events', 'events', 'update'),
  ('events:delete', 'Delete Events', 'Delete events', 'Events', 'events', 'delete'),
  ('tickets:create', 'Create Tickets', 'Create ticket types', 'Tickets', 'tickets', 'create'),
  ('tickets:read', 'View Tickets', 'View ticket information', 'Tickets', 'tickets', 'read'),
  ('tickets:sell', 'Sell Tickets', 'Process ticket sales', 'Tickets', 'tickets', 'sell'),
  ('tickets:refund', 'Refund Tickets', 'Process refunds', 'Tickets', 'tickets', 'refund'),
  ('users:create', 'Create Users', 'Add new users', 'Users', 'users', 'create'),
  ('users:read', 'View Users', 'View user information', 'Users', 'users', 'read'),
  ('users:update', 'Update Users', 'Modify user details', 'Users', 'users', 'update'),
  ('users:delete', 'Delete Users', 'Remove users', 'Users', 'users', 'delete'),
  ('reports:read', 'View Reports', 'Access reports', 'Reports', 'reports', 'read'),
  ('reports:export', 'Export Reports', 'Export report data', 'Reports', 'reports', 'export'),
  ('settings:read', 'View Settings', 'View organization settings', 'Settings', 'settings', 'read'),
  ('settings:update', 'Update Settings', 'Modify settings', 'Settings', 'settings', 'update')
ON CONFLICT DO NOTHING;

-- RLS policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON role_invitations TO authenticated;
GRANT SELECT, INSERT ON access_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON api_keys TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_permission(UUID, TEXT, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_roles(UUID, UUID) TO authenticated;
