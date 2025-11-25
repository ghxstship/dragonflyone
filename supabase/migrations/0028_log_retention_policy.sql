-- 0028_log_retention_policy.sql
-- Configure log retention policies and automatic cleanup

-- Create function to clean up old webhook logs
create or replace function cleanup_old_webhook_logs()
returns void
language plpgsql
security definer
as $$
begin
  delete from webhook_event_logs
  where created_at < now() - interval '90 days';
  
  raise notice 'Cleaned up webhook logs older than 90 days';
end;
$$;

-- Create function to clean up old audit logs
create or replace function cleanup_old_audit_logs()
returns void
language plpgsql
security definer
as $$
begin
  delete from audit_log
  where created_at < now() - interval '365 days';
  
  raise notice 'Cleaned up audit logs older than 365 days';
end;
$$;

-- Create function to clean up old automation logs
create or replace function cleanup_old_automation_logs()
returns void
language plpgsql
security definer
as $$
begin
  delete from automation_usage_log
  where created_at < now() - interval '180 days';
  
  raise notice 'Cleaned up automation logs older than 180 days';
end;
$$;

-- Create function to archive old records before deletion
create or replace function archive_before_delete()
returns trigger
language plpgsql
security definer
as $$
begin
  if TG_TABLE_NAME = 'webhook_event_logs' and OLD.created_at < now() - interval '85 days' then
    insert into webhook_event_logs_archive (id, event_type, source, payload, status, created_at)
    values (OLD.id, OLD.event_type, OLD.source, OLD.payload, OLD.status, OLD.created_at);
  end if;
  
  return OLD;
end;
$$;

-- Create archive table for webhook logs
create table if not exists webhook_event_logs_archive (
  id uuid primary key,
  event_type text not null,
  source text not null,
  payload jsonb,
  status text,
  created_at timestamptz default now()
);

create index idx_webhook_logs_archive_created_at on webhook_event_logs_archive(created_at);

-- Create trigger to archive before deleting
drop trigger if exists archive_webhook_logs on webhook_event_logs;
create trigger archive_webhook_logs
  before delete on webhook_event_logs
  for each row execute function archive_before_delete();

-- Schedule automatic cleanup using pg_cron (if available)
-- Run cleanup jobs nightly at 2 AM UTC
comment on function cleanup_old_webhook_logs is 'Cleanup webhook logs older than 90 days - scheduled to run nightly';
comment on function cleanup_old_audit_logs is 'Cleanup audit logs older than 365 days - scheduled to run nightly';
comment on function cleanup_old_automation_logs is 'Cleanup automation logs older than 180 days - scheduled to run nightly';

-- Create function to get log retention stats
create or replace function get_log_retention_stats()
returns table (
  table_name text,
  total_records bigint,
  records_to_cleanup bigint,
  oldest_record timestamptz,
  newest_record timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    'webhook_event_logs'::text,
    count(*)::bigint,
    count(*) filter (where created_at < now() - interval '90 days')::bigint,
    min(created_at),
    max(created_at)
  from webhook_event_logs
  
  union all
  
  select 
    'audit_log'::text,
    count(*)::bigint,
    count(*) filter (where created_at < now() - interval '365 days')::bigint,
    min(created_at),
    max(created_at)
  from audit_log
  
  union all
  
  select 
    'automation_usage_log'::text,
    count(*)::bigint,
    count(*) filter (where created_at < now() - interval '180 days')::bigint,
    min(created_at),
    max(created_at)
  from automation_usage_log;
end;
$$;

comment on function get_log_retention_stats is 'Get statistics on log tables and records eligible for cleanup';
