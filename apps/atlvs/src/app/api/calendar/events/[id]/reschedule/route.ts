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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // TODO: Send notifications if notify_attendees is true

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
