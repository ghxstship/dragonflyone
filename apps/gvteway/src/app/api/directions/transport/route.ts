export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}



export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const venueId = searchParams.get('venue_id');

    // Get venue ID from event if not provided
    let targetVenueId = venueId;
    if (!targetVenueId && eventId) {
      const { data: event } = await supabase
        .from('events')
        .select('venue_id')
        .eq('id', eventId)
        .single();
      targetVenueId = event?.venue_id;
    }

    // If no venue ID, return default transport options
    if (!targetVenueId) {
      const defaultOptions = [
        { id: 'uber', type: 'rideshare', name: 'Uber', description: 'Request a ride', estimated_time: 'Varies', estimated_cost: 'Varies', pickup_location: null },
        { id: 'lyft', type: 'rideshare', name: 'Lyft', description: 'Request a ride', estimated_time: 'Varies', estimated_cost: 'Varies', pickup_location: null },
        { id: 'taxi', type: 'taxi', name: 'Taxi', description: 'Hail or call a taxi', estimated_time: 'Varies', estimated_cost: 'Varies', pickup_location: null },
        { id: 'public_transit', type: 'transit', name: 'Public Transit', description: 'Bus, subway, or train', estimated_time: 'Varies', estimated_cost: '$2-5', pickup_location: null },
      ];
      return NextResponse.json({ options: defaultOptions, total: defaultOptions.length });
    }

    // Get transport options for venue
    const { data, error } = await supabase
      .from('transport_options')
      .select('*')
      .eq('venue_id', targetVenueId)
      .eq('is_active', true)
      .order('type', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    const options = data?.map(opt => ({
      id: opt.id,
      type: opt.type,
      name: opt.name,
      description: opt.description,
      estimated_time: opt.estimated_time,
      estimated_cost: opt.estimated_cost,
      pickup_location: opt.pickup_location,
    })) || [];

    // Add default rideshare options if none exist
    if (!options.some(o => o.type === 'rideshare')) {
      options.push({
        id: 'uber',
        type: 'rideshare',
        name: 'Uber',
        description: 'Request a ride to the venue',
        estimated_time: 'Varies',
        estimated_cost: 'Varies by distance',
        pickup_location: null,
      });
      options.push({
        id: 'lyft',
        type: 'rideshare',
        name: 'Lyft',
        description: 'Request a ride to the venue',
        estimated_time: 'Varies',
        estimated_cost: 'Varies by distance',
        pickup_location: null,
      });
    }

    return NextResponse.json({ options });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
