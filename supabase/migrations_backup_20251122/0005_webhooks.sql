-- Webhook event storage for Stripe/Twilio/GVTEWAY integrations

create type webhook_source as enum ('stripe', 'twilio', 'gvteway');
create type webhook_status as enum ('received', 'processed', 'failed');

create table webhook_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  source webhook_source not null,
  event_id text not null,
  status webhook_status not null default 'received',
  payload jsonb not null,
  headers jsonb,
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index on webhook_events (source, event_id);

alter table webhook_events enable row level security;

create policy webhook_events_read on webhook_events
  for select using (current_app_role() in (
    'ATLVS_TEAM_MEMBER','ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN','FINANCE_ADMIN'
  ));

create policy webhook_events_manage on webhook_events
  for all using (current_app_role() in (
    'ATLVS_ADMIN','ATLVS_SUPER_ADMIN','LEGEND_SUPER_ADMIN'
  ));
