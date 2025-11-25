import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const listingSchema = z.object({
  event_id: z.string().uuid(),
  aggregator: z.enum(['eventbrite', 'ticketmaster', 'stubhub', 'seatgeek', 'bandsintown', 'songkick', 'facebook_events', 'google_events']),
  external_id: z.string().optional(),
  listing_url: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const type = searchParams.get('type');

    if (type === 'aggregators') {
      const aggregators = [
        { id: 'eventbrite', name: 'Eventbrite', logo: '/logos/eventbrite.png', supported: true },
        { id: 'ticketmaster', name: 'Ticketmaster', logo: '/logos/ticketmaster.png', supported: true },
        { id: 'stubhub', name: 'StubHub', logo: '/logos/stubhub.png', supported: true },
        { id: 'seatgeek', name: 'SeatGeek', logo: '/logos/seatgeek.png', supported: true },
        { id: 'bandsintown', name: 'Bandsintown', logo: '/logos/bandsintown.png', supported: true },
        { id: 'songkick', name: 'Songkick', logo: '/logos/songkick.png', supported: true },
        { id: 'facebook_events', name: 'Facebook Events', logo: '/logos/facebook.png', supported: true },
        { id: 'google_events', name: 'Google Events', logo: '/logos/google.png', supported: true },
      ];
      return NextResponse.json({ aggregators });
    }

    if (eventId) {
      const { data: listings, error } = await supabase
        .from('aggregator_listings')
        .select('*')
        .eq('event_id', eventId);

      if (error) throw error;
      return NextResponse.json({ listings });
    }

    return NextResponse.json({ error: 'event_id required' }, { status: 400 });
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

      const { data: listing, error } = await supabase
        .from('aggregator_listings')
        .insert({
          ...validated,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ listing }, { status: 201 });
    }

    if (action === 'sync') {
      const { event_id, aggregator } = body.data;

      // Get event data
      const { data: event } = await supabase
        .from('events')
        .select(`
          *,
          venue:venues(name, address, city, state, country),
          artists:event_artists(artist:artists(name))
        `)
        .eq('id', event_id)
        .single();

      if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

      // Prepare event data for aggregator
      const eventData = {
        name: event.name,
        description: event.description,
        start_date: event.start_date,
        end_date: event.end_date,
        venue: {
          name: event.venue?.name,
          address: event.venue?.address,
          city: event.venue?.city,
          state: event.venue?.state,
          country: event.venue?.country,
        },
        artists: event.artists?.map((a: any) => a.artist?.name),
        ticket_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event_id}`,
        image_url: event.image_url,
      };

      // Log sync attempt
      await supabase.from('aggregator_sync_logs').insert({
        event_id,
        aggregator,
        sync_data: eventData,
        status: 'initiated',
        synced_at: new Date().toISOString(),
      });

      // Update listing status
      await supabase
        .from('aggregator_listings')
        .update({ status: 'synced', last_synced_at: new Date().toISOString() })
        .eq('event_id', event_id)
        .eq('aggregator', aggregator);

      return NextResponse.json({ synced: true, event_data: eventData });
    }

    if (action === 'bulk_list') {
      const { event_id, aggregators } = body.data;

      const listings = aggregators.map((agg: string) => ({
        event_id,
        aggregator: agg,
        status: 'pending',
        created_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from('aggregator_listings')
        .insert(listings)
        .select();

      if (error) throw error;
      return NextResponse.json({ listings: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data: listing, error } = await supabase
      .from('aggregator_listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ listing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const { error } = await supabase
      .from('aggregator_listings')
      .update({ status: 'removed' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
