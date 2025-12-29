-- 0018_advanced_rpcs.sql
-- Advanced business logic RPC endpoints

create or replace function rpc_batch_update_deal_status(
  p_deal_ids uuid[],
  p_status deal_status
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
  select organization_id into v_org_id from deals where id = p_deal_ids[1];
  
  if not org_matches(v_org_id) or not role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN') then
    raise exception 'Insufficient permissions';
  end if;

  update deals set status = p_status where id = any(p_deal_ids) and organization_id = v_org_id;
  get diagnostics v_updated_count = row_count;

  return jsonb_build_object('updated_count', v_updated_count, 'status', p_status);
end;
$$;

create or replace function rpc_project_timeline(p_project_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_result jsonb;
begin
  select organization_id into v_org_id from projects where id = p_project_id;
  if not org_matches(v_org_id) then raise exception 'Insufficient permissions'; end if;

  select jsonb_build_object(
    'project', row_to_json(p.*),
    'assets', coalesce((select jsonb_agg(row_to_json(a.*)) from assets a where a.project_id = p_project_id), '[]'::jsonb),
    'expenses', coalesce((select jsonb_agg(row_to_json(e.*)) from finance_expenses e where e.project_id = p_project_id), '[]'::jsonb)
  ) into v_result from projects p where p.id = p_project_id;

  return v_result;
end;
$$;

create or replace function rpc_search_contacts(p_org_id uuid, p_query text default null, p_limit int default 50)
returns table(id uuid, company text, full_name text, email text, phone text, deal_count bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not org_matches(p_org_id) then raise exception 'Insufficient permissions'; end if;

  return query
  select c.id, c.company, c.first_name || ' ' || c.last_name as full_name, c.email, c.phone, count(d.id) as deal_count
  from contacts c
  left join deals d on d.contact_id = c.id
  where c.organization_id = p_org_id
    and (p_query is null or c.company ilike '%' || p_query || '%' or c.first_name ilike '%' || p_query || '%' or c.last_name ilike '%' || p_query || '%' or c.email ilike '%' || p_query || '%')
  group by c.id, c.company, c.first_name, c.last_name, c.email, c.phone
  order by deal_count desc, c.company
  limit p_limit;
end;
$$;

create or replace function rpc_asset_calendar(p_org_id uuid, p_start_date date, p_end_date date, p_category text default null)
returns table(date date, total_assets bigint, available_assets bigint, reserved_assets bigint, deployed_assets bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not org_matches(p_org_id) then raise exception 'Insufficient permissions'; end if;

  return query
  select d.date, count(a.id) as total_assets,
    count(a.id) filter (where a.state = 'available') as available_assets,
    count(a.id) filter (where a.state = 'reserved') as reserved_assets,
    count(a.id) filter (where a.state = 'deployed') as deployed_assets
  from generate_series(p_start_date, p_end_date, '1 day'::interval) d(date)
  cross join assets a
  where a.organization_id = p_org_id and (p_category is null or a.category = p_category)
  group by d.date order by d.date;
end;
$$;

create or replace function rpc_workforce_capacity(p_org_id uuid, p_start_date date, p_end_date date)
returns table(date date, total_employees bigint, available_hours numeric, allocated_hours numeric, capacity_pct numeric)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not org_matches(p_org_id) or not role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN') then
    raise exception 'Insufficient permissions';
  end if;

  return query
  select d.date, count(distinct we.id) as total_employees, count(distinct we.id) * 8 as available_hours,
    coalesce(sum(wt.hours), 0) as allocated_hours,
    case when count(distinct we.id) > 0 then round((coalesce(sum(wt.hours), 0) / (count(distinct we.id) * 8)) * 100, 2) else 0 end as capacity_pct
  from generate_series(p_start_date, p_end_date, '1 day'::interval) d(date)
  cross join workforce_employees we
  left join workforce_time_entries wt on wt.employee_id = we.id and wt.work_date = d.date::date
  where we.organization_id = p_org_id and we.status = 'active'
  group by d.date order by d.date;
end;
$$;
