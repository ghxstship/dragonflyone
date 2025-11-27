import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

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

const VenueMapSchema = z.object({
  venue_id: z.string().uuid(),
  name: z.string(),
  map_type: z.enum(['seating', 'floor', 'overview', 'accessibility']),
  svg_data: z.string().optional(),
  image_url: z.string().optional(),
  sections: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['section', 'row', 'seat', 'area', 'amenity']),
    coordinates: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number().optional(),
      height: z.number().optional(),
      path: z.string().optional(),
    }),
    capacity: z.number().optional(),
    price_tier: z.string().optional(),
    accessibility: z.boolean().optional(),
    amenities: z.array(z.string()).optional(),
  })).optional(),
  amenities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['restroom', 'concession', 'merchandise', 'first_aid', 'atm', 'parking', 'entrance', 'exit', 'elevator', 'stairs']),
    coordinates: z.object({
      x: z.number(),
      y: z.number(),
    }),
    floor: z.number().optional(),
    accessible: z.boolean().optional(),
  })).optional(),
});

// GET /api/venue-maps - Get venue maps and seating
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venue_id');
    const eventId = searchParams.get('event_id');
    const mapId = searchParams.get('map_id');
    const action = searchParams.get('action');

    if (action === 'availability' && eventId) {
      // Get seat availability for an event
      const { data: event } = await supabase
        .from('events')
        .select('venue_id')
        .eq('id', eventId)
        .single();

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // Get venue map
      const { data: map } = await supabase
        .from('venue_maps')
        .select('*')
        .eq('venue_id', event.venue_id)
        .eq('map_type', 'seating')
        .eq('is_active', true)
        .single();

      if (!map) {
        return NextResponse.json({ error: 'Seating map not available' }, { status: 404 });
      }

      // Get sold/reserved seats
      const { data: soldSeats } = await supabase
        .from('tickets')
        .select('seat_id, section_id, row_id')
        .eq('event_id', eventId)
        .in('status', ['sold', 'reserved', 'held']);

      // Get ticket types with pricing
      const { data: ticketTypes } = await supabase
        .from('ticket_types')
        .select('id, name, price, section_ids')
        .eq('event_id', eventId);

      return NextResponse.json({
        map,
        sold_seats: soldSeats || [],
        ticket_types: ticketTypes || [],
      });
    }

    if (action === 'section_details') {
      const sectionId = searchParams.get('section_id');
      if (!sectionId || !eventId) {
        return NextResponse.json({ error: 'Section ID and Event ID required' }, { status: 400 });
      }

      // Get section info
      const { data: section } = await supabase
        .from('venue_sections')
        .select('*')
        .eq('id', sectionId)
        .single();

      // Get available seats in section
      const { data: allSeats } = await supabase
        .from('venue_seats')
        .select('*')
        .eq('section_id', sectionId);

      const { data: soldSeats } = await supabase
        .from('tickets')
        .select('seat_id')
        .eq('event_id', eventId)
        .eq('section_id', sectionId)
        .in('status', ['sold', 'reserved', 'held']);

      const soldSeatIds = new Set(soldSeats?.map(s => s.seat_id) || []);
      const availableSeats = allSeats?.filter(s => !soldSeatIds.has(s.id)) || [];

      // Get pricing for section
      const { data: ticketType } = await supabase
        .from('ticket_types')
        .select('price, name')
        .eq('event_id', eventId)
        .contains('section_ids', [sectionId])
        .single();

      return NextResponse.json({
        section,
        total_seats: allSeats?.length || 0,
        available_seats: availableSeats.length,
        seats: allSeats?.map(seat => ({
          ...seat,
          available: !soldSeatIds.has(seat.id),
        })),
        pricing: ticketType,
      });
    }

    if (action === 'amenities' && venueId) {
      const { data: amenities } = await supabase
        .from('venue_amenities')
        .select('*')
        .eq('venue_id', venueId)
        .eq('is_active', true);

      return NextResponse.json({ amenities: amenities || [] });
    }

    if (action === 'accessibility' && venueId) {
      // Get accessibility information
      const { data: accessibilityInfo } = await supabase
        .from('venue_accessibility')
        .select('*')
        .eq('venue_id', venueId);

      const { data: accessibleSeating } = await supabase
        .from('venue_sections')
        .select('id, name, accessible_seats')
        .eq('venue_id', venueId)
        .eq('has_accessible_seating', true);

      const { data: accessibilityMap } = await supabase
        .from('venue_maps')
        .select('*')
        .eq('venue_id', venueId)
        .eq('map_type', 'accessibility')
        .single();

      return NextResponse.json({
        info: accessibilityInfo || [],
        accessible_sections: accessibleSeating || [],
        map: accessibilityMap,
      });
    }

    if (mapId) {
      const { data: map } = await supabase
        .from('venue_maps')
        .select('*')
        .eq('id', mapId)
        .single();

      if (!map) {
        return NextResponse.json({ error: 'Map not found' }, { status: 404 });
      }

      return NextResponse.json({ map });
    }

    if (venueId) {
      // Get all maps for venue
      const { data: maps } = await supabase
        .from('venue_maps')
        .select('*')
        .eq('venue_id', venueId)
        .eq('is_active', true)
        .order('map_type');

      const { data: venue } = await supabase
        .from('venues')
        .select('id, name, capacity, address, city, state')
        .eq('id', venueId)
        .single();

      return NextResponse.json({
        venue,
        maps: maps || [],
      });
    }

    return NextResponse.json({ error: 'Venue ID or Map ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch venue maps' }, { status: 500 });
  }
}

// POST /api/venue-maps - Create or manage maps
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create';

    if (action === 'create') {
      const validated = VenueMapSchema.parse(body);

      const { data: map, error } = await supabase
        .from('venue_maps')
        .insert({
          ...validated,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ map }, { status: 201 });
    } else if (action === 'select_seats') {
      const { event_id, seat_ids, hold_duration_minutes } = body;

      // Check availability
      const { data: existingTickets } = await supabase
        .from('tickets')
        .select('seat_id')
        .eq('event_id', event_id)
        .in('seat_id', seat_ids)
        .in('status', ['sold', 'reserved', 'held']);

      if (existingTickets && existingTickets.length > 0) {
        return NextResponse.json({
          error: 'Some seats are no longer available',
          unavailable_seats: existingTickets.map(t => t.seat_id),
        }, { status: 400 });
      }

      // Hold seats temporarily
      const holdExpiry = new Date(Date.now() + (hold_duration_minutes || 10) * 60 * 1000);

      const holdRecords = seat_ids.map((seatId: string) => ({
        event_id,
        seat_id: seatId,
        user_id: user.id,
        status: 'held',
        hold_expires_at: holdExpiry.toISOString(),
      }));

      const { data: holds, error } = await supabase
        .from('seat_holds')
        .insert(holdRecords)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        holds,
        expires_at: holdExpiry.toISOString(),
        hold_duration_minutes: hold_duration_minutes || 10,
      });
    } else if (action === 'release_seats') {
      const { event_id, seat_ids } = body;

      const { error } = await supabase
        .from('seat_holds')
        .delete()
        .eq('event_id', event_id)
        .eq('user_id', user.id)
        .in('seat_id', seat_ids);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else if (action === 'add_section') {
      const { venue_id, map_id, name, type, coordinates, capacity, price_tier } = body;

      const { data: section, error } = await supabase
        .from('venue_sections')
        .insert({
          venue_id,
          map_id,
          name,
          type,
          coordinates,
          capacity,
          price_tier,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ section }, { status: 201 });
    } else if (action === 'add_amenity') {
      const { venue_id, name, type, coordinates, floor, accessible } = body;

      const { data: amenity, error } = await supabase
        .from('venue_amenities')
        .insert({
          venue_id,
          name,
          type,
          coordinates,
          floor,
          accessible,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ amenity }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/venue-maps - Update map
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mapId = searchParams.get('map_id');

    if (!mapId) {
      return NextResponse.json({ error: 'Map ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data: map, error } = await supabase
      .from('venue_maps')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', mapId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ map });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update map' }, { status: 500 });
  }
}
