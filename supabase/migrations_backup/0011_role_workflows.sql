-- 0011_role_workflows.sql
-- Role-based workflow templates, assignments, and APIs for user onboarding

create type workflow_status as enum ('pending','in_progress','completed','blocked');

create table workflow_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  platform text not null,
  role_code text not null references role_definitions(code) on delete cascade,
  name text not null,
  description text,
  priority integer not null default 0,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workflow_steps (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references workflow_templates(id) on delete cascade,
  step_order integer not null,
  title text not null,
  description text,
  automation_trigger_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (template_id, step_order)
);

create table workflow_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  platform_user_id uuid not null references platform_users(id) on delete cascade,
  template_id uuid not null references workflow_templates(id) on delete cascade,
  status workflow_status not null default 'pending',
  current_step integer not null default 1,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  unique (platform_user_id, template_id)
);

create table workflow_assignment_events (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references workflow_assignments(id) on delete cascade,
  step_order integer not null,
  status workflow_status not null,
  notes text,
  created_at timestamptz not null default now()
);

create index workflow_templates_org_idx on workflow_templates (organization_id, platform, role_code);
create index workflow_assignments_platform_user_idx on workflow_assignments (platform_user_id);
create index workflow_assignment_events_assignment_idx on workflow_assignment_events (assignment_id);

DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT unnest(ARRAY[
    'workflow_templates','workflow_steps','workflow_assignments','workflow_assignment_events'
  ]) AS table_name LOOP
    EXECUTE format('alter table %I enable row level security', r.table_name);
  END LOOP;
END $$;

create policy workflow_templates_select on workflow_templates
  for select using (org_matches(organization_id));

create policy workflow_templates_manage on workflow_templates
  for all using (org_matches(organization_id) and role_in('LEGEND_SUPER_ADMIN','ATLVS_SUPER_ADMIN','ATLVS_ADMIN'))
  with check (org_matches(organization_id) and role_in('LEGEND_SUPER_ADMIN','ATLVS_SUPER_ADMIN','ATLVS_ADMIN'));

create policy workflow_steps_manage on workflow_steps
  for all using (
    exists (
      select 1 from workflow_templates wt
      where wt.id = template_id and org_matches(wt.organization_id)
        and role_in('LEGEND_SUPER_ADMIN','ATLVS_SUPER_ADMIN','ATLVS_ADMIN')
    )
  ) with check (
    exists (
      select 1 from workflow_templates wt
      where wt.id = template_id and org_matches(wt.organization_id)
        and role_in('LEGEND_SUPER_ADMIN','ATLVS_SUPER_ADMIN','ATLVS_ADMIN')
    )
  );

create policy workflow_assignments_read on workflow_assignments
  for select using (
    org_matches(organization_id) and (
      platform_user_id = current_platform_user_id()
      or role_in('LEGEND_SUPER_ADMIN','ATLVS_SUPER_ADMIN','ATLVS_ADMIN')
    )
  );

create policy workflow_assignments_manage on workflow_assignments
  for all using (
    org_matches(organization_id) and (
      role_in('LEGEND_SUPER_ADMIN','ATLVS_SUPER_ADMIN','ATLVS_ADMIN')
      or platform_user_id = current_platform_user_id()
    )
  ) with check (
    org_matches(organization_id) and (
      role_in('LEGEND_SUPER_ADMIN','ATLVS_SUPER_ADMIN','ATLVS_ADMIN')
      or platform_user_id = current_platform_user_id()
    )
  );

create policy workflow_assignment_events_read on workflow_assignment_events
  for select using (
    exists (
      select 1 from workflow_assignments wa
      where wa.id = assignment_id and org_matches(wa.organization_id)
        and (
          wa.platform_user_id = current_platform_user_id()
          or role_in('LEGEND_SUPER_ADMIN','ATLVS_SUPER_ADMIN','ATLVS_ADMIN')
        )
    )
  );

create policy workflow_assignment_events_manage on workflow_assignment_events
  for all using (
    exists (
      select 1 from workflow_assignments wa
      where wa.id = assignment_id and org_matches(wa.organization_id)
        and (
          wa.platform_user_id = current_platform_user_id()
          or role_in('LEGEND_SUPER_ADMIN','ATLVS_SUPER_ADMIN','ATLVS_ADMIN')
        )
    )
  )
  with check (
    exists (
      select 1 from workflow_assignments wa
      where wa.id = assignment_id and org_matches(wa.organization_id)
        and (
          wa.platform_user_id = current_platform_user_id()
          or role_in('LEGEND_SUPER_ADMIN','ATLVS_SUPER_ADMIN','ATLVS_ADMIN')
        )
    )
  );

create or replace function public.assign_workflow_to_user(
  p_template_id uuid,
  p_auth_user_id uuid,
  p_status workflow_status default 'pending'
)
returns workflow_assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_template workflow_templates;
  v_platform_user_id uuid;
  v_assignment workflow_assignments;
begin
  select * into v_template from workflow_templates where id = p_template_id;
  if v_template.id is null then
    raise exception 'Workflow template not found';
  end if;

  select id into v_platform_user_id from platform_users where auth_user_id = p_auth_user_id limit 1;
  if v_platform_user_id is null then
    raise exception 'Platform user not found for auth id %', p_auth_user_id;
  end if;

  insert into workflow_assignments (
    organization_id,
    platform_user_id,
    template_id,
    status,
    started_at
  ) values (
    v_template.organization_id,
    v_platform_user_id,
    v_template.id,
    coalesce(p_status, 'pending'),
    case when p_status = 'pending' then null else now() end
  )
  on conflict (platform_user_id, template_id) do update set status = excluded.status
  returning * into v_assignment;

  return v_assignment;
end;
$$;

grant execute on function public.assign_workflow_to_user(uuid, uuid, workflow_status) to authenticated;

create or replace function public.progress_workflow_assignment(
  p_assignment_id uuid,
  p_next_status workflow_status default 'in_progress'
)
returns workflow_assignments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment workflow_assignments;
  v_total_steps integer;
begin
  select * into v_assignment from workflow_assignments where id = p_assignment_id;
  if v_assignment.id is null then
    raise exception 'Workflow assignment not found';
  end if;

  select count(*) into v_total_steps from workflow_steps where template_id = v_assignment.template_id;
  if v_total_steps = 0 then
    raise exception 'Template has no steps';
  end if;

  if p_next_status = 'completed' then
    update workflow_assignments
    set status = 'completed',
        current_step = v_total_steps,
        completed_at = now()
    where id = p_assignment_id;
  else
    update workflow_assignments
    set status = p_next_status,
        current_step = least(current_step + 1, v_total_steps),
        started_at = coalesce(started_at, now())
    where id = p_assignment_id;
  end if;

  insert into workflow_assignment_events (assignment_id, step_order, status)
  values (p_assignment_id, v_assignment.current_step, p_next_status);

  return (select * from workflow_assignments where id = p_assignment_id);
end;
$$;

grant execute on function public.progress_workflow_assignment(uuid, workflow_status) to authenticated;

create or replace function public.get_user_workflows(p_auth_user_id uuid)
returns table (
  assignment_id uuid,
  template_id uuid,
  template_name text,
  platform text,
  role_code text,
  status workflow_status,
  current_step integer,
  total_steps integer,
  steps jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    wa.id as assignment_id,
    wt.id as template_id,
    wt.name as template_name,
    wt.platform,
    wt.role_code,
    wa.status,
    wa.current_step,
    count(ws.id) as total_steps,
    coalesce(jsonb_agg(jsonb_build_object(
      'step_order', ws.step_order,
      'title', ws.title,
      'description', ws.description
    ) order by ws.step_order), '[]'::jsonb) as steps
  from workflow_assignments wa
  join workflow_templates wt on wt.id = wa.template_id
  join platform_users pu on pu.id = wa.platform_user_id
  left join workflow_steps ws on ws.template_id = wt.id
  where pu.auth_user_id = p_auth_user_id
  group by wa.id, wt.id;
$$;

grant execute on function public.get_user_workflows(uuid) to authenticated;

with org as (
  select ensure_primary_organization() as id
)
insert into workflow_templates (organization_id, platform, role_code, name, description, priority)
select org.id, 'ATLVS', role_code, name, description, priority
from org,
  lateral (values
    ('ATLVS_TEAM_MEMBER','ATLVS Team Onboarding','Kick-off checklist for ATLVS contributors',10),
    ('ATLVS_ADMIN','ATLVS Admin Command Center','Administrator readiness workflow',5)
  ) as tpl(role_code,name,description,priority)
on conflict do nothing;

insert into workflow_steps (template_id, step_order, title, description)
select wt.id, steps.step_order, steps.title, steps.description
from workflow_templates wt
join (
  values
    ('ATLVS Team Onboarding', 1, 'Review GHXSTSHIP Role System', 'Confirm role assignments and permissions'),
    ('ATLVS Team Onboarding', 2, 'Connect Supabase + Turbo dev env', 'Follow onboarding guide to run pnpm supabase start'),
    ('ATLVS Team Onboarding', 3, 'Complete First Deal Entry', 'Create sample contact + deal inside ATLVS CRM'),
    ('ATLVS Admin Command Center', 1, 'Validate Org Hierarchy', 'Ensure departments + role mappings exist'),
    ('ATLVS Admin Command Center', 2, 'Configure Automation Hooks', 'Enable Stripe + Zapier integrations for the tenant')
) as steps(template_name, step_order, title, description)
  on wt.name = steps.template_name
on conflict do nothing;
