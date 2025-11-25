create table if not exists gvteway_balance_reports (
  id uuid primary key default gen_random_uuid(),
  stripe_report_date timestamptz not null,
  currency text not null default 'usd',
  gross_cents integer not null default 0,
  fee_cents integer not null default 0,
  net_cents integer not null default 0,
  payout_status text not null default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (stripe_report_date, currency)
);

create index if not exists idx_gvteway_balance_reports_date on gvteway_balance_reports(stripe_report_date);

create table if not exists gvteway_balance_report_entries (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references gvteway_balance_reports(id) on delete cascade,
  stripe_balance_transaction_id text not null unique,
  type text not null,
  amount_cents integer not null,
  fee_cents integer not null,
  net_cents integer not null,
  currency text not null default 'usd',
  description text,
  available_on timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_gvteway_balance_report_entries_report on gvteway_balance_report_entries(report_id);
create index if not exists idx_gvteway_balance_report_entries_available on gvteway_balance_report_entries(available_on);
