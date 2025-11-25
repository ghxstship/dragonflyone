-- Centralized webhook event log for automation providers

create table if not exists integration_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text not null,
  status text not null default 'received',
  payload jsonb not null,
  headers jsonb not null default '{}'::jsonb,
  signature_valid boolean not null default false,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists idx_integration_webhook_events_provider on integration_webhook_events(provider, received_at desc);
create index if not exists idx_integration_webhook_events_status on integration_webhook_events(status);

grant select, insert, update on integration_webhook_events to service_role;
