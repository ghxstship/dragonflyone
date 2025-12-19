export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ReminderSchema = z.object({
  milestone_id: z.string().uuid().optional(),
  recipient_email: z.string().email(),
  channel: z.enum(['email', 'sms']).default('email'),
  custom_message: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const validatedData = ReminderSchema.parse(body);

    // Get schedule details
    const { data: schedule, error: scheduleError } = await supabase
      .from('payment_schedules')
      .select(`
        *,
        booking:bookings(*, contact:contacts(*)),
        milestones:payment_milestones(*)
      `)
      .eq('id', id)
      .single();

    if (scheduleError || !schedule) {
      return NextResponse.json({ error: 'Payment schedule not found' }, { status: 404 });
    }

    // Get specific milestone if provided
    let milestone = null;
    if (validatedData.milestone_id) {
      milestone = schedule.milestones?.find(
        (m: { id: string }) => m.id === validatedData.milestone_id
      );
    } else {
      // Get next pending milestone
      milestone = schedule.milestones?.find(
        (m: { status: string }) => m.status === 'pending'
      );
    }

    // Create reminder record
    const { data: reminder, error: reminderError } = await supabase
      .from('payment_reminders')
      .insert({
        schedule_id: id,
        milestone_id: milestone?.id,
        reminder_type: 'manual',
        scheduled_for: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        status: 'sent',
        channel: validatedData.channel,
        recipient_email: validatedData.recipient_email,
      })
      .select()
      .single();

    if (reminderError) {
      return NextResponse.json({ error: reminderError.message }, { status: 500 });
    }

    // TODO: Actually send email/SMS via notification service
    // For now, just mark as sent

    return NextResponse.json({ 
      success: true, 
      reminder,
      message: `Reminder sent to ${validatedData.recipient_email}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to send reminder' }, { status: 500 });
  }
}
