export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createCrewCallSchema = z.object({
  project_id: z.string().uuid(),
  call_date: z.string(),
  call_time: z.string(),
  location: z.string().optional(),
  notes: z.string().optional(),
  assignments: z.array(z.object({
    crew_id: z.string().uuid(),
    role: z.string().optional(),
    call_time: z.string().optional(),
    department: z.string().optional(),
  })).optional(),
});

const updateCrewCallSchema = z.object({
  id: z.string().uuid().optional(),
  assignment_id: z.string().uuid().optional(),
  action: z.string().optional(),
  call_time: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

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
    const date = searchParams.get('date');

    let query = supabase.from('crew_calls').select(`
      *, project:projects(id, name, venue),
      assignments:crew_call_assignments(
        *, crew:platform_users(id, email, first_name, last_name)
      )
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (date) query = query.eq('call_date', date);

    const { data, error } = await query.order('call_date', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({
      crew_calls: data,
      today: data?.filter(c => c.call_date === new Date().toISOString().split('T')[0]) || []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch crew calls' }, { status: 500 });
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
    const validatedData = createCrewCallSchema.parse(body);
    const { project_id, call_date, call_time, location, notes, assignments } = validatedData;

    const { data: call, error } = await supabase.from('crew_calls').insert({
      project_id, call_date, call_time, location, notes, created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    if (assignments && assignments.length > 0) {
      const assignmentRecords = assignments.map((a: Record<string, unknown>) => ({
        crew_call_id: call.id, crew_id: a.crew_id, role: a.role,
        call_time: a.call_time || call_time, department: a.department
      }));
      await supabase.from('crew_call_assignments').insert(assignmentRecords);

      // Send notifications
      for (const a of assignments) {
        await supabase.from('notifications').insert({
          user_id: a.crew_id, type: 'crew_call',
          title: 'New Crew Call',
          message: `You have a call on ${call_date} at ${a.call_time || call_time}`,
          reference_id: call.id
        });
      }
    }

    return NextResponse.json({ crew_call: call }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create crew call' }, { status: 500 });
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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = updateCrewCallSchema.parse(body);
    const { id, assignment_id, action, ...updateData } = validatedData;

    if (assignment_id && action === 'check_in') {
      await supabase.from('crew_call_assignments').update({
        checked_in: true, check_in_time: new Date().toISOString()
      }).eq('id', assignment_id);
      return NextResponse.json({ success: true });
    }

    if (id) {
      const { error } = await supabase.from('crew_calls').update(updateData).eq('id', id);
      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      // Notify crew of changes
      const { data: assignments } = await supabase.from('crew_call_assignments')
        .select('crew_id').eq('crew_call_id', id);

      for (const a of assignments || []) {
        await supabase.from('notifications').insert({
          user_id: a.crew_id, type: 'crew_call_update',
          title: 'Crew Call Updated',
          message: 'Your crew call has been updated. Please check the details.',
          reference_id: id
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
