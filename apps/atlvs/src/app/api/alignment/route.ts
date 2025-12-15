export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { project_id, goal_ids } = body;

    if (!project_id) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Delete existing alignments for this project
    await supabase
      .from('project_goal_alignments')
      .delete()
      .eq('project_id', project_id);

    // Insert new alignments
    if (goal_ids && goal_ids.length > 0) {
      const alignments = goal_ids.map((goalId: string) => ({
        project_id,
        goal_id: goalId,
      }));

      const { error } = await supabase
        .from('project_goal_alignments')
        .insert(alignments);

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }
    }

    // Calculate and update alignment score
    const totalGoals = await supabase
      .from('strategic_goals')
      .select('id', { count: 'exact' });

    const alignmentScore = totalGoals.count && totalGoals.count > 0
      ? Math.round((goal_ids?.length || 0) / totalGoals.count * 100)
      : 0;

    await supabase
      .from('projects')
      .update({ alignment_score: alignmentScore })
      .eq('id', project_id);

    return NextResponse.json({
      success: true,
      alignment_score: alignmentScore,
      aligned_goals: goal_ids?.length || 0,
    });
  } catch (error) {
    logger.error('Error in POST /api/alignment:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
