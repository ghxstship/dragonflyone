import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Haversine formula for distance calculation
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
    const radius = parseFloat(searchParams.get('radius') || '50');
    const category = searchParams.get('category');
    const dateRange = searchParams.get('date_range');

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

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let endDate: Date;

      switch (dateRange) {
        case 'today':
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          query = query.lte('date', endDate.toISOString());
          break;
        case 'week':
          endDate = new Date(now);
          endDate.setDate(endDate.getDate() + 7);
          query = query.lte('date', endDate.toISOString());
          break;
        case 'month':
          endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() + 1);
          query = query.lte('date', endDate.toISOString());
          break;
        case 'weekend':
          const dayOfWeek = now.getDay();
          const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
          const saturday = new Date(now);
          saturday.setDate(saturday.getDate() + daysUntilSaturday);
          saturday.setHours(0, 0, 0, 0);
          const sunday = new Date(saturday);
          sunday.setDate(sunday.getDate() + 1);
          sunday.setHours(23, 59, 59, 999);
          query = query.gte('date', saturday.toISOString()).lte('date', sunday.toISOString());
          break;
      }
    }

    const { data, error } = await query.limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by location and transform
    const events = data
      ?.map(event => {
        const venue = event.venues as any;
        if (!venue?.latitude || !venue?.longitude) return null;

        const distance = lat && lng
          ? calculateDistance(lat, lng, venue.latitude, venue.longitude)
          : 0;

        if (lat && lng && distance > radius) return null;

        const prices = (event.ticket_types as any[])?.map(t => t.price) || [];
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

        return {
          id: event.id,
          title: event.title,
          date: event.date,
          venue: venue.name,
          city: `${venue.city}, ${venue.state}`,
          latitude: venue.latitude,
          longitude: venue.longitude,
          category: event.category,
          price_min: minPrice,
          image: event.image,
          distance,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.distance - b.distance) || [];

    // Create clusters for nearby events (simplified clustering)
    const clusters: any[] = [];
    const clusterRadius = 0.1; // degrees

    events.forEach((event: any) => {
      const existingCluster = clusters.find(c =>
        Math.abs(c.latitude - event.latitude) < clusterRadius &&
        Math.abs(c.longitude - event.longitude) < clusterRadius
      );

      if (existingCluster) {
        existingCluster.count++;
        existingCluster.events.push(event);
      } else {
        clusters.push({
          id: `cluster-${clusters.length}`,
          latitude: event.latitude,
          longitude: event.longitude,
          count: 1,
          events: [event],
        });
      }
    });

    return NextResponse.json({ events, clusters });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
