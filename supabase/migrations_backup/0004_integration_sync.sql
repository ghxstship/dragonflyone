-- 0004_integration_sync.sql
-- Cross-platform integration entities, RPC helpers, and ticket ingestion

create type sync_status as enum ('pending','in_progress','synced','failed');

create table integration_deal_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  deal_id uuid not null references deals(id) on delete cascade,
  compvss_opportunity_id uuid,
  gvteway_campaign_id uuid,
  status sync_status not null default 'pending',
  last_synced_at timestamptz,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  unique (deal_id, compvss_opportunity_id, gvteway_campaign_id)
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
  metadata jsonb not null default '{}'::jsonb,
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
  metadata jsonb not null default '{}'::jsonb,
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
  metadata jsonb not null default '{}'::jsonb,
  unique (asset_id, compvss_asset_id, gvteway_inventory_id)
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

create table ticket_revenue_ingestions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  event_code text not null,
  ticket_count integer not null,
  gross_amount numeric(14,2) not null,
  currency text default 'USD',
  ingestion_source text not null,
  payload jsonb not null default '{}'::jsonb,
  ingested_at timestamptz not null default now()
);

create index on integration_project_links (organization_id, status);
create index on integration_event_links (organization_id, status);
create index on integration_asset_links (organization_id, status);
create index on integration_sync_jobs (organization_id, status);
create index on ticket_revenue_ingestions (organization_id, project_id);

DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT unnest(ARRAY[
    'integration_deal_links','integration_project_links','integration_event_links','integration_asset_links','integration_sync_jobs','ticket_revenue_ingestions'
  ]) AS table_name LOOP
    EXECUTE format('alter table %I enable row level security', r.table_name);
  END LOOP;
END $$;

create policy integration_deal_links_read on integration_deal_links
  for select using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN'));

create policy integration_deal_links_manage on integration_deal_links
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy integration_project_links_read on integration_project_links
  for select using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN'));

create policy integration_project_links_manage on integration_project_links
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN'));

create policy integration_event_links_read on integration_event_links
  for select using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','GVTEWAY_ADMIN'));

create policy integration_event_links_manage on integration_event_links
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','GVTEWAY_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','GVTEWAY_ADMIN'));

create policy integration_asset_links_read on integration_asset_links
  for select using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_TEAM_MEMBER'));

create policy integration_asset_links_manage on integration_asset_links
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_TEAM_MEMBER'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_TEAM_MEMBER'));

create policy integration_sync_jobs_manage on integration_sync_jobs
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy ticket_revenue_read on ticket_revenue_ingestions
  for select using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN'));

create policy ticket_revenue_manage on ticket_revenue_ingestions
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'));

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
  v_org uuid;
  v_job integration_sync_jobs;
begin
  select id into v_org from organizations where slug = p_org_slug limit 1;
  if v_org is null then
    raise exception 'organization not found for slug %', p_org_slug;
  end if;

  insert into integration_sync_jobs (organization_id, source_system, target_system, payload)
  values (v_org, p_source_system, p_target_system, coalesce(p_payload, '{}'::jsonb))
  returning * into v_job;

  return v_job;
end;
$$;

grant execute on function public.rpc_enqueue_sync_job(text,text,text,jsonb) to authenticated;

create or replace function public.rpc_ingest_ticket_revenue(
  p_org_slug text,
  p_project_code text,
  p_event_code text,
  p_ticket_count integer,
  p_gross_amount numeric,
  p_currency text default 'USD',
  p_source text default 'gvteway',
  p_payload jsonb default '{}'::jsonb
)
returns ticket_revenue_ingestions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
  v_project uuid;
  v_row ticket_revenue_ingestions;
begin
  select id into v_org from organizations where slug = p_org_slug limit 1;
  if v_org is null then
    raise exception 'organization not found';
  end if;

  select id into v_project from projects where organization_id = v_org and code = p_project_code limit 1;

  insert into ticket_revenue_ingestions (
    organization_id,
    project_id,
    event_code,
    ticket_count,
    gross_amount,
    currency,
    ingestion_source,
    payload
  ) values (
    v_org,
    v_project,
    p_event_code,
    p_ticket_count,
    p_gross_amount,
    coalesce(p_currency,'USD'),
    p_source,
    coalesce(p_payload,'{}'::jsonb)
  ) returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.rpc_ingest_ticket_revenue(text,text,text,integer,numeric,text,text,jsonb) to authenticated;
