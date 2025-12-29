-- 0027_security_hardening.sql
-- Additional security hardening and password policies

-- Enable pgcrypto for secure hashing
create extension if not exists pgcrypto;

-- Create function to validate password strength
create or replace function validate_password_strength(password text)
returns boolean
language plpgsql
as $$
declare
  min_length int := 8;
  has_upper boolean;
  has_lower boolean;
  has_digit boolean;
  has_special boolean;
begin
  if length(password) < min_length then
    return false;
  end if;
  
  has_upper := password ~ '[A-Z]';
  has_lower := password ~ '[a-z]';
  has_digit := password ~ '[0-9]';
  has_special := password ~ '[^A-Za-z0-9]';
  
  return has_upper and has_lower and has_digit and has_special;
end;
$$;

-- Create audit function for sensitive table access
create or replace function audit_sensitive_access()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into audit_log (
    table_name,
    operation,
    user_id,
    old_data,
    new_data,
    metadata
  ) values (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    case when TG_OP = 'DELETE' or TG_OP = 'UPDATE' then row_to_json(OLD) else null end,
    case when TG_OP = 'INSERT' or TG_OP = 'UPDATE' then row_to_json(NEW) else null end,
    jsonb_build_object(
      'timestamp', now(),
      'ip_address', current_setting('request.headers', true)::json->>'x-forwarded-for',
      'user_agent', current_setting('request.headers', true)::json->>'user-agent'
    )
  );
  
  return case TG_OP
    when 'DELETE' then OLD
    else NEW
  end;
end;
$$;

-- Apply audit triggers to sensitive tables
drop trigger if exists audit_ledger_entries on ledger_entries;
create trigger audit_ledger_entries
  after insert or update or delete on ledger_entries
  for each row execute function audit_sensitive_access();

drop trigger if exists audit_finance_expenses on finance_expenses;
create trigger audit_finance_expenses
  after insert or update or delete on finance_expenses
  for each row execute function audit_sensitive_access();

drop trigger if exists audit_finance_purchase_orders on finance_purchase_orders;
create trigger audit_finance_purchase_orders
  after insert or update or delete on finance_purchase_orders
  for each row execute function audit_sensitive_access();

drop trigger if exists audit_platform_users on platform_users;
create trigger audit_platform_users
  after insert or update or delete on platform_users
  for each row execute function audit_sensitive_access();

-- Create function to mask sensitive data in logs
create or replace function mask_sensitive_data(data jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
  masked_data jsonb := data;
  sensitive_fields text[] := array['email', 'phone', 'ssn', 'account_number', 'routing_number'];
  field text;
begin
  foreach field in array sensitive_fields
  loop
    if masked_data ? field then
      masked_data := jsonb_set(masked_data, array[field], '"***REDACTED***"'::jsonb);
    end if;
  end loop;
  
  return masked_data;
end;
$$;

-- Create function to check for SQL injection patterns
create or replace function detect_sql_injection(input_text text)
returns boolean
language plpgsql
immutable
as $$
declare
  suspicious_patterns text[] := array[
    '--',
    ';',
    'union',
    'select',
    'drop',
    'insert',
    'update',
    'delete',
    'exec',
    'execute',
    'script',
    'javascript',
    '<script',
    'onerror',
    'onload'
  ];
  pattern text;
begin
  foreach pattern in array suspicious_patterns
  loop
    if lower(input_text) like '%' || pattern || '%' then
      return true;
    end if;
  end loop;
  
  return false;
end;
$$;

-- Add rate limiting table for API calls
create table if not exists api_rate_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text not null,
  request_count int default 0,
  window_start timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id, endpoint, window_start)
);

create index idx_api_rate_limits_user_endpoint on api_rate_limits(user_id, endpoint, window_start);

-- Create function to check rate limits
create or replace function check_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_max_requests int default 100,
  p_window_minutes int default 60
)
returns boolean
language plpgsql
security definer
as $$
declare
  current_count int;
  window_start timestamptz;
begin
  window_start := date_trunc('hour', now());
  
  insert into api_rate_limits (user_id, endpoint, request_count, window_start)
  values (p_user_id, p_endpoint, 1, window_start)
  on conflict (user_id, endpoint, window_start)
  do update set request_count = api_rate_limits.request_count + 1
  returning request_count into current_count;
  
  return current_count <= p_max_requests;
end;
$$;

-- Enable RLS on rate limits table
alter table api_rate_limits enable row level security;

create policy api_rate_limits_select on api_rate_limits
  for select using (auth.uid() = user_id or role_in('LEGEND_SUPER_ADMIN'));

create policy api_rate_limits_insert on api_rate_limits
  for insert with check (auth.uid() = user_id);

comment on function validate_password_strength is 'Validate password meets minimum security requirements';
comment on function audit_sensitive_access is 'Audit all access to sensitive tables with user context';
comment on function mask_sensitive_data is 'Mask sensitive fields in JSONB data for logging';
comment on function detect_sql_injection is 'Detect potential SQL injection patterns in user input';
comment on function check_rate_limit is 'Implement rate limiting for API endpoints per user';
