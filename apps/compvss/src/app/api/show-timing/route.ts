export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const recordDoorsSchema = z.object({
  action: z.literal('record_doors'),
  event_id: z.string().uuid(),
  actual_time: z.string(),
});

const recordSetSchema = z.object({
  action: z.literal('record_set'),
  event_id: z.string().uuid(),
  artist_id: z.string().uuid(),
  set_start: z.string(),
  set_end: z.string().optional(),
});

const recordCurfewSchema = z.object({
  action: z.literal('record_curfew'),
  event_id: z.string().uuid(),
  actual_time: z.string(),
  exceeded: z.boolean().optional(),
});

const showTimingActionSchema = z.union([recordDoorsSchema, recordSetSchema, recordCurfewSchema]);

// Doors time, set time, curfew tracking
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

    const { data, error } = await supabase.from('show_timings').select('*').eq('event_id', eventId);
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ timings: data });
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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = showTimingActionSchema.parse(body);
    const { action, event_id } = validatedData;

    if (action === 'record_doors') {
      const { actual_time } = validatedData as z.infer<typeof recordDoorsSchema>;
      await supabase.from('show_timings').upsert({
        event_id, timing_type: 'doors', actual_time, recorded_by: user.id
      }, { onConflict: 'event_id,timing_type' });
      return NextResponse.json({ success: true });
    }

    if (action === 'record_set') {
      const { artist_id, set_start, set_end } = validatedData as z.infer<typeof recordSetSchema>;
      await supabase.from('show_timings').insert({
        event_id, timing_type: 'set', artist_id, actual_time: set_start,
        end_time: set_end, recorded_by: user.id
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'record_curfew') {
      const { actual_time, exceeded } = validatedData as z.infer<typeof recordCurfewSchema>;
      await supabase.from('show_timings').upsert({
        event_id, timing_type: 'curfew', actual_time, exceeded, recorded_by: user.id
      }, { onConflict: 'event_id,timing_type' });

      if (exceeded) {
        await supabase.from('curfew_alerts').insert({
          event_id, exceeded_at: actual_time, recorded_by: user.id
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
