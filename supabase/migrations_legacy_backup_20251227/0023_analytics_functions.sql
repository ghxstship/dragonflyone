-- 0022_analytics_functions.sql
-- Analytics and reporting functions

create or replace function rpc_revenue_by_month(
  p_org_id uuid,
  p_months int default 12
)
returns table(
  month date,
  revenue numeric,
  expenses numeric,
  profit numeric,
  profit_margin numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not org_matches(p_org_id) or not role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN') then
    raise exception 'Insufficient permissions';
  end if;

  return query
  select
    date_trunc('month', le.entry_date)::date as month,
    sum(le.amount) filter (where la.account_type = 'Revenue' and le.side = 'credit') as revenue,
    sum(le.amount) filter (where la.account_type = 'Expense' and le.side = 'debit') as expenses,
    sum(le.amount) filter (where la.account_type = 'Revenue' and le.side = 'credit') - sum(le.amount) filter (where la.account_type = 'Expense' and le.side = 'debit') as profit,
    case when sum(le.amount) filter (where la.account_type = 'Revenue' and le.side = 'credit') > 0
      then round(((sum(le.amount) filter (where la.account_type = 'Revenue' and le.side = 'credit') - sum(le.amount) filter (where la.account_type = 'Expense' and le.side = 'debit')) / sum(le.amount) filter (where la.account_type = 'Revenue' and le.side = 'credit')) * 100, 2)
      else 0
    end as profit_margin
  from ledger_entries le
  join ledger_accounts la on la.id = le.account_id
  where le.organization_id = p_org_id
    and le.entry_date >= current_date - interval '1 month' * p_months
  group by date_trunc('month', le.entry_date)
  order by month desc;
end;
$$;

create or replace function rpc_top_clients_by_revenue(
  p_org_id uuid,
  p_limit int default 10
)
returns table(
  contact_id uuid,
  contact_name text,
  company text,
  total_deal_value numeric,
  deal_count bigint,
  won_deals bigint,
  avg_deal_value numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not org_matches(p_org_id) then
    raise exception 'Insufficient permissions';
  end if;

  return query
  select
    c.id as contact_id,
    c.first_name || ' ' || c.last_name as contact_name,
    c.company,
    coalesce(sum(d.value) filter (where d.status = 'won'), 0) as total_deal_value,
    count(d.id) as deal_count,
    count(d.id) filter (where d.status = 'won') as won_deals,
    round(avg(d.value) filter (where d.status = 'won'), 2) as avg_deal_value
  from contacts c
  left join deals d on d.contact_id = c.id
  where c.organization_id = p_org_id
  group by c.id, c.first_name, c.last_name, c.company
  having count(d.id) filter (where d.status = 'won') > 0
  order by total_deal_value desc
  limit p_limit;
end;
$$;

create or replace function rpc_employee_productivity(
  p_org_id uuid,
  p_start_date date,
  p_end_date date
)
returns table(
  employee_id uuid,
  employee_name text,
  total_hours numeric,
  billable_hours numeric,
  projects_count bigint,
  avg_hours_per_project numeric,
  productivity_score numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not org_matches(p_org_id) or not role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN') then
    raise exception 'Insufficient permissions';
  end if;

  return query
  select
    we.id as employee_id,
    we.first_name || ' ' || we.last_name as employee_name,
    coalesce(sum(wt.hours), 0) as total_hours,
    coalesce(sum(wt.hours) filter (where p.id is not null), 0) as billable_hours,
    count(distinct wt.project_id) as projects_count,
    case when count(distinct wt.project_id) > 0 then round(sum(wt.hours) / count(distinct wt.project_id), 2) else 0 end as avg_hours_per_project,
    case when sum(wt.hours) > 0 then round((sum(wt.hours) filter (where p.id is not null) / sum(wt.hours)) * 100, 2) else 0 end as productivity_score
  from workforce_employees we
  left join workforce_time_entries wt on wt.employee_id = we.id
    and wt.work_date between p_start_date and p_end_date
    and wt.status = 'approved'
  left join projects p on p.id = wt.project_id
  where we.organization_id = p_org_id
    and we.status = 'active'
  group by we.id, we.first_name, we.last_name
  order by total_hours desc;
end;
$$;

create or replace function rpc_deal_pipeline_analysis(
  p_org_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not org_matches(p_org_id) then
    raise exception 'Insufficient permissions';
  end if;

  with pipeline_stats as (
    select
      status,
      count(*) as deal_count,
      sum(value) as total_value,
      avg(value) as avg_value,
      avg(probability) as avg_probability
    from deals
    where organization_id = p_org_id
      and status in ('lead','qualified','proposal')
    group by status
  ),
  conversion_rates as (
    select
      count(*) filter (where status = 'won') as won_count,
      count(*) filter (where status = 'lost') as lost_count,
      count(*) filter (where status in ('won','lost')) as total_closed,
      case when count(*) filter (where status in ('won','lost')) > 0
        then round((count(*) filter (where status = 'won')::numeric / count(*) filter (where status in ('won','lost'))) * 100, 2)
        else 0
      end as win_rate
    from deals
    where organization_id = p_org_id
  ),
  time_to_close as (
    select
      round(avg(extract(days from updated_at - created_at)), 0) as avg_days_to_close
    from deals
    where organization_id = p_org_id
      and status = 'won'
  )
  select jsonb_build_object(
    'pipeline_by_stage', (select jsonb_agg(row_to_json(pipeline_stats.*)) from pipeline_stats),
    'conversion_metrics', (select row_to_json(conversion_rates.*) from conversion_rates),
    'time_metrics', (select row_to_json(time_to_close.*) from time_to_close)
  ) into v_result;

  return v_result;
end;
$$;

create or replace function rpc_asset_roi_analysis(
  p_org_id uuid
)
returns table(
  asset_id uuid,
  asset_tag text,
  category text,
  purchase_price numeric,
  total_maintenance_cost numeric,
  total_revenue_generated numeric,
  roi_percentage numeric,
  payback_period_days numeric,
  current_value numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not org_matches(p_org_id) or not role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN') then
    raise exception 'Insufficient permissions';
  end if;

  return query
  select
    a.id as asset_id,
    a.tag as asset_tag,
    a.category,
    a.purchase_price,
    coalesce(sum(am.cost), 0) as total_maintenance_cost,
    coalesce(
      (select sum(le.amount)
       from ledger_entries le
       join ledger_accounts la on la.id = le.account_id
       join projects p on p.id = le.project_id
       where p.id in (select project_id from assets where id = a.id)
         and la.account_type = 'Revenue'
         and le.side = 'credit'), 0
    ) as total_revenue_generated,
    case when a.purchase_price > 0
      then round(((coalesce(
        (select sum(le.amount)
         from ledger_entries le
         join ledger_accounts la on la.id = le.account_id
         join projects p on p.id = le.project_id
         where p.id in (select project_id from assets where id = a.id)
           and la.account_type = 'Revenue'
           and le.side = 'credit'), 0
      ) - a.purchase_price - coalesce(sum(am.cost), 0)) / a.purchase_price) * 100, 2)
      else 0
    end as roi_percentage,
    case when coalesce(
      (select sum(le.amount)
       from ledger_entries le
       join ledger_accounts la on la.id = le.account_id
       join projects p on p.id = le.project_id
       where p.id in (select project_id from assets where id = a.id)
         and la.account_type = 'Revenue'
         and le.side = 'credit'), 0
    ) > 0
      then round((a.purchase_price::numeric / (
        (select sum(le.amount)
         from ledger_entries le
         join ledger_accounts la on la.id = le.account_id
         join projects p on p.id = le.project_id
         where p.id in (select project_id from assets where id = a.id)
           and la.account_type = 'Revenue'
           and le.side = 'credit') / extract(days from now() - a.acquired_at)
      )), 0)
      else null
    end as payback_period_days,
    greatest(a.purchase_price - coalesce(sum(am.cost), 0) - (a.purchase_price * 0.1 * extract(years from now() - a.acquired_at)), 0) as current_value
  from assets a
  left join asset_maintenance_events am on am.asset_id = a.id
  where a.organization_id = p_org_id
    and a.purchase_price is not null
  group by a.id, a.tag, a.category, a.purchase_price, a.acquired_at
  order by roi_percentage desc nulls last;
end;
$$;
