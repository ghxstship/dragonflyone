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

    if (!targetVenueId) {
      return NextResponse.json({ error: 'Venue ID required' }, { status: 400 });
    }

    // Get parking lots near venue
    const { data, error } = await supabase
      .from('parking_lots')
      .select('*')
      .eq('venue_id', targetVenueId)
      .order('distance_meters', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const parking = data?.map(lot => ({
      id: lot.id,
      name: lot.name,
      type: lot.type || 'lot',
      distance: formatDistance(lot.distance_meters),
      price: lot.price_display || `$${lot.price_per_hour}/hr`,
      spaces_available: lot.spaces_available || 0,
      total_spaces: lot.total_spaces || 0,
      address: lot.address,
      lat: lot.latitude || 0,
      lng: lot.longitude || 0,
      amenities: lot.amenities || [],
    })) || [];

    return NextResponse.json({ parking });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatDistance(meters: number | null): string {
  if (!meters) return 'Unknown';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}
