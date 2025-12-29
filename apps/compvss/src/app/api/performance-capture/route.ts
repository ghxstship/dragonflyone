export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createPlanSchema = z.object({
  action: z.literal('create_plan'),
  event_id: z.string().uuid(),
  capture_type: z.string(),
  requirements: z.string().optional(),
  positions: z.array(z.object({
    position: z.string(),
    time_slot: z.string().optional(),
  })).optional(),
});

const uploadSchema = z.object({
  action: z.literal('upload'),
  event_id: z.string().uuid().optional(),
  capture_id: z.string().uuid(),
  media_url: z.string().url(),
  media_type: z.string(),
  timestamp: z.string().optional(),
  notes: z.string().optional(),
});

const captureActionSchema = z.union([createPlanSchema, uploadSchema]);

// Performance capture coordination (photo/video)
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

    const { data, error } = await supabase.from('performance_captures').select(`
      *, assignments:capture_assignments(id, photographer, position, time_slot, status)
    `).eq('event_id', eventId);

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ captures: data });
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
    const validatedData = captureActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create_plan') {
      const { event_id, capture_type, requirements, positions } = validatedData as z.infer<typeof createPlanSchema>;

      const { data, error } = await supabase.from('performance_captures').insert({
        event_id, capture_type, requirements, status: 'planned', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      if (positions?.length) {
        await supabase.from('capture_assignments').insert(
          positions.map((p: Record<string, unknown>) => ({ capture_id: data.id, position: p.position, time_slot: p.time_slot, status: 'assigned' }))
        );
      }

      return NextResponse.json({ capture: data }, { status: 201 });
    }

    if (action === 'upload') {
      const { capture_id, media_url, media_type, timestamp, notes } = validatedData as z.infer<typeof uploadSchema>;

      const { data, error } = await supabase.from('captured_media').insert({
        capture_id, media_url, media_type, timestamp, notes, uploaded_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ media: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
