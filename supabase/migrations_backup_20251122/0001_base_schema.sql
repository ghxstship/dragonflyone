-- GHXSTSHIP Supabase base schema for ATLVS/COMPVSS/GVTEWAY

create type deal_status as enum ('lead', 'qualified', 'proposal', 'won', 'lost');
create type project_phase as enum ('intake', 'preproduction', 'in_production', 'post');
create type asset_state as enum ('available', 'reserved', 'deployed', 'maintenance', 'retired');
create type ledger_side as enum ('debit', 'credit');

create table organizations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table platform_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null,
  organization_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  company text,
  first_name text,
  last_name text,
  email text,
  phone text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table deals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  title text not null,
  status deal_status not null default 'lead',
  value numeric(18,2),
  expected_close_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  deal_id uuid references deals(id) on delete set null,
  department_id uuid references departments(id) on delete set null,
  code text not null,
  name text not null,
  phase project_phase not null default 'intake',
  start_date date,
  end_date date,
  budget numeric(18,2),
  currency text default 'USD',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (organization_id, code)
);

create table assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  tag text not null,
  category text not null,
  state asset_state not null default 'available',
  purchase_price numeric(18,2),
  acquired_at date,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (organization_id, tag)
);

create table ledger_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  code text not null,
  name text not null,
  account_type text not null,
  created_at timestamptz default now(),
  unique (organization_id, code)
);

create table ledger_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  account_id uuid not null references ledger_accounts(id) on delete cascade,
  amount numeric(18,2) not null,
  side ledger_side not null,
  entry_date date not null,
  memo text,
  created_at timestamptz default now()
);

create table role_definitions (
  code text primary key,
  platform text not null,
  description text,
  level text not null
);

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  platform_user_id uuid not null references platform_users(id) on delete cascade,
  role_code text not null references role_definitions(code) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  created_at timestamptz default now(),
  unique (platform_user_id, role_code, organization_id)
);

-- Helper to read JWT role claims
create or replace function public.current_app_role() returns text
language plpgsql security definer set search_path = public as $$
declare
  claims jsonb;
  role text;
begin
  claims := auth.jwt();
  role := claims ->> 'app_role';
  return coalesce(role, 'ATLVS_VIEWER');
end;
$$;

after create function, ensure revocation ??? not needed.

do $$ begin execute 'alter table organizations enable row level security'; end $$;
do $$ begin execute 'alter table platform_users enable row level security'; end $$;
do $$ begin execute 'alter table contacts enable row level security'; end $$;
do $$ begin execute 'alter table deals enable row level security'; end $$;
do $$ begin execute 'alter table projects enable row level security'; end $$;
do $$ begin execute 'alter table assets enable row level security'; end $$;
do $$ begin execute 'alter table ledger_accounts enable row level security'; end $$;
do $$ begin execute 'alter table ledger_entries enable row level security'; end $$;
do $$ begin execute 'alter table user_roles enable row level security'; end $$;

create policy organizations_access on organizations
  for select using (true);

create policy organizations_admin on organizations
  for insert with check (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy organizations_update on organizations
  for update using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy platform_users_self on platform_users
  for select using (auth.uid() = auth_user_id);

create policy platform_users_admin on platform_users
  for all using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy data_reader on contacts
  for select using (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy data_writer on contacts
  for insert with check (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy deals_reader on deals
  for select using (current_app_role() in ('ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy deals_writer on deals
  for insert with check (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy deals_updater on deals
  for update using (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy projects_rw on projects
  for all
  using (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_ADMIN','LEGEND_SUPER_ADMIN'));

create policy assets_rw on assets
  for all
  using (current_app_role() in ('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_TEAM_MEMBER','LEGEND_SUPER_ADMIN'));

create policy ledger_reader on ledger_accounts
  for select using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'));

create policy ledger_entries_rw on ledger_entries
  using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'));

create policy user_roles_reader on user_roles
  for select using (current_app_role() in ('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));
