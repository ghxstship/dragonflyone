-- Data Application Layer integration: executive KPIs, feedback intake, and analytics views

create schema if not exists analytics;

grant usage on schema analytics to postgres, anon, authenticated, service_role;

grant create on schema analytics to postgres, service_role;

create table if not exists public.client_feedback (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  platform text not null check (platform in ('ATLVS', 'COMPVSS', 'GVTEWAY')),
  feedback_channel text,
  nps_score smallint check (nps_score between 0 and 10),
  satisfaction_score smallint check (satisfaction_score between 1 and 5),
  comment text,
  metadata jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);

create index if not exists client_feedback_org_idx on public.client_feedback (organization_id);
create index if not exists client_feedback_project_idx on public.client_feedback (project_id);
create index if not exists client_feedback_submitted_idx on public.client_feedback (submitted_at);

alter table public.client_feedback enable row level security;

create policy client_feedback_read on public.client_feedback
  for select using (
    current_app_role() in (
      'ATLVS_VIEWER',
      'ATLVS_TEAM_MEMBER',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN',
      'COMPVSS_ADMIN',
      'GVTEWAY_ADMIN'
    )
  );

create policy client_feedback_manage on public.client_feedback
  for insert with check (
    current_app_role() in (
      'ATLVS_TEAM_MEMBER',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN',
      'COMPVSS_ADMIN',
      'GVTEWAY_ADMIN'
    )
  );

create policy client_feedback_update on public.client_feedback
  for update using (
    current_app_role() in (
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN',
      'COMPVSS_ADMIN',
      'GVTEWAY_ADMIN'
    )
  );

create policy client_feedback_delete on public.client_feedback
  for delete using (
    current_app_role() in (
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

with ledger_totals as (
  select
    project_id,
    sum(case when side = 'debit' then amount else -amount end) as net_amount,
    max(entry_date) as last_entry_date
  from public.ledger_entries
  group by project_id
)
create materialized view analytics.project_budget_vs_actual as
select
  p.id as project_id,
  p.organization_id,
  p.code,
  p.name,
  coalesce(p.budget, 0)::numeric as budget_amount,
  coalesce(lt.net_amount, 0)::numeric as actual_spend,
  coalesce(p.budget, 0)::numeric - coalesce(lt.net_amount, 0)::numeric as variance,
  case
    when coalesce(p.budget, 0) = 0 then null
    else round((coalesce(lt.net_amount, 0) / nullif(p.budget, 0))::numeric, 4)
  end as utilization_ratio,
  lt.last_entry_date,
  now() as refreshed_at
from public.projects p
left join ledger_totals lt on lt.project_id = p.id;

create unique index analytics_project_budget_vs_actual_project_id_idx
  on analytics.project_budget_vs_actual (project_id);

create materialized view analytics.asset_utilization as
select
  organization_id,
  count(*) as total_assets,
  count(*) filter (where state = 'deployed') as deployed_assets,
  count(*) filter (where state = 'reserved') as reserved_assets,
  count(*) filter (where state = 'maintenance') as maintenance_assets,
  count(*) filter (where state = 'retired') as retired_assets,
  case
    when count(*) = 0 then 0
    else round(
      (count(*) filter (where state = 'deployed')::numeric / count(*)::numeric),
      4
    )
  end as deployment_ratio,
  now() as refreshed_at
from public.assets
group by organization_id;

create unique index analytics_asset_utilization_org_idx
  on analytics.asset_utilization (organization_id);

create materialized view analytics.nps_summary as
select
  organization_id,
  project_id,
  count(*) as response_count,
  avg(nps_score)::numeric(5, 2) as average_nps,
  count(*) filter (where nps_score >= 9) as promoters,
  count(*) filter (where nps_score between 7 and 8) as passives,
  count(*) filter (where nps_score <= 6) as detractors,
  case
    when count(*) = 0 then null
    else round(((count(*) filter (where nps_score >= 9) - count(*) filter (where nps_score <= 6))::numeric
      / count(*)::numeric) * 100, 2)
  end as nps_score,
  avg(satisfaction_score)::numeric(5, 2) as average_satisfaction,
  max(submitted_at) as last_response_at,
  now() as refreshed_at
from public.client_feedback
where nps_score is not null
  or satisfaction_score is not null
group by organization_id, project_id;

create unique index analytics_nps_summary_org_project_idx
  on analytics.nps_summary (organization_id, project_id);

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

create or replace view public.analytics_project_budget_vs_actual as
select * from analytics.project_budget_vs_actual;

granted_select_budget:
grant select on public.analytics_project_budget_vs_actual to authenticated;

granted_select_budget_service:
grant select on public.analytics_project_budget_vs_actual to service_role;

create or replace view public.analytics_asset_utilization as
select * from analytics.asset_utilization;

granted_select_asset:
grant select on public.analytics_asset_utilization to authenticated;

granted_select_asset_service:
grant select on public.analytics_asset_utilization to service_role;

create or replace view public.analytics_nps_summary as
select * from analytics.nps_summary;

granted_select_nps:
grant select on public.analytics_nps_summary to authenticated;

granted_select_nps_service:
grant select on public.analytics_nps_summary to service_role;
