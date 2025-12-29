-- 0006_automation_catalog.sql
-- Automation trigger/action catalog, usage log, and RPC helpers

create type automation_kind as enum ('trigger','action');
create type automation_status as enum ('success','error');

create table automation_trigger_catalog (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  description text,
  platform_scope text[] not null default array['ATLVS','COMPVSS','GVTEWAY'],
  payload_schema jsonb not null default '{}'::jsonb,
  throttling_window interval not null default interval '1 minute',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table automation_action_catalog (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  description text,
  platform_scope text[] not null default array['ATLVS','COMPVSS','GVTEWAY'],
  payload_schema jsonb not null default '{}'::jsonb,
  requires_confirmation boolean not null default false,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table automation_usage_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  kind automation_kind not null,
  identifier text not null,
  status automation_status not null default 'success',
  platform text not null default 'ATLVS',
  payload jsonb not null default '{}'::jsonb,
  response jsonb,
  latency_ms integer,
  invoked_by uuid references platform_users(id) on delete set null,
  executed_at timestamptz not null default now()
);

alter table automation_trigger_catalog enable row level security;
alter table automation_action_catalog enable row level security;
alter table automation_usage_log enable row level security;

create policy automation_catalog_read on automation_trigger_catalog
  for select using (role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN'));

create policy automation_action_read on automation_action_catalog
  for select using (role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN'));

create policy automation_log_select on automation_usage_log
  for select using ((organization_id is null and current_app_role() like 'LEGEND_%') or org_matches(organization_id));

create policy automation_log_insert on automation_usage_log
  for insert with check ((organization_id is null and current_app_role() like 'LEGEND_%') or org_matches(organization_id));

create or replace function public.rpc_list_automation_triggers(p_platform text default 'ATLVS')
returns setof automation_trigger_catalog
language sql
security definer
set search_path = public
as $$
  select * from automation_trigger_catalog
  where enabled and p_platform = any(platform_scope);
$$;

grant execute on function public.rpc_list_automation_triggers(text) to authenticated;

create or replace function public.rpc_list_automation_actions(p_platform text default 'ATLVS')
returns setof automation_action_catalog
language sql
security definer
set search_path = public
as $$
  select * from automation_action_catalog
  where enabled and p_platform = any(platform_scope);
$$;

grant execute on function public.rpc_list_automation_actions(text) to authenticated;

create or replace function public.rpc_log_automation_event(
  p_kind automation_kind,
  p_identifier text,
  p_status automation_status default 'success',
  p_platform text default 'ATLVS',
  p_org_slug text default null,
  p_payload jsonb default '{}'::jsonb,
  p_response jsonb default null,
  p_latency_ms integer default null
)
returns automation_usage_log
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
  v_invoker uuid := current_platform_user_id();
  v_row automation_usage_log;
begin
  if p_org_slug is not null then
    select id into v_org from organizations where slug = p_org_slug limit 1;
  else
    v_org := current_organization_id();
  end if;

  insert into automation_usage_log (
    organization_id,
    kind,
    identifier,
    status,
    platform,
    payload,
    response,
    latency_ms,
    invoked_by
  ) values (
    v_org,
    p_kind,
    p_identifier,
    coalesce(p_status,'success'),
    coalesce(p_platform,'ATLVS'),
    coalesce(p_payload,'{}'::jsonb),
    p_response,
    p_latency_ms,
    v_invoker
  ) returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.rpc_log_automation_event(automation_kind,text,automation_status,text,text,jsonb,jsonb,integer) to authenticated;

insert into automation_trigger_catalog (key,label,description,platform_scope,payload_schema)
values
  ('atlvs.deal.closed','ATLVS Deal Closed','Fire when ATLVS deal moves to WON',array['ATLVS'],
    '{"type":"object","properties":{"deal_id":{"type":"string"},"value":{"type":"number"}}}'::jsonb),
  ('compvss.schedule.updated','COMPVSS Schedule Updated','Publish schedule change events',array['COMPVSS'],'{}')
on conflict (key) do update set label = excluded.label, description = excluded.description, platform_scope = excluded.platform_scope, payload_schema = excluded.payload_schema, enabled = true, updated_at = now();

insert into automation_action_catalog (key,label,description,platform_scope,payload_schema)
values
  ('atlvs.create.task','Create ATLVS Task','Create a workflow task',array['ATLVS'],
    '{"type":"object","required":["project_code","title"],"properties":{"project_code":{"type":"string"},"title":{"type":"string"},"assignee_email":{"type":"string"}}}'::jsonb),
  ('gvteway.issue.refund','Issue GVTEWAY Refund','Trigger refund process',array['GVTEWAY'],'{}')
on conflict (key) do update set label = excluded.label, description = excluded.description, platform_scope = excluded.platform_scope, payload_schema = excluded.payload_schema, enabled = true, updated_at = now();
