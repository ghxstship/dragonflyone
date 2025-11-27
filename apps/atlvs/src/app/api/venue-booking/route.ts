import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const VenueSchema = z.object({
  name: z.string(),
  type: z.enum(['arena', 'theater', 'stadium', 'convention_center', 'outdoor', 'club', 'ballroom', 'other']),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string().default('USA'),
  postal_code: z.string(),
  capacity: z.number().int().positive(),
  seating_configurations: z.array(z.object({
    name: z.string(),
    capacity: z.number().int().positive(),
    layout_url: z.string().optional(),
  })).optional(),
  amenities: z.array(z.string()).optional(),
  technical_specs: z.record(z.any()).optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  base_rental_rate: z.number().optional(),
  rate_type: z.enum(['flat', 'hourly', 'daily', 'percentage']).default('flat'),
  minimum_rental_hours: z.number().int().optional(),
  insurance_requirements: z.string().optional(),
  load_in_restrictions: z.string().optional(),
  curfew_time: z.string().optional(),
});

const BookingSchema = z.object({
  venue_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  event_name: z.string(),
  event_type: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  load_in_date: z.string().optional(),
  load_out_date: z.string().optional(),
  expected_attendance: z.number().int().positive().optional(),
  seating_configuration: z.string().optional(),
  rental_rate: z.number(),
  additional_fees: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    type: z.enum(['flat', 'percentage']),
  })).optional(),
  deposit_amount: z.number().optional(),
  deposit_due_date: z.string().optional(),
  payment_schedule: z.array(z.object({
    description: z.string(),
    amount: z.number(),
    due_date: z.string(),
  })).optional(),
  special_requirements: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/venue-booking - Get venues and bookings
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venue_id');
    const bookingId = searchParams.get('booking_id');
    const checkAvailability = searchParams.get('check_availability') === 'true';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const city = searchParams.get('city');
    const type = searchParams.get('type');
    const minCapacity = searchParams.get('min_capacity');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (bookingId) {
      // Get specific booking
      const { data: booking, error } = await supabase
        .from('venue_bookings')
        .select(`
          *,
          venue:venues(*),
          project:projects(id, name),
          contract:venue_contracts(*)
        `)
        .eq('id', bookingId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ booking });
    } else if (venueId) {
      // Get venue with bookings
      const { data: venue, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', venueId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get bookings for this venue
      let bookingsQuery = supabase
        .from('venue_bookings')
        .select('*')
        .eq('venue_id', venueId)
        .order('start_date', { ascending: true });

      if (startDate && endDate) {
        bookingsQuery = bookingsQuery
          .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);
      }

      const { data: bookings } = await bookingsQuery;

      // Check availability for date range
      let availability = null;
      if (checkAvailability && startDate && endDate) {
        const conflictingBookings = bookings?.filter(b => {
          const bStart = new Date(b.start_date);
          const bEnd = new Date(b.end_date);
          const qStart = new Date(startDate);
          const qEnd = new Date(endDate);
          return bStart <= qEnd && bEnd >= qStart && b.status !== 'cancelled';
        });

        availability = {
          is_available: conflictingBookings?.length === 0,
          conflicting_bookings: conflictingBookings,
        };
      }

      return NextResponse.json({
        venue,
        bookings: bookings || [],
        availability,
      });
    } else {
      // Get all venues with filters
      let query = supabase
        .from('venues')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('name')
        .range(offset, offset + limit - 1);

      if (city) {
        query = query.ilike('city', `%${city}%`);
      }

      if (type) {
        query = query.eq('type', type);
      }

      if (minCapacity) {
        query = query.gte('capacity', parseInt(minCapacity));
      }

      const { data: venues, error, count } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Check availability for each venue if date range provided
      let venuesWithAvailability = venues;
      if (checkAvailability && startDate && endDate && venues) {
        const venueIds = venues.map(v => v.id);
        const { data: allBookings } = await supabase
          .from('venue_bookings')
          .select('venue_id, start_date, end_date, status')
          .in('venue_id', venueIds)
          .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
          .neq('status', 'cancelled');

        const bookedVenueIds = new Set(allBookings?.map(b => b.venue_id));

        venuesWithAvailability = venues.map(v => ({
          ...v,
          is_available: !bookedVenueIds.has(v.id),
        }));
      }

      return NextResponse.json({
        venues: venuesWithAvailability || [],
        total: count || 0,
        limit,
        offset,
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch venue data' }, { status: 500 });
  }
}

// POST /api/venue-booking - Create venue or booking
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create_booking';

    if (action === 'create_venue') {
      const validated = VenueSchema.parse(body);

      const { data: venue, error } = await supabase
        .from('venues')
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

      return NextResponse.json({ venue }, { status: 201 });
    } else if (action === 'create_booking') {
      const validated = BookingSchema.parse(body);

      // Check availability
      const { data: conflicting } = await supabase
        .from('venue_bookings')
        .select('id, event_name, start_date, end_date')
        .eq('venue_id', validated.venue_id)
        .neq('status', 'cancelled')
        .or(`start_date.lte.${validated.end_date},end_date.gte.${validated.start_date}`);

      if (conflicting && conflicting.length > 0) {
        return NextResponse.json({
          error: 'Venue is not available for the requested dates',
          conflicting_bookings: conflicting,
        }, { status: 400 });
      }

      // Calculate total cost
      let totalCost = validated.rental_rate;
      if (validated.additional_fees) {
        for (const fee of validated.additional_fees) {
          if (fee.type === 'flat') {
            totalCost += fee.amount;
          } else {
            totalCost += validated.rental_rate * (fee.amount / 100);
          }
        }
      }

      const { data: booking, error } = await supabase
        .from('venue_bookings')
        .insert({
          ...validated,
          total_cost: totalCost,
          status: 'pending',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Create payment schedule reminders
      if (validated.payment_schedule) {
        for (const payment of validated.payment_schedule) {
          const reminderDate = new Date(payment.due_date);
          reminderDate.setDate(reminderDate.getDate() - 7);

          await supabase.from('scheduled_notifications').insert({
            user_id: user.id,
            type: 'payment_reminder',
            title: 'Venue Payment Due',
            message: `${payment.description} - $${payment.amount} due for ${validated.event_name}`,
            link: `/bookings/${booking.id}`,
            scheduled_for: reminderDate.toISOString(),
            reference_type: 'venue_booking',
            reference_id: booking.id,
          });
        }
      }

      return NextResponse.json({ booking }, { status: 201 });
    } else if (action === 'hold_dates') {
      const { venue_id, start_date, end_date, hold_until, notes } = body;

      // Create a hold
      const { data: hold, error } = await supabase
        .from('venue_holds')
        .insert({
          venue_id,
          start_date,
          end_date,
          hold_until,
          notes,
          status: 'active',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ hold }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/venue-booking - Update venue or booking
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venue_id');
    const bookingId = searchParams.get('booking_id');

    const body = await request.json();

    if (bookingId) {
      const { data: booking, error } = await supabase
        .from('venue_bookings')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ booking });
    } else if (venueId) {
      const { data: venue, error } = await supabase
        .from('venues')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', venueId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ venue });
    }

    return NextResponse.json({ error: 'Venue ID or Booking ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/venue-booking - Cancel booking
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));

    const { error } = await supabase
      .from('venue_bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
        cancellation_reason: body.reason,
      })
      .eq('id', bookingId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
