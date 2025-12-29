-- 0024_cascade_deletes.sql
-- Configure cascade delete behavior for referential integrity

alter table deals drop constraint if exists deals_contact_id_fkey;
alter table deals add constraint deals_contact_id_fkey foreign key (contact_id) references contacts(id) on delete set null;

alter table deals drop constraint if exists deals_organization_id_fkey;
alter table deals add constraint deals_organization_id_fkey foreign key (organization_id) references organizations(id) on delete cascade;

alter table projects drop constraint if exists projects_deal_id_fkey;
alter table projects add constraint projects_deal_id_fkey foreign key (deal_id) references deals(id) on delete set null;

alter table projects drop constraint if exists projects_organization_id_fkey;
alter table projects add constraint projects_organization_id_fkey foreign key (organization_id) references organizations(id) on delete cascade;

alter table assets drop constraint if exists assets_project_id_fkey;
alter table assets add constraint assets_project_id_fkey foreign key (project_id) references projects(id) on delete set null;

alter table assets drop constraint if exists assets_organization_id_fkey;
alter table assets add constraint assets_organization_id_fkey foreign key (organization_id) references organizations(id) on delete cascade;

alter table ledger_entries drop constraint if exists ledger_entries_account_id_fkey;
alter table ledger_entries add constraint ledger_entries_account_id_fkey foreign key (account_id) references ledger_accounts(id) on delete restrict;

alter table ledger_entries drop constraint if exists ledger_entries_project_id_fkey;
alter table ledger_entries add constraint ledger_entries_project_id_fkey foreign key (project_id) references projects(id) on delete set null;

alter table finance_expenses drop constraint if exists finance_expenses_employee_id_fkey;
alter table finance_expenses add constraint finance_expenses_employee_id_fkey foreign key (employee_id) references workforce_employees(id) on delete set null;

alter table finance_expenses drop constraint if exists finance_expenses_project_id_fkey;
alter table finance_expenses add constraint finance_expenses_project_id_fkey foreign key (project_id) references projects(id) on delete set null;

alter table finance_purchase_orders drop constraint if exists finance_purchase_orders_project_id_fkey;
alter table finance_purchase_orders add constraint finance_purchase_orders_project_id_fkey foreign key (project_id) references projects(id) on delete set null;

alter table workforce_time_entries drop constraint if exists workforce_time_entries_employee_id_fkey;
alter table workforce_time_entries add constraint workforce_time_entries_employee_id_fkey foreign key (employee_id) references workforce_employees(id) on delete cascade;

alter table workforce_time_entries drop constraint if exists workforce_time_entries_project_id_fkey;
alter table workforce_time_entries add constraint workforce_time_entries_project_id_fkey foreign key (project_id) references projects(id) on delete set null;

comment on constraint deals_contact_id_fkey on deals is 'Set null on contact delete - preserve deal history';
comment on constraint projects_deal_id_fkey on projects is 'Set null on deal delete - preserve project record';
comment on constraint assets_project_id_fkey on assets is 'Set null on project delete - return asset to available pool';
comment on constraint ledger_entries_account_id_fkey on ledger_entries is 'Restrict account deletion if entries exist - maintain financial integrity';
