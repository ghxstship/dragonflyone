export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createBookingSchema = z.object({
  project_id: z.string().uuid(),
  crew_id: z.string().uuid().optional(),
  booking_type: z.string(),
  confirmation_number: z.string().optional(),
  departure_date: z.string().optional(),
  departure_location: z.string().optional(),
  arrival_date: z.string().optional(),
  arrival_location: z.string().optional(),
  hotel_name: z.string().optional(),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  room_type: z.string().optional(),
  vehicle_type: z.string().optional(),
  pickup_location: z.string().optional(),
  dropoff_location: z.string().optional(),
  cost: z.number().optional(),
  notes: z.string().optional(),
});

const updateBookingSchema = z.object({
  id: z.string().uuid(),
  status: z.string().optional(),
  confirmation_number: z.string().optional(),
  notes: z.string().optional(),
});

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

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
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);
    const { 
      project_id, crew_id, booking_type, confirmation_number,
      departure_date, departure_location, arrival_date, arrival_location,
      hotel_name, check_in, check_out, room_type,
      vehicle_type, pickup_location, dropoff_location,
      cost, notes
    } = validatedData;

    const { data, error } = await supabase.from('travel_bookings').insert({
      project_id, crew_id, booking_type, confirmation_number,
      departure_date, departure_location, arrival_date, arrival_location,
      hotel_name, check_in, check_out, room_type,
      vehicle_type, pickup_location, dropoff_location,
      cost, notes, status: 'confirmed', created_by: userId
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ booking: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateBookingSchema.parse(body);
    const { id, ...updateData } = validatedData;

    const { error } = await supabase.from('travel_bookings').update(updateData).eq('id', id);
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
