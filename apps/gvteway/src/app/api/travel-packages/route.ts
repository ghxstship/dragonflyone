export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}



// Destination experiences (travel + event packages)
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const destination = searchParams.get('destination');

    let query = supabase.from('travel_packages').select('*').eq('status', 'active');

    if (eventId) query = query.eq('event_id', eventId);
    if (destination) query = query.ilike('destination_city', `%${destination}%`);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json({ packages: [], featured: [], destinations: [] });
    }

    return NextResponse.json({
      packages: data,
      featured: data?.filter(p => p.is_featured) || [],
      destinations: [...new Set(data?.map(p => p.destination_city) || [])]
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
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
    const { package_id, travelers, hotel_preferences, flight_preferences, add_ons } = body;

    const { data: pkg } = await supabase.from('travel_packages').select('*').eq('id', package_id).single();
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });

    // Calculate total
    interface AddOn { price?: number }
    const basePrice = pkg.base_price * travelers;
    const addOnTotal = (add_ons || []).reduce((sum: number, a: AddOn) => sum + (a.price || 0), 0);
    const total = basePrice + addOnTotal;

    const { data: booking, error } = await supabase.from('travel_bookings').insert({
      package_id, user_id: user.id, travelers, hotel_preferences, flight_preferences,
      add_ons, base_price: basePrice, total_price: total, status: 'pending'
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ booking, total }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to book package' }, { status: 500 });
  }
}
