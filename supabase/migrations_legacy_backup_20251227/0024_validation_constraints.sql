-- 0023_validation_constraints.sql
-- Additional validation constraints and default values

alter table contacts add constraint contacts_email_format check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
alter table platform_users add constraint platform_users_email_format check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
alter table workforce_employees add constraint workforce_employees_email_format check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

alter table deals add constraint deals_value_positive check (value >= 0);
alter table deals add constraint deals_probability_range check (probability >= 0 and probability <= 100);
alter table projects add constraint projects_budget_positive check (budget >= 0);
alter table assets add constraint assets_purchase_price_positive check (purchase_price >= 0);
alter table finance_expenses add constraint finance_expenses_amount_positive check (amount > 0);
alter table finance_purchase_orders add constraint finance_purchase_orders_amount_positive check (total_amount >= 0);

alter table workforce_employees add constraint workforce_employees_dates_logical check (end_date is null or end_date >= start_date);
alter table projects add constraint projects_dates_logical check (end_date is null or end_date >= start_date);

alter table workforce_time_entries add constraint workforce_time_entries_hours_positive check (hours > 0 and hours <= 24);
alter table procurement_vendors add constraint procurement_vendors_rating_range check (rating is null or (rating >= 1 and rating <= 5));

-- Set metadata defaults only for tables that have metadata column
alter table contacts alter column metadata set default '{}'::jsonb;
-- alter table deals alter column metadata set default '{}'::jsonb;
alter table projects alter column metadata set default '{}'::jsonb;
alter table assets alter column metadata set default '{}'::jsonb;
-- alter table ledger_entries alter column metadata set default '{}'::jsonb;

-- Set currency defaults only for tables that have currency column
-- alter table deals alter column currency set default 'USD';
alter table projects alter column currency set default 'USD';
alter table finance_expenses alter column currency set default 'USD';
alter table finance_purchase_orders alter column currency set default 'USD';

alter table deals alter column probability set default 0;
-- alter table procurement_vendors alter column metadata set default '{}'::jsonb;
-- alter table workforce_employees alter column metadata set default '{}'::jsonb;
alter table finance_expenses alter column metadata set default '{}'::jsonb;
alter table finance_purchase_orders alter column metadata set default '{}'::jsonb;
