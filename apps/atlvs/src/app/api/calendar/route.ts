import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

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

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const venueId = searchParams.get('venue_id');
    const spaceId = searchParams.get('space_id');
    const eventType = searchParams.get('event_type');
    const includeHolds = searchParams.get('include_holds') !== 'false';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      );
    }

    // Get bookings in date range
    let bookingsQuery = supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        event_name,
        event_type,
        event_date,
        start_time,
        end_time,
        status,
        client_id,
        client:clients(id, name),
        venue_id,
        venue:venues(id, name),
        guest_count_expected,
        color
      `)
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .neq('status', 'cancelled');

    if (venueId) {
      bookingsQuery = bookingsQuery.eq('venue_id', venueId);
    }
    if (eventType) {
      bookingsQuery = bookingsQuery.eq('event_type', eventType);
    }

    const { data: bookings, error: bookingsError } = await bookingsQuery;

    if (bookingsError) {
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Get space holds if requested
    let holds: Array<Record<string, unknown>> = [];
    if (includeHolds) {
      let holdsQuery = supabase
        .from('space_holds')
        .select(`
          id,
          date,
          start_time,
          end_time,
          client_name,
          hold_type,
          status,
          expires_at,
          space_id,
          space:spaces(id, name)
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('status', 'active');

      if (spaceId) {
        holdsQuery = holdsQuery.eq('space_id', spaceId);
      }

      const { data: holdsData } = await holdsQuery;
      holds = holdsData || [];
    }

    // Transform bookings to calendar events
    const events = bookings?.map(booking => ({
      id: booking.id,
      type: 'booking',
      title: booking.event_name,
      date: booking.event_date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      client: booking.client,
      venue: booking.venue,
      event_type: booking.event_type,
      guest_count: booking.guest_count_expected,
      color: booking.color || getStatusColor(booking.status),
      booking_number: booking.booking_number,
    })) || [];

    // Transform holds to calendar events
    const holdEvents = holds.map(hold => ({
      id: hold.id,
      type: 'hold',
      title: `Hold: ${hold.client_name || 'TBD'}`,
      date: hold.date,
      start_time: hold.start_time,
      end_time: hold.end_time,
      status: hold.status,
      hold_type: hold.hold_type,
      space: hold.space,
      expires_at: hold.expires_at,
      color: getHoldColor(hold.hold_type as string),
    }));

    // Combine and sort by date/time
    const allEvents = [...events, ...holdEvents].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.start_time || '').localeCompare(b.start_time || '');
    });

    return NextResponse.json({
      events: allEvents,
      bookings: events,
      holds: holdEvents,
      date_range: { start: startDate, end: endDate },
      total: allEvents.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: '#9CA3AF',
    pending: '#F59E0B',
    confirmed: '#10B981',
    in_progress: '#3B82F6',
    completed: '#6B7280',
    cancelled: '#EF4444',
  };
  return colors[status] || '#6B7280';
}

function getHoldColor(holdType: string): string {
  const colors: Record<string, string> = {
    first_option: '#8B5CF6',
    second_option: '#A78BFA',
    tentative: '#C4B5FD',
    internal: '#4B5563',
  };
  return colors[holdType] || '#9CA3AF';
}
