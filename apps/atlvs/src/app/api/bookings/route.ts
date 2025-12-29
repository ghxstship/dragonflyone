export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BookingSchema = z.object({
  organization_id: z.string().uuid(),
  lead_id: z.string().uuid().optional().nullable(),
  contact_id: z.string().uuid(),
  venue_id: z.string().uuid(),
  event_type: z.string().optional(),
  event_name: z.string().optional(),
  status: z.enum(['draft', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).default('draft'),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  setup_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  breakdown_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  guest_count_expected: z.number().int().positive().optional(),
  guest_count_guaranteed: z.number().int().positive().optional(),
  package_id: z.string().uuid().optional().nullable(),
  line_items: z.array(z.object({
    id: z.string(),
    description: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    total: z.number(),
    category: z.string().optional(),
  })).default([]),
  subtotal: z.number().min(0).default(0),
  tax_rate: z.number().min(0).max(1).default(0),
  tax_amount: z.number().min(0).default(0),
  service_charge_rate: z.number().min(0).max(1).default(0),
  service_charge_amount: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
  total_amount: z.number().min(0).default(0),
  deposit_required: z.number().min(0).default(0),
  special_requests: z.string().optional(),
  internal_notes: z.string().optional(),
  dietary_notes: z.string().optional(),
  spaces: z.array(z.object({
    space_id: z.string().uuid(),
    setup_type: z.string().optional(),
    capacity: z.number().optional(),
    rental_amount: z.number().optional(),
    notes: z.string().optional(),
  })).optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const venueId = searchParams.get('venue_id');
    const status = searchParams.get('status');
    const contactId = searchParams.get('contact_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('bookings')
      .select(`
        *,
        contact:contacts(id, first_name, last_name, email, phone, company),
        venue:venues(id, name, city),
        booking_spaces(*, space:venue_spaces(id, name))
      `, { count: 'exact' })
      .order('event_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (venueId) {
      query = query.eq('venue_id', venueId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (contactId) {
      query = query.eq('contact_id', contactId);
    }
    if (startDate) {
      query = query.gte('event_date', startDate);
    }
    if (endDate) {
      query = query.lte('event_date', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const bookings = data || [];
    const summary = {
      total: count || 0,
      by_status: {
        draft: bookings.filter(b => b.status === 'draft').length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        in_progress: bookings.filter(b => b.status === 'in_progress').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
      },
      total_revenue: bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
    };

    return NextResponse.json({
      bookings,
      summary,
      pagination: { limit, offset, total: count || 0 },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = BookingSchema.parse(body);
    const { spaces, ...bookingData } = validatedData;

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    // Add booking spaces if provided
    if (spaces && spaces.length > 0) {
      const bookingSpaces = spaces.map(space => ({
        booking_id: booking.id,
        ...space,
      }));

      const { error: spacesError } = await supabase
        .from('booking_spaces')
        .insert(bookingSpaces);

      if (spacesError) {
        // Continue - booking created successfully, spaces are optional
      }
    }

    // Create calendar event
    if (booking.event_date) {
      const { error: eventError } = await supabase
        .from('venue_events')
        .insert({
          organization_id: booking.organization_id,
          venue_id: booking.venue_id,
          booking_id: booking.id,
          name: booking.event_name || `Booking ${booking.booking_number}`,
          event_type: booking.event_type,
          status: booking.status === 'confirmed' ? 'confirmed' : 'tentative',
          start_datetime: `${booking.event_date}T${booking.start_time || '00:00:00'}`,
          end_datetime: `${booking.event_date}T${booking.end_time || '23:59:59'}`,
          contact_id: booking.contact_id,
        });

      if (eventError) {
        // Continue - booking created successfully, calendar event is optional
      }
    }

    // Update lead if linked
    if (booking.lead_id) {
      await supabase
        .from('leads')
        .update({ 
          won_booking_id: booking.id,
          status: 'won',
          actual_close_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', booking.lead_id);
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
