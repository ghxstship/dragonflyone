-- ATLVS Operations expansion: workforce, finance, procurement, asset maintenance, and lookup data

create type employment_type as enum ('full_time', 'part_time', 'contractor', 'freelancer');
create type employee_status as enum ('active', 'on_leave', 'inactive', 'terminated');
create type time_entry_status as enum ('pending', 'approved', 'rejected');
create type expense_status as enum ('draft', 'submitted', 'approved', 'rejected', 'paid');
create type purchase_order_status as enum ('draft', 'pending_approval', 'approved', 'ordered', 'received', 'closed');
create type procurement_request_status as enum ('draft', 'submitted', 'under_review', 'approved', 'denied', 'fulfilled');

create table status_registry (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  category text not null,
  code text not null,
  label text not null,
  sort_order integer default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (organization_id, category, code)
);

create table risk_levels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  code text not null,
  label text not null,
  score integer not null,
  description text,
  unique (organization_id, code)
);

create table workforce_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  code text not null,
  name text not null,
  category text,
  created_at timestamptz default now(),
  unique (organization_id, code)
);

create table workforce_employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  platform_user_id uuid references platform_users(id) on delete set null,
  primary_role_id uuid references workforce_roles(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  status employee_status not null default 'active',
  employment_type employment_type not null default 'full_time',
  start_date date,
  end_date date,
  hourly_rate numeric(10,2),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (organization_id, email)
);

create table workforce_employee_roles (
  employee_id uuid not null references workforce_employees(id) on delete cascade,
  role_id uuid not null references workforce_roles(id) on delete cascade,
  primary_role boolean default false,
  unique (employee_id, role_id)
);

create table workforce_time_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  employee_id uuid not null references workforce_employees(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  work_date date not null,
  hours numeric(5,2) not null,
  status time_entry_status not null default 'pending',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table workforce_certifications (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references workforce_employees(id) on delete cascade,
  title text not null,
  issuer text,
  issued_on date,
  expires_on date,
  metadata jsonb default '{}'::jsonb
);

create table procurement_vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  category text,
  contact_name text,
  contact_email text,
  contact_phone text,
  rating integer,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (organization_id, name)
);

create table procurement_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  requester_id uuid references workforce_employees(id) on delete set null,
  vendor_id uuid references procurement_vendors(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  status procurement_request_status not null default 'draft',
  needed_by date,
  total_estimate numeric(12,2),
  justification text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table procurement_request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references procurement_requests(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null,
  unit_price numeric(12,2),
  metadata jsonb default '{}'::jsonb
);

create table finance_expense_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  code text not null,
  name text not null,
  unique (organization_id, code)
);

create table finance_expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  employee_id uuid references workforce_employees(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  category_id uuid references finance_expense_categories(id) on delete set null,
  amount numeric(12,2) not null,
  currency text default 'USD',
  incurred_on date not null,
  status expense_status not null default 'draft',
  description text,
  receipt_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table finance_purchase_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  vendor_id uuid references procurement_vendors(id) on delete set null,
  status purchase_order_status not null default 'draft',
  order_number text not null,
  issued_on date,
  approved_on date,
  total_amount numeric(14,2),
  currency text default 'USD',
  notes text,
  metadata jsonb default '{}'::jsonb,
  unique (organization_id, order_number)
);

create table finance_purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references finance_purchase_orders(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null,
  unit_cost numeric(12,2) not null,
  metadata jsonb default '{}'::jsonb
);

create table asset_maintenance_events (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  event_date date not null,
  performed_by uuid references workforce_employees(id) on delete set null,
  maintenance_type text not null,
  cost numeric(12,2),
  notes text,
  next_due date,
  metadata jsonb default '{}'::jsonb
);

create index on workforce_employees (organization_id);
create index on workforce_time_entries (employee_id, work_date);
create index on finance_expenses (organization_id, status);
create index on finance_purchase_orders (organization_id, status);
create index on procurement_requests (organization_id, status);
create index on asset_maintenance_events (asset_id, event_date);

insert into role_definitions (code, platform, description, level) values
  ('FINANCE_ADMIN', 'atlvs', 'Manages ATLVS finance workflows', 'admin'),
  ('PROCUREMENT_MANAGER', 'atlvs', 'Oversees procurement requests', 'admin'),
  ('WORKFORCE_MANAGER', 'atlvs', 'Manages workforce records and scheduling', 'admin')
on conflict (code) do nothing;

-- Enable RLS
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT unnest(ARRAY[
    'status_registry',
    'risk_levels',
    'workforce_roles',
    'workforce_employees',
    'workforce_employee_roles',
    'workforce_time_entries',
    'workforce_certifications',
    'procurement_vendors',
    'procurement_requests',
    'procurement_request_items',
    'finance_expense_categories',
    'finance_expenses',
    'finance_purchase_orders',
    'finance_purchase_order_items',
    'asset_maintenance_events'
  ]) AS table_name LOOP
    EXECUTE format('alter table %I enable row level security', r.table_name);
  END LOOP;
END $$;

create policy status_registry_reader on status_registry
  for select using (current_app_role() in ('ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy status_registry_admin on status_registry
  for all using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy workforce_roles_reader on workforce_roles
  for select using (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy workforce_roles_admin on workforce_roles
  for all using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'));

create policy workforce_employees_reader on workforce_employees
  for select using (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'));

create policy workforce_employees_admin on workforce_employees
  for all using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'));

create policy workforce_employee_roles_manage on workforce_employee_roles
  for all using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'));

create policy workforce_time_entries_read on workforce_time_entries
  for select using (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'));

create policy workforce_time_entries_submit on workforce_time_entries
  for insert with check (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'));

create policy workforce_time_entries_update on workforce_time_entries
  for update using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'));

create policy workforce_certifications_manage on workforce_certifications
  for all using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'));

create policy procurement_vendors_read on procurement_vendors
  for select using (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'));

create policy procurement_vendors_manage on procurement_vendors
  for all using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'));

create policy procurement_requests_read on procurement_requests
  for select using (current_app_role() in ('ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'));

create policy procurement_requests_submit on procurement_requests
  for insert with check (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'));

create policy procurement_requests_update on procurement_requests
  for update using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'));

create policy procurement_request_items_manage on procurement_request_items
  for all using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'));

create policy finance_expense_categories_read on finance_expense_categories
  for select using (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'));

create policy finance_expense_categories_manage on finance_expense_categories
  for all using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'));

create policy finance_expenses_read on finance_expenses
  for select using (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'));

create policy finance_expenses_submit on finance_expenses
  for insert with check (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'));

create policy finance_expenses_update on finance_expenses
  for update using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'));

create policy finance_purchase_orders_read on finance_purchase_orders
  for select using (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'));

create policy finance_purchase_orders_manage on finance_purchase_orders
  for all using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'));

create policy finance_purchase_order_items_manage on finance_purchase_order_items
  for all using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'));

create policy asset_maintenance_events_read on asset_maintenance_events
  for select using (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_TEAM_MEMBER','LEGEND_SUPER_ADMIN'));

create policy asset_maintenance_events_manage on asset_maintenance_events
  for all using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_TEAM_MEMBER','LEGEND_SUPER_ADMIN'));

-- Baseline organizational seed data for demos and automated tests
with upsert_org as (
  insert into organizations (slug, name)
  values ('ghxstship-industries', 'GHXSTSHIP Industries')
  on conflict (slug) do update set name = excluded.name
  returning id
)
insert into departments (organization_id, code, name)
select id, code, name
from upsert_org,
  lateral (values
    ('DESIGN', 'Design & Direction'),
    ('DEV', 'Development & Engineering'),
    ('OPS', 'Operations & Logistics'),
    ('FIN', 'Finance & Strategy')
  ) as dept(code, name)
on conflict (organization_id, code) do update set name = excluded.name;

with org as (
  select id from organizations where slug = 'ghxstship-industries' limit 1
)
insert into workforce_roles (organization_id, code, name, category)
select org.id, code, name, category
from org,
  lateral (values
    ('EXEC_PRODUCER', 'Executive Producer', 'Leadership'),
    ('TECH_LEAD', 'Technical Lead', 'Engineering'),
    ('ASSET_MANAGER', 'Asset Manager', 'Operations'),
    ('FINANCE_ANALYST', 'Finance Analyst', 'Finance')
  ) as roles(code, name, category)
on conflict (organization_id, code) do update set name = excluded.name;

with org as (
  select id from organizations where slug = 'ghxstship-industries' limit 1
)
insert into finance_expense_categories (organization_id, code, name)
select org.id, code, name
from org,
  lateral (values
    ('TRAVEL', 'Travel & Lodging'),
    ('EQUIPMENT', 'Equipment & Rentals'),
    ('LABOR', 'Staffing & Labor'),
    ('MARKETING', 'Marketing & Promotion')
  ) as cats(code, name)
on conflict (organization_id, code) do update set name = excluded.name;

with org as (
  select id from organizations where slug = 'ghxstship-industries' limit 1
)
insert into procurement_vendors (organization_id, name, category, contact_name, contact_email, rating)
select org.id, name, category, contact_name, contact_email, rating
from org,
  lateral (values
    ('Specter AV Rentals', 'AV', 'Jordan Rivers', 'av@specter.com', 5),
    ('Atlas Fabrication', 'Fabrication', 'Monica Grey', 'build@atlasfab.com', 4)
  ) as vendor(name, category, contact_name, contact_email, rating)
on conflict (organization_id, name) do update set category = excluded.category;

with org as (
  select id from organizations where slug = 'ghxstship-industries' limit 1
)
insert into status_registry (organization_id, category, code, label, sort_order)
select org.id, category, code, label, sort_order
from org,
  lateral (values
    ('risk_level', 'low', 'Low', 1),
    ('risk_level', 'medium', 'Medium', 2),
    ('risk_level', 'high', 'High', 3),
    ('project_health', 'on_track', 'On Track', 1),
    ('project_health', 'at_risk', 'At Risk', 2),
    ('project_health', 'off_track', 'Off Track', 3)
  ) as stats(category, code, label, sort_order)
on conflict (organization_id, category, code) do update set label = excluded.label;
