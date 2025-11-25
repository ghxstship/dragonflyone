-- 0003_event_roles_auth.sql
-- Event role definitions, assignments, and auth helpers

create table event_role_definitions (
  code text primary key,
  label text not null,
  level integer not null,
  description text,
  platforms text[] not null default array['ATLVS','COMPVSS','GVTEWAY']
);

create table event_role_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  platform_user_id uuid not null references platform_users(id) on delete cascade,
  role_code text not null references event_role_definitions(code) on delete cascade,
  platform text not null check (platform in ('ATLVS','COMPVSS','GVTEWAY')),
  project_id uuid references projects(id) on delete cascade,
  external_event_ref text,
  assigned_by uuid references platform_users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  check (project_id is not null or external_event_ref is not null)
);

create unique index event_role_assignments_unq
  on event_role_assignments (
    platform_user_id,
    platform,
    coalesce(project_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(external_event_ref, ''),
    role_code
  );

insert into event_role_definitions (code,label,level,description,platforms) values
  ('EXECUTIVE','Executive Control',1000,'Executive oversight',array['ATLVS','COMPVSS','GVTEWAY']),
  ('CORE_AAA','Core AAA',900,'Core leadership approvals',array['ATLVS','COMPVSS','GVTEWAY']),
  ('AA','Advance Authority',800,'Advance operations',array['ATLVS','COMPVSS','GVTEWAY']),
  ('PRODUCTION','Production Ops',700,'Production execution',array['ATLVS','COMPVSS','GVTEWAY']),
  ('MANAGEMENT','Management Oversight',600,'Business visibility',array['ATLVS','COMPVSS','GVTEWAY']),
  ('CREW','Crew',500,'Crew assignments',array['COMPVSS']),
  ('STAFF','Staff',450,'Staff workflows',array['COMPVSS']),
  ('VENDOR','Vendor',400,'Vendor workflows',array['COMPVSS']),
  ('MEDIA','Media',250,'Media access',array['COMPVSS','GVTEWAY']),
  ('SPONSOR','Sponsor',200,'Sponsor entitlements',array['COMPVSS','GVTEWAY']),
  ('VIP_L1','VIP',200,'VIP guest access',array['GVTEWAY']),
  ('GA_L1','General Admission',60,'Guest access',array['GVTEWAY'])
  on conflict (code) do update set label = excluded.label, level = excluded.level, description = excluded.description, platforms = excluded.platforms;

create or replace function public.get_user_role_claims(p_auth_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_platform jsonb := '[]'::jsonb;
  v_event jsonb := '[]'::jsonb;
begin
  select coalesce(jsonb_agg(role_code order by hierarchy_rank desc),'[]'::jsonb)
    into v_platform
  from (
    select distinct ur.role_code, rd.hierarchy_rank
    from user_roles ur
    join role_definitions rd on rd.code = ur.role_code
    join platform_users pu on pu.id = ur.platform_user_id
    where pu.auth_user_id = p_auth_user_id
  ) t;

  select coalesce(jsonb_agg(jsonb_build_object(
    'role_code', era.role_code,
    'platform', era.platform,
    'project_id', era.project_id,
    'external_event_ref', era.external_event_ref,
    'expires_at', era.expires_at
  )), '[]'::jsonb)
  into v_event
  from event_role_assignments era
  join platform_users pu on pu.id = era.platform_user_id
  where pu.auth_user_id = p_auth_user_id
    and (era.expires_at is null or era.expires_at > now());

  return jsonb_build_object('platform_roles', v_platform, 'event_roles', v_event);
end;
$$;

grant execute on function public.get_user_role_claims(uuid) to authenticated;

alter table event_role_assignments enable row level security;

create policy event_roles_select on event_role_assignments
  for select using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN'));

create policy event_roles_manage on event_role_assignments
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create or replace view public.user_event_roles as
select
  era.id,
  era.organization_id,
  era.platform_user_id,
  pu.auth_user_id,
  era.role_code,
  erd.level,
  era.platform,
  era.project_id,
  era.external_event_ref,
  era.assigned_at,
  era.expires_at,
  era.metadata
from event_role_assignments era
join platform_users pu on pu.id = era.platform_user_id
join event_role_definitions erd on erd.code = era.role_code;
