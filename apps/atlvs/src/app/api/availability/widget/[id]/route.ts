import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Public endpoint - no auth required
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const widgetId = params.id;
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const guestCount = searchParams.get('guest_count');

    // Get widget configuration
    const { data: widget, error: widgetError } = await supabase
      .from('availability_widgets')
      .select(`
        id,
        venue_id,
        venue:venues(id, name, timezone),
        space_ids,
        event_types,
        min_notice_hours,
        max_advance_days,
        show_pricing,
        custom_styles,
        is_active
      `)
      .eq('id', widgetId)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      );
    }

    if (!widget.is_active) {
      return NextResponse.json(
        { error: 'Widget is not active' },
        { status: 403 }
      );
    }

    // Calculate default date range if not provided
    const today = new Date();
    const defaultStart = startDate || today.toISOString().split('T')[0];
    const maxEnd = new Date(today);
    maxEnd.setDate(maxEnd.getDate() + (widget.max_advance_days || 90));
    const defaultEnd = endDate || maxEnd.toISOString().split('T')[0];

    // Get spaces for this widget
    let spacesQuery = supabase
      .from('spaces')
      .select('id, name, capacity, photos, base_pricing')
      .eq('venue_id', widget.venue_id)
      .eq('is_active', true);

    if (widget.space_ids && widget.space_ids.length > 0) {
      spacesQuery = spacesQuery.in('id', widget.space_ids);
    }

    if (guestCount) {
      spacesQuery = spacesQuery.gte('capacity', parseInt(guestCount));
    }

    const { data: spaces } = await spacesQuery;

    // Get bookings in date range
    const { data: bookings } = await supabase
      .from('booking_spaces')
      .select(`
        space_id,
        booking:bookings(event_date, status)
      `)
      .gte('booking.event_date', defaultStart)
      .lte('booking.event_date', defaultEnd)
      .in('booking.status', ['confirmed', 'in_progress']);

    // Get holds in date range
    const { data: holds } = await supabase
      .from('space_holds')
      .select('space_id, date, hold_type')
      .gte('date', defaultStart)
      .lte('date', defaultEnd)
      .eq('status', 'active');

    // Build availability calendar
    const spaceAvailability = spaces?.map(space => {
      const dates: Array<{
        date: string;
        available: boolean;
        has_hold: boolean;
        price?: number;
      }> = [];

      const start = new Date(defaultStart);
      const end = new Date(defaultEnd);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        // Check if booked
        const isBooked = bookings?.some(
          b => b.space_id === space.id && 
               b.booking && 
               (b.booking as { event_date: string }).event_date === dateStr
        );

        // Check for holds
        const hasHold = holds?.some(
          h => h.space_id === space.id && h.date === dateStr
        );

        // Check minimum notice
        const daysDiff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const minNoticeDays = Math.ceil((widget.min_notice_hours || 24) / 24);
        const meetsNotice = daysDiff >= minNoticeDays;

        dates.push({
          date: dateStr,
          available: !isBooked && meetsNotice,
          has_hold: hasHold,
          price: widget.show_pricing && space.base_pricing 
            ? (space.base_pricing as { daily?: number }).daily 
            : undefined,
        });
      }

      return {
        id: space.id,
        name: space.name,
        capacity: space.capacity,
        photo: Array.isArray(space.photos) && space.photos.length > 0 
          ? space.photos[0] 
          : null,
        availability: dates,
      };
    }) || [];

    // Track widget view
    await supabase
      .from('availability_widgets')
      .update({ 
        view_count: (widget as { view_count?: number }).view_count 
          ? (widget as { view_count?: number }).view_count! + 1 
          : 1 
      })
      .eq('id', widgetId);

    return NextResponse.json({
      venue: widget.venue,
      spaces: spaceAvailability,
      date_range: {
        start: defaultStart,
        end: defaultEnd,
      },
      config: {
        event_types: widget.event_types,
        min_notice_hours: widget.min_notice_hours,
        max_advance_days: widget.max_advance_days,
        show_pricing: widget.show_pricing,
        custom_styles: widget.custom_styles,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
