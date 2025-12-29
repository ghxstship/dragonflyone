export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(_request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get projects with their budget and progress for alignment metrics
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, budget, status, organization_id')
      .order('created_at', { ascending: false });

    if (projectsError) {
      return NextResponse.json({ error: projectsError.message }, { status: 500 });
    }

    interface ProjectRecord {
      id: string;
      name: string;
      budget: number | null;
      status: string;
      organization_id: string;
    }

    const projectList = (projects || []) as ProjectRecord[];

    // Calculate aggregate metrics from projects
    const metrics = {
      total_projects: projectList.length,
      total_budget: projectList.reduce((sum, p) => sum + (p.budget || 0), 0),
      by_status: projectList.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      active_projects: projectList.filter(p => p.status === 'active' || p.status === 'in_progress').length,
    };

    return NextResponse.json({ metrics });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
