import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticket_id');
    const eventId = searchParams.get('event_id');

    if (ticketId) {
      // Get available upgrades for a specific ticket
      const { data: ticket } = await supabase.from('tickets').select(`
        *, event:events(id, name)
      `).eq('id', ticketId).eq('user_id', user.id).single();

      if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

      // Get available better seats
      const { data: upgrades } = await supabase.from('seat_upgrade_offers').select('*')
        .eq('event_id', ticket.event_id).eq('status', 'available')
        .gt('tier_level', ticket.tier_level || 0);

      return NextResponse.json({ current_ticket: ticket, available_upgrades: upgrades });
    }

    // Get user's active bids
    const { data: bids, error } = await supabase.from('seat_upgrade_bids').select(`
      *, ticket:tickets(*, event:events(id, name, date))
    `).eq('user_id', user.id).order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ bids });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch upgrades' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { ticket_id, upgrade_offer_id, bid_amount, is_instant_upgrade } = body;

    // Verify ticket ownership
    const { data: ticket } = await supabase.from('tickets').select('*')
      .eq('id', ticket_id).eq('user_id', user.id).single();

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    // Get upgrade offer
    const { data: offer } = await supabase.from('seat_upgrade_offers').select('*')
      .eq('id', upgrade_offer_id).eq('status', 'available').single();

    if (!offer) return NextResponse.json({ error: 'Upgrade not available' }, { status: 404 });

    if (is_instant_upgrade && bid_amount >= offer.instant_price) {
      // Process instant upgrade
      await supabase.from('seat_upgrade_offers').update({ status: 'sold' }).eq('id', upgrade_offer_id);
      
      await supabase.from('tickets').update({
        seat_info: offer.seat_info, tier_level: offer.tier_level,
        upgraded_from: ticket.seat_info, upgrade_price: bid_amount
      }).eq('id', ticket_id);

      return NextResponse.json({ success: true, type: 'instant_upgrade' }, { status: 201 });
    }

    // Create bid
    const { data: bid, error } = await supabase.from('seat_upgrade_bids').insert({
      ticket_id, upgrade_offer_id, user_id: user.id, bid_amount,
      status: 'active', expires_at: offer.auction_end_time
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ bid, type: 'bid_placed' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process upgrade' }, { status: 500 });
  }
}
