export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}



export async function GET(request: NextRequest) {
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

    const now = new Date();
    const nowIso = now.toISOString();

    // Get user's tickets with event details (only future events)
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        id,
        order_id,
        ticket_type,
        quantity,
        events (
          id,
          title,
          date,
          time,
          venue,
          city,
          image
        ),
        user_event_reminders (
          enabled,
          reminder_time
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('events.date', nowIso.split('T')[0]);

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    interface UserEventInfo { id?: string; title?: string; date?: string; time?: string; venue?: string; city?: string; image?: string }
    interface ReminderInfo { enabled?: boolean; reminder_time?: string }
    const events = tickets?.map(ticket => {
      const event = ticket.events as UserEventInfo | null;
      const reminders = (ticket.user_event_reminders || []) as ReminderInfo[];
      const reminder = reminders[0];
      const eventDate = new Date(event?.date || '');
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: ticket.id,
        event_id: event?.id,
        title: event?.title,
        date: event?.date,
        time: event?.time || '19:00',
        venue: event?.venue,
        city: event?.city,
        image: event?.image,
        ticket_count: ticket.quantity || 1,
        ticket_type: ticket.ticket_type || 'General Admission',
        order_id: ticket.order_id,
        reminder_enabled: reminder?.enabled || false,
        reminder_time: reminder?.reminder_time || '24h',
        days_until: daysUntil,
        event_date: eventDate,
      };
    }) || [];

    // Split into upcoming and past
    const upcoming = events
      .filter(e => e.event_date >= new Date())
      .sort((a, b) => a.event_date.getTime() - b.event_date.getTime());

    const past = events
      .filter(e => e.event_date < new Date())
      .sort((a, b) => b.event_date.getTime() - a.event_date.getTime());

    return NextResponse.json({ upcoming, past });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
