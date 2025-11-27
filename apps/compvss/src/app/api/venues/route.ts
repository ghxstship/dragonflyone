import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const VenueSchema = z.object({
  name: z.string().min(1),
  venue_code: z.string().optional(),
  venue_type: z.enum(['arena', 'stadium', 'club', 'outdoor', 'theater', 'convention_center', 'amphitheater', 'other']),
  address: z.string(),
  address_line_2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string().optional(),
  country: z.string().default('USA'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacity: z.number().positive(),
  seating_capacity: z.number().positive().optional(),
  standing_capacity: z.number().nonnegative().optional(),
  parking_capacity: z.number().nonnegative().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  accessibility_features: z.array(z.string()).optional(),
  load_in_info: z.string().optional(),
  technical_specs: z.record(z.unknown()).optional(),
  photos: z.array(z.string()).optional(),
  floor_plans: z.array(z.string()).optional(),
});

// GET /api/venues - List venues
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const venueType = searchParams.get('venue_type');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const minCapacity = searchParams.get('min_capacity');
    const maxCapacity = searchParams.get('max_capacity');
    const search = searchParams.get('search');

    let query = supabase
      .from('venues')
      .select(`
        *,
        events:events(count),
        contacts:venue_contacts(id, name, role, email, phone)
      `)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (venueType) {
      query = query.eq('venue_type', venueType);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (state) {
      query = query.eq('state', state);
    }
    if (minCapacity) {
      query = query.gte('capacity', parseInt(minCapacity));
    }
    if (maxCapacity) {
      query = query.lte('capacity', parseInt(maxCapacity));
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching venues:', error);
      return NextResponse.json(
        { error: 'Failed to fetch venues', details: error.message },
        { status: 500 }
      );
    }

    interface VenueRecord {
      id: string;
      venue_type: string;
      capacity: number;
      city: string;
      state: string;
      [key: string]: unknown;
    }
    const venues = (data || []) as unknown as VenueRecord[];

    const summary = {
      total: venues.length,
      by_type: venues.reduce((acc, v) => {
        acc[v.venue_type] = (acc[v.venue_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      total_capacity: venues.reduce((sum, v) => sum + (v.capacity || 0), 0),
      by_state: venues.reduce((acc, v) => {
        acc[v.state] = (acc[v.state] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({ venues: data, summary });
  } catch (error) {
    console.error('Error in GET /api/venues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/venues - Create venue
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const validated = VenueSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: venue, error } = await supabase
      .from('venues')
      .insert({
        organization_id: organizationId,
        ...validated,
        is_active: true,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating venue:', error);
      return NextResponse.json(
        { error: 'Failed to create venue', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(venue, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/venues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/venues - Update venue
export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { venue_id, updates } = body;

    if (!venue_id) {
      return NextResponse.json({ error: 'venue_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('venues')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', venue_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update venue', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, venue: data });
  } catch (error) {
    console.error('Error in PATCH /api/venues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/venues - Deactivate venue
export async function DELETE(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venue_id');

    if (!venueId) {
      return NextResponse.json({ error: 'venue_id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('venues')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', venueId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to deactivate venue', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Venue deactivated' });
  } catch (error) {
    console.error('Error in DELETE /api/venues:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
