import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const crewId = searchParams.get('crew_id');

    let query = supabase.from('travel_bookings').select(`
      *, crew:platform_users(id, email, first_name, last_name),
      project:projects(id, name)
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (crewId) query = query.eq('crew_id', crewId);

    const { data, error } = await query.order('departure_date', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      bookings: data,
      upcoming: data?.filter(b => new Date(b.departure_date) > new Date()) || [],
      by_type: {
        flights: data?.filter(b => b.booking_type === 'flight') || [],
        hotels: data?.filter(b => b.booking_type === 'hotel') || [],
        ground: data?.filter(b => b.booking_type === 'ground_transport') || []
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { 
      project_id, crew_id, booking_type, confirmation_number,
      departure_date, departure_location, arrival_date, arrival_location,
      hotel_name, check_in, check_out, room_type,
      vehicle_type, pickup_location, dropoff_location,
      cost, notes
    } = body;

    const { data, error } = await supabase.from('travel_bookings').insert({
      project_id, crew_id, booking_type, confirmation_number,
      departure_date, departure_location, arrival_date, arrival_location,
      hotel_name, check_in, check_out, room_type,
      vehicle_type, pickup_location, dropoff_location,
      cost, notes, status: 'confirmed', created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ booking: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, ...updateData } = body;

    const { error } = await supabase.from('travel_bookings').update(updateData).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
