export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.ATLVS_TEAM_MEMBER,
  PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
];

const notificationSettingsSchema = z.object({
  email_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
  digest_frequency: z.enum(['realtime', 'hourly', 'daily', 'weekly']).optional(),
  event_updates: z.boolean().optional(),
  task_reminders: z.boolean().optional(),
  team_mentions: z.boolean().optional(),
  billing_alerts: z.boolean().optional(),
  security_alerts: z.boolean().optional(),
  marketing_emails: z.boolean().optional() });

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const userId = authResult.user?.id;

    const { data, error } = await supabase
      .from('user_notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return NextResponse.json({
          settings: {
            email_enabled: true,
            push_enabled: true,
            sms_enabled: false,
            digest_frequency: 'daily',
            event_updates: true,
            task_reminders: true,
            team_mentions: true,
            billing_alerts: true,
            security_alerts: true,
            marketing_emails: false } });
      }
      return NextResponse.json({
        settings: {
          email_enabled: true,
          push_enabled: true,
          sms_enabled: false,
          digest_frequency: 'daily',
          event_updates: true,
          task_reminders: true,
          team_mentions: true,
          billing_alerts: true,
          security_alerts: true,
          marketing_emails: false } });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    logger.error('Error in GET /api/settings/notifications:', error instanceof Error ? error : undefined);
    return NextResponse.json({
      settings: {
        email_enabled: true,
        push_enabled: true,
        sms_enabled: false,
        digest_frequency: 'daily',
        event_updates: true,
        task_reminders: true,
        team_mentions: true,
        billing_alerts: true,
        security_alerts: true,
        marketing_emails: false } });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const userId = authResult.user?.id;
    const body = await request.json();
    const validated = notificationSettingsSchema.parse(body);

    const { data, error } = await supabase
      .from('user_notification_settings')
      .upsert({
        user_id: userId,
        ...validated,
        updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      logger.error('Error updating notification settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in PUT /api/settings/notifications:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
