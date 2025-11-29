-- 0119_seed_demo_users.sql
-- Demo users for testing each role on each platform
-- Password for all demo accounts: Demo123!
-- 
-- NOTE: This migration creates platform_users records. The actual Supabase Auth
-- users must be created separately using the seed-demo-users.ts script.

-- ============================================================================
-- DEMO ORGANIZATION (if not exists)
-- ============================================================================
INSERT INTO organizations (id, slug, name, timezone)
VALUES ('00000000-0000-0000-0000-000000000001', 'ghxstship', 'GHXSTSHIP Industries', 'America/New_York')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- ATLVS DEMO USERS
-- ============================================================================

-- ATLVS Super Admin
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0001-000000000001',
  '10000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'atlvs.superadmin@demo.ghxstship.com',
  'Atlas SuperAdmin'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- ATLVS Admin
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0001-000000000002',
  '10000000-0000-0000-0001-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'atlvs.admin@demo.ghxstship.com',
  'Atlas Admin'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- ATLVS Team Member
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0001-000000000003',
  '10000000-0000-0000-0001-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'atlvs.team@demo.ghxstship.com',
  'Atlas TeamMember'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- ATLVS Viewer
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0001-000000000004',
  '10000000-0000-0000-0001-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'atlvs.viewer@demo.ghxstship.com',
  'Atlas Viewer'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- ============================================================================
-- COMPVSS DEMO USERS
-- ============================================================================

-- COMPVSS Admin
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0002-000000000001',
  '10000000-0000-0000-0002-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'compvss.admin@demo.ghxstship.com',
  'Compass Admin'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- COMPVSS Team Member
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0002-000000000002',
  '10000000-0000-0000-0002-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'compvss.team@demo.ghxstship.com',
  'Compass TeamMember'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- COMPVSS Collaborator
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0002-000000000003',
  '10000000-0000-0000-0002-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'compvss.collab@demo.ghxstship.com',
  'Compass Collaborator'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- COMPVSS Viewer
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0002-000000000004',
  '10000000-0000-0000-0002-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'compvss.viewer@demo.ghxstship.com',
  'Compass Viewer'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- ============================================================================
-- GVTEWAY DEMO USERS
-- ============================================================================

-- GVTEWAY Admin
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0003-000000000001',
  '10000000-0000-0000-0003-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'gvteway.admin@demo.ghxstship.com',
  'Gateway Admin'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- GVTEWAY Experience Creator
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0003-000000000002',
  '10000000-0000-0000-0003-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'gvteway.creator@demo.ghxstship.com',
  'Gateway Creator'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- GVTEWAY Venue Manager
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0003-000000000003',
  '10000000-0000-0000-0003-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'gvteway.venue@demo.ghxstship.com',
  'Gateway VenueManager'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- GVTEWAY Verified Artist
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0003-000000000004',
  '10000000-0000-0000-0003-000000000004',
  '00000000-0000-0000-0000-000000000001',
  'gvteway.artist@demo.ghxstship.com',
  'Gateway Artist'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- GVTEWAY Member Plus
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0003-000000000005',
  '10000000-0000-0000-0003-000000000005',
  '00000000-0000-0000-0000-000000000001',
  'gvteway.member@demo.ghxstship.com',
  'Gateway Member'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- GVTEWAY Affiliate
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0003-000000000006',
  '10000000-0000-0000-0003-000000000006',
  '00000000-0000-0000-0000-000000000001',
  'gvteway.affiliate@demo.ghxstship.com',
  'Gateway Affiliate'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- ============================================================================
-- LEGEND (GOD MODE) DEMO USERS
-- ============================================================================

-- Legend Super Admin (cross-platform access)
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'legend.super@demo.ghxstship.com',
  'Legend SuperAdmin'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- Legend Developer
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'legend.dev@demo.ghxstship.com',
  'Legend Developer'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- Legend Support
INSERT INTO platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'legend.support@demo.ghxstship.com',
  'Legend Support'
) ON CONFLICT (auth_user_id) DO UPDATE SET 
  full_name = EXCLUDED.full_name;

-- ============================================================================
-- INSERT USER ROLES INTO user_roles TABLE
-- ============================================================================

-- ATLVS roles
INSERT INTO user_roles (platform_user_id, organization_id, role_code) VALUES
  ('10000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'ATLVS_SUPER_ADMIN'),
  ('10000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'ATLVS_ADMIN'),
  ('10000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'ATLVS_TEAM_MEMBER'),
  ('10000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'ATLVS_VIEWER')
ON CONFLICT (platform_user_id, organization_id, role_code) DO NOTHING;

-- COMPVSS roles
INSERT INTO user_roles (platform_user_id, organization_id, role_code) VALUES
  ('10000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'COMPVSS_ADMIN'),
  ('10000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 'COMPVSS_TEAM_MEMBER'),
  ('10000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001', 'COMPVSS_VIEWER')
ON CONFLICT (platform_user_id, organization_id, role_code) DO NOTHING;

-- GVTEWAY roles
INSERT INTO user_roles (platform_user_id, organization_id, role_code) VALUES
  ('10000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', 'GVTEWAY_ADMIN'),
  ('10000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000001', 'GVTEWAY_MEMBER')
ON CONFLICT (platform_user_id, organization_id, role_code) DO NOTHING;

-- Legend roles
INSERT INTO user_roles (platform_user_id, organization_id, role_code) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'LEGEND_SUPER_ADMIN'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'LEGEND_DEVELOPER'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'LEGEND_SUPPORT')
ON CONFLICT (platform_user_id, organization_id, role_code) DO NOTHING;
