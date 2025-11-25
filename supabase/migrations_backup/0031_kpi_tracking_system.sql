-- 0031_kpi_tracking_system.sql
-- KPI Master List tracking and reporting system

-- KPI data points storage
create table kpi_data_points (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  kpi_code text not null,
  kpi_name text not null,
  value numeric not null,
  unit text not null,
  project_id uuid references projects(id) on delete set null,
  event_id uuid,
  period_start timestamptz,
  period_end timestamptz,
  metadata jsonb default '{}'::jsonb,
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index kpi_data_points_org_idx on kpi_data_points(organization_id, kpi_code, calculated_at desc);
create index kpi_data_points_project_idx on kpi_data_points(project_id, kpi_code);
create index kpi_data_points_event_idx on kpi_data_points(event_id, kpi_code);
create index kpi_data_points_period_idx on kpi_data_points(period_start, period_end);

-- KPI report definitions
create table kpi_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  kpi_codes text[] not null default '{}',
  category text,
  filters jsonb default '{}'::jsonb,
  is_global boolean default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index kpi_reports_org_idx on kpi_reports(organization_id);
create index kpi_reports_category_idx on kpi_reports(category);
create index kpi_reports_global_idx on kpi_reports(is_global) where is_global = true;

-- KPI targets and thresholds
create table kpi_targets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  kpi_code text not null,
  target_value numeric not null,
  warning_threshold numeric,
  critical_threshold numeric,
  project_id uuid references projects(id) on delete cascade,
  event_id uuid,
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index kpi_targets_org_kpi_idx on kpi_targets(organization_id, kpi_code);
create index kpi_targets_project_idx on kpi_targets(project_id);
create index kpi_targets_validity_idx on kpi_targets(valid_from, valid_to);

-- RLS policies
alter table kpi_data_points enable row level security;
alter table kpi_reports enable row level security;
alter table kpi_targets enable row level security;

create policy kpi_data_points_select on kpi_data_points
  for select using (org_matches(organization_id) and role_in('ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy kpi_data_points_manage on kpi_data_points
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy kpi_reports_select on kpi_reports
  for select using (org_matches(organization_id) and role_in('ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy kpi_reports_manage on kpi_reports
  for all using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy kpi_targets_select on kpi_targets
  for select using (org_matches(organization_id) and role_in('ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy kpi_targets_manage on kpi_targets
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

-- Analytics views for KPI aggregations
create or replace view analytics_kpi_summary as
select
  kdp.organization_id,
  kdp.kpi_code,
  kdp.kpi_name,
  kdp.unit,
  count(*) as data_point_count,
  avg(kdp.value) as avg_value,
  min(kdp.value) as min_value,
  max(kdp.value) as max_value,
  stddev(kdp.value) as stddev_value,
  max(kdp.calculated_at) as last_calculated,
  kt.target_value,
  kt.warning_threshold,
  kt.critical_threshold
from kpi_data_points kdp
left join kpi_targets kt on 
  kt.organization_id = kdp.organization_id 
  and kt.kpi_code = kdp.kpi_code
  and kdp.calculated_at between kt.valid_from and coalesce(kt.valid_to, 'infinity'::timestamptz)
where kdp.calculated_at >= now() - interval '90 days'
group by kdp.organization_id, kdp.kpi_code, kdp.kpi_name, kdp.unit, 
  kt.target_value, kt.warning_threshold, kt.critical_threshold;

grant select on analytics_kpi_summary to authenticated;

-- Function to record KPI data point
create or replace function record_kpi_data_point(
  p_organization_id uuid,
  p_kpi_code text,
  p_kpi_name text,
  p_value numeric,
  p_unit text,
  p_project_id uuid default null,
  p_event_id uuid default null,
  p_period_start timestamptz default null,
  p_period_end timestamptz default null,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into kpi_data_points (
    organization_id,
    kpi_code,
    kpi_name,
    value,
    unit,
    project_id,
    event_id,
    period_start,
    period_end,
    metadata
  ) values (
    p_organization_id,
    p_kpi_code,
    p_kpi_name,
    p_value,
    p_unit,
    p_project_id,
    p_event_id,
    p_period_start,
    p_period_end,
    p_metadata
  ) returning id into v_id;
  
  return v_id;
end;
$$;

grant execute on function record_kpi_data_point to authenticated;

-- Function to get KPI trend data
create or replace function get_kpi_trend(
  p_organization_id uuid,
  p_kpi_code text,
  p_days integer default 30,
  p_project_id uuid default null
) returns table (
  date date,
  value numeric,
  target_value numeric,
  warning_threshold numeric,
  critical_threshold numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    kdp.calculated_at::date as date,
    avg(kdp.value) as value,
    max(kt.target_value) as target_value,
    max(kt.warning_threshold) as warning_threshold,
    max(kt.critical_threshold) as critical_threshold
  from kpi_data_points kdp
  left join kpi_targets kt on 
    kt.organization_id = kdp.organization_id 
    and kt.kpi_code = kdp.kpi_code
    and kdp.calculated_at between kt.valid_from and coalesce(kt.valid_to, 'infinity'::timestamptz)
  where kdp.organization_id = p_organization_id
    and kdp.kpi_code = p_kpi_code
    and kdp.calculated_at >= now() - (p_days || ' days')::interval
    and (p_project_id is null or kdp.project_id = p_project_id)
  group by kdp.calculated_at::date
  order by date desc;
end;
$$;

grant execute on function get_kpi_trend to authenticated;

-- Seed 200 global KPI reports
-- NOTE: The 200 global reports will be seeded in migration 0032_seed_200_kpi_reports.sql
-- This was separated due to SQL file size constraints

-- Comments
comment on table kpi_data_points is 'Historical KPI data points for tracking and analysis';
comment on table kpi_reports is 'Pre-configured KPI report definitions';
comment on table kpi_targets is 'Target values and thresholds for KPI monitoring';
