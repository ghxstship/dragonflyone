-- 0002_ops_finance.sql
-- Workforce, procurement, finance, and asset maintenance modules

create table status_registry (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  category text not null,
  code text not null,
  label text not null,
  sort_order integer default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
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
  created_at timestamptz not null default now(),
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
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workforce_certifications (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references workforce_employees(id) on delete cascade,
  title text not null,
  issuer text,
  issued_on date,
  expires_on date,
  metadata jsonb not null default '{}'::jsonb
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
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
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
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table procurement_request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references procurement_requests(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null,
  unit_price numeric(12,2),
  metadata jsonb not null default '{}'::jsonb
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
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, order_number)
);

create table finance_purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references finance_purchase_orders(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null,
  unit_cost numeric(12,2) not null,
  metadata jsonb not null default '{}'::jsonb
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
  metadata jsonb not null default '{}'::jsonb
);

create index on workforce_employees (organization_id);
create index on workforce_time_entries (employee_id, work_date);
create index on finance_expenses (organization_id, status);
create index on finance_purchase_orders (organization_id, status);
create index on procurement_requests (organization_id, status);
create index on asset_maintenance_events (asset_id, event_date);

-- Enable RLS
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT unnest(ARRAY[
    'status_registry','risk_levels','workforce_roles','workforce_employees','workforce_employee_roles',
    'workforce_time_entries','workforce_certifications','procurement_vendors','procurement_requests',
    'procurement_request_items','finance_expense_categories','finance_expenses','finance_purchase_orders',
    'finance_purchase_order_items','asset_maintenance_events'
  ]) AS table_name LOOP
    EXECUTE format('alter table %I enable row level security', r.table_name);
  END LOOP;
END $$;

create policy generic_select on status_registry
  for select using (org_matches(organization_id) and role_in('ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy status_registry_manage on status_registry
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy workforce_roles_rw on workforce_roles
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'));

create policy workforce_employees_rw on workforce_employees
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'));

create policy workforce_employees_select on workforce_employees
  for select using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'));

create policy workforce_time_entries_rw on workforce_time_entries
  for all using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','WORKFORCE_MANAGER','LEGEND_SUPER_ADMIN'));

create policy procurement_access on procurement_requests
  for all using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'));

create policy procurement_items_manage on procurement_request_items
  for all using (org_matches((select organization_id from procurement_requests where id = request_id))
    and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'))
  with check (org_matches((select organization_id from procurement_requests where id = request_id))
    and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'));

create policy finance_expense_categories_rw on finance_expense_categories
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'));

create policy finance_expenses_rw on finance_expenses
  for all using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'));

create policy finance_purchase_orders_rw on finance_purchase_orders
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN'));

create policy finance_purchase_order_items_manage on finance_purchase_order_items
  for all using (
    org_matches((select organization_id from finance_purchase_orders where id = purchase_order_id))
    and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN')
  )
  with check (
    org_matches((select organization_id from finance_purchase_orders where id = purchase_order_id))
    and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','PROCUREMENT_MANAGER','LEGEND_SUPER_ADMIN')
  );

create policy asset_maintenance_access on asset_maintenance_events
  for all using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_TEAM_MEMBER','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_TEAM_MEMBER','LEGEND_SUPER_ADMIN'));
