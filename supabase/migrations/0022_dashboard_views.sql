-- 0021_dashboard_views.sql
-- Materialized views for dashboard performance

create materialized view mv_executive_dashboard as
select
  o.id as organization_id,
  o.name as organization_name,
  count(distinct p.id) filter (where p.phase in ('intake','preproduction','in_production')) as active_projects,
  count(distinct d.id) filter (where d.status in ('lead','qualified','proposal')) as active_deals,
  sum(d.value) filter (where d.status in ('lead','qualified','proposal')) as pipeline_value,
  count(distinct a.id) as total_assets,
  count(distinct a.id) filter (where a.state = 'available') as available_assets,
  count(distinct we.id) filter (where we.status = 'active') as active_employees,
  count(distinct e.id) filter (where e.status = 'submitted') as pending_expenses,
  sum(e.amount) filter (where e.status = 'submitted') as pending_expense_amount,
  count(distinct po.id) filter (where po.status = 'pending_approval') as pending_purchase_orders,
  sum(po.total_amount) filter (where po.status = 'pending_approval') as pending_po_amount
from organizations o
left join projects p on p.organization_id = o.id
left join deals d on d.organization_id = o.id
left join assets a on a.organization_id = o.id
left join workforce_employees we on we.organization_id = o.id
left join finance_expenses e on e.organization_id = o.id
left join finance_purchase_orders po on po.organization_id = o.id
group by o.id, o.name;

create unique index on mv_executive_dashboard (organization_id);

create materialized view mv_project_financials as
select
  p.id as project_id,
  p.organization_id,
  p.code as project_code,
  p.name as project_name,
  p.budget,
  p.currency,
  coalesce(sum(e.amount) filter (where e.status in ('approved','paid')), 0) as total_expenses,
  coalesce(sum(po.total_amount) filter (where po.status in ('approved','ordered','received')), 0) as total_purchase_orders,
  coalesce(sum(e.amount) filter (where e.status in ('approved','paid')), 0) + coalesce(sum(po.total_amount) filter (where po.status in ('approved','ordered','received')), 0) as total_committed,
  p.budget - (coalesce(sum(e.amount) filter (where e.status in ('approved','paid')), 0) + coalesce(sum(po.total_amount) filter (where po.status in ('approved','ordered','received')), 0)) as remaining_budget,
  case when p.budget > 0 then round(((coalesce(sum(e.amount) filter (where e.status in ('approved','paid')), 0) + coalesce(sum(po.total_amount) filter (where po.status in ('approved','ordered','received')), 0)) / p.budget) * 100, 2) else 0 end as budget_utilization_pct,
  count(distinct a.id) as asset_count,
  count(distinct wt.employee_id) as team_member_count,
  sum(wt.hours) filter (where wt.status = 'approved') as total_hours_logged
from projects p
left join finance_expenses e on e.project_id = p.id
left join finance_purchase_orders po on po.project_id = p.id
left join assets a on a.project_id = p.id
left join workforce_time_entries wt on wt.project_id = p.id
group by p.id, p.organization_id, p.code, p.name, p.budget, p.currency;

create unique index on mv_project_financials (project_id);
create index on mv_project_financials (organization_id);

create materialized view mv_asset_utilization as
select
  a.id as asset_id,
  a.organization_id,
  a.tag,
  a.category,
  a.state,
  a.project_id,
  p.code as current_project_code,
  p.name as current_project_name,
  count(distinct am.id) as maintenance_count,
  max(am.event_date) as last_maintenance_date,
  sum(am.cost) as total_maintenance_cost,
  case when a.purchase_price > 0 then round((sum(am.cost) / a.purchase_price) * 100, 2) else 0 end as maintenance_cost_pct,
  extract(days from now() - a.acquired_at) as days_owned,
  case when a.state = 'deployed' and p.start_date is not null then extract(days from now() - p.start_date) else 0 end as days_on_current_project
from assets a
left join projects p on p.id = a.project_id
left join asset_maintenance_events am on am.asset_id = a.id
group by a.id, a.organization_id, a.tag, a.category, a.state, a.project_id, p.code, p.name, a.purchase_price, a.acquired_at, p.start_date;

create unique index on mv_asset_utilization (asset_id);
create index on mv_asset_utilization (organization_id, category);
create index on mv_asset_utilization (organization_id, state);

create or replace function refresh_all_materialized_views()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  refresh materialized view concurrently mv_executive_dashboard;
  refresh materialized view concurrently mv_project_financials;
  refresh materialized view concurrently mv_asset_utilization;
end;
$$;

create or replace function schedule_materialized_view_refresh()
returns void
language plpgsql
as $$
begin
  perform cron.schedule('refresh-dashboards', '*/15 * * * *', 'select refresh_all_materialized_views()');
end;
$$;
