-- 0020_indexes_optimization.sql
-- Performance indexes for critical query paths

create index if not exists idx_contacts_org_email on contacts(organization_id, email);
create index if not exists idx_contacts_org_company on contacts(organization_id, company);
create index if not exists idx_contacts_search on contacts using gin(to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(company, '') || ' ' || coalesce(email, '')));

create index if not exists idx_deals_org_status on deals(organization_id, status);
create index if not exists idx_deals_org_contact on deals(organization_id, contact_id);
create index if not exists idx_deals_expected_close on deals(expected_close_date) where status in ('lead', 'qualified', 'proposal');

create index if not exists idx_projects_org_phase on projects(organization_id, phase);
create index if not exists idx_projects_org_deal on projects(organization_id, deal_id);
create index if not exists idx_projects_date_range on projects(start_date, end_date);
create index if not exists idx_projects_org_dept on projects(organization_id, department_id);

create index if not exists idx_assets_org_state on assets(organization_id, state);
create index if not exists idx_assets_org_category on assets(organization_id, category);
create index if not exists idx_assets_project on assets(project_id) where project_id is not null;
create index if not exists idx_assets_tag on assets(tag);

create index if not exists idx_ledger_entries_org_date on ledger_entries(organization_id, entry_date);
create index if not exists idx_ledger_entries_account on ledger_entries(account_id);
create index if not exists idx_ledger_entries_project on ledger_entries(project_id) where project_id is not null;

create index if not exists idx_finance_expenses_org_status on finance_expenses(organization_id, status);
create index if not exists idx_finance_expenses_employee on finance_expenses(employee_id);
create index if not exists idx_finance_expenses_project on finance_expenses(project_id) where project_id is not null;
create index if not exists idx_finance_expenses_date on finance_expenses(incurred_on);

create index if not exists idx_finance_po_org_status on finance_purchase_orders(organization_id, status);
create index if not exists idx_finance_po_vendor on finance_purchase_orders(vendor_id);
create index if not exists idx_finance_po_project on finance_purchase_orders(project_id) where project_id is not null;
create index if not exists idx_finance_po_date on finance_purchase_orders(issued_on);

create index if not exists idx_workforce_employees_org_status on workforce_employees(organization_id, status);
create index if not exists idx_workforce_employees_email on workforce_employees(email);
create index if not exists idx_workforce_time_entries_date on workforce_time_entries(work_date);
create index if not exists idx_workforce_time_entries_status on workforce_time_entries(status);

create index if not exists idx_procurement_requests_org_status on procurement_requests(organization_id, status);
create index if not exists idx_procurement_requests_vendor on procurement_requests(vendor_id);
create index if not exists idx_procurement_requests_project on procurement_requests(project_id) where project_id is not null;

create index if not exists idx_audit_log_org_table_record on audit_log(organization_id, table_name, record_id);
create index if not exists idx_audit_log_timestamp on audit_log(changed_at);

create index if not exists idx_webhook_logs_provider on webhook_event_logs(provider, status);
create index if not exists idx_webhook_logs_created on webhook_event_logs(created_at);

create index if not exists idx_automation_usage_org on automation_usage_log(organization_id, kind);
create index if not exists idx_automation_usage_executed on automation_usage_log(executed_at);

create index if not exists idx_integration_deal_links_org on integration_deal_links(organization_id, status);
create index if not exists idx_integration_project_links_org on integration_project_links(organization_id, status);
create index if not exists idx_integration_event_links_org on integration_event_links(organization_id, status);

analyze contacts;
analyze deals;
analyze projects;
analyze assets;
analyze ledger_entries;
analyze finance_expenses;
analyze finance_purchase_orders;
analyze workforce_employees;
analyze workforce_time_entries;
analyze procurement_requests;
