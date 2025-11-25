-- 0029_alert_thresholds.sql
-- Configure alert thresholds and monitoring rules

create table if not exists alert_thresholds (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null unique,
  warning_threshold numeric not null,
  critical_threshold numeric not null,
  unit text not null,
  enabled boolean default true,
  notification_channels jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Insert default alert thresholds
insert into alert_thresholds (metric_name, warning_threshold, critical_threshold, unit, notification_channels) values
  ('api_response_time_p95', 200, 500, 'ms', '["ops_channel", "email"]'::jsonb),
  ('api_error_rate', 5, 10, 'percent', '["ops_channel", "email"]'::jsonb),
  ('database_connections', 80, 95, 'percent', '["ops_channel"]'::jsonb),
  ('database_query_time_p95', 100, 300, 'ms', '["ops_channel"]'::jsonb),
  ('cpu_usage', 70, 90, 'percent', '["ops_channel"]'::jsonb),
  ('memory_usage', 80, 95, 'percent', '["ops_channel", "email"]'::jsonb),
  ('disk_usage', 75, 90, 'percent', '["ops_channel", "email"]'::jsonb),
  ('failed_auth_attempts', 10, 50, 'count', '["security_channel", "email"]'::jsonb),
  ('webhook_failure_rate', 10, 25, 'percent', '["ops_channel"]'::jsonb),
  ('edge_function_errors', 5, 15, 'percent', '["ops_channel"]'::jsonb)
on conflict (metric_name) do nothing;

-- Create function to check if alert should be triggered
create or replace function check_alert_threshold(
  p_metric_name text,
  p_current_value numeric,
  out should_alert boolean,
  out severity text,
  out threshold_value numeric
)
language plpgsql
security definer
as $$
declare
  v_threshold alert_thresholds;
begin
  select * into v_threshold
  from alert_thresholds
  where metric_name = p_metric_name
    and enabled = true;
  
  if not found then
    should_alert := false;
    severity := 'none';
    threshold_value := null;
    return;
  end if;
  
  if p_current_value >= v_threshold.critical_threshold then
    should_alert := true;
    severity := 'critical';
    threshold_value := v_threshold.critical_threshold;
  elsif p_current_value >= v_threshold.warning_threshold then
    should_alert := true;
    severity := 'warning';
    threshold_value := v_threshold.warning_threshold;
  else
    should_alert := false;
    severity := 'ok';
    threshold_value := null;
  end if;
end;
$$;

-- Create alert history table
create table if not exists alert_history (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null,
  severity text not null check (severity in ('warning', 'critical')),
  current_value numeric not null,
  threshold_value numeric not null,
  message text,
  metadata jsonb default '{}'::jsonb,
  acknowledged boolean default false,
  acknowledged_at timestamptz,
  acknowledged_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create index idx_alert_history_metric_name on alert_history(metric_name);
create index idx_alert_history_created_at on alert_history(created_at desc);
create index idx_alert_history_acknowledged on alert_history(acknowledged) where not acknowledged;

-- Enable RLS on alert tables
alter table alert_thresholds enable row level security;
alter table alert_history enable row level security;

create policy alert_thresholds_select on alert_thresholds
  for select using (role_in('LEGEND_SUPER_ADMIN', 'ATLVS_ADMIN'));

create policy alert_thresholds_update on alert_thresholds
  for update using (role_in('LEGEND_SUPER_ADMIN'));

create policy alert_history_select on alert_history
  for select using (role_in('LEGEND_SUPER_ADMIN', 'ATLVS_ADMIN'));

create policy alert_history_update on alert_history
  for update using (role_in('LEGEND_SUPER_ADMIN', 'ATLVS_ADMIN'));

-- Create function to record alert
create or replace function record_alert(
  p_metric_name text,
  p_severity text,
  p_current_value numeric,
  p_threshold_value numeric,
  p_message text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_alert_id uuid;
begin
  insert into alert_history (
    metric_name,
    severity,
    current_value,
    threshold_value,
    message,
    metadata
  ) values (
    p_metric_name,
    p_severity,
    p_current_value,
    p_threshold_value,
    p_message,
    p_metadata
  )
  returning id into v_alert_id;
  
  return v_alert_id;
end;
$$;

-- Create function to acknowledge alert
create or replace function acknowledge_alert(
  p_alert_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language plpgsql
security definer
as $$
begin
  update alert_history
  set 
    acknowledged = true,
    acknowledged_at = now(),
    acknowledged_by = p_user_id
  where id = p_alert_id
    and not acknowledged;
  
  return found;
end;
$$;

-- Create function to get active alerts
create or replace function get_active_alerts()
returns table (
  id uuid,
  metric_name text,
  severity text,
  current_value numeric,
  threshold_value numeric,
  message text,
  created_at timestamptz,
  age_minutes numeric
)
language sql
security definer
as $$
  select 
    id,
    metric_name,
    severity,
    current_value,
    threshold_value,
    message,
    created_at,
    extract(epoch from (now() - created_at)) / 60 as age_minutes
  from alert_history
  where not acknowledged
  order by created_at desc;
$$;

comment on function check_alert_threshold is 'Check if a metric value exceeds configured thresholds';
comment on function record_alert is 'Record an alert event in history';
comment on function acknowledge_alert is 'Mark an alert as acknowledged';
comment on function get_active_alerts is 'Get all unacknowledged alerts';
