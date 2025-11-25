-- 0005_client_feedback_kpi.sql
-- Client feedback intake and analytics materialized views

create table client_feedback (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  platform text not null check (platform in ('ATLVS','COMPVSS','GVTEWAY')),
  feedback_channel text,
  nps_score smallint check (nps_score between 0 and 10),
  satisfaction_score smallint check (satisfaction_score between 1 and 5),
  comment text,
  metadata jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);

create index client_feedback_org_idx on client_feedback (organization_id, submitted_at desc);
create index client_feedback_project_idx on client_feedback (project_id);

alter table client_feedback enable row level security;

create policy client_feedback_select on client_feedback
  for select using (org_matches(organization_id) and role_in('ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN'));

create policy client_feedback_manage on client_feedback
  for all using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN'));

create schema if not exists analytics;

grant usage on schema analytics to postgres, anon, authenticated, service_role;

grant create on schema analytics to postgres, service_role;

create materialized view analytics.project_budget_vs_actual as
select
  p.id as project_id,
  p.organization_id,
  p.code,
  p.name,
  coalesce(p.budget,0)::numeric as budget_amount,
  coalesce(sum(case when le.side = 'debit' then le.amount else -le.amount end),0)::numeric as actual_spend,
  coalesce(p.budget,0)::numeric - coalesce(sum(case when le.side = 'debit' then le.amount else -le.amount end),0)::numeric as variance,
  case when coalesce(p.budget,0) = 0 then null else round(
    (coalesce(sum(case when le.side = 'debit' then le.amount else -le.amount end),0)::numeric / nullif(p.budget,0)::numeric), 4
  ) end as utilization_ratio,
  max(le.entry_date) as last_entry_date,
  now() as refreshed_at
from projects p
left join ledger_entries le on le.project_id = p.id
where p.organization_id is not null
  group by p.id, p.organization_id, p.code, p.name, p.budget;

create unique index analytics_project_budget_vs_actual_project_id_idx on analytics.project_budget_vs_actual(project_id);

create materialized view analytics.asset_utilization as
select
  organization_id,
  count(*) as total_assets,
  count(*) filter (where state = 'deployed') as deployed_assets,
  count(*) filter (where state = 'reserved') as reserved_assets,
  count(*) filter (where state = 'maintenance') as maintenance_assets,
  count(*) filter (where state = 'retired') as retired_assets,
  case when count(*) = 0 then 0 else round(
    (count(*) filter (where state = 'deployed'))::numeric / count(*)::numeric,
    4
  ) end as deployment_ratio,
  now() as refreshed_at
from assets
group by organization_id;

create unique index analytics_asset_utilization_org_idx on analytics.asset_utilization(organization_id);

create materialized view analytics.nps_summary as
select
  organization_id,
  project_id,
  count(*) as response_count,
  avg(nps_score)::numeric(5,2) as average_nps,
  count(*) filter (where nps_score >= 9) as promoters,
  count(*) filter (where nps_score between 7 and 8) as passives,
  count(*) filter (where nps_score <= 6) as detractors,
  case when count(*) = 0 then null else round(((count(*) filter (where nps_score >= 9) - count(*) filter (where nps_score <= 6))::numeric / count(*)::numeric) * 100, 2) end as nps_score,
  avg(satisfaction_score)::numeric(5,2) as average_satisfaction,
  max(submitted_at) as last_response_at,
  now() as refreshed_at
from client_feedback
where nps_score is not null or satisfaction_score is not null
group by organization_id, project_id;

create unique index analytics_nps_summary_org_project_idx on analytics.nps_summary(organization_id, project_id);

create or replace function analytics.refresh_kpi_views()
returns void
language plpgsql
security definer
set search_path = analytics, public
as $$
begin
  refresh materialized view concurrently analytics.project_budget_vs_actual;
  refresh materialized view concurrently analytics.asset_utilization;
  refresh materialized view concurrently analytics.nps_summary;
end;
$$;

grant execute on function analytics.refresh_kpi_views() to service_role;

create or replace view public.analytics_project_budget_vs_actual as select * from analytics.project_budget_vs_actual;
create or replace view public.analytics_asset_utilization as select * from analytics.asset_utilization;
create or replace view public.analytics_nps_summary as select * from analytics.nps_summary;

grant select on public.analytics_project_budget_vs_actual, public.analytics_asset_utilization, public.analytics_nps_summary to authenticated;
