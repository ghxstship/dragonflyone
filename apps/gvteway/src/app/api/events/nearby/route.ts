import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '25');
    const category = searchParams.get('category');

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Get events with venue coordinates
    let query = supabase
      .from('events')
      .select(`
        id,
        title,
        date,
        category,
        image,
        venues (
          id,
          name,
          city,
          state,
          latitude,
          longitude
        ),
        ticket_types (
          price
        )
      `)
      .eq('status', 'published')
      .gte('date', new Date().toISOString());

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter and calculate distances
    const eventsWithDistance = data
      ?.map(event => {
        const venue = event.venues as any;
        if (!venue?.latitude || !venue?.longitude) return null;

        const distance = calculateDistance(lat, lng, venue.latitude, venue.longitude);
        if (distance > radius) return null;

        const prices = (event.ticket_types as any[])?.map(t => t.price) || [];
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

        return {
          id: event.id,
          title: event.title,
          date: event.date,
          venue: venue.name,
          city: `${venue.city}, ${venue.state}`,
          distance,
          category: event.category,
          price: minPrice,
          image: event.image,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.distance - b.distance) || [];

    return NextResponse.json({ events: eventsWithDistance });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
