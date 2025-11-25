-- 0014_business_logic_rpcs.sql
-- Comprehensive RPC endpoints for frontend consumption

-- Deal management
create or replace function public.rpc_create_deal_with_contact(
  p_org_id uuid,
  p_contact jsonb,
  p_deal jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contact_id uuid;
  v_deal_id uuid;
  v_result jsonb;
begin
  if not org_matches(p_org_id) or not role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN') then
    raise exception 'Insufficient permissions';
  end if;

  insert into contacts (organization_id, company, first_name, last_name, email, phone, metadata)
  values (
    p_org_id,
    p_contact->>'company',
    p_contact->>'first_name',
    p_contact->>'last_name',
    p_contact->>'email',
    p_contact->>'phone',
    coalesce(p_contact->'metadata', '{}'::jsonb)
  )
  returning id into v_contact_id;

  insert into deals (organization_id, contact_id, title, status, value, expected_close_date, probability, notes)
  values (
    p_org_id,
    v_contact_id,
    p_deal->>'title',
    coalesce(p_deal->>'status', 'lead')::deal_status,
    (p_deal->>'value')::numeric,
    (p_deal->>'expected_close_date')::date,
    (p_deal->>'probability')::numeric,
    p_deal->>'notes'
  )
  returning id into v_deal_id;

  select jsonb_build_object(
    'contact_id', v_contact_id,
    'deal_id', v_deal_id
  ) into v_result;

  return v_result;
end;
$$;

-- Project creation from deal
create or replace function public.rpc_create_project_from_deal(
  p_deal_id uuid,
  p_project_code text,
  p_project_name text,
  p_budget numeric default null,
  p_start_date date default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_project_id uuid;
  v_result jsonb;
begin
  select organization_id into v_org_id from deals where id = p_deal_id;
  
  if not org_matches(v_org_id) or not role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_ADMIN','LEGEND_SUPER_ADMIN') then
    raise exception 'Insufficient permissions';
  end if;

  insert into projects (
    organization_id,
    deal_id,
    code,
    name,
    phase,
    budget,
    start_date
  )
  values (
    v_org_id,
    p_deal_id,
    p_project_code,
    p_project_name,
    'intake',
    p_budget,
    coalesce(p_start_date, current_date)
  )
  returning id into v_project_id;

  update deals set status = 'won' where id = p_deal_id;

  insert into integration_deal_links (organization_id, atlvs_deal_id, compvss_project_id, sync_status)
  values (v_org_id, p_deal_id, v_project_id, 'active');

  select jsonb_build_object(
    'project_id', v_project_id,
    'deal_id', p_deal_id,
    'status', 'created'
  ) into v_result;

  return v_result;
end;
$$;

-- Asset availability check
create or replace function public.rpc_check_asset_availability(
  p_asset_ids uuid[],
  p_start_date date,
  p_end_date date
)
returns table(asset_id uuid, available boolean, conflict_project_id uuid)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    a.id as asset_id,
    case 
      when a.state = 'available' then true
      when a.state = 'reserved' and (a.project_id is null or not exists (
        select 1 from projects p 
        where p.id = a.project_id 
        and daterange(p.start_date, p.end_date, '[]') && daterange(p_start_date, p_end_date, '[]')
      )) then true
      else false
    end as available,
    a.project_id as conflict_project_id
  from assets a
  where a.id = any(p_asset_ids)
    and org_matches(a.organization_id);
end;
$$;

-- Bulk asset assignment
create or replace function public.rpc_assign_assets_to_project(
  p_project_id uuid,
  p_asset_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_updated_count int;
begin
  select organization_id into v_org_id from projects where id = p_project_id;
  
  if not org_matches(v_org_id) or not role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_TEAM_MEMBER','LEGEND_SUPER_ADMIN') then
    raise exception 'Insufficient permissions';
  end if;

  update assets
  set project_id = p_project_id, state = 'reserved'
  where id = any(p_asset_ids)
    and organization_id = v_org_id
    and state = 'available';
  
  get diagnostics v_updated_count = row_count;

  return jsonb_build_object(
    'project_id', p_project_id,
    'assets_assigned', v_updated_count
  );
end;
$$;

-- Financial summary by project
create or replace function public.rpc_project_financial_summary(
  p_project_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_budget numeric;
  v_total_expenses numeric;
  v_total_po numeric;
  v_result jsonb;
begin
  select organization_id, budget into v_org_id, v_budget from projects where id = p_project_id;
  
  if not org_matches(v_org_id) or not role_in('ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN') then
    raise exception 'Insufficient permissions';
  end if;

  select coalesce(sum(amount), 0) into v_total_expenses
  from finance_expenses
  where project_id = p_project_id and status in ('approved','paid');

  select coalesce(sum(total_amount), 0) into v_total_po
  from finance_purchase_orders
  where project_id = p_project_id and status in ('approved','ordered','received');

  select jsonb_build_object(
    'project_id', p_project_id,
    'budget', v_budget,
    'total_expenses', v_total_expenses,
    'total_purchase_orders', v_total_po,
    'total_committed', v_total_expenses + v_total_po,
    'remaining_budget', v_budget - (v_total_expenses + v_total_po),
    'budget_utilization_pct', case when v_budget > 0 then round(((v_total_expenses + v_total_po) / v_budget) * 100, 2) else 0 end
  ) into v_result;

  return v_result;
end;
$$;

-- Workforce utilization report
create or replace function public.rpc_workforce_utilization(
  p_org_id uuid,
  p_start_date date,
  p_end_date date
)
returns table(
  employee_id uuid,
  employee_name text,
  total_hours numeric,
  project_count bigint,
  utilization_pct numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_working_days int;
  v_expected_hours numeric;
begin
  if not org_matches(p_org_id) or not role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN') then
    raise exception 'Insufficient permissions';
  end if;

  v_working_days := (p_end_date - p_start_date + 1);
  v_expected_hours := v_working_days * 8;

  return query
  select
    we.id as employee_id,
    we.first_name || ' ' || we.last_name as employee_name,
    coalesce(sum(wt.hours), 0) as total_hours,
    count(distinct wt.project_id) as project_count,
    case when v_expected_hours > 0 then round((coalesce(sum(wt.hours), 0) / v_expected_hours) * 100, 2) else 0 end as utilization_pct
  from workforce_employees we
  left join workforce_time_entries wt on wt.employee_id = we.id
    and wt.work_date between p_start_date and p_end_date
    and wt.status = 'approved'
  where we.organization_id = p_org_id
    and we.status = 'active'
  group by we.id, we.first_name, we.last_name
  order by total_hours desc;
end;
$$;

-- Dashboard metrics
create or replace function public.rpc_dashboard_metrics(
  p_org_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
  v_active_projects int;
  v_active_deals int;
  v_total_assets int;
  v_available_assets int;
  v_active_employees int;
  v_pending_expenses int;
  v_pending_po int;
begin
  if not org_matches(p_org_id) then
    raise exception 'Insufficient permissions';
  end if;

  select count(*) into v_active_projects from projects where organization_id = p_org_id and phase in ('intake','preproduction','in_production');
  select count(*) into v_active_deals from deals where organization_id = p_org_id and status in ('lead','qualified','proposal');
  select count(*) into v_total_assets from assets where organization_id = p_org_id;
  select count(*) into v_available_assets from assets where organization_id = p_org_id and state = 'available';
  select count(*) into v_active_employees from workforce_employees where organization_id = p_org_id and status = 'active';
  select count(*) into v_pending_expenses from finance_expenses where organization_id = p_org_id and status = 'submitted';
  select count(*) into v_pending_po from finance_purchase_orders where organization_id = p_org_id and status = 'pending_approval';

  select jsonb_build_object(
    'active_projects', v_active_projects,
    'active_deals', v_active_deals,
    'total_assets', v_total_assets,
    'available_assets', v_available_assets,
    'active_employees', v_active_employees,
    'pending_expenses', v_pending_expenses,
    'pending_purchase_orders', v_pending_po
  ) into v_result;

  return v_result;
end;
$$;

comment on function public.rpc_create_deal_with_contact is 'Create a contact and deal in a single transaction';
comment on function public.rpc_create_project_from_deal is 'Convert won deal to project and create integration link';
comment on function public.rpc_check_asset_availability is 'Check asset availability for date range';
comment on function public.rpc_assign_assets_to_project is 'Bulk assign available assets to project';
comment on function public.rpc_project_financial_summary is 'Get budget vs actual financial summary for project';
comment on function public.rpc_workforce_utilization is 'Calculate workforce utilization rates for date range';
comment on function public.rpc_dashboard_metrics is 'Get key metrics for executive dashboard';
