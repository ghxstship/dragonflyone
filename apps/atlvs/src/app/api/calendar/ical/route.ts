import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const venueId = searchParams.get('venue_id');
    const spaceId = searchParams.get('space_id');
    const months = parseInt(searchParams.get('months') || '3');

    // Calculate date range
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    // Get bookings
    let bookingsQuery = supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        event_name,
        event_date,
        start_time,
        end_time,
        status,
        venue:venues(id, name, address),
        client:clients(id, name, email)
      `)
      .gte('event_date', startDate.toISOString().split('T')[0])
      .lte('event_date', endDate.toISOString().split('T')[0])
      .neq('status', 'cancelled');

    if (venueId) {
      bookingsQuery = bookingsQuery.eq('venue_id', venueId);
    }

    if (spaceId) {
      bookingsQuery = bookingsQuery.eq('space_id', spaceId);
    }

    const { data: bookings, error: bookingsError } = await bookingsQuery;

    if (bookingsError) {
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    // Get calendar events
    let eventsQuery = supabase
      .from('calendar_events')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (venueId) {
      eventsQuery = eventsQuery.eq('venue_id', venueId);
    }

    const { data: calendarEvents } = await eventsQuery;

    // Generate iCal content
    const icalContent = generateICal(bookings || [], calendarEvents || []);

    return new NextResponse(icalContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="calendar.ics"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateICal(
  bookings: Array<Record<string, unknown>>,
  events: Array<Record<string, unknown>>
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ATLVS//Event Management//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:ATLVS Events',
  ];

  // Add bookings
  bookings.forEach((booking) => {
    const uid = `booking-${booking.id}@atlvs`;
    const dtstart = formatICalDate(booking.event_date as string, booking.start_time as string);
    const dtend = formatICalDate(booking.event_date as string, booking.end_time as string);
    const venue = booking.venue as { name?: string; address?: string } | null;
    const client = booking.client as { name?: string; email?: string } | null;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${formatICalDateTime(new Date())}`);
    lines.push(`DTSTART:${dtstart}`);
    lines.push(`DTEND:${dtend}`);
    lines.push(`SUMMARY:${escapeICalText(booking.event_name as string)}`);
    
    if (venue?.name) {
      lines.push(`LOCATION:${escapeICalText(venue.name)}`);
    }
    
    if (client?.name) {
      lines.push(`DESCRIPTION:Client: ${escapeICalText(client.name)}\\nBooking: ${booking.booking_number}`);
    }
    
    lines.push(`STATUS:${getICalStatus(booking.status as string)}`);
    lines.push('END:VEVENT');
  });

  // Add calendar events
  events.forEach((event) => {
    const uid = `event-${event.id}@atlvs`;
    const dtstart = event.all_day
      ? formatICalDateOnly(event.date as string)
      : formatICalDate(event.date as string, event.start_time as string);
    const dtend = event.all_day
      ? formatICalDateOnly(event.date as string)
      : formatICalDate(event.date as string, event.end_time as string);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${formatICalDateTime(new Date())}`);
    
    if (event.all_day) {
      lines.push(`DTSTART;VALUE=DATE:${dtstart}`);
      lines.push(`DTEND;VALUE=DATE:${dtend}`);
    } else {
      lines.push(`DTSTART:${dtstart}`);
      lines.push(`DTEND:${dtend}`);
    }
    
    lines.push(`SUMMARY:${escapeICalText(event.title as string)}`);
    
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICalText(event.description as string)}`);
    }
    
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

function formatICalDate(date: string, time: string | null): string {
  if (!time) {
    return formatICalDateOnly(date);
  }
  const d = new Date(`${date}T${time}`);
  return formatICalDateTime(d);
}

function formatICalDateOnly(date: string): string {
  return date.replace(/-/g, '');
}

function formatICalDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function getICalStatus(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'CONFIRMED';
    case 'pending':
    case 'draft':
      return 'TENTATIVE';
    case 'cancelled':
      return 'CANCELLED';
    default:
      return 'CONFIRMED';
  }
}
