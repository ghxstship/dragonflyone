-- Cross-platform integration entities for ATLVS ↔ COMPVSS ↔ GVTEWAY sync

create type sync_status as enum ('pending', 'in_progress', 'synced', 'failed');

create table integration_deal_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  deal_id uuid not null references deals(id) on delete cascade,
  compvss_opportunity_id uuid,
  gvteway_campaign_id uuid,
  status sync_status not null default 'pending',
  last_synced_at timestamptz,
  error_message text,
  metadata jsonb default '{}'::jsonb,
  unique (deal_id, coalesce(compvss_opportunity_id, uuid_nil(), gvteway_campaign_id))
);

create table integration_project_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  compvss_project_id uuid,
  compvss_slug text,
  status sync_status not null default 'pending',
  last_synced_at timestamptz,
  error_message text,
  metadata jsonb default '{}'::jsonb,
  unique (project_id, compvss_project_id)
);

create table integration_event_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  gvteway_event_id uuid not null,
  gvteway_slug text,
  status sync_status not null default 'pending',
  last_synced_at timestamptz,
  error_message text,
  metadata jsonb default '{}'::jsonb,
  unique (organization_id, gvteway_event_id)
);

create table integration_asset_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  asset_id uuid not null references assets(id) on delete cascade,
  compvss_asset_id uuid,
  gvteway_inventory_id uuid,
  status sync_status not null default 'pending',
  last_synced_at timestamptz,
  error_message text,
  metadata jsonb default '{}'::jsonb,
  unique (asset_id, coalesce(compvss_asset_id, gvteway_inventory_id))
);

create table integration_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  source_system text not null,
  target_system text not null,
  payload jsonb not null,
  status sync_status not null default 'pending',
  attempts integer not null default 0,
  last_attempted_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create index on integration_project_links (organization_id, status);
create index on integration_event_links (organization_id, status);
create index on integration_asset_links (organization_id, status);
create index on integration_sync_jobs (organization_id, status);

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT unnest(ARRAY[
    'integration_deal_links',
    'integration_project_links',
    'integration_event_links',
    'integration_asset_links',
    'integration_sync_jobs'
  ]) AS table_name LOOP
    EXECUTE format('alter table %I enable row level security', r.table_name);
  END LOOP;
END $$;

create policy integration_deal_links_read on integration_deal_links
  for select using (current_app_role() in (
    'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN'
  ));

create policy integration_deal_links_manage on integration_deal_links
  for all using (current_app_role() in (
    'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
  ));

create policy integration_project_links_read on integration_project_links
  for select using (current_app_role() in (
    'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN'
  ));

create policy integration_project_links_manage on integration_project_links
  for all using (current_app_role() in (
    'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN'
  ));

create policy integration_event_links_read on integration_event_links
  for select using (current_app_role() in (
    'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','GVTEWAY_ADMIN'
  ));

create policy integration_event_links_manage on integration_event_links
  for all using (current_app_role() in (
    'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','GVTEWAY_ADMIN'
  ));

create policy integration_asset_links_read on integration_asset_links
  for select using (current_app_role() in (
    'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_TEAM_MEMBER'
  ));

create policy integration_asset_links_manage on integration_asset_links
  for all using (current_app_role() in (
    'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_TEAM_MEMBER'
  ));

create policy integration_sync_jobs_manage on integration_sync_jobs
  for all using (current_app_role() in (
    'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
  ));

create or replace function public.rpc_enqueue_sync_job(
  p_org_slug text,
  p_source_system text,
  p_target_system text,
  p_payload jsonb
)
returns integration_sync_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_job integration_sync_jobs;
begin
  select id into v_org_id from organizations where slug = p_org_slug limit 1;
  if v_org_id is null then
    raise exception 'organization not found for slug %', p_org_slug;
  end if;

  insert into integration_sync_jobs (
    organization_id,
    source_system,
    target_system,
    payload
  ) values (
    v_org_id,
    p_source_system,
    p_target_system,
    coalesce(p_payload, '{}'::jsonb)
  ) returning * into v_job;

  return v_job;
end;
$$;

grant execute on function public.rpc_enqueue_sync_job(text, text, text, jsonb) to authenticated;
