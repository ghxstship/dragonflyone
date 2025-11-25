import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get all goals
    const { data: goals, error: goalsError } = await supabase
      .from('strategic_goals')
      .select('id, name');

    if (goalsError) {
      return NextResponse.json({ error: goalsError.message }, { status: 500 });
    }

    // Get all alignments with project data
    const { data: alignments, error: alignmentsError } = await supabase
      .from('project_goal_alignments')
      .select(`
        goal_id,
        projects (
          id,
          budget,
          progress
        )
      `);

    if (alignmentsError) {
      return NextResponse.json({ error: alignmentsError.message }, { status: 500 });
    }

    // Calculate metrics per goal
    const metrics = goals?.map(goal => {
      const goalAlignments = alignments?.filter(a => a.goal_id === goal.id) || [];
      const projects = goalAlignments.map(a => a.projects).filter(Boolean);

      const totalBudget = projects.reduce((sum, p: any) => sum + (p?.budget || 0), 0);
      const avgProgress = projects.length > 0
        ? Math.round(projects.reduce((sum, p: any) => sum + (p?.progress || 0), 0) / projects.length)
        : 0;

      return {
        goal_id: goal.id,
        goal_name: goal.name,
        aligned_projects: projects.length,
        total_budget_aligned: totalBudget,
        average_progress: avgProgress,
      };
    }) || [];

    return NextResponse.json({ metrics });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
