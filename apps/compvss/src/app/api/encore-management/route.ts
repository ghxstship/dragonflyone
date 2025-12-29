export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createEncoreSchema = z.object({
  event_id: z.string().uuid(),
  artist_id: z.string().uuid(),
  sequence: z.number().optional(),
  songs: z.array(z.string()).optional(),
  duration_minutes: z.number().optional(),
  curfew_check: z.boolean().optional(),
});

const updateEncoreSchema = z.object({
  id: z.string().uuid(),
  status: z.string().optional(),
  actual_start: z.string().optional(),
  actual_end: z.string().optional(),
});

// Encore management
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

    const { data, error } = await supabase.from('encores').select(`
      *, artist:artists(id, name)
    `).eq('event_id', eventId).order('sequence', { ascending: true });

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ encores: data });
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
    const validatedData = createEncoreSchema.parse(body);
    const { event_id, artist_id, sequence, songs, duration_minutes, curfew_check } = validatedData;

    // Check curfew if needed
    if (curfew_check) {
      const { data: timing } = await supabase.from('show_timings').select('actual_time')
        .eq('event_id', event_id).eq('timing_type', 'curfew').single();

      if (timing) {
        const curfewTime = new Date(timing.actual_time);
        const now = new Date();
        const minutesRemaining = (curfewTime.getTime() - now.getTime()) / 60000;

        if (minutesRemaining < duration_minutes) {
          return NextResponse.json({
            warning: 'Encore may exceed curfew',
            minutes_remaining: Math.round(minutesRemaining),
            encore_duration: duration_minutes
          });
        }
      }
    }

    const { data, error } = await supabase.from('encores').insert({
      event_id, artist_id, sequence, songs: songs || [],
      duration_minutes, status: 'planned'
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ encore: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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
    const validatedData = updateEncoreSchema.parse(body);
    const { id, status, actual_start, actual_end } = validatedData;

    await supabase.from('encores').update({
      status, actual_start, actual_end
    }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
