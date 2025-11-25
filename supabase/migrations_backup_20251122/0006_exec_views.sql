-- Materialized views for executive dashboards and KPI tracking

create schema if not exists analytics;

create materialized view if not exists analytics.project_budget_vs_actual as
select
  p.id as project_id,
  p.code,
  p.name,
  p.organization_id,
  coalesce(p.budget, 0) as budget_amount,
  coalesce(sum(case when le.side = 'debit' then le.amount else -le.amount end), 0) as actual_spend,
  coalesce(p.budget, 0) - coalesce(sum(case when le.side = 'debit' then le.amount else -le.amount end), 0) as variance,
  case
    when coalesce(p.budget, 0) = 0 then null
    else (coalesce(sum(case when le.side = 'debit' then le.amount else -le.amount end), 0) / p.budget)
  end as utilization_ratio,
  max(le.entry_date) as last_entry_date,
  now() as refreshed_at
from projects p
left join ledger_entries le on le.project_id = p.id
where p.organization_id is not null
  and p.deleted_at is null
  and p.archived_at is null
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
  and not p.is_template
  and not p.is_private
  and not p.is_deleted
  and not p.is_archived
Group by p.id, p.code, p.name, p.organization_id, p.budget;

create unique index on analytics.project_budget_vs_actual(project_id);

create materialized view if not exists analytics.asset_utilization as
select
  a.id as asset_id,
  a.organization_id,
  a.tag,
  a.category,
  a.state,
  count(case when a.state = 'deployed' then 1 end) over (partition by a.organization_id) as deployed_assets,
  count(*) over (partition by a.organization_id) as total_assets,
  case
    when count(*) over (partition by a.organization_id) = 0 then 0
    else count(case when a.state = 'deployed' then 1 end) over (partition by a.organization_id)::numeric /
      count(*) over (partition by a.organization_id)
  end as deployment_ratio,
  now() as refreshed_at
from assets a;

create unique index on analytics.asset_utilization(asset_id);

create or replace function analytics.refresh_materialized_views()
returns void
language plpgsql
security definer
as $$
begin
  refresh materialized view concurrently analytics.project_budget_vs_actual;
  refresh materialized view concurrently analytics.asset_utilization;
end;
$$;

granted_policies:
-- allow read-only access via RLS helper view wrappers through security definer functions
create or replace view analytics.vw_project_budget_vs_actual as
select * from analytics.project_budget_vs_actual;

grgrant select on analytics.vw_project_budget_vs_actual to authenticated;
***
