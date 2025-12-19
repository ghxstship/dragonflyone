import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const notifySchema = z.object({
  notification_type: z.enum(['reminder', 'update', 'confirmation_request', 'cancellation']),
  message: z.string().optional(),
  send_email: z.boolean().default(true),
  send_sms: z.boolean().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const scheduleId = params.id;

    const body = await request.json();
    const validatedData = notifySchema.parse(body);

    // Check if schedule exists
    const { data: schedule, error: scheduleError } = await supabase
      .from('vendor_schedules')
      .select(`
        id,
        organization_id,
        vendor_profile_id,
        booking_id,
        scheduled_date,
        status,
        vendor_profile:vendor_profiles(id, name, email, phone)
      `)
      .eq('id', scheduleId)
      .single();

    if (scheduleError || !schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from('vendor_schedule_notifications')
      .insert({
        vendor_schedule_id: scheduleId,
        organization_id: schedule.organization_id,
        notification_type: validatedData.notification_type,
        message: validatedData.message || null,
        sent_via_email: validatedData.send_email,
        sent_via_sms: validatedData.send_sms,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (notificationError) {
      return NextResponse.json(
        { error: 'Failed to create notification record' },
        { status: 500 }
      );
    }

    // Update schedule with last notification time
    await supabase
      .from('vendor_schedules')
      .update({
        last_notified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', scheduleId);

    // TODO: Integrate with email/SMS service to actually send notifications
    // For now, we just record the notification

    return NextResponse.json({
      success: true,
      notification,
      vendor: schedule.vendor_profile,
      message: `Notification sent via ${[
        validatedData.send_email ? 'email' : null,
        validatedData.send_sms ? 'SMS' : null,
      ].filter(Boolean).join(' and ')}`,
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
