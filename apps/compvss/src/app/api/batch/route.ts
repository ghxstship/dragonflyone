export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const BatchCrewAssignmentSchema = z.object({
  projectId: z.string(),
  crewMembers: z.array(
    z.object({
      userId: z.string(),
      role: z.string(),
      callTime: z.string().optional(),
      rate: z.number().optional(),
    })
  ),
});

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = BatchCrewAssignmentSchema.parse(body);

    const assignments = validated.crewMembers.map((member) => ({
      project_id: validated.projectId,
      user_id: member.userId,
      role: member.role,
      call_time: member.callTime,
      rate: member.rate,
      status: 'pending',
      created_by: user.id,
    }));

    const { data, error } = await supabase
      .from('project_assignments')
      .insert(assignments)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      assignments: data,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
