create table if not exists gvteway_stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

grant select, insert on gvteway_stripe_events to service_role;

create index if not exists idx_gvteway_stripe_events_processed_at on gvteway_stripe_events (processed_at desc);

create table if not exists gvteway_payout_reports (
  id uuid primary key default gen_random_uuid(),
  report_date date not null unique,
  window_start timestamptz not null,
  window_end timestamptz not null,
  stripe_gross_cents integer not null default 0,
  stripe_fee_cents integer not null default 0,
  stripe_net_cents integer not null default 0,
  stripe_transaction_count integer not null default 0,
  stripe_transaction_ids text[] not null default '{}',
  orders_gross_cents integer not null default 0,
  orders_count integer not null default 0,
  created_at timestamptz not null default now()
);

grant select, insert, update on gvteway_payout_reports to service_role;

create index if not exists idx_gvteway_payout_reports_report_date on gvteway_payout_reports (report_date desc);

create or replace function gvteway_upsert_payout_report(
  p_report_date date,
  p_window_start timestamptz,
  p_window_end timestamptz,
  p_stripe_gross_cents integer,
  p_stripe_fee_cents integer,
  p_stripe_net_cents integer,
  p_stripe_transaction_count integer,
  p_stripe_transaction_ids text[],
  p_orders_gross_cents integer,
  p_orders_count integer
) returns gvteway_payout_reports
language plpgsql
as $$
declare
  v_report gvteway_payout_reports;
begin
  insert into gvteway_payout_reports (
    report_date,
    window_start,
    window_end,
    stripe_gross_cents,
    stripe_fee_cents,
    stripe_net_cents,
    stripe_transaction_count,
    stripe_transaction_ids,
    orders_gross_cents,
    orders_count
  ) values (
    p_report_date,
    p_window_start,
    p_window_end,
    coalesce(p_stripe_gross_cents, 0),
    coalesce(p_stripe_fee_cents, 0),
    coalesce(p_stripe_net_cents, 0),
    coalesce(p_stripe_transaction_count, 0),
    coalesce(p_stripe_transaction_ids, '{}'),
    coalesce(p_orders_gross_cents, 0),
    coalesce(p_orders_count, 0)
  )
  on conflict (report_date) do update set
    window_start = excluded.window_start,
    window_end = excluded.window_end,
    stripe_gross_cents = excluded.stripe_gross_cents,
    stripe_fee_cents = excluded.stripe_fee_cents,
    stripe_net_cents = excluded.stripe_net_cents,
    stripe_transaction_count = excluded.stripe_transaction_count,
    stripe_transaction_ids = excluded.stripe_transaction_ids,
    orders_gross_cents = excluded.orders_gross_cents,
    orders_count = excluded.orders_count,
    created_at = gvteway_payout_reports.created_at
  returning * into v_report;

  return v_report;
end;
$$;
