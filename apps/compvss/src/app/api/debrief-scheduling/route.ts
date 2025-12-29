export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const scheduleDebriefSchema = z.object({
  action: z.literal('schedule'),
  event_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  debrief_type: z.string(),
  scheduled_at: z.string(),
  location: z.string().optional(),
  attendees: z.array(z.object({
    name: z.string(),
    role: z.string().optional(),
    email: z.string().email().optional(),
  })).optional(),
  agenda: z.array(z.string()).optional(),
});

const addNotesSchema = z.object({
  action: z.literal('add_notes'),
  debrief_id: z.string().uuid(),
  topic: z.string(),
  content: z.string(),
  action_items: z.array(z.string()).optional(),
});

const debriefActionSchema = z.union([scheduleDebriefSchema, addNotesSchema]);

// Artist/client debrief scheduling
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
    const projectId = searchParams.get('project_id');

    let query = supabase.from('debriefs').select(`
      *, attendees:debrief_attendees(id, name, role, confirmed),
      notes:debrief_notes(id, topic, content, action_items)
    `);

    if (eventId) query = query.eq('event_id', eventId);
    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query.order('scheduled_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ debriefs: data });
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
    const validatedData = debriefActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'schedule') {
      const { event_id, project_id, debrief_type, scheduled_at, location, attendees, agenda } = validatedData as z.infer<typeof scheduleDebriefSchema>;

      const { data, error } = await supabase.from('debriefs').insert({
        event_id, project_id, debrief_type, scheduled_at, location,
        agenda: agenda || [], status: 'scheduled', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      if (attendees?.length) {
        await supabase.from('debrief_attendees').insert(
          attendees.map((a: Record<string, unknown>) => ({ debrief_id: data.id, name: a.name, role: a.role, email: a.email, confirmed: false }))
        );
      }

      return NextResponse.json({ debrief: data }, { status: 201 });
    }

    if (action === 'add_notes') {
      const { debrief_id, topic, content, action_items } = validatedData as z.infer<typeof addNotesSchema>;

      const { data, error } = await supabase.from('debrief_notes').insert({
        debrief_id, topic, content, action_items: action_items || [], created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ note: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
