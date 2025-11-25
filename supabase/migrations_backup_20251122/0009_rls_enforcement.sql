-- RLS hardening across data application layer tables

create or replace function public.current_platform_user_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id
  from platform_users
  where auth_user_id = auth.uid()
  order by created_at desc
  limit 1;
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select organization_id
  from platform_users
  where auth_user_id = auth.uid()
  order by created_at desc
  limit 1;
$$;

create or replace function public.org_matches(p_org uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid;
  v_role text;
begin
  v_role := current_app_role();
  if v_role like 'LEGEND_%' then
    return true;
  end if;

  v_org := current_organization_id();
  if v_org is null then
    return false;
  end if;

  return p_org is not distinct from v_org;
end;
$$;

create or replace function public.org_check(p_org uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select org_matches(p_org);
$$;

-- Helper rolesets
create or replace function public.role_in(variadic roles text[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select current_app_role() = any(roles);
$$;

-- Base tables ---------------------------------------------------------------

drop policy if exists organizations_access on organizations;
drop policy if exists organizations_admin on organizations;
drop policy if exists organizations_update on organizations;

create policy organizations_select on organizations
  for select using (
    current_app_role() like 'LEGEND_%'
    or id = current_organization_id()
  );

create policy organizations_manage on organizations
  for all using (current_app_role() in ('ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (current_app_role() in ('ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy platform_users_self on platform_users
  for select using (
    auth.uid() = auth_user_id
    or (org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    ))
  );

drop policy if exists platform_users_admin on platform_users;

create policy platform_users_manage on platform_users
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

-- Contacts

drop policy if exists data_reader on contacts;
drop policy if exists data_writer on contacts;

create policy contacts_select on contacts
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

create policy contacts_insert on contacts
  for insert with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

create policy contacts_update on contacts
  for update using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

-- Deals

drop policy if exists deals_reader on deals;
drop policy if exists deals_writer on deals;
drop policy if exists deals_updater on deals;

create policy deals_select on deals
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

create policy deals_insert on deals
  for insert with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

create policy deals_update on deals
  for update using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

-- Projects

drop policy if exists projects_rw on projects;

create policy projects_select on projects
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

create policy projects_manage on projects
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_ADMIN','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

-- Assets

drop policy if exists assets_rw on assets;

create policy assets_manage on assets
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_TEAM_MEMBER','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_TEAM_MEMBER','LEGEND_SUPER_ADMIN'
    )
  );

-- Ledger

drop policy if exists ledger_reader on ledger_accounts;
drop policy if exists ledger_entries_rw on ledger_entries;

create policy ledger_accounts_select on ledger_accounts
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

create policy ledger_entries_manage on ledger_entries
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

-- User roles

drop policy if exists user_roles_reader on user_roles;

create policy user_roles_select on user_roles
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

-- Operational tables --------------------------------------------------------

-- Status registry

drop policy if exists status_registry_reader on status_registry;
drop policy if exists status_registry_admin on status_registry;

create policy status_registry_select on status_registry
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

create policy status_registry_manage on status_registry
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

-- Workforce tables

-- workforce_roles

drop policy if exists workforce_roles_reader on workforce_roles;
drop policy if exists workforce_roles_admin on workforce_roles;

create policy workforce_roles_select on workforce_roles
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );

create policy workforce_roles_manage on workforce_roles
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );

-- workforce_employees

drop policy if exists workforce_employees_reader on workforce_employees;
drop policy if exists workforce_employees_admin on workforce_employees;

create policy workforce_employees_select on workforce_employees
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );

create policy workforce_employees_manage on workforce_employees
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );

-- workforce_employee_roles

drop policy if exists workforce_employee_roles_manage on workforce_employee_roles;

create policy workforce_employee_roles_manage on workforce_employee_roles
  for all using (
    org_matches((select organization_id from workforce_employees where id = employee_id))
    and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches((select organization_id from workforce_employees where id = employee_id))
    and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );

-- workforce_time_entries

drop policy if exists workforce_time_entries_read on workforce_time_entries;
drop policy if exists workforce_time_entries_submit on workforce_time_entries;
drop policy if exists workforce_time_entries_update on workforce_time_entries;

create policy workforce_time_entries_select on workforce_time_entries
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );

create policy workforce_time_entries_manage on workforce_time_entries
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );

-- workforce_certifications

drop policy if exists workforce_certifications_manage on workforce_certifications;

create policy workforce_certifications_manage on workforce_certifications
  for all using (
    org_matches((select organization_id from workforce_employees where id = employee_id))
    and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches((select organization_id from workforce_employees where id = employee_id))
    and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );

-- Procurement vendors

drop policy if exists procurement_vendors_read on procurement_vendors;
drop policy if exists procurement_vendors_manage on procurement_vendors;

create policy procurement_vendors_select on procurement_vendors
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );

create policy procurement_vendors_manage on procurement_vendors
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );

-- Procurement requests / items

drop policy if exists procurement_requests_read on procurement_requests;
drop policy if exists procurement_requests_submit on procurement_requests;
drop policy if exists procurement_requests_update on procurement_requests;

create policy procurement_requests_select on procurement_requests
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );

create policy procurement_requests_manage on procurement_requests
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );


drop policy if exists procurement_request_items_manage on procurement_request_items;

create policy procurement_request_items_manage on procurement_request_items
  for all using (
    org_matches((select organization_id from procurement_requests where id = request_id))
    and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches((select organization_id from procurement_requests where id = request_id))
    and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );

-- Finance expense categories / expenses

drop policy if exists finance_expense_categories_read on finance_expense_categories;
drop policy if exists finance_expense_categories_manage on finance_expense_categories;

create policy finance_expense_categories_select on finance_expense_categories
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

create policy finance_expense_categories_manage on finance_expense_categories
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );


drop policy if exists finance_expenses_read on finance_expenses;
drop policy if exists finance_expenses_submit on finance_expenses;
drop policy if exists finance_expenses_update on finance_expenses;

create policy finance_expenses_select on finance_expenses
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

create policy finance_expenses_manage on finance_expenses
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

-- Purchase orders

drop policy if exists finance_purchase_orders_read on finance_purchase_orders;
drop policy if exists finance_purchase_orders_manage on finance_purchase_orders;

create policy finance_purchase_orders_select on finance_purchase_orders
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );

create policy finance_purchase_orders_manage on finance_purchase_orders
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );


drop policy if exists finance_purchase_order_items_manage on finance_purchase_order_items;

create policy finance_purchase_order_items_manage on finance_purchase_order_items
  for all using (
    org_matches((select organization_id from finance_purchase_orders where id = purchase_order_id))
    and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches((select organization_id from finance_purchase_orders where id = purchase_order_id))
    and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'
    )
  );

-- Asset maintenance

drop policy if exists asset_maintenance_events_read on asset_maintenance_events;
drop policy if exists asset_maintenance_events_manage on asset_maintenance_events;

create policy asset_maintenance_events_select on asset_maintenance_events
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_TEAM_MEMBER','LEGEND_SUPER_ADMIN'
    )
  );

create policy asset_maintenance_events_manage on asset_maintenance_events
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_TEAM_MEMBER','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_TEAM_MEMBER','LEGEND_SUPER_ADMIN'
    )
  );

-- Integration tables --------------------------------------------------------

drop policy if exists integration_deal_links_read on integration_deal_links;
drop policy if exists integration_deal_links_manage on integration_deal_links;

create policy integration_deal_links_select on integration_deal_links
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN'
    )
  );

create policy integration_deal_links_manage on integration_deal_links
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );


drop policy if exists integration_project_links_read on integration_project_links;
drop policy if exists integration_project_links_manage on integration_project_links;

create policy integration_project_links_select on integration_project_links
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN'
    )
  );

create policy integration_project_links_manage on integration_project_links
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN'
    )
  );


drop policy if exists integration_event_links_read on integration_event_links;
drop policy if exists integration_event_links_manage on integration_event_links;

create policy integration_event_links_select on integration_event_links
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','GVTEWAY_ADMIN'
    )
  );

create policy integration_event_links_manage on integration_event_links
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','GVTEWAY_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','GVTEWAY_ADMIN'
    )
  );


drop policy if exists integration_asset_links_read on integration_asset_links;
drop policy if exists integration_asset_links_manage on integration_asset_links;

create policy integration_asset_links_select on integration_asset_links
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_TEAM_MEMBER'
    )
  );

create policy integration_asset_links_manage on integration_asset_links
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_TEAM_MEMBER'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_TEAM_MEMBER'
    )
  );


drop policy if exists integration_sync_jobs_manage on integration_sync_jobs;

create policy integration_sync_jobs_manage on integration_sync_jobs
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

-- Client feedback

drop policy if exists client_feedback_read on client_feedback;
drop policy if exists client_feedback_manage on client_feedback;
drop policy if exists client_feedback_update on client_feedback;
drop policy if exists client_feedback_delete on client_feedback;

create policy client_feedback_select on client_feedback
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN'
    )
  );

create policy client_feedback_manage on client_feedback
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN'
    )
  );

-- Ticket revenue ingestions

drop policy if exists ticket_revenue_read on ticket_revenue_ingestions;
drop policy if exists ticket_revenue_manage on ticket_revenue_ingestions;

create policy ticket_revenue_select on ticket_revenue_ingestions
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN'
    )
  );

create policy ticket_revenue_manage on ticket_revenue_ingestions
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );

-- Event role assignments

drop policy if exists event_roles_read on event_role_assignments;
drop policy if exists event_roles_manage on event_role_assignments;

create policy event_roles_select on event_role_assignments
  for select using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN'
    )
  );

create policy event_roles_manage on event_role_assignments
  for all using (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  )
  with check (
    org_matches(organization_id) and current_app_role() in (
      'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
    )
  );
