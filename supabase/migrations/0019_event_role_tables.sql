-- 0019_event_role_tables.sql
-- Event-level role assignments for COMPVSS and GVTEWAY

create table event_role_hierarchy (
  role_code text primary key,
  level integer not null,
  platforms text[] not null,
  description text
);

insert into event_role_hierarchy (role_code, level, platforms, description) values
  ('EXECUTIVE', 1000, array['ATLVS','COMPVSS','GVTEWAY'], 'Executive access'),
  ('CORE_AAA', 900, array['ATLVS','COMPVSS','GVTEWAY'], 'Core AAA access'),
  ('AA', 800, array['ATLVS','COMPVSS','GVTEWAY'], 'AA level access'),
  ('PRODUCTION', 700, array['ATLVS','COMPVSS','GVTEWAY'], 'Production access'),
  ('MANAGEMENT', 600, array['ATLVS','COMPVSS','GVTEWAY'], 'Management access'),
  ('CREW', 500, array['COMPVSS'], 'Crew member'),
  ('STAFF', 450, array['COMPVSS'], 'Staff member'),
  ('VENDOR', 400, array['COMPVSS'], 'Vendor'),
  ('ENTERTAINER', 350, array['COMPVSS','GVTEWAY'], 'Entertainer'),
  ('ARTIST', 350, array['COMPVSS','GVTEWAY'], 'Artist'),
  ('AGENT', 300, array['COMPVSS'], 'Agent'),
  ('MEDIA', 250, array['COMPVSS','GVTEWAY'], 'Media'),
  ('SPONSOR', 200, array['COMPVSS','GVTEWAY'], 'Sponsor'),
  ('PARTNER', 200, array['COMPVSS','GVTEWAY'], 'Partner'),
  ('INDUSTRY', 150, array['COMPVSS'], 'Industry professional'),
  ('INTERN', 100, array['COMPVSS'], 'Intern'),
  ('VOLUNTEER', 50, array['COMPVSS'], 'Volunteer'),
  ('BACKSTAGE_L2', 500, array['GVTEWAY'], 'Backstage Level 2'),
  ('BACKSTAGE_L1', 450, array['GVTEWAY'], 'Backstage Level 1'),
  ('PLATINUM_VIP_L2', 400, array['GVTEWAY'], 'Platinum VIP Level 2'),
  ('PLATINUM_VIP_L1', 350, array['GVTEWAY'], 'Platinum VIP Level 1'),
  ('VIP_L3', 300, array['GVTEWAY'], 'VIP Level 3'),
  ('VIP_L2', 250, array['GVTEWAY'], 'VIP Level 2'),
  ('VIP_L1', 200, array['GVTEWAY'], 'VIP Level 1'),
  ('GA_L5', 150, array['GVTEWAY'], 'GA Level 5'),
  ('GA_L4', 120, array['GVTEWAY'], 'GA Level 4'),
  ('GA_L3', 100, array['GVTEWAY'], 'GA Level 3'),
  ('GA_L2', 80, array['GVTEWAY'], 'GA Level 2'),
  ('GA_L1', 60, array['GVTEWAY'], 'GA Level 1'),
  ('GUEST', 50, array['GVTEWAY'], 'Guest'),
  ('INFLUENCER', 150, array['GVTEWAY'], 'Influencer'),
  ('BRAND_AMBASSADOR', 120, array['GVTEWAY'], 'Brand Ambassador'),
  ('AFFILIATE', 100, array['GVTEWAY'], 'Affiliate');

create index on event_role_assignments (platform_user_id);
-- Note: event_id column doesn't exist in table definition, using project_id instead
create index on event_role_assignments (project_id);
create index on event_role_assignments (role_code);
create index on event_role_assignments (organization_id, platform_user_id);

alter table event_role_assignments enable row level security;

create policy event_role_assignments_select on event_role_assignments
  for select using (
    org_matches(organization_id) and (
      platform_user_id = current_platform_user_id()
      or role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN','LEGEND_SUPER_ADMIN')
    )
  );

create policy event_role_assignments_manage on event_role_assignments
  for all using (
    org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN','LEGEND_SUPER_ADMIN')
  )
  with check (
    org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN','LEGEND_SUPER_ADMIN')
  );

create or replace function rpc_assign_event_roles(
  p_project_id uuid,
  p_user_ids uuid[],
  p_role_code text,
  p_platform text default 'ATLVS'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_assigned_count int := 0;
begin
  select organization_id into v_org_id from event_role_assignments where project_id = p_project_id limit 1;
  
  if v_org_id is null then
    select organization_id into v_org_id from projects where id = p_project_id;
  end if;
  
  if not org_matches(v_org_id) or not role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN','LEGEND_SUPER_ADMIN') then
    raise exception 'Insufficient permissions';
  end if;

  insert into event_role_assignments (organization_id, platform_user_id, project_id, role_code, platform)
  select v_org_id, unnest(p_user_ids), p_project_id, p_role_code, p_platform
  on conflict do nothing;
  
  get diagnostics v_assigned_count = row_count;

  return jsonb_build_object(
    'project_id', p_project_id,
    'role_code', p_role_code,
    'assigned_count', v_assigned_count
  );
end;
$$;
