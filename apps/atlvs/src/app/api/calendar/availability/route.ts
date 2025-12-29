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

    const date = searchParams.get('date');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const venueId = searchParams.get('venue_id');
    const spaceId = searchParams.get('space_id');
    const guestCount = searchParams.get('guest_count');

    // Need at least a date or date range
    if (!date && (!startDate || !endDate)) {
      return NextResponse.json(
        { error: 'Either date or start_date/end_date are required' },
        { status: 400 }
      );
    }

    const queryStartDate = date || startDate;
    const queryEndDate = date || endDate;

    // Get all spaces
    let spacesQuery = supabase
      .from('spaces')
      .select('id, name, capacity, venue_id, venue:venues(id, name)')
      .eq('is_active', true);

    if (venueId) {
      spacesQuery = spacesQuery.eq('venue_id', venueId);
    }
    if (spaceId) {
      spacesQuery = spacesQuery.eq('id', spaceId);
    }
    if (guestCount) {
      spacesQuery = spacesQuery.gte('capacity', parseInt(guestCount));
    }

    const { data: spaces, error: spacesError } = await spacesQuery;

    if (spacesError) {
      return NextResponse.json(
        { error: 'Failed to fetch spaces' },
        { status: 500 }
      );
    }

    // Get bookings in date range
    const { data: bookings } = await supabase
      .from('booking_spaces')
      .select(`
        space_id,
        booking:bookings(id, event_date, start_time, end_time, status)
      `)
      .gte('booking.event_date', queryStartDate)
      .lte('booking.event_date', queryEndDate)
      .neq('booking.status', 'cancelled');

    // Get holds in date range
    const { data: holds } = await supabase
      .from('space_holds')
      .select('space_id, date, start_time, end_time, hold_type, status')
      .gte('date', queryStartDate)
      .lte('date', queryEndDate)
      .eq('status', 'active');

    // Build availability map
    const spaceAvailability = spaces?.map(space => {
      const spaceBookings = bookings?.filter(b => b.space_id === space.id) || [];
      const spaceHolds = holds?.filter(h => h.space_id === space.id) || [];

      // Generate dates in range
      const dates: Array<{
        date: string;
        available: boolean;
        bookings: number;
        holds: number;
        hold_types: string[];
      }> = [];

      const start = new Date(queryStartDate!);
      const end = new Date(queryEndDate!);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayBookings = spaceBookings.filter(
          b => b.booking && (b.booking as { event_date: string }).event_date === dateStr
        );
        const dayHolds = spaceHolds.filter(h => h.date === dateStr);

        dates.push({
          date: dateStr,
          available: dayBookings.length === 0,
          bookings: dayBookings.length,
          holds: dayHolds.length,
          hold_types: dayHolds.map(h => h.hold_type),
        });
      }

      const availableDays = dates.filter(d => d.available).length;

      return {
        space: {
          id: space.id,
          name: space.name,
          capacity: space.capacity,
          venue: space.venue,
        },
        availability: dates,
        summary: {
          total_days: dates.length,
          available_days: availableDays,
          booked_days: dates.length - availableDays,
          availability_rate: dates.length > 0 
            ? parseFloat(((availableDays / dates.length) * 100).toFixed(1)) 
            : 100,
        },
      };
    }) || [];

    // Overall summary
    const totalSpaces = spaceAvailability.length;
    const fullyAvailable = spaceAvailability.filter(
      s => s.summary.availability_rate === 100
    ).length;

    return NextResponse.json({
      spaces: spaceAvailability,
      summary: {
        total_spaces: totalSpaces,
        fully_available: fullyAvailable,
        partially_available: totalSpaces - fullyAvailable,
      },
      date_range: {
        start: queryStartDate,
        end: queryEndDate,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
