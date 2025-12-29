import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const rescheduleSchema = z.object({
  new_date: z.string(),
  new_start_time: z.string().optional(),
  new_end_time: z.string().optional(),
  notify_attendees: z.boolean().default(false),
  reason: z.string().optional(),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();
    const eventId = params.id;

    const body = await request.json();
    const validatedData = rescheduleSchema.parse(body);

    // Get current event
    const { data: event, error: eventError } = await supabase
      .from('calendar_events')
      .select('id, title, date, start_time, end_time, event_type')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const previousDate = event.date;
    const previousStartTime = event.start_time;

    // Update event with new date/time
    const { data: updatedEvent, error: updateError } = await supabase
      .from('calendar_events')
      .update({
        date: validatedData.new_date,
        start_time: validatedData.new_start_time || event.start_time,
        end_time: validatedData.new_end_time || event.end_time,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to reschedule event' },
        { status: 500 }
      );
    }

    // Log the reschedule
    await supabase.from('calendar_event_history').insert({
      calendar_event_id: eventId,
      action: 'reschedule',
      previous_date: previousDate,
      previous_start_time: previousStartTime,
      new_date: validatedData.new_date,
      new_start_time: validatedData.new_start_time || event.start_time,
      reason: validatedData.reason || null,
      created_at: new Date().toISOString(),
    });

    // Send notifications if notify_attendees is true
    if (validatedData.notify_attendees) {
      const { data: attendees } = await supabase
        .from('calendar_event_attendees')
        .select('user_id, email, name')
        .eq('calendar_event_id', eventId);

      if (attendees && attendees.length > 0) {
        const notifications = attendees.map((attendee) => ({
          user_id: attendee.user_id,
          type: 'event_rescheduled',
          title: 'Event Rescheduled',
          message: `"${event.title}" has been rescheduled from ${previousDate} to ${validatedData.new_date}${validatedData.reason ? `. Reason: ${validatedData.reason}` : ''}`,
          metadata: {
            event_id: eventId,
            event_title: event.title,
            previous_date: previousDate,
            new_date: validatedData.new_date,
          },
          read: false,
          created_at: new Date().toISOString(),
        }));

        await supabase.from('notifications').insert(notifications);
      }
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      previous: {
        date: previousDate,
        start_time: previousStartTime,
      },
      message: `Event rescheduled from ${previousDate} to ${validatedData.new_date}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
