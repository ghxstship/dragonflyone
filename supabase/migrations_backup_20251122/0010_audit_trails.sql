-- Audit logging for financial + commerce entities

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  operation text not null check (operation in ('INSERT','UPDATE','DELETE')),
  record_id text not null,
  changed_data jsonb not null,
  changed_at timestamptz not null default now(),
  changed_by uuid,
  metadata jsonb not null default '{}'::jsonb
);

grant select, insert on public.audit_log to service_role;

grant select on public.audit_log to authenticated;

create or replace function public.log_audit_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  payload jsonb;
  target_id text;
begin
  if (TG_OP = 'DELETE') then
    payload := to_jsonb(OLD);
    target_id := coalesce(OLD.id::text, OLD.order_id::text, OLD.code::text, OLD.ticket_type_id::text, 'unknown');
    insert into public.audit_log (table_name, operation, record_id, changed_data, changed_by, metadata)
    values (TG_TABLE_NAME, TG_OP, target_id, payload, auth.uid(), jsonb_build_object('trigger', TG_NAME));
    return OLD;
  end if;

  payload := to_jsonb(NEW);
  target_id := coalesce(NEW.id::text, NEW.order_id::text, NEW.code::text, NEW.ticket_type_id::text, 'unknown');

  insert into public.audit_log (table_name, operation, record_id, changed_data, changed_by, metadata)
  values (TG_TABLE_NAME, TG_OP, target_id, payload, auth.uid(), jsonb_build_object('trigger', TG_NAME));

  return NEW;
end;
$$;

-- gvteway_orders
 drop trigger if exists audit_gvteway_orders on public.gvteway_orders;
create trigger audit_gvteway_orders
  after insert or update or delete on public.gvteway_orders
  for each row execute function public.log_audit_change();

-- gvteway_order_items
 drop trigger if exists audit_gvteway_order_items on public.gvteway_order_items;
create trigger audit_gvteway_order_items
  after insert or update or delete on public.gvteway_order_items
  for each row execute function public.log_audit_change();

-- gvteway_order_refunds
 drop trigger if exists audit_gvteway_order_refunds on public.gvteway_order_refunds;
create trigger audit_gvteway_order_refunds
  after insert or update or delete on public.gvteway_order_refunds
  for each row execute function public.log_audit_change();

-- ledger_entries
 drop trigger if exists audit_ledger_entries on public.ledger_entries;
create trigger audit_ledger_entries
  after insert or update or delete on public.ledger_entries
  for each row execute function public.log_audit_change();

-- finance_expenses
 drop trigger if exists audit_finance_expenses on public.finance_expenses;
create trigger audit_finance_expenses
  after insert or update or delete on public.finance_expenses
  for each row execute function public.log_audit_change();

-- finance_purchase_orders
 drop trigger if exists audit_finance_purchase_orders on public.finance_purchase_orders;
create trigger audit_finance_purchase_orders
  after insert or update or delete on public.finance_purchase_orders
  for each row execute function public.log_audit_change();

-- finance_purchase_order_items
 drop trigger if exists audit_finance_purchase_order_items on public.finance_purchase_order_items;
create trigger audit_finance_purchase_order_items
  after insert or update or delete on public.finance_purchase_order_items
  for each row execute function public.log_audit_change();
