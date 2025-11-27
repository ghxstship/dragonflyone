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
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const venueId = searchParams.get('venue_id');

    if (!eventId && !venueId) {
      return NextResponse.json({ error: 'Event ID or Venue ID required' }, { status: 400 });
    }

    let venue;

    if (venueId) {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venueId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      venue = data;
    } else if (eventId) {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('venue_id')
        .eq('id', eventId)
        .single();

      if (eventError || !event?.venue_id) {
        return NextResponse.json({ error: 'Event or venue not found' }, { status: 404 });
      }

      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', event.venue_id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      venue = data;
    }

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    return NextResponse.json({
      venue: {
        id: venue.id,
        name: venue.name,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        zip: venue.zip_code,
        lat: venue.latitude || 0,
        lng: venue.longitude || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
