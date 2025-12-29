export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createSetChangeSchema = z.object({
  event_id: z.string().uuid(),
  sequence: z.number(),
  from_set: z.string().optional(),
  to_set: z.string().optional(),
  duration_minutes: z.number().optional(),
  tasks: z.array(z.object({
    task: z.string(),
    assigned_to: z.string().uuid().optional(),
  })).optional(),
});

const updateSetChangeSchema = z.object({
  id: z.string().uuid(),
  status: z.string().optional(),
  actual_start: z.string().optional(),
  actual_end: z.string().optional(),
});

// Set change coordination and timing
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

    const { data, error } = await supabase.from('set_changes').select(`
      *, tasks:set_change_tasks(id, task, assigned_to, sequence, status)
    `).eq('event_id', eventId).order('sequence', { ascending: true });

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ set_changes: data });
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
    const validatedData = createSetChangeSchema.parse(body);
    const { event_id, sequence, from_set, to_set, duration_minutes, tasks } = validatedData;

    const { data, error } = await supabase.from('set_changes').insert({
      event_id, sequence, from_set, to_set, duration_minutes, status: 'planned'
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    interface SetChangeTask { task: string; assigned_to?: string }
    if (tasks?.length) {
      await supabase.from('set_change_tasks').insert(
        tasks.map((t: SetChangeTask, i: number) => ({
          set_change_id: data.id, task: t.task, assigned_to: t.assigned_to, sequence: i + 1, status: 'pending'
        }))
      );
    }

    return NextResponse.json({ set_change: data }, { status: 201 });
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
    const validatedData = updateSetChangeSchema.parse(body);
    const { id, status, actual_start, actual_end } = validatedData;

    await supabase.from('set_changes').update({
      status, actual_start, actual_end,
      actual_duration: actual_start && actual_end ? 
        Math.round((new Date(actual_end).getTime() - new Date(actual_start).getTime()) / 60000) : null
    }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
