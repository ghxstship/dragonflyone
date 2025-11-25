import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const listingSchema = z.object({
  ticket_id: z.string().uuid(),
  asking_price: z.number().min(0),
  min_price: z.number().min(0).optional(),
  allow_offers: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const type = searchParams.get('type');

    if (type === 'listings' && eventId) {
      const { data: listings, error } = await supabase
        .from('resale_listings')
        .select(`
          *,
          ticket:tickets(id, ticket_type, section, row, seat, original_price, event:events(id, name, start_date))
        `)
        .eq('ticket.event_id', eventId)
        .eq('status', 'active')
        .order('asking_price', { ascending: true });

      if (error) throw error;
      return NextResponse.json({ listings });
    }

    if (type === 'my_listings') {
      const sellerId = searchParams.get('seller_id');
      const { data: listings, error } = await supabase
        .from('resale_listings')
        .select(`*, ticket:tickets(id, ticket_type, section, event:events(id, name))`)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ listings });
    }

    // Get price controls for event
    if (type === 'price_controls' && eventId) {
      const { data: controls } = await supabase
        .from('resale_price_controls')
        .select('*')
        .eq('event_id', eventId)
        .single();

      return NextResponse.json({ price_controls: controls });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (action === 'create_listing') {
      const validated = listingSchema.parse(body.data);
      const sellerId = body.seller_id;

      // Get ticket and check price controls
      const { data: ticket } = await supabase
        .from('tickets')
        .select('id, event_id, original_price')
        .eq('id', validated.ticket_id)
        .single();

      if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

      // Check price controls
      const { data: controls } = await supabase
        .from('resale_price_controls')
        .select('*')
        .eq('event_id', ticket.event_id)
        .single();

      if (controls) {
        const maxPrice = controls.max_markup_percent 
          ? ticket.original_price * (1 + controls.max_markup_percent / 100)
          : controls.max_price;

        if (maxPrice && validated.asking_price > maxPrice) {
          return NextResponse.json({ 
            error: 'Price exceeds maximum allowed', 
            max_allowed: maxPrice 
          }, { status: 400 });
        }
      }

      const { data: listing, error } = await supabase
        .from('resale_listings')
        .insert({
          ...validated,
          seller_id: sellerId,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ listing }, { status: 201 });
    }

    if (action === 'purchase') {
      const { listing_id, buyer_id } = body;

      const { data: listing } = await supabase
        .from('resale_listings')
        .select('*, ticket:tickets(*)')
        .eq('id', listing_id)
        .eq('status', 'active')
        .single();

      if (!listing) return NextResponse.json({ error: 'Listing not available' }, { status: 404 });

      // Transfer ticket
      await supabase.from('tickets').update({ owner_id: buyer_id }).eq('id', listing.ticket_id);

      // Update listing
      await supabase
        .from('resale_listings')
        .update({ status: 'sold', sold_at: new Date().toISOString(), buyer_id })
        .eq('id', listing_id);

      return NextResponse.json({ success: true, ticket_id: listing.ticket_id });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
      .from('resale_listings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
