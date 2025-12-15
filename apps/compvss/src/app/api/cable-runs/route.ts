export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_COLLABORATOR, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

// Cable runs and infrastructure mapping
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const department = searchParams.get('department');

    let query = supabase.from('cable_runs').select('*').eq('project_id', projectId);
    if (department) query = query.eq('department', department);

    const { data, error } = await query.order('run_number', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Group by department
    interface CableRun { id: string; department?: string; run_number: string }
    const byDept: Record<string, CableRun[]> = {};
    data?.forEach((run: CableRun) => {
      const dept = run.department || 'general';
      if (!byDept[dept]) byDept[dept] = [];
      byDept[dept].push(run);
    });

    return NextResponse.json({ cable_runs: data, by_department: byDept });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const user = authResult.user;

    const body = await request.json();
    const { project_id, department, run_number, cable_type, length_m, source, destination, signal_type, notes } = body;

    const { data, error } = await supabase.from('cable_runs').insert({
      project_id, department, run_number, cable_type, length_m,
      source, destination, signal_type, notes, created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ cable_run: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
