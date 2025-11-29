-- Demo Users Seed Script
-- Run this in Supabase Studio SQL Editor (http://127.0.0.1:54323)
-- Or via: docker exec -i supabase_db_ghxstship-platform psql -U postgres -d postgres < scripts/seed-demo-users.sql
-- Password for all accounts: Demo123!

-- ============================================================================
-- SETUP: Disable triggers to avoid issues during seeding
-- ============================================================================
SET session_replication_role = replica;

-- Create demo organization if not exists
INSERT INTO public.organizations (id, slug, name, timezone)
VALUES ('00000000-0000-0000-0000-000000000001', 'ghxstship', 'GHXSTSHIP Industries', 'America/New_York')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- CREATE AUTH USERS
-- Password hash for 'Demo123!' using bcrypt
-- IMPORTANT: All token fields must be empty strings, not NULL
-- ============================================================================

-- ATLVS Users
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at, 
  created_at, updated_at, raw_user_meta_data, raw_app_meta_data, aud, role,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  phone_change_token, email_change_token_current, reauthentication_token
) VALUES 
  ('10000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000000', 
   'atlvs.superadmin@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(), 
   now(), now(), '{"full_name": "Atlas SuperAdmin"}'::jsonb, '{"provider": "email", "role": "ATLVS_SUPER_ADMIN"}'::jsonb, 'authenticated', 'authenticated',
   '', '', '', '', '', '', ''),
  ('10000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000000',
   'atlvs.admin@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Atlas Admin"}'::jsonb, '{"provider": "email", "role": "ATLVS_ADMIN"}'::jsonb, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000000',
   'atlvs.team@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Atlas TeamMember"}'::jsonb, '{"provider": "email", "role": "ATLVS_TEAM_MEMBER"}'::jsonb, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000000',
   'atlvs.viewer@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Atlas Viewer"}'::jsonb, '{"provider": "email", "role": "ATLVS_VIEWER"}'::jsonb, 'authenticated', 'authenticated')
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- COMPVSS Users
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_user_meta_data, raw_app_meta_data, aud, role
) VALUES
  ('10000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000000',
   'compvss.admin@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Compass Admin"}'::jsonb, '{"provider": "email", "role": "COMPVSS_ADMIN"}'::jsonb, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000000',
   'compvss.team@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Compass TeamMember"}'::jsonb, '{"provider": "email", "role": "COMPVSS_TEAM_MEMBER"}'::jsonb, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000000',
   'compvss.collab@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Compass Collaborator"}'::jsonb, '{"provider": "email", "role": "COMPVSS_COLLABORATOR"}'::jsonb, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000000',
   'compvss.viewer@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Compass Viewer"}'::jsonb, '{"provider": "email", "role": "COMPVSS_VIEWER"}'::jsonb, 'authenticated', 'authenticated')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- GVTEWAY Users
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_user_meta_data, raw_app_meta_data, aud, role
) VALUES
  ('10000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000000',
   'gvteway.admin@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Gateway Admin"}'::jsonb, '{"provider": "email", "role": "GVTEWAY_ADMIN"}'::jsonb, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000000',
   'gvteway.creator@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Gateway Creator"}'::jsonb, '{"provider": "email", "role": "GVTEWAY_EXPERIENCE_CREATOR"}'::jsonb, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000000',
   'gvteway.venue@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Gateway VenueManager"}'::jsonb, '{"provider": "email", "role": "GVTEWAY_VENUE_MANAGER"}'::jsonb, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000000',
   'gvteway.artist@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Gateway Artist"}'::jsonb, '{"provider": "email", "role": "GVTEWAY_ARTIST_VERIFIED"}'::jsonb, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000000',
   'gvteway.member@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Gateway Member"}'::jsonb, '{"provider": "email", "role": "GVTEWAY_MEMBER_PLUS"}'::jsonb, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0003-000000000006', '00000000-0000-0000-0000-000000000000',
   'gvteway.affiliate@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Gateway Affiliate"}'::jsonb, '{"provider": "email", "role": "GVTEWAY_AFFILIATE"}'::jsonb, 'authenticated', 'authenticated')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Legend Users
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_user_meta_data, raw_app_meta_data, aud, role
) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000',
   'legend.super@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Legend SuperAdmin"}'::jsonb, '{"provider": "email", "role": "LEGEND_SUPER_ADMIN"}'::jsonb, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000',
   'legend.dev@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Legend Developer"}'::jsonb, '{"provider": "email", "role": "LEGEND_DEVELOPER"}'::jsonb, 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000',
   'legend.support@demo.ghxstship.com', crypt('Demo123!', gen_salt('bf')), now(),
   now(), now(), '{"full_name": "Legend Support"}'::jsonb, '{"provider": "email", "role": "LEGEND_SUPPORT"}'::jsonb, 'authenticated', 'authenticated')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- ============================================================================
-- CREATE PLATFORM USERS
-- ============================================================================

-- ATLVS Platform Users
INSERT INTO public.platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES
  ('10000000-0000-0000-0001-000000000001', '10000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'atlvs.superadmin@demo.ghxstship.com', 'Atlas SuperAdmin'),
  ('10000000-0000-0000-0001-000000000002', '10000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'atlvs.admin@demo.ghxstship.com', 'Atlas Admin'),
  ('10000000-0000-0000-0001-000000000003', '10000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'atlvs.team@demo.ghxstship.com', 'Atlas TeamMember'),
  ('10000000-0000-0000-0001-000000000004', '10000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'atlvs.viewer@demo.ghxstship.com', 'Atlas Viewer')
ON CONFLICT (auth_user_id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- COMPVSS Platform Users
INSERT INTO public.platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES
  ('10000000-0000-0000-0002-000000000001', '10000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'compvss.admin@demo.ghxstship.com', 'Compass Admin'),
  ('10000000-0000-0000-0002-000000000002', '10000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 'compvss.team@demo.ghxstship.com', 'Compass TeamMember'),
  ('10000000-0000-0000-0002-000000000003', '10000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001', 'compvss.collab@demo.ghxstship.com', 'Compass Collaborator'),
  ('10000000-0000-0000-0002-000000000004', '10000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001', 'compvss.viewer@demo.ghxstship.com', 'Compass Viewer')
ON CONFLICT (auth_user_id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- GVTEWAY Platform Users
INSERT INTO public.platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES
  ('10000000-0000-0000-0003-000000000001', '10000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', 'gvteway.admin@demo.ghxstship.com', 'Gateway Admin'),
  ('10000000-0000-0000-0003-000000000002', '10000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000001', 'gvteway.creator@demo.ghxstship.com', 'Gateway Creator'),
  ('10000000-0000-0000-0003-000000000003', '10000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000001', 'gvteway.venue@demo.ghxstship.com', 'Gateway VenueManager'),
  ('10000000-0000-0000-0003-000000000004', '10000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000001', 'gvteway.artist@demo.ghxstship.com', 'Gateway Artist'),
  ('10000000-0000-0000-0003-000000000005', '10000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000001', 'gvteway.member@demo.ghxstship.com', 'Gateway Member'),
  ('10000000-0000-0000-0003-000000000006', '10000000-0000-0000-0003-000000000006', '00000000-0000-0000-0000-000000000001', 'gvteway.affiliate@demo.ghxstship.com', 'Gateway Affiliate')
ON CONFLICT (auth_user_id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Legend Platform Users
INSERT INTO public.platform_users (id, auth_user_id, organization_id, email, full_name)
VALUES
  ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'legend.super@demo.ghxstship.com', 'Legend SuperAdmin'),
  ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'legend.dev@demo.ghxstship.com', 'Legend Developer'),
  ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'legend.support@demo.ghxstship.com', 'Legend Support')
ON CONFLICT (auth_user_id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- ============================================================================
-- CREATE USER ROLES
-- ============================================================================

-- ATLVS Roles
INSERT INTO public.user_roles (platform_user_id, organization_id, role_code) VALUES
  ('10000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'ATLVS_SUPER_ADMIN'),
  ('10000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'ATLVS_ADMIN'),
  ('10000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'ATLVS_TEAM_MEMBER'),
  ('10000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'ATLVS_VIEWER')
ON CONFLICT (platform_user_id, organization_id, role_code) DO NOTHING;

-- COMPVSS Roles
INSERT INTO public.user_roles (platform_user_id, organization_id, role_code) VALUES
  ('10000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 'COMPVSS_ADMIN'),
  ('10000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 'COMPVSS_TEAM_MEMBER'),
  ('10000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001', 'COMPVSS_VIEWER')
ON CONFLICT (platform_user_id, organization_id, role_code) DO NOTHING;

-- GVTEWAY Roles
INSERT INTO public.user_roles (platform_user_id, organization_id, role_code) VALUES
  ('10000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000001', 'GVTEWAY_ADMIN'),
  ('10000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000001', 'GVTEWAY_MEMBER')
ON CONFLICT (platform_user_id, organization_id, role_code) DO NOTHING;

-- Legend Roles
INSERT INTO public.user_roles (platform_user_id, organization_id, role_code) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'LEGEND_SUPER_ADMIN'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'LEGEND_DEVELOPER'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'LEGEND_SUPPORT')
ON CONFLICT (platform_user_id, organization_id, role_code) DO NOTHING;

-- ============================================================================
-- FIX NULL TOKEN FIELDS (required for auth to work)
-- ============================================================================
UPDATE auth.users SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE email LIKE '%@demo.ghxstship.com';

-- ============================================================================
-- CREATE AUTH IDENTITIES (required for login to work)
-- ============================================================================
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  'email',
  u.id::text,
  now(),
  now(),
  now()
FROM auth.users u
WHERE u.email LIKE '%@demo.ghxstship.com'
ON CONFLICT (provider, provider_id) DO NOTHING;

-- ============================================================================
-- RE-ENABLE TRIGGERS
-- ============================================================================
SET session_replication_role = DEFAULT;

-- ============================================================================
-- VERIFY USERS WERE CREATED
-- ============================================================================
SELECT 
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.raw_app_meta_data->>'role' as role,
  u.email_confirmed_at IS NOT NULL as confirmed,
  EXISTS(SELECT 1 FROM auth.identities i WHERE i.user_id = u.id) as has_identity
FROM auth.users u
WHERE u.email LIKE '%@demo.ghxstship.com'
ORDER BY u.email;
