-- 0017_database_triggers.sql
-- Automated triggers for business logic

-- Auto-update timestamps
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_contacts_updated_at before update on contacts
  for each row execute function update_updated_at_column();

create trigger update_deals_updated_at before update on deals
  for each row execute function update_updated_at_column();

create trigger update_projects_updated_at before update on projects
  for each row execute function update_updated_at_column();

create trigger update_finance_expenses_updated_at before update on finance_expenses
  for each row execute function update_updated_at_column();

create trigger update_procurement_requests_updated_at before update on procurement_requests
  for each row execute function update_updated_at_column();

create trigger update_workforce_time_entries_updated_at before update on workforce_time_entries
  for each row execute function update_updated_at_column();

-- Auto-log deal status changes
create or replace function log_deal_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into audit_log (
      organization_id,
      entity_type,
      entity_id,
      action,
      actor_id,
      changes
    ) values (
      new.organization_id,
      'deal',
      new.id,
      'status_change',
      current_platform_user_id(),
      jsonb_build_object(
        'old_status', old.status,
        'new_status', new.status
      )
    );
  end if;
  return new;
end;
$$;

create trigger log_deal_status_changes after update on deals
  for each row execute function log_deal_status_change();

-- Auto-create project when deal is won
create or replace function auto_create_project_on_deal_won()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_code text;
  v_project_id uuid;
begin
  if new.status = 'won' and (old.status is null or old.status != 'won') then
    v_project_code := 'PROJ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('project_sequence')::text, 4, '0');
    
    insert into projects (
      organization_id,
      deal_id,
      code,
      name,
      phase,
      budget
    ) values (
      new.organization_id,
      new.id,
      v_project_code,
      new.title,
      'intake',
      new.value
    )
    returning id into v_project_id;
    
    insert into integration_deal_links (
      organization_id,
      atlvs_deal_id,
      compvss_project_id,
      sync_status
    ) values (
      new.organization_id,
      new.id,
      v_project_id,
      'active'
    );
  end if;
  
  return new;
end;
$$;

create sequence if not exists project_sequence start 1;

create trigger auto_project_creation after update on deals
  for each row execute function auto_create_project_on_deal_won();

-- Asset state validation
create or replace function validate_asset_state_change()
returns trigger
language plpgsql
as $$
begin
  if new.state = 'deployed' and new.project_id is null then
    raise exception 'Cannot deploy asset without project assignment';
  end if;
  
  if new.state = 'maintenance' and old.state = 'deployed' then
    raise exception 'Cannot move deployed asset directly to maintenance. Return to available first.';
  end if;
  
  return new;
end;
$$;

create trigger validate_asset_states before update on assets
  for each row execute function validate_asset_state_change();

-- Expense auto-approval for small amounts
create or replace function auto_approve_small_expenses()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.amount <= 100 and new.status = 'submitted' then
    new.status := 'approved';
  end if;
  return new;
end;
$$;

create trigger auto_approve_expenses before insert or update on finance_expenses
  for each row execute function auto_approve_small_expenses();

-- Calculate PO total from line items
create or replace function calculate_po_total()
returns trigger
language plpgsql
as $$
declare
  v_total numeric;
begin
  select sum(quantity * unit_cost) into v_total
  from finance_purchase_order_items
  where purchase_order_id = new.purchase_order_id;
  
  update finance_purchase_orders
  set total_amount = v_total
  where id = new.purchase_order_id;
  
  return new;
end;
$$;

create trigger update_po_total after insert or update or delete on finance_purchase_order_items
  for each row execute function calculate_po_total();

-- Log procurement request status changes
create or replace function log_procurement_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into audit_log (
      organization_id,
      entity_type,
      entity_id,
      action,
      actor_id,
      changes
    ) values (
      new.organization_id,
      'procurement_request',
      new.id,
      'status_change',
      current_platform_user_id(),
      jsonb_build_object(
        'old_status', old.status,
        'new_status', new.status
      )
    );
  end if;
  return new;
end;
$$;

create trigger log_procurement_changes after update on procurement_requests
  for each row execute function log_procurement_status_change();

-- Prevent deletion of projects with assets
create or replace function prevent_project_deletion_with_assets()
returns trigger
language plpgsql
as $$
declare
  v_asset_count int;
begin
  select count(*) into v_asset_count
  from assets
  where project_id = old.id;
  
  if v_asset_count > 0 then
    raise exception 'Cannot delete project with % assigned assets. Unassign assets first.', v_asset_count;
  end if;
  
  return old;
end;
$$;

create trigger prevent_project_deletion before delete on projects
  for each row execute function prevent_project_deletion_with_assets();

-- Update integration sync timestamp
create or replace function update_integration_sync_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.last_sync_at := now();
  return new;
end;
$$;

create trigger sync_timestamp_deal_links before update on integration_deal_links
  for each row execute function update_integration_sync_timestamp();

create trigger sync_timestamp_project_links before update on integration_project_links
  for each row execute function update_integration_sync_timestamp();

create trigger sync_timestamp_event_links before update on integration_event_links
  for each row execute function update_integration_sync_timestamp();
