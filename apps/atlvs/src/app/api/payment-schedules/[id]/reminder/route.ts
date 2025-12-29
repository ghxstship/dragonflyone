export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
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

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(
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

    // Queue notification based on channel
    if (validatedData.channel === 'email') {
      await supabase.from('email_queue').insert({
        template: 'payment_reminder',
        to_email: validatedData.recipient_email,
        subject: `Payment Reminder: ${schedule.name || 'Payment Due'}`,
        metadata: {
          schedule_id: id,
          schedule_name: schedule.name,
          milestone_id: milestone?.id,
          milestone_name: milestone?.name,
          amount_due: milestone?.amount || schedule.total_amount,
          due_date: milestone?.due_date,
          custom_message: validatedData.custom_message,
          booking_id: schedule.booking_id,
          contact_name: schedule.booking?.contact?.name,
        },
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    } else if (validatedData.channel === 'sms') {
      await supabase.from('sms_queue').insert({
        template: 'payment_reminder',
        to_phone: validatedData.recipient_email, // Would need phone field
        message: validatedData.custom_message || `Payment reminder: ${milestone?.name || schedule.name} - Amount due: ${milestone?.amount || schedule.total_amount}`,
        metadata: {
          schedule_id: id,
          milestone_id: milestone?.id,
        },
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    }

    // Create notification record
    await supabase.from('notifications').insert({
      type: 'payment_reminder_sent',
      title: 'Payment Reminder Sent',
      message: `Payment reminder sent to ${validatedData.recipient_email} via ${validatedData.channel}`,
      metadata: {
        schedule_id: id,
        milestone_id: milestone?.id,
        channel: validatedData.channel,
        recipient: validatedData.recipient_email,
      },
      read: false,
      created_at: new Date().toISOString(),
    });

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
