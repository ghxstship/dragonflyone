-- 0001_core_schema.sql
-- Canonical schema foundation for GHXSTSHIP data application layer

create extension if not exists "uuid-ossp";

create type deal_status as enum ('lead','qualified','proposal','won','lost');
create type project_phase as enum ('intake','preproduction','in_production','post');
create type asset_state as enum ('available','reserved','deployed','maintenance','retired');
create type ledger_side as enum ('debit','credit');
create type employment_type as enum ('full_time','part_time','contractor','freelancer');
create type employee_status as enum ('active','on_leave','inactive','terminated');
create type time_entry_status as enum ('pending','approved','rejected');
create type expense_status as enum ('draft','submitted','approved','rejected','paid');
create type purchase_order_status as enum ('draft','pending_approval','approved','ordered','received','closed');
create type procurement_request_status as enum ('draft','submitted','under_review','approved','denied','fulfilled');

create table organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  timezone text default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  auth_user_id uuid not null unique,
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
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table deals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  title text not null,
  status deal_status not null default 'lead',
  value numeric(18,2),
  expected_close_date date,
  probability numeric(5,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  deal_id uuid references deals(id) on delete set null,
  department_id uuid references departments(id) on delete set null,
  code text not null,
  name text not null,
  phase project_phase not null default 'intake',
  budget numeric(18,2),
  currency text default 'USD',
  start_date date,
  end_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
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
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, tag)
);

create table ledger_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  code text not null,
  name text not null,
  account_type text not null,
  created_at timestamptz not null default now(),
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
  created_at timestamptz not null default now()
);

create table role_definitions (
  code text primary key,
  platform text not null,
  description text,
  level text not null,
  hierarchy_rank integer not null default 0
);

create table user_roles (
  id uuid primary key default gen_random_uuid(),
  platform_user_id uuid not null references platform_users(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  role_code text not null references role_definitions(code) on delete cascade,
  created_at timestamptz not null default now(),
  unique(platform_user_id, organization_id, role_code)
);

insert into role_definitions (code, platform, description, level, hierarchy_rank) values
  ('LEGEND_SUPER_ADMIN','legend','Global superuser','god',5),
  ('LEGEND_ADMIN','legend','Legend admin','god',5),
  ('LEGEND_DEVELOPER','legend','Internal developer','god',5),
  ('LEGEND_SUPPORT','legend','Support with impersonation','god',5),
  ('ATLVS_SUPER_ADMIN','atlvs','Org super admin','admin',4),
  ('ATLVS_ADMIN','atlvs','Org admin','admin',3),
  ('ATLVS_TEAM_MEMBER','atlvs','Contributor','member',2),
  ('ATLVS_VIEWER','atlvs','Read-only','viewer',1),
  ('COMPVSS_ADMIN','compvss','Production admin','admin',3),
  ('COMPVSS_TEAM_MEMBER','compvss','Production member','member',2),
  ('COMPVSS_VIEWER','compvss','Production viewer','viewer',1),
  ('GVTEWAY_ADMIN','gvteway','Platform admin','admin',3),
  ('GVTEWAY_MEMBER','gvteway','Member','member',1)
  on conflict (code) do update set platform = excluded.platform, description = excluded.description, level = excluded.level, hierarchy_rank = excluded.hierarchy_rank;

create or replace function public.current_platform_user_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from platform_users where auth_user_id = auth.uid() order by created_at desc limit 1;
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select organization_id from platform_users where auth_user_id = auth.uid() order by created_at desc limit 1;
$$;

create or replace function public.current_app_role()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  claims jsonb;
  role text;
  highest text;
begin
  claims := auth.jwt();
  role := claims ->> 'app_role';
  if role is not null then
    return role;
  end if;

  select rd.code
  into highest
  from user_roles ur
  join role_definitions rd on rd.code = ur.role_code
  join platform_users pu on pu.id = ur.platform_user_id
  where pu.auth_user_id = auth.uid()
  order by rd.hierarchy_rank desc
  limit 1;

  return coalesce(highest, 'ATLVS_VIEWER');
end;
$$;

create or replace function public.org_matches(p_org uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(p_org = current_organization_id(), true) or current_app_role() like 'LEGEND_%';
$$;

create or replace function public.role_in(variadic roles text[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select current_app_role() = any(roles);
$$;

-- Enable RLS
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT unnest(ARRAY[
    'organizations','departments','platform_users','contacts','deals','projects','assets','ledger_accounts','ledger_entries','user_roles'
  ]) AS table_name LOOP
    EXECUTE format('alter table %I enable row level security', r.table_name);
  END LOOP;
END $$;

create policy organizations_select on organizations
  for select using (current_app_role() like 'LEGEND_%' or id = current_organization_id());

create policy organizations_manage on organizations
  for all using (current_app_role() in ('ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (current_app_role() in ('ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy departments_rw on departments
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy platform_users_self on platform_users
  for select using (
    auth.uid() = auth_user_id
    or (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'))
  );

create policy contacts_select on contacts
  for select using (org_matches(organization_id) and role_in('ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy contacts_write on contacts
  for all using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy deals_select on deals
  for select using (org_matches(organization_id) and role_in('ATLVS_VIEWER','ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy deals_write on deals
  for all using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));

create policy projects_access on projects
  for all using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_ADMIN','LEGEND_SUPER_ADMIN'));

create policy assets_access on assets
  for all using (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_TEAM_MEMBER','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_TEAM_MEMBER','LEGEND_SUPER_ADMIN'));

create policy ledger_accounts_select on ledger_accounts
  for select using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'));

create policy ledger_entries_manage on ledger_entries
  for all using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'))
  with check (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','FINANCE_ADMIN','LEGEND_SUPER_ADMIN'));

create policy user_roles_select on user_roles
  for select using (org_matches(organization_id) and role_in('ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'));
