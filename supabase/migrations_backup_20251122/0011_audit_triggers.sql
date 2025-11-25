-- Audit logging for critical entities across the data application layer

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  table_name text not null,
  record_id text,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid references public.platform_users(id) on delete set null,
  role_code text,
  metadata jsonb not null default '{}'::jsonb,
  changed_at timestamptz not null default now()
);

create index if not exists audit_log_org_idx on public.audit_log (organization_id, changed_at desc);
create index if not exists audit_log_table_idx on public.audit_log (table_name, changed_at desc);

alter table public.audit_log enable row level security;

create policy audit_log_select on public.audit_log
  for select using (
    (organization_id is null and current_app_role() like 'LEGEND_%')
    or org_matches(organization_id)
  );

create policy audit_log_insert on public.audit_log
  for insert with check (
    (organization_id is null and current_app_role() like 'LEGEND_%')
    or org_matches(organization_id)
  );

create or replace function public.audit_log_capture()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
  v_changed_by uuid := current_platform_user_id();
  v_role text := current_app_role();
  v_record_id text;
  v_old jsonb;
  v_new jsonb;
  v_col text;
begin
  v_col := coalesce(TG_ARGV[0], 'organization_id');

  if TG_OP = 'DELETE' then
    v_old := to_jsonb(OLD);
    v_new := null;
    v_record_id := coalesce(v_old ->> 'id', v_old ->> 'code');
    v_org := nullif(v_old ->> v_col, '')::uuid;
  else
    v_old := case when TG_OP = 'UPDATE' then to_jsonb(OLD) else null end;
    v_new := to_jsonb(NEW);
    v_record_id := coalesce(v_new ->> 'id', v_new ->> 'code');
    v_org := nullif(v_new ->> v_col, '')::uuid;
  end if;

  insert into public.audit_log (
    organization_id,
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_by,
    role_code,
    metadata
  ) values (
    v_org,
    TG_TABLE_NAME,
    v_record_id,
    TG_OP,
    v_old,
    v_new,
    v_changed_by,
    v_role,
    jsonb_build_object('trigger', TG_NAME)
  );

  if TG_OP = 'DELETE' then
    return OLD;
  else
    return NEW;
  end if;
end;
$$;

-- Helper to attach audit triggers safely
create or replace function public.attach_audit_trigger(p_table regclass, p_column text default 'organization_id')
returns void
language plpgsql
as $$
begin
  execute format('drop trigger if exists audit_%s on %s', p_column, p_table);
  execute format(
    'create trigger audit_%s after insert or update or delete on %s for each row execute function public.audit_log_capture(%L)',
    p_column,
    p_table,
    p_column
  );
end;
$$;

select public.attach_audit_trigger('public.deals'::regclass, 'organization_id');
select public.attach_audit_trigger('public.projects'::regclass, 'organization_id');
select public.attach_audit_trigger('public.finance_expenses'::regclass, 'organization_id');
select public.attach_audit_trigger('public.finance_purchase_orders'::regclass, 'organization_id');
select public.attach_audit_trigger('public.procurement_requests'::regclass, 'organization_id');
select public.attach_audit_trigger('public.integration_project_links'::regclass, 'organization_id');
select public.attach_audit_trigger('public.ticket_revenue_ingestions'::regclass, 'organization_id');
select public.attach_audit_trigger('public.automation_usage_log'::regclass, 'organization_id');
