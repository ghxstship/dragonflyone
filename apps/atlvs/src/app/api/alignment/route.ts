import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
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
        return NextResponse.json({ error: error.message }, { status: 500 });
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
