import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Cron Job: Ticket Reminders
 * Runs daily at 9am EST (14:00 UTC)
 * Sends reminders for upcoming events
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    let remindersSent = 0;

    // Get tickets for events happening tomorrow
    const { data: tickets, error: fetchError } = await supabase
      .from('tickets')
      .select(`
        id,
        user_id,
        event_id,
        events (
          id,
          name,
          start_time,
          venue_name
        )
      `)
      .eq('status', 'confirmed')
      .gte('events.start_time', `${tomorrowStr}T00:00:00`)
      .lte('events.start_time', `${tomorrowStr}T23:59:59`);

    if (fetchError) {
      throw fetchError;
    }

    // Send reminder to each ticket holder
    for (const ticket of tickets || []) {
      const event = ticket.events as { name: string; start_time: string; venue_name: string } | null;
      if (!event) continue;

      await supabase.from('notifications').insert({
        user_id: ticket.user_id,
        type: 'event_reminder',
        title: `Reminder: ${event.name} is Tomorrow`,
        message: `Your event at ${event.venue_name} starts tomorrow. Don't forget your tickets!`,
        priority: 'high',
        created_at: now.toISOString(),
      });

      remindersSent++;
    }

    // Log the cron execution
    await supabase.from('cron_logs').insert({
      job_name: 'ticket-reminders',
      status: 'completed',
      records_processed: remindersSent,
      executed_at: now.toISOString(),
    });

    return NextResponse.json({
      success: true,
      ticketsChecked: tickets?.length || 0,
      remindersSent,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    await supabase.from('cron_logs').insert({
      job_name: 'ticket-reminders',
      status: 'failed',
      error_message: message,
      executed_at: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Ticket reminders failed', message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
