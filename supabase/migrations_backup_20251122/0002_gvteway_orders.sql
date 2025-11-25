create type gvteway_order_status as enum ('pending', 'processing', 'requires_action', 'succeeded', 'failed', 'refunded');

create table if not exists gvteway_events (
  id text primary key,
  slug text not null unique,
  title text not null,
  venue text,
  city text,
  start_date timestamptz,
  status text not null default 'draft',
  currency text not null default 'usd',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists gvteway_ticket_types (
  id text primary key,
  event_id text not null references gvteway_events(id) on delete cascade,
  name text not null,
  tier text not null,
  price_cents integer not null,
  service_fee_cents integer not null default 0,
  currency text not null default 'usd',
  quantity_total integer not null,
  quantity_sold integer not null default 0,
  description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint gvteway_ticket_types_quantity check (quantity_total >= 0 and quantity_sold >= 0 and quantity_sold <= quantity_total)
);

create index if not exists idx_gvteway_ticket_types_event on gvteway_ticket_types(event_id);

create table if not exists gvteway_orders (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text,
  event_id text not null references gvteway_events(id) on delete restrict,
  event_slug text not null,
  customer_email text,
  referral_code text,
  status gvteway_order_status not null default 'pending',
  currency text not null default 'usd',
  amount_subtotal_cents integer not null default 0,
  amount_fee_cents integer not null default 0,
  amount_total_cents integer not null default 0,
  amount_received_cents integer default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  refunded_amount_cents integer default 0,
  refunded_at timestamptz,
  unique (stripe_payment_intent_id)
);

create index if not exists idx_gvteway_orders_event on gvteway_orders(event_id);
create index if not exists idx_gvteway_orders_status on gvteway_orders(status);

create table if not exists gvteway_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references gvteway_orders(id) on delete cascade,
  ticket_type_id text not null references gvteway_ticket_types(id) on delete restrict,
  ticket_name text not null,
  tier text not null,
  quantity integer not null,
  unit_price_cents integer not null,
  service_fee_cents integer not null,
  created_at timestamptz default now()
);

create index if not exists idx_gvteway_order_items_order on gvteway_order_items(order_id);

create table if not exists gvteway_order_refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references gvteway_orders(id) on delete cascade,
  stripe_charge_id text not null,
  amount_cents integer not null,
  currency text not null,
  reason text,
  created_at timestamptz default now()
);

create index if not exists idx_gvteway_order_refunds_order on gvteway_order_refunds(order_id);

grant select, insert, update on gvteway_orders to service_role;
grant select, insert, update on gvteway_order_items to service_role;
grant select, insert on gvteway_order_refunds to service_role;

create or replace function gvteway_create_order(
  p_checkout_session_id text,
  p_payment_intent_id text,
  p_event_id text,
  p_event_slug text,
  p_customer_email text,
  p_referral_code text,
  p_currency text,
  p_amount_subtotal_cents integer,
  p_amount_fee_cents integer,
  p_amount_total_cents integer,
  p_metadata jsonb,
  p_items jsonb
) returns gvteway_orders
language plpgsql
as $$
declare
  v_order gvteway_orders;
  v_item jsonb;
  v_ticket_id text;
  v_quantity integer;
  v_unit_price integer;
  v_service_fee integer;
  v_ticket_name text;
  v_tier text;
begin
  select * into v_order from gvteway_orders where stripe_checkout_session_id = p_checkout_session_id;
  if v_order.id is not null then
    return v_order;
  end if;

  insert into gvteway_orders (
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    event_id,
    event_slug,
    customer_email,
    referral_code,
    status,
    currency,
    amount_subtotal_cents,
    amount_fee_cents,
    amount_total_cents,
    metadata
  ) values (
    p_checkout_session_id,
    p_payment_intent_id,
    p_event_id,
    p_event_slug,
    p_customer_email,
    p_referral_code,
    'processing',
    coalesce(p_currency, 'usd'),
    coalesce(p_amount_subtotal_cents, 0),
    coalesce(p_amount_fee_cents, 0),
    coalesce(p_amount_total_cents, 0),
    coalesce(p_metadata, '{}'::jsonb)
  ) returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_ticket_id := v_item->>'ticket_type_id';
    v_quantity := coalesce((v_item->>'quantity')::integer, 0);
    v_unit_price := coalesce((v_item->>'unit_price_cents')::integer, 0);
    v_service_fee := coalesce((v_item->>'service_fee_cents')::integer, 0);
    v_ticket_name := v_item->>'ticket_name';
    v_tier := v_item->>'tier';

    if v_ticket_id is null or v_quantity <= 0 then
      raise exception 'Invalid ticket payload supplied to gvteway_create_order';
    end if;

    update gvteway_ticket_types
    set quantity_sold = quantity_sold + v_quantity,
        updated_at = now()
    where id = v_ticket_id
      and quantity_sold + v_quantity <= quantity_total
    returning id into v_ticket_id;

    if not found then
      raise exception 'Insufficient inventory for ticket %', v_item->>'ticket_type_id';
    end if;

    insert into gvteway_order_items (
      order_id,
      ticket_type_id,
      ticket_name,
      tier,
      quantity,
      unit_price_cents,
      service_fee_cents
    ) values (
      v_order.id,
      v_item->>'ticket_type_id',
      coalesce(v_ticket_name, v_item->>'ticket_type_id'),
      coalesce(v_tier, 'ga'),
      v_quantity,
      v_unit_price,
      v_service_fee
    );
  end loop;

  return v_order;
end;
$$;

create or replace function gvteway_update_order_status(
  p_payment_intent_id text,
  p_status gvteway_order_status,
  p_amount_received_cents integer default null,
  p_reason text default null
) returns gvteway_orders
language plpgsql
as $$
declare
  v_order gvteway_orders;
begin
  update gvteway_orders
  set status = p_status,
      amount_received_cents = coalesce(p_amount_received_cents, amount_received_cents),
      updated_at = now()
  where stripe_payment_intent_id = p_payment_intent_id
  returning * into v_order;

  if v_order.id is null then
    return null;
  end if;

  if p_status = 'failed' then
    insert into gvteway_order_refunds (order_id, stripe_charge_id, amount_cents, currency, reason)
    values (v_order.id, coalesce(p_reason, 'payment_failed'), 0, v_order.currency, 'payment_failed');
  end if;

  return v_order;
end;
$$;

create or replace function gvteway_register_refund(
  p_payment_intent_id text,
  p_charge_id text,
  p_amount_cents integer,
  p_currency text
) returns gvteway_orders
language plpgsql
as $$
declare
  v_order gvteway_orders;
begin
  update gvteway_orders
  set status = 'refunded',
      refunded_amount_cents = coalesce(refunded_amount_cents, 0) + coalesce(p_amount_cents, 0),
      refunded_at = now(),
      updated_at = now()
  where stripe_payment_intent_id = p_payment_intent_id
  returning * into v_order;

  if v_order.id is null then
    return null;
  end if;

  insert into gvteway_order_refunds (order_id, stripe_charge_id, amount_cents, currency)
  values (v_order.id, p_charge_id, coalesce(p_amount_cents, 0), coalesce(p_currency, v_order.currency));

  return v_order;
end;
$$;

insert into gvteway_events (id, slug, title, venue, city, start_date, status, currency)
values
  ('event-ghxstship-miami-2025', 'ghxstship-miami-2025', 'GHXSTSHIP // Miami Immersion', 'Harbour Terminal', 'Miami, FL', '2025-07-12T23:00:00Z', 'on-sale', 'usd'),
  ('event-ghxstship-nyc-2025', 'ghxstship-nyc-2025', 'GHXSTSHIP // NYC Vanguard Week', 'Brooklyn Navy Yard', 'New York, NY', '2025-09-06T00:00:00Z', 'draft', 'usd')
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  venue = excluded.venue,
  city = excluded.city,
  start_date = excluded.start_date,
  status = excluded.status,
  currency = excluded.currency,
  updated_at = now();

insert into gvteway_ticket_types (id, event_id, name, tier, price_cents, service_fee_cents, currency, quantity_total, quantity_sold, description, metadata)
values
  ('ticket-miami-ga', 'event-ghxstship-miami-2025', 'GA Immersion', 'ga', 19000, 1500, 'usd', 800, 0, 'Main floor access, projection tunnels, and baseline merch voucher.', jsonb_build_object('badge', 'GA')),
  ('ticket-miami-vip', 'event-ghxstship-miami-2025', 'VIP Command Deck', 'vip', 42000, 2500, 'usd', 220, 0, 'Raised deck seating, concierge lane, limited-edition merch drop.', jsonb_build_object('badge', 'VIP')),
  ('ticket-miami-ultra', 'event-ghxstship-miami-2025', 'Ultra // Backstage Ghost', 'ultra', 82000, 4700, 'usd', 40, 0, 'Backstage roam, meet the creators, and concierge transport.', jsonb_build_object('badge', 'ULTRA'))
on conflict (id) do update set
  event_id = excluded.event_id,
  name = excluded.name,
  tier = excluded.tier,
  price_cents = excluded.price_cents,
  service_fee_cents = excluded.service_fee_cents,
  currency = excluded.currency,
  quantity_total = excluded.quantity_total,
  description = excluded.description,
  metadata = excluded.metadata,
  updated_at = now();
