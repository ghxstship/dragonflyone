import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const notifySchema = z.object({
  notification_type: z.enum(['reminder', 'update', 'confirmation_request', 'cancellation']),
  message: z.string().optional(),
  send_email: z.boolean().default(true),
  send_sms: z.boolean().default(false),
});

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
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
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    // Send notifications via email/SMS
    const vendorProfile = schedule.vendor_profile as { id: string; name: string; email: string; phone: string } | null;
    const notificationTitles: Record<string, string> = {
      reminder: 'Schedule Reminder',
      update: 'Schedule Update',
      confirmation_request: 'Confirmation Required',
      cancellation: 'Schedule Cancellation',
    };

    if (validatedData.send_email && vendorProfile?.email) {
      await supabase.from('email_queue').insert({
        organization_id: schedule.organization_id,
        template: `vendor_schedule_${validatedData.notification_type}`,
        to_email: vendorProfile.email,
        subject: `${notificationTitles[validatedData.notification_type]}: ${schedule.scheduled_date}`,
        metadata: {
          schedule_id: scheduleId,
          vendor_id: vendorProfile.id,
          vendor_name: vendorProfile.name,
          scheduled_date: schedule.scheduled_date,
          notification_type: validatedData.notification_type,
          custom_message: validatedData.message,
          booking_id: schedule.booking_id,
        },
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    }

    if (validatedData.send_sms && vendorProfile?.phone) {
      const smsMessages: Record<string, string> = {
        reminder: `Reminder: You have a scheduled service on ${schedule.scheduled_date}`,
        update: `Your schedule for ${schedule.scheduled_date} has been updated`,
        confirmation_request: `Please confirm your availability for ${schedule.scheduled_date}`,
        cancellation: `Your schedule for ${schedule.scheduled_date} has been cancelled`,
      };

      await supabase.from('sms_queue').insert({
        organization_id: schedule.organization_id,
        template: `vendor_schedule_${validatedData.notification_type}`,
        to_phone: vendorProfile.phone,
        message: validatedData.message || smsMessages[validatedData.notification_type],
        metadata: {
          schedule_id: scheduleId,
          vendor_id: vendorProfile.id,
          notification_type: validatedData.notification_type,
        },
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    }

    // Create in-app notification for vendor portal
    await supabase.from('vendor_notifications').insert({
      vendor_profile_id: vendorProfile?.id,
      type: `schedule_${validatedData.notification_type}`,
      title: notificationTitles[validatedData.notification_type],
      message: validatedData.message || `Your schedule for ${schedule.scheduled_date} requires attention.`,
      reference_type: 'vendor_schedule',
      reference_id: scheduleId,
      read: false,
      created_at: new Date().toISOString(),
    });

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
