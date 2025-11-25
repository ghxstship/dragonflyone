-- Integration-focused RPC endpoints and supporting tables

create table ticket_revenue_ingestions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  event_code text not null,
  ticket_count integer not null,
  gross_amount numeric(14,2) not null,
  currency text default 'USD',
  ingestion_source text not null,
  payload jsonb default '{}'::jsonb,
  ingested_at timestamptz not null default now()
);

create index on ticket_revenue_ingestions (organization_id, project_id);

do $$ begin execute 'alter table ticket_revenue_ingestions enable row level security'; end $$;

create policy ticket_revenue_read on ticket_revenue_ingestions
  for select using (current_app_role() in (
    'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN'
  ));

create policy ticket_revenue_manage on ticket_revenue_ingestions
  for insert using (current_app_role() in (
    'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'
  ));

create or replace function public.rpc_update_project_budget(
  p_project_code text,
  p_organization_slug text,
  p_budget numeric,
  p_currency text default 'USD'
)
returns projects
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project projects;
begin
  update projects p
  set budget = p_budget,
      currency = coalesce(p_currency, p.currency),
      updated_at = now()
  where p.code = p_project_code
    and p.organization_id = (
      select id from organizations where slug = p_organization_slug limit 1
    )
  returning * into v_project;

  if not found then
    raise exception 'project not found for code %', p_project_code;
  end if;

  return v_project;
end;
$$;

create or replace function public.rpc_ingest_ticket_revenue(
  p_organization_slug text,
  p_project_code text,
  p_event_code text,
  p_ticket_count integer,
  p_gross_amount numeric,
  p_currency text default 'USD',
  p_ingestion_source text default 'gvteway',
  p_payload jsonb default '{}'::jsonb
)
returns ticket_revenue_ingestions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_project_id uuid;
  v_record ticket_revenue_ingestions;
begin
  select id into v_org_id from organizations where slug = p_organization_slug limit 1;
  if v_org_id is null then
    raise exception 'organization not found for slug %', p_organization_slug;
  end if;

  select id into v_project_id from projects where code = p_project_code and organization_id = v_org_id limit 1;

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
    v_org_id,
    v_project_id,
    p_event_code,
    p_ticket_count,
    p_gross_amount,
    coalesce(p_currency, 'USD'),
    p_ingestion_source,
    coalesce(p_payload, '{}'::jsonb)
  ) returning * into v_record;

  return v_record;
end;
$$;

grant execute on function public.rpc_update_project_budget(text, text, numeric, text) to authenticated;
grant execute on function public.rpc_ingest_ticket_revenue(text, text, text, integer, numeric, text, text, jsonb) to authenticated;
