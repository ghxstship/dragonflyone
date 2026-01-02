export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createSoundcheckSchema = z.object({
  event_id: z.string().uuid(),
  artist_id: z.string().uuid(),
  start_time: z.string(),
  duration_minutes: z.number(),
  type: z.string().optional(),
});

const updateSoundcheckSchema = z.object({
  id: z.string().uuid(),
  status: z.string(),
  actual_start: z.string().optional(),
  actual_end: z.string().optional(),
  notes: z.string().optional(),
});

// Soundcheck and focus time coordination
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

    const { data, error } = await supabase.from('soundcheck_schedule').select(`
      *, artist:artists(id, name), notes:soundcheck_notes(id, content, created_at)
    `).eq('event_id', eventId).order('start_time', { ascending: true });

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ schedule: data });
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
    const validatedData = createSoundcheckSchema.parse(body);
    const { event_id, artist_id, start_time, duration_minutes, type } = validatedData;

    const { data, error } = await supabase.from('soundcheck_schedule').insert({
      event_id, artist_id, start_time, duration_minutes,
      type: type || 'soundcheck', status: 'scheduled'
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ slot: data }, { status: 201 });
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
    const validatedData = updateSoundcheckSchema.parse(body);
    const { id, status, actual_start, actual_end, notes } = validatedData;

    interface SoundcheckUpdate { status: string; actual_start?: string; actual_end?: string }
    const updateData: SoundcheckUpdate = { status };
    if (actual_start) updateData.actual_start = actual_start;
    if (actual_end) updateData.actual_end = actual_end;

    await supabase.from('soundcheck_schedule').update(updateData).eq('id', id);

    if (notes) {
      await supabase.from('soundcheck_notes').insert({ soundcheck_id: id, content: notes });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
