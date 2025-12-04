import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Cron Job: Event Notifications
 * Runs daily at 6am EST (11:00 UTC)
 * Sends notifications for upcoming events and updates
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
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    let notificationsSent = 0;

    // Get events happening in the next 7 days
    const { data: upcomingEvents, error: fetchError } = await supabase
      .from('events')
      .select('id, name, start_time, venue_name')
      .gte('start_time', now.toISOString())
      .lte('start_time', nextWeek.toISOString())
      .eq('status', 'published');

    if (fetchError) {
      throw fetchError;
    }

    // Get users who have favorited these events
    for (const event of upcomingEvents || []) {
      const { data: favorites } = await supabase
        .from('event_favorites')
        .select('user_id')
        .eq('event_id', event.id);

      for (const favorite of favorites || []) {
        // Check if we already sent a notification this week
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', favorite.user_id)
          .eq('type', 'event_upcoming')
          .eq('reference_id', event.id)
          .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (!existingNotif || existingNotif.length === 0) {
          await supabase.from('notifications').insert({
            user_id: favorite.user_id,
            type: 'event_upcoming',
            title: `${event.name} is Coming Up`,
            message: `Don't miss ${event.name} at ${event.venue_name}. Get your tickets now!`,
            reference_id: event.id,
            priority: 'medium',
            created_at: now.toISOString(),
          });
          notificationsSent++;
        }
      }
    }

    // Log the cron execution
    await supabase.from('cron_logs').insert({
      job_name: 'event-notifications',
      status: 'completed',
      records_processed: notificationsSent,
      executed_at: now.toISOString(),
    });

    return NextResponse.json({
      success: true,
      eventsChecked: upcomingEvents?.length || 0,
      notificationsSent,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    await supabase.from('cron_logs').insert({
      job_name: 'event-notifications',
      status: 'failed',
      error_message: message,
      executed_at: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Event notifications failed', message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
