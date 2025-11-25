-- Role system mapping to Supabase Auth + event role assignments

alter table public.role_definitions
  add column if not exists hierarchy_rank integer not null default 0;

update public.role_definitions
set hierarchy_rank = 5
where code like 'LEGEND_%';

update public.role_definitions
set hierarchy_rank = 4
where code in ('ATLVS_SUPER_ADMIN', 'GVTEWAY_ADMIN', 'COMPVSS_ADMIN');

update public.role_definitions
set hierarchy_rank = 3
where code in ('ATLVS_ADMIN', 'GVTEWAY_MODERATOR', 'COMPVSS_TEAM_MEMBER', 'FINANCE_ADMIN', 'PROCUREMENT_MANAGER', 'WORKFORCE_MANAGER');

update public.role_definitions
set hierarchy_rank = 2
where code in ('ATLVS_TEAM_MEMBER', 'GVTEWAY_MEMBER_PLUS', 'GVTEWAY_MEMBER_EXTRA', 'GVTEWAY_EXPERIENCE_CREATOR', 'GVTEWAY_VENUE_MANAGER');

update public.role_definitions
set hierarchy_rank = 1
where code in ('ATLVS_VIEWER', 'GVTEWAY_MEMBER', 'GVTEWAY_MEMBER_GUEST', 'COMPVSS_VIEWER', 'COMPVSS_COLLABORATOR');

create table if not exists public.event_role_definitions (
  code text primary key,
  label text not null,
  level integer not null,
  description text,
  platforms text[] not null default array['ATLVS','COMPVSS','GVTEWAY']
);

insert into public.event_role_definitions (code, label, level, description, platforms)
values
  ('EXECUTIVE', 'Executive Control', 1000, 'All-access executive authority', array['ATLVS','COMPVSS','GVTEWAY']),
  ('CORE_AAA', 'Core AAA', 900, 'Core leadership with approvals', array['ATLVS','COMPVSS','GVTEWAY']),
  ('AA', 'Advance Authority', 800, 'Advance approvals + operations intel', array['ATLVS','COMPVSS','GVTEWAY']),
  ('PRODUCTION', 'Production Ops', 700, 'Production execution + backstage', array['ATLVS','COMPVSS','GVTEWAY']),
  ('MANAGEMENT', 'Management Oversight', 600, 'Business visibility + reporting', array['ATLVS','COMPVSS','GVTEWAY']),
  ('CREW', 'Crew', 500, 'Crew-level access', array['COMPVSS']),
  ('STAFF', 'Staff', 450, 'Staff workflows', array['COMPVSS']),
  ('VENDOR', 'Vendor', 400, 'Vendor submissions + docs', array['COMPVSS']),
  ('MEDIA', 'Media', 250, 'Media pit & coverage', array['COMPVSS','GVTEWAY']),
  ('SPONSOR', 'Sponsor', 200, 'Sponsor entitlements', array['COMPVSS','GVTEWAY']),
  ('VIP_L1', 'VIP', 200, 'VIP guest entitlements', array['GVTEWAY']),
  ('GA_L1', 'General Admission', 60, 'Guest access layer', array['GVTEWAY'])
ON CONFLICT (code) DO UPDATE SET
  label = excluded.label,
  level = excluded.level,
  description = excluded.description,
  platforms = excluded.platforms;

create table if not exists public.event_role_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  platform_user_id uuid not null references public.platform_users(id) on delete cascade,
  role_code text not null references public.event_role_definitions(code),
  platform text not null check (platform in ('ATLVS','COMPVSS','GVTEWAY')),
  project_id uuid references public.projects(id) on delete cascade,
  external_event_ref text,
  assigned_by uuid references public.platform_users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  check (project_id is not null or external_event_ref is not null)
);

create unique index if not exists event_role_assignments_unique_idx
  on public.event_role_assignments (
    platform_user_id,
    platform,
    coalesce(project_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(external_event_ref, ''),
    role_code
  );

create index if not exists event_role_assignments_user_idx
  on public.event_role_assignments (platform_user_id, platform);

create index if not exists event_role_assignments_org_idx
  on public.event_role_assignments (organization_id);

alter table public.event_role_assignments enable row level security;

create policy event_roles_read on public.event_role_assignments
  for select using (
    current_app_role() in (
      'ATLVS_TEAM_MEMBER',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN',
      'COMPVSS_ADMIN',
      'GVTEWAY_ADMIN'
    )
  );

create policy event_roles_manage on public.event_role_assignments
  for all using (
    current_app_role() in (
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

create or replace function public.get_highest_platform_role(p_auth_user_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select rd.code
  from public.user_roles ur
  join public.platform_users pu on pu.id = ur.platform_user_id
  join public.role_definitions rd on rd.code = ur.role_code
  where pu.auth_user_id = p_auth_user_id
  order by rd.hierarchy_rank desc, rd.code
  limit 1;
$$;

grant execute on function public.get_highest_platform_role(uuid) to authenticated;

create or replace function public.current_app_role()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  claims jsonb;
  role text;
  computed_role text;
begin
  claims := auth.jwt();
  role := claims ->> 'app_role';

  if role is null then
    computed_role := public.get_highest_platform_role(auth.uid());
    if computed_role is not null then
      role := computed_role;
    end if;
  end if;

  return coalesce(role, 'ATLVS_VIEWER');
end;
$$;

create or replace view public.user_event_roles as
select
  era.id,
  era.platform_user_id,
  pu.auth_user_id,
  era.organization_id,
  era.platform,
  era.project_id,
  era.external_event_ref,
  era.role_code,
  erd.level,
  era.assigned_at,
  era.expires_at,
  era.metadata
from public.event_role_assignments era
join public.platform_users pu on pu.id = era.platform_user_id
join public.event_role_definitions erd on erd.code = era.role_code;

create or replace function public.get_user_role_claims(p_auth_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_platform_roles jsonb := '[]'::jsonb;
  v_event_roles jsonb := '[]'::jsonb;
begin
  select coalesce(jsonb_agg(role_code order by hierarchy_rank desc), '[]'::jsonb)
  into v_platform_roles
  from (
    select distinct ur.role_code, rd.hierarchy_rank
    from public.user_roles ur
    join public.platform_users pu on pu.id = ur.platform_user_id
    join public.role_definitions rd on rd.code = ur.role_code
    where pu.auth_user_id = p_auth_user_id
  ) roles;

  select coalesce(jsonb_agg(jsonb_build_object(
    'role_code', era.role_code,
    'platform', era.platform,
    'project_id', era.project_id,
    'external_event_ref', era.external_event_ref,
    'expires_at', era.expires_at
  )), '[]'::jsonb)
  into v_event_roles
  from public.event_role_assignments era
  join public.platform_users pu on pu.id = era.platform_user_id
  where pu.auth_user_id = p_auth_user_id
    and (era.expires_at is null or era.expires_at > now());

  return jsonb_build_object(
    'platform_roles', v_platform_roles,
    'event_roles', v_event_roles
  );
end;
$$;

grant execute on function public.get_user_role_claims(uuid) to authenticated;
