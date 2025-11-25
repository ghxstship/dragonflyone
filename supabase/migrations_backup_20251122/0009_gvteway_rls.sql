-- RLS hardening for GVTEWAY commerce tables

alter table public.gvteway_events enable row level security;
alter table public.gvteway_ticket_types enable row level security;
alter table public.gvteway_orders enable row level security;
alter table public.gvteway_order_items enable row level security;
alter table public.gvteway_order_refunds enable row level security;
alter table public.gvteway_stripe_events enable row level security;
alter table public.gvteway_payout_reports enable row level security;

create policy gvteway_events_read on public.gvteway_events
  for select using (
    current_app_role() in (
      'GVTEWAY_MEMBER',
      'GVTEWAY_MEMBER_PLUS',
      'GVTEWAY_MEMBER_EXTRA',
      'GVTEWAY_MEMBER_GUEST',
      'GVTEWAY_AFFILIATE',
      'GVTEWAY_ARTIST',
      'GVTEWAY_ARTIST_VERIFIED',
      'GVTEWAY_EXPERIENCE_CREATOR',
      'GVTEWAY_VENUE_MANAGER',
      'GVTEWAY_ADMIN',
      'ATLVS_VIEWER',
      'ATLVS_TEAM_MEMBER',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

create policy gvteway_events_write on public.gvteway_events
  for insert with check (
    current_app_role() in (
      'GVTEWAY_EXPERIENCE_CREATOR',
      'GVTEWAY_VENUE_MANAGER',
      'GVTEWAY_ADMIN',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

create policy gvteway_events_update on public.gvteway_events
  for update using (
    current_app_role() in (
      'GVTEWAY_EXPERIENCE_CREATOR',
      'GVTEWAY_VENUE_MANAGER',
      'GVTEWAY_ADMIN',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

create policy gvteway_events_delete on public.gvteway_events
  for delete using (
    current_app_role() in (
      'GVTEWAY_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

create policy gvteway_ticket_types_read on public.gvteway_ticket_types
  for select using (
    current_app_role() in (
      'GVTEWAY_MEMBER',
      'GVTEWAY_MEMBER_PLUS',
      'GVTEWAY_MEMBER_EXTRA',
      'GVTEWAY_MEMBER_GUEST',
      'GVTEWAY_AFFILIATE',
      'GVTEWAY_ARTIST',
      'GVTEWAY_ARTIST_VERIFIED',
      'GVTEWAY_EXPERIENCE_CREATOR',
      'GVTEWAY_VENUE_MANAGER',
      'GVTEWAY_ADMIN',
      'ATLVS_VIEWER',
      'ATLVS_TEAM_MEMBER',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

create policy gvteway_ticket_types_write on public.gvteway_ticket_types
  for insert with check (
    current_app_role() in (
      'GVTEWAY_EXPERIENCE_CREATOR',
      'GVTEWAY_VENUE_MANAGER',
      'GVTEWAY_ADMIN',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

create policy gvteway_ticket_types_update on public.gvteway_ticket_types
  for update using (
    current_app_role() in (
      'GVTEWAY_EXPERIENCE_CREATOR',
      'GVTEWAY_VENUE_MANAGER',
      'GVTEWAY_ADMIN',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

create policy gvteway_ticket_types_delete on public.gvteway_ticket_types
  for delete using (
    current_app_role() in (
      'GVTEWAY_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

create policy gvteway_orders_read on public.gvteway_orders
  for select using (
    current_app_role() in (
      'GVTEWAY_ADMIN',
      'GVTEWAY_EXPERIENCE_CREATOR',
      'GVTEWAY_VENUE_MANAGER',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN',
      'FINANCE_ADMIN'
    )
  );

create policy gvteway_orders_insert on public.gvteway_orders
  for insert with check (
    current_app_role() in (
      'GVTEWAY_ADMIN',
      'GVTEWAY_EXPERIENCE_CREATOR',
      'GVTEWAY_VENUE_MANAGER',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

create policy gvteway_orders_update on public.gvteway_orders
  for update using (
    current_app_role() in (
      'GVTEWAY_ADMIN',
      'GVTEWAY_EXPERIENCE_CREATOR',
      'GVTEWAY_VENUE_MANAGER',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN',
      'FINANCE_ADMIN'
    )
  );

create policy gvteway_orders_delete on public.gvteway_orders
  for delete using (
    current_app_role() in (
      'GVTEWAY_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

create policy gvteway_order_items_read on public.gvteway_order_items
  for select using (
    current_app_role() in (
      'GVTEWAY_ADMIN',
      'GVTEWAY_EXPERIENCE_CREATOR',
      'GVTEWAY_VENUE_MANAGER',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN',
      'FINANCE_ADMIN'
    )
  );

create policy gvteway_order_items_manage on public.gvteway_order_items
  for all using (
    current_app_role() in (
      'GVTEWAY_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

create policy gvteway_order_refunds_read on public.gvteway_order_refunds
  for select using (
    current_app_role() in (
      'GVTEWAY_ADMIN',
      'GVTEWAY_EXPERIENCE_CREATOR',
      'GVTEWAY_VENUE_MANAGER',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN',
      'FINANCE_ADMIN'
    )
  );

create policy gvteway_order_refunds_manage on public.gvteway_order_refunds
  for all using (
    current_app_role() in (
      'GVTEWAY_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN'
    )
  );

create policy gvteway_stripe_events_read on public.gvteway_stripe_events
  for select using (
    current_app_role() in (
      'GVTEWAY_ADMIN',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN',
      'FINANCE_ADMIN'
    )
  );

create policy gvteway_payout_reports_read on public.gvteway_payout_reports
  for select using (
    current_app_role() in (
      'GVTEWAY_ADMIN',
      'ATLVS_ADMIN',
      'ATLVS_SUPER_ADMIN',
      'LEGEND_SUPER_ADMIN',
      'FINANCE_ADMIN'
    )
  );
