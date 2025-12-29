export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@ghxstship/config/supabase-types';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CrewAssignSchema = z.object({
  project_id: z.string().uuid(),
  crew_ids: z.array(z.string().uuid()),
  assigned_by: z.string().uuid(),
  role: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
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

    const body = await request.json();
    const validatedData = CrewAssignSchema.parse(body);

    // Create crew assignments for each crew member
    const assignments = validatedData.crew_ids.map(crewId => ({
      project_id: validatedData.project_id,
      crew_id: crewId,
      assigned_by: validatedData.assigned_by,
      role: validatedData.role,
      start_date: validatedData.start_date,
      end_date: validatedData.end_date,
      status: 'assigned',
    }));

    const { data: createdAssignments, error } = await supabase
      .from('crew_assignments')
      .insert(assignments)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      assignments: createdAssignments,
      count: createdAssignments?.length || 0,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to assign crew' }, { status: 500 });
  }
}
