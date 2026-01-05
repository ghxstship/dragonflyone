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

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.COMPVSS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
];

const preferencesSchema = z.object({
  email_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
  schedule_changes: z.boolean().optional(),
  crew_updates: z.boolean().optional(),
  equipment_alerts: z.boolean().optional(),
  safety_alerts: z.boolean().optional(),
  weather_alerts: z.boolean().optional(),
  task_reminders: z.boolean().optional(),
  quiet_hours_start: z.string().optional(),
  quiet_hours_end: z.string().optional() });

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const userId = authResult.user?.id;

    const { data, error } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return NextResponse.json({
          preferences: {
            email_enabled: true,
            push_enabled: true,
            sms_enabled: false,
            schedule_changes: true,
            crew_updates: true,
            equipment_alerts: true,
            safety_alerts: true,
            weather_alerts: true,
            task_reminders: true,
            quiet_hours_start: null,
            quiet_hours_end: null } });
      }
      return NextResponse.json({
        preferences: {
          email_enabled: true,
          push_enabled: true,
          sms_enabled: false,
          schedule_changes: true,
          crew_updates: true,
          equipment_alerts: true,
          safety_alerts: true,
          weather_alerts: true,
          task_reminders: true,
          quiet_hours_start: null,
          quiet_hours_end: null } });
    }

    return NextResponse.json({ preferences: data });
  } catch (error) {
    logger.error('Error in GET /api/notifications/preferences:', error instanceof Error ? error : undefined);
    return NextResponse.json({
      preferences: {
        email_enabled: true,
        push_enabled: true,
        sms_enabled: false,
        schedule_changes: true,
        crew_updates: true,
        equipment_alerts: true,
        safety_alerts: true,
        weather_alerts: true,
        task_reminders: true,
        quiet_hours_start: null,
        quiet_hours_end: null } });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const userId = authResult.user?.id;
    const body = await request.json();
    const validated = preferencesSchema.parse(body);

    const { data, error } = await supabase
      .from('user_notification_preferences')
      .upsert({
        user_id: userId,
        ...validated,
        updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      logger.error('Error updating notification preferences:', error);
      return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
    }

    return NextResponse.json({ preferences: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in PUT /api/notifications/preferences:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
