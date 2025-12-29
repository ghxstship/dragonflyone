-- ============================================================================
-- 0002_core_foundation.sql
-- Core Foundation Tables: Organizations, Users, Auth, Roles
-- GHXSTSHIP Platform - Single Source of Truth
-- ============================================================================

-- ============================================================================
-- ORGANIZATIONS (Root entity - all data is org-scoped)
-- ============================================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  legal_name TEXT,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  locale TEXT DEFAULT 'en-US',
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_active ON organizations(is_active) WHERE is_active = true;

-- ============================================================================
-- PLATFORM USERS (Auth users linked to organizations)
-- ============================================================================

CREATE TABLE platform_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  timezone TEXT,
  locale TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_platform_users_auth ON platform_users(auth_user_id);
CREATE INDEX idx_platform_users_org ON platform_users(organization_id);
CREATE INDEX idx_platform_users_email ON platform_users(email);

-- ============================================================================
-- USER ORGANIZATIONS (M:M for multi-org users)
-- ============================================================================

CREATE TABLE user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer', 'guest')),
  is_default BOOLEAN DEFAULT false,
  invited_by UUID REFERENCES platform_users(id),
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

CREATE INDEX idx_user_organizations_user ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org ON user_organizations(organization_id);

-- ============================================================================
-- ROLE DEFINITIONS (Platform-wide role definitions)
-- ============================================================================

CREATE TABLE role_definitions (
  code TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL,
  hierarchy_rank INTEGER NOT NULL DEFAULT 0,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default role definitions
INSERT INTO role_definitions (code, platform, description, level, hierarchy_rank, is_system) VALUES
  ('LEGEND_SUPER_ADMIN', 'legend', 'Global superuser', 'god', 5, true),
  ('LEGEND_ADMIN', 'legend', 'Legend admin', 'god', 5, true),
  ('LEGEND_DEVELOPER', 'legend', 'Internal developer', 'god', 5, true),
  ('LEGEND_SUPPORT', 'legend', 'Support with impersonation', 'god', 5, true),
  ('ATLVS_SUPER_ADMIN', 'atlvs', 'Org super admin', 'admin', 4, true),
  ('ATLVS_ADMIN', 'atlvs', 'Org admin', 'admin', 3, true),
  ('ATLVS_TEAM_MEMBER', 'atlvs', 'Contributor', 'member', 2, true),
  ('ATLVS_VIEWER', 'atlvs', 'Read-only', 'viewer', 1, true),
  ('COMPVSS_ADMIN', 'compvss', 'Production admin', 'admin', 3, true),
  ('COMPVSS_TEAM_MEMBER', 'compvss', 'Production member', 'member', 2, true),
  ('COMPVSS_VIEWER', 'compvss', 'Production viewer', 'viewer', 1, true),
  ('GVTEWAY_ADMIN', 'gvteway', 'Platform admin', 'admin', 3, true),
  ('GVTEWAY_MEMBER', 'gvteway', 'Member', 'member', 1, true)
ON CONFLICT (code) DO UPDATE SET 
  platform = EXCLUDED.platform,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  hierarchy_rank = EXCLUDED.hierarchy_rank;

-- ============================================================================
-- USER ROLES (User role assignments)
-- ============================================================================

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_user_id UUID NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role_code TEXT NOT NULL REFERENCES role_definitions(code) ON DELETE CASCADE,
  granted_by UUID REFERENCES platform_users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(platform_user_id, organization_id, role_code)
);

CREATE INDEX idx_user_roles_user ON user_roles(platform_user_id);
CREATE INDEX idx_user_roles_org ON user_roles(organization_id);
CREATE INDEX idx_user_roles_code ON user_roles(role_code);

-- ============================================================================
-- AUTH HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.current_platform_user_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM platform_users WHERE auth_user_id = auth.uid() ORDER BY created_at DESC LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM platform_users WHERE auth_user_id = auth.uid() ORDER BY created_at DESC LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims jsonb;
  role text;
  highest text;
BEGIN
  claims := auth.jwt();
  role := claims ->> 'app_role';
  IF role IS NOT NULL THEN
    RETURN role;
  END IF;

  SELECT rd.code
  INTO highest
  FROM user_roles ur
  JOIN role_definitions rd ON rd.code = ur.role_code
  JOIN platform_users pu ON pu.id = ur.platform_user_id
  WHERE pu.auth_user_id = auth.uid()
  ORDER BY rd.hierarchy_rank DESC
  LIMIT 1;

  RETURN COALESCE(highest, 'ATLVS_VIEWER');
END;
$$;

CREATE OR REPLACE FUNCTION public.org_matches(p_org UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(p_org = current_organization_id(), true) OR current_app_role() LIKE 'LEGEND_%';
$$;

CREATE OR REPLACE FUNCTION public.role_in(VARIADIC roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT current_app_role() = ANY(roles);
$$;

CREATE OR REPLACE FUNCTION public.has_org_access(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_organizations 
    WHERE user_id = current_platform_user_id() 
    AND organization_id = p_org_id
  ) OR current_app_role() LIKE 'LEGEND_%';
$$;

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER platform_users_updated_at
  BEFORE UPDATE ON platform_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_organizations_updated_at
  BEFORE UPDATE ON user_organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
