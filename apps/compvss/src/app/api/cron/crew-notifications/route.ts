import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Cron Job: Crew Notifications
 * Runs daily at 8am EST (13:00 UTC)
 * Sends daily schedule reminders to crew members
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
    const today = now.toISOString().split('T')[0];
    let notificationsSent = 0;

    // Get today's crew assignments
    const { data: assignments, error: fetchError } = await supabase
      .from('workforce_shift_assignments')
      .select(`
        id,
        crew_member_id,
        shift_start,
        shift_end,
        location,
        crew_members (
          id,
          user_id,
          name
        )
      `)
      .gte('shift_start', `${today}T00:00:00`)
      .lte('shift_start', `${today}T23:59:59`);

    if (fetchError) {
      throw fetchError;
    }

    // Send notification to each crew member with assignments today
    const crewNotified = new Set<string>();

    for (const assignment of assignments || []) {
      const crewMember = assignment.crew_members as { id: string; user_id: string; name: string } | null;
      if (!crewMember || crewNotified.has(crewMember.id)) continue;

      crewNotified.add(crewMember.id);

      // Create notification
      await supabase.from('notifications').insert({
        user_id: crewMember.user_id,
        type: 'daily_schedule',
        title: 'Your Schedule Today',
        message: `You have shifts scheduled for today. Check your schedule for details.`,
        priority: 'medium',
        created_at: now.toISOString(),
      });

      notificationsSent++;
    }

    // Log the cron execution
    await supabase.from('cron_logs').insert({
      job_name: 'crew-notifications',
      status: 'completed',
      records_processed: notificationsSent,
      executed_at: now.toISOString(),
    });

    return NextResponse.json({
      success: true,
      assignmentsFound: assignments?.length || 0,
      notificationsSent,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    await supabase.from('cron_logs').insert({
      job_name: 'crew-notifications',
      status: 'failed',
      error_message: message,
      executed_at: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Crew notifications failed', message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
