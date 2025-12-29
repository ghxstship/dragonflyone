export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const scheduleSchema = z.object({
  action: z.literal('schedule'),
  project_id: z.string().uuid(),
  scheduled_at: z.string(),
  duration_hours: z.number().positive(),
  type: z.string(),
  departments: z.array(z.string()).optional(),
});

const addNoteSchema = z.object({
  action: z.literal('add_note'),
  project_id: z.string().uuid().optional(),
  rehearsal_id: z.string().uuid(),
  category: z.string(),
  content: z.string().min(1),
});

const technicalRehearsalActionSchema = z.union([scheduleSchema, addNoteSchema]);

// Technical rehearsal scheduling and notes
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
    const projectId = searchParams.get('project_id');

    const { data, error } = await supabase.from('technical_rehearsals').select(`
      *, notes:rehearsal_notes(id, category, content, created_by, created_at)
    `).eq('project_id', projectId).order('scheduled_at', { ascending: true });

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ rehearsals: data });
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
    const validatedData = technicalRehearsalActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'schedule') {
      const { project_id, scheduled_at, duration_hours, type, departments } = validatedData as z.infer<typeof scheduleSchema>;

      const { data, error } = await supabase.from('technical_rehearsals').insert({
        project_id, scheduled_at, duration_hours, type,
        departments: departments || [], status: 'scheduled', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ rehearsal: data }, { status: 201 });
    }

    if (action === 'add_note') {
      const { rehearsal_id, category, content } = validatedData as z.infer<typeof addNoteSchema>;

      const { data, error } = await supabase.from('rehearsal_notes').insert({
        rehearsal_id, category, content, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ note: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
