import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET /api/ai/portfolio-planning - Strategic portfolio planning
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'portfolio_overview') {
      // Get all projects with financial data
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, status, budget, actual_cost, revenue, start_date, end_date, category, risk_level')
        .order('created_at', { ascending: false });

      // Calculate portfolio metrics
      const activeProjects = projects?.filter(p => p.status === 'active') || [];
      const completedProjects = projects?.filter(p => p.status === 'completed') || [];

      const totalBudget = projects?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
      const totalRevenue = projects?.reduce((sum, p) => sum + (p.revenue || 0), 0) || 0;
      const totalCost = projects?.reduce((sum, p) => sum + (p.actual_cost || 0), 0) || 0;

      // Portfolio health score
      const healthScore = calculatePortfolioHealth(projects || []);

      // Risk distribution
      const riskDistribution = {
        low: projects?.filter(p => p.risk_level === 'low').length || 0,
        medium: projects?.filter(p => p.risk_level === 'medium').length || 0,
        high: projects?.filter(p => p.risk_level === 'high').length || 0,
      };

      // Category distribution
      const categoryDistribution: Record<string, { count: number; budget: number }> = {};
      projects?.forEach(p => {
        const cat = p.category || 'other';
        if (!categoryDistribution[cat]) categoryDistribution[cat] = { count: 0, budget: 0 };
        categoryDistribution[cat].count++;
        categoryDistribution[cat].budget += p.budget || 0;
      });

      return NextResponse.json({
        overview: {
          total_projects: projects?.length || 0,
          active_projects: activeProjects.length,
          completed_projects: completedProjects.length,
          total_budget: totalBudget,
          total_revenue: totalRevenue,
          total_cost: totalCost,
          portfolio_profit: totalRevenue - totalCost,
          health_score: healthScore,
        },
        risk_distribution: riskDistribution,
        category_distribution: categoryDistribution,
      });
    }

    if (action === 'strategic_alignment') {
      // Get strategic goals
      const { data: goals } = await supabase
        .from('strategic_goals')
        .select('*')
        .eq('status', 'active');

      // Get projects and their alignment
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, strategic_goal_ids, budget, status')
        .in('status', ['active', 'planned']);

      // Calculate alignment scores
      const goalAlignment = goals?.map(goal => {
        const alignedProjects = projects?.filter(p =>
          p.strategic_goal_ids?.includes(goal.id)
        ) || [];

        const totalBudget = alignedProjects.reduce((sum, p) => sum + (p.budget || 0), 0);

        return {
          goal_id: goal.id,
          goal_name: goal.name,
          aligned_projects: alignedProjects.length,
          budget_allocated: totalBudget,
          target_budget: goal.target_budget || 0,
          alignment_score: goal.target_budget > 0
            ? Math.min(100, (totalBudget / goal.target_budget) * 100)
            : 0,
        };
      });

      // Identify unaligned projects
      const unalignedProjects = projects?.filter(p =>
        !p.strategic_goal_ids || p.strategic_goal_ids.length === 0
      ) || [];

      return NextResponse.json({
        goal_alignment: goalAlignment || [],
        unaligned_projects: unalignedProjects.map(p => ({
          id: p.id,
          name: p.name,
          budget: p.budget,
        })),
        recommendations: generateAlignmentRecommendations(goalAlignment || [], unalignedProjects),
      });
    }

    if (action === 'capacity_planning') {
      // Get resource capacity
      const { data: employees } = await supabase
        .from('employees')
        .select('id, department, skills')
        .eq('status', 'active');

      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, start_date, end_date, required_skills, team_size')
        .in('status', ['planned', 'active'])
        .gte('end_date', new Date().toISOString());

      // Calculate capacity by month
      const capacityByMonth: Record<string, { available: number; required: number }> = {};

      const now = new Date();
      for (let i = 0; i < 12; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const monthKey = month.toISOString().slice(0, 7);
        capacityByMonth[monthKey] = {
          available: (employees?.length || 0) * 160, // 160 hours/month
          required: 0,
        };
      }

      projects?.forEach(p => {
        const start = new Date(p.start_date);
        const end = new Date(p.end_date);

        Object.keys(capacityByMonth).forEach(monthKey => {
          const monthStart = new Date(monthKey + '-01');
          const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

          if (start <= monthEnd && end >= monthStart) {
            capacityByMonth[monthKey].required += (p.team_size || 1) * 160;
          }
        });
      });

      // Identify capacity constraints
      const constraints = Object.entries(capacityByMonth)
        .filter(([_, data]) => data.required > data.available * 0.9)
        .map(([month, data]) => ({
          month,
          utilization: ((data.required / data.available) * 100).toFixed(1),
          gap: data.required - data.available,
        }));

      return NextResponse.json({
        capacity_forecast: Object.entries(capacityByMonth).map(([month, data]) => ({
          month,
          available_hours: data.available,
          required_hours: data.required,
          utilization: ((data.required / data.available) * 100).toFixed(1),
        })),
        constraints,
        recommendations: generateCapacityRecommendations(constraints),
      });
    }

    if (action === 'scenario_analysis') {
      const scenarioType = searchParams.get('scenario') || 'baseline';

      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .in('status', ['active', 'planned']);

      // Apply scenario adjustments
      let adjustedProjects = projects?.map(p => ({ ...p })) || [];

      switch (scenarioType) {
        case 'optimistic':
          adjustedProjects = adjustedProjects.map(p => ({
            ...p,
            revenue: (p.revenue || 0) * 1.2,
            actual_cost: (p.actual_cost || 0) * 0.9,
          }));
          break;
        case 'pessimistic':
          adjustedProjects = adjustedProjects.map(p => ({
            ...p,
            revenue: (p.revenue || 0) * 0.8,
            actual_cost: (p.actual_cost || 0) * 1.15,
          }));
          break;
        case 'delay':
          adjustedProjects = adjustedProjects.map(p => ({
            ...p,
            end_date: new Date(new Date(p.end_date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            actual_cost: (p.actual_cost || 0) * 1.1,
          }));
          break;
      }

      const baselineMetrics = calculatePortfolioMetrics(projects || []);
      const scenarioMetrics = calculatePortfolioMetrics(adjustedProjects);

      return NextResponse.json({
        scenario: scenarioType,
        baseline: baselineMetrics,
        scenario_outcome: scenarioMetrics,
        impact: {
          revenue_change: scenarioMetrics.total_revenue - baselineMetrics.total_revenue,
          cost_change: scenarioMetrics.total_cost - baselineMetrics.total_cost,
          profit_change: scenarioMetrics.profit - baselineMetrics.profit,
        },
      });
    }

    if (action === 'prioritization_matrix') {
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, budget, revenue, risk_level, strategic_importance, urgency')
        .in('status', ['planned', 'active']);

      // Calculate priority scores
      const prioritizedProjects = projects?.map(p => {
        const roi = p.budget > 0 ? ((p.revenue || 0) - p.budget) / p.budget : 0;
        const riskScore = p.risk_level === 'low' ? 3 : p.risk_level === 'medium' ? 2 : 1;
        const strategicScore = p.strategic_importance || 3;
        const urgencyScore = p.urgency || 3;

        const priorityScore = (roi * 0.3 + riskScore * 0.2 + strategicScore * 0.3 + urgencyScore * 0.2) * 100;

        return {
          id: p.id,
          name: p.name,
          budget: p.budget,
          roi: (roi * 100).toFixed(1),
          risk_score: riskScore,
          strategic_score: strategicScore,
          urgency_score: urgencyScore,
          priority_score: priorityScore.toFixed(1),
          quadrant: determineQuadrant(strategicScore, urgencyScore),
        };
      }).sort((a, b) => parseFloat(b.priority_score) - parseFloat(a.priority_score));

      return NextResponse.json({
        prioritized_projects: prioritizedProjects || [],
        quadrant_summary: {
          do_first: prioritizedProjects?.filter(p => p.quadrant === 'do_first').length || 0,
          schedule: prioritizedProjects?.filter(p => p.quadrant === 'schedule').length || 0,
          delegate: prioritizedProjects?.filter(p => p.quadrant === 'delegate').length || 0,
          eliminate: prioritizedProjects?.filter(p => p.quadrant === 'eliminate').length || 0,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate portfolio analysis' }, { status: 500 });
  }
}

// POST /api/ai/portfolio-planning - Create goals or apply recommendations
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create_goal';

    if (action === 'create_goal') {
      const { name, description, target_budget, target_date, metrics } = body;

      const { data: goal, error } = await supabase
        .from('strategic_goals')
        .insert({
          name,
          description,
          target_budget,
          target_date,
          metrics,
          status: 'active',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ goal }, { status: 201 });
    } else if (action === 'align_project') {
      const { project_id, goal_ids } = body;

      const { error } = await supabase
        .from('projects')
        .update({ strategic_goal_ids: goal_ids })
        .eq('id', project_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else if (action === 'update_priority') {
      const { project_id, strategic_importance, urgency } = body;

      const { error } = await supabase
        .from('projects')
        .update({
          strategic_importance,
          urgency,
          updated_at: new Date().toISOString(),
        })
        .eq('id', project_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper functions
function calculatePortfolioHealth(projects: any[]): number {
  if (projects.length === 0) return 0;

  let score = 100;

  // Budget adherence
  const overBudget = projects.filter(p => (p.actual_cost || 0) > (p.budget || 0) * 1.1).length;
  score -= (overBudget / projects.length) * 30;

  // Risk distribution
  const highRisk = projects.filter(p => p.risk_level === 'high').length;
  score -= (highRisk / projects.length) * 20;

  // Profitability
  const unprofitable = projects.filter(p => (p.revenue || 0) < (p.actual_cost || 0)).length;
  score -= (unprofitable / projects.length) * 25;

  return Math.max(0, Math.round(score));
}

function calculatePortfolioMetrics(projects: any[]): any {
  return {
    total_revenue: projects.reduce((sum, p) => sum + (p.revenue || 0), 0),
    total_cost: projects.reduce((sum, p) => sum + (p.actual_cost || 0), 0),
    profit: projects.reduce((sum, p) => sum + ((p.revenue || 0) - (p.actual_cost || 0)), 0),
    project_count: projects.length,
  };
}

function generateAlignmentRecommendations(goalAlignment: any[], unalignedProjects: any[]): string[] {
  const recommendations: string[] = [];

  const underAligned = goalAlignment.filter(g => g.alignment_score < 50);
  if (underAligned.length > 0) {
    recommendations.push(`${underAligned.length} strategic goals are under-resourced. Consider reallocating budget.`);
  }

  if (unalignedProjects.length > 0) {
    recommendations.push(`${unalignedProjects.length} projects lack strategic alignment. Review and assign to goals.`);
  }

  return recommendations;
}

function generateCapacityRecommendations(constraints: any[]): string[] {
  const recommendations: string[] = [];

  if (constraints.length > 0) {
    recommendations.push(`Capacity constraints identified in ${constraints.length} months. Consider hiring or project rescheduling.`);
  }

  return recommendations;
}

function determineQuadrant(strategic: number, urgency: number): string {
  if (strategic >= 3 && urgency >= 3) return 'do_first';
  if (strategic >= 3 && urgency < 3) return 'schedule';
  if (strategic < 3 && urgency >= 3) return 'delegate';
  return 'eliminate';
}
