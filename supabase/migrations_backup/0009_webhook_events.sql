-- 0009_webhook_events.sql
-- Webhook event logging and processing metadata

create type webhook_provider as enum ('stripe','twilio','gvteway');
create type webhook_status as enum ('received','validated','rejected','processed');

create table webhook_event_logs (
  id uuid primary key default gen_random_uuid(),
  provider webhook_provider not null,
  event_type text,
  signature text,
  headers jsonb not null default '{}'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  status webhook_status not null default 'received',
  failure_reason text,
  processed_at timestamptz,
  replayed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table webhook_event_logs enable row level security;

create policy webhook_logs_read on webhook_event_logs
  for select using (role_in('LEGEND_SUPER_ADMIN','ATLVS_SUPER_ADMIN','COMPVSS_ADMIN','GVTEWAY_ADMIN','FINANCE_ADMIN'));

create policy webhook_logs_write on webhook_event_logs
  for all using (role_in('LEGEND_SUPER_ADMIN','ATLVS_SUPER_ADMIN'))
  with check (role_in('LEGEND_SUPER_ADMIN','ATLVS_SUPER_ADMIN'));

create index webhook_event_logs_provider_idx on webhook_event_logs (provider, created_at desc);
create index webhook_event_logs_status_idx on webhook_event_logs (status);
