export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const recordSchema = z.object({
  action: z.literal('record'),
  event_id: z.string().uuid(),
  db_level: z.number(),
  location: z.string().optional(),
});

const setLimitsSchema = z.object({
  action: z.literal('set_limits'),
  event_id: z.string().uuid(),
  max_db: z.number(),
  warning_db: z.number().optional(),
});

const soundActionSchema = z.union([recordSchema, setLimitsSchema]);

// Sound level monitoring (dB tracking)
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    const { data: readings } = await supabase.from('sound_readings').select('*')
      .eq('event_id', eventId).order('recorded_at', { ascending: false }).limit(100);

    const { data: limits } = await supabase.from('sound_limits').select('*')
      .eq('event_id', eventId).single();

    // Calculate stats
    const dbValues = readings?.map(r => r.db_level) || [];
    const avg = dbValues.length ? dbValues.reduce((s, v) => s + v, 0) / dbValues.length : 0;
    const max = dbValues.length ? Math.max(...dbValues) : 0;
    const violations = readings?.filter(r => r.db_level > (limits?.max_db || 105)).length || 0;

    return NextResponse.json({
      readings,
      limits,
      stats: {
        average_db: Math.round(avg * 10) / 10,
        max_db: max,
        violations,
        current: readings?.[0]?.db_level || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = soundActionSchema.parse(body);
    const { action, event_id } = validatedData;

    if (action === 'record') {
      const { db_level, location } = validatedData as z.infer<typeof recordSchema>;

      const { data: limits } = await supabase.from('sound_limits').select('max_db')
        .eq('event_id', event_id).single();

      const isViolation = db_level > (limits?.max_db || 105);

      const { data, error } = await supabase.from('sound_readings').insert({
        event_id, db_level, location, is_violation: isViolation,
        recorded_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      if (isViolation) {
        await supabase.from('sound_violations').insert({
          event_id, db_level, limit_db: limits?.max_db || 105, location
        });
      }

      return NextResponse.json({ reading: data, violation: isViolation }, { status: 201 });
    }

    if (action === 'set_limits') {
      const { max_db, warning_db } = validatedData as z.infer<typeof setLimitsSchema>;

      await supabase.from('sound_limits').upsert({
        event_id, max_db, warning_db
      }, { onConflict: 'event_id' });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
