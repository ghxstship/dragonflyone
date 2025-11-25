import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Geographic proximity search
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '50'); // km
    const entityType = searchParams.get('type') || 'vendor';

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Latitude and longitude required' }, { status: 400 });
    }

    // Get entities with location data
    const table = entityType === 'vendor' ? 'vendors' : entityType === 'freelancer' ? 'freelancers' : 'venues';

    const { data, error } = await supabase.from(table).select('*')
      .not('latitude', 'is', null).not('longitude', 'is', null);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate distances and filter
    const results = data?.map(entity => {
      const distance = calculateDistance(lat, lng, entity.latitude, entity.longitude);
      return { ...entity, distance_km: Math.round(distance * 10) / 10 };
    }).filter(e => e.distance_km <= radius).sort((a, b) => a.distance_km - b.distance_km);

    return NextResponse.json({
      results,
      search_params: { lat, lng, radius_km: radius },
      count: results?.length || 0
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
