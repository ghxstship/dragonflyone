import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/ai/resource-optimization - Advanced resource optimization
export async function GET(request: NextRequest) {
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

    if (action === 'workforce_optimization') {
      // Get current workforce allocation
      const { data: employees } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department, skills, hourly_rate, utilization_rate')
        .eq('status', 'active');

      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, required_skills, budget, start_date, end_date, status')
        .in('status', ['planned', 'active']);

      const { data: assignments } = await supabase
        .from('project_assignments')
        .select('employee_id, project_id, hours_allocated')
        .in('project_id', projects?.map(p => p.id) || []);

      // Calculate utilization
      const employeeUtilization: Record<string, { allocated: number; capacity: number }> = {};
      employees?.forEach(emp => {
        employeeUtilization[emp.id] = { allocated: 0, capacity: 160 }; // 160 hours/month
      });

      assignments?.forEach(a => {
        if (employeeUtilization[a.employee_id]) {
          employeeUtilization[a.employee_id].allocated += a.hours_allocated || 0;
        }
      });

      // Find optimization opportunities
      const underutilized = employees?.filter(emp => {
        const util = employeeUtilization[emp.id];
        return util && (util.allocated / util.capacity) < 0.7;
      }) || [];

      const overutilized = employees?.filter(emp => {
        const util = employeeUtilization[emp.id];
        return util && (util.allocated / util.capacity) > 0.9;
      }) || [];

      // Skill gap analysis
      const requiredSkills = new Set<string>();
      projects?.forEach(p => {
        p.required_skills?.forEach((s: string) => requiredSkills.add(s));
      });

      const availableSkills = new Set<string>();
      employees?.forEach(e => {
        e.skills?.forEach((s: string) => availableSkills.add(s));
      });

      const skillGaps = Array.from(requiredSkills).filter(s => !availableSkills.has(s));

      return NextResponse.json({
        workforce_summary: {
          total_employees: employees?.length || 0,
          average_utilization: calculateAverageUtilization(employeeUtilization),
          underutilized_count: underutilized.length,
          overutilized_count: overutilized.length,
        },
        underutilized: underutilized.map(e => ({
          id: e.id,
          name: `${e.first_name} ${e.last_name}`,
          utilization: ((employeeUtilization[e.id]?.allocated || 0) / 160 * 100).toFixed(1),
          skills: e.skills,
        })),
        overutilized: overutilized.map(e => ({
          id: e.id,
          name: `${e.first_name} ${e.last_name}`,
          utilization: ((employeeUtilization[e.id]?.allocated || 0) / 160 * 100).toFixed(1),
        })),
        skill_gaps: skillGaps,
        recommendations: generateWorkforceRecommendations(underutilized, overutilized, skillGaps),
      });
    }

    if (action === 'asset_optimization') {
      // Get asset utilization
      const { data: assets } = await supabase
        .from('assets')
        .select('id, name, category, status, utilization_rate, maintenance_cost, purchase_price')
        .eq('status', 'active');

      const { data: assetUsage } = await supabase
        .from('asset_allocations')
        .select('asset_id, project_id, start_date, end_date')
        .gte('end_date', new Date().toISOString());

      // Calculate utilization
      const assetUtilization: Record<string, number> = {};
      assets?.forEach(a => {
        assetUtilization[a.id] = 0;
      });

      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      assetUsage?.forEach(usage => {
        const start = new Date(usage.start_date).getTime();
        const end = new Date(usage.end_date).getTime();
        const overlapStart = Math.max(start, now - thirtyDays);
        const overlapEnd = Math.min(end, now);

        if (overlapEnd > overlapStart) {
          const days = (overlapEnd - overlapStart) / (24 * 60 * 60 * 1000);
          assetUtilization[usage.asset_id] = (assetUtilization[usage.asset_id] || 0) + days;
        }
      });

      // Identify underutilized assets
      const underutilizedAssets = assets?.filter(a => {
        const utilDays = assetUtilization[a.id] || 0;
        return utilDays < 15; // Less than 50% utilization
      }) || [];

      // Calculate ROI
      const assetROI = assets?.map(a => {
        const utilization = (assetUtilization[a.id] || 0) / 30;
        const annualMaintenanceCost = (a.maintenance_cost || 0) * 12;
        const roi = a.purchase_price > 0
          ? ((utilization * a.purchase_price * 0.1) - annualMaintenanceCost) / a.purchase_price * 100
          : 0;

        return {
          asset_id: a.id,
          name: a.name,
          category: a.category,
          utilization: (utilization * 100).toFixed(1),
          roi: roi.toFixed(1),
          recommendation: utilization < 0.3 ? 'consider_disposal' : utilization < 0.5 ? 'increase_usage' : 'optimal',
        };
      });

      return NextResponse.json({
        asset_summary: {
          total_assets: assets?.length || 0,
          average_utilization: calculateAverageAssetUtilization(assetUtilization),
          underutilized_count: underutilizedAssets.length,
        },
        asset_analysis: assetROI,
        recommendations: generateAssetRecommendations(underutilizedAssets),
      });
    }

    if (action === 'budget_optimization') {
      // Get budget allocations
      const { data: budgets } = await supabase
        .from('budgets')
        .select('id, name, category, planned_amount, actual_amount, period_start, period_end')
        .gte('period_end', new Date().toISOString());

      const { data: expenses } = await supabase
        .from('expenses')
        .select('category, amount, expense_date')
        .gte('expense_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      // Analyze spending patterns
      const categorySpending: Record<string, number[]> = {};
      expenses?.forEach(e => {
        const month = e.expense_date?.slice(0, 7);
        if (!categorySpending[e.category]) categorySpending[e.category] = [];
        categorySpending[e.category].push(e.amount || 0);
      });

      // Calculate trends and recommendations
      const categoryAnalysis = Object.entries(categorySpending).map(([category, amounts]) => {
        const total = amounts.reduce((a, b) => a + b, 0);
        const avg = total / amounts.length;
        const trend = amounts.length >= 2
          ? ((amounts[amounts.length - 1] - amounts[0]) / amounts[0] * 100)
          : 0;

        const budget = budgets?.find(b => b.category === category);
        const variance = budget
          ? ((budget.actual_amount || 0) - budget.planned_amount) / budget.planned_amount * 100
          : 0;

        return {
          category,
          total_spent: total,
          average_monthly: avg,
          trend_percent: trend.toFixed(1),
          budget_variance: variance.toFixed(1),
          recommendation: variance > 10 ? 'reduce_spending' : variance < -20 ? 'reallocate_surplus' : 'on_track',
        };
      });

      return NextResponse.json({
        budget_analysis: categoryAnalysis,
        total_budget: budgets?.reduce((sum, b) => sum + (b.planned_amount || 0), 0) || 0,
        total_spent: budgets?.reduce((sum, b) => sum + (b.actual_amount || 0), 0) || 0,
        recommendations: generateBudgetRecommendations(categoryAnalysis),
      });
    }

    if (action === 'project_resource_allocation') {
      const projectId = searchParams.get('project_id');

      if (!projectId) {
        return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
      }

      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Get current allocations
      const { data: assignments } = await supabase
        .from('project_assignments')
        .select(`
          *,
          employee:employees(id, first_name, last_name, skills, hourly_rate)
        `)
        .eq('project_id', projectId);

      const { data: assetAllocations } = await supabase
        .from('asset_allocations')
        .select(`
          *,
          asset:assets(id, name, category, daily_rate)
        `)
        .eq('project_id', projectId);

      // Calculate costs
      const laborCost = assignments?.reduce((sum, a) => {
        const rate = (a.employee as any)?.hourly_rate || 0;
        return sum + (a.hours_allocated || 0) * rate;
      }, 0) || 0;

      const assetCost = assetAllocations?.reduce((sum, a) => {
        const rate = (a.asset as any)?.daily_rate || 0;
        const days = a.start_date && a.end_date
          ? (new Date(a.end_date).getTime() - new Date(a.start_date).getTime()) / (24 * 60 * 60 * 1000)
          : 0;
        return sum + days * rate;
      }, 0) || 0;

      // Optimization suggestions
      const suggestions = [];

      if (laborCost > project.budget * 0.7) {
        suggestions.push({
          type: 'labor_cost',
          message: 'Labor costs exceed 70% of budget. Consider optimizing team size.',
          potential_savings: laborCost * 0.1,
        });
      }

      // Check for skill redundancy
      const skillCount: Record<string, number> = {};
      assignments?.forEach(a => {
        (a.employee as any)?.skills?.forEach((s: string) => {
          skillCount[s] = (skillCount[s] || 0) + 1;
        });
      });

      const redundantSkills = Object.entries(skillCount).filter(([_, count]) => count > 2);
      if (redundantSkills.length > 0) {
        suggestions.push({
          type: 'skill_redundancy',
          message: `Multiple team members with same skills: ${redundantSkills.map(([s]) => s).join(', ')}`,
          potential_savings: laborCost * 0.05,
        });
      }

      return NextResponse.json({
        project: {
          id: project.id,
          name: project.name,
          budget: project.budget,
        },
        current_allocation: {
          labor_cost: laborCost,
          asset_cost: assetCost,
          total_cost: laborCost + assetCost,
          budget_remaining: project.budget - laborCost - assetCost,
        },
        team: assignments?.map(a => ({
          employee_id: (a.employee as any)?.id,
          name: `${(a.employee as any)?.first_name} ${(a.employee as any)?.last_name}`,
          hours: a.hours_allocated,
          cost: (a.hours_allocated || 0) * ((a.employee as any)?.hourly_rate || 0),
        })),
        assets: assetAllocations?.map(a => ({
          asset_id: (a.asset as any)?.id,
          name: (a.asset as any)?.name,
          dates: `${a.start_date} - ${a.end_date}`,
        })),
        optimization_suggestions: suggestions,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to optimize resources' }, { status: 500 });
  }
}

// POST /api/ai/resource-optimization - Apply optimization recommendations
export async function POST(request: NextRequest) {
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
    const action = body.action || 'apply_recommendation';

    if (action === 'apply_recommendation') {
      const { recommendation_type, entity_id, changes } = body;

      // Log the optimization action
      const { data: log, error } = await supabase
        .from('optimization_logs')
        .insert({
          recommendation_type,
          entity_id,
          changes,
          applied_by: user.id,
          status: 'applied',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ log });
    } else if (action === 'rebalance_workload') {
      const { from_employee_id, to_employee_id, project_id, hours } = body;

      // Update assignments
      await supabase
        .from('project_assignments')
        .update({ hours_allocated: supabase.rpc('decrement_hours', { amount: hours }) })
        .eq('employee_id', from_employee_id)
        .eq('project_id', project_id);

      const { data: existing } = await supabase
        .from('project_assignments')
        .select('id, hours_allocated')
        .eq('employee_id', to_employee_id)
        .eq('project_id', project_id)
        .single();

      if (existing) {
        await supabase
          .from('project_assignments')
          .update({ hours_allocated: (existing.hours_allocated || 0) + hours })
          .eq('id', existing.id);
      } else {
        await supabase.from('project_assignments').insert({
          employee_id: to_employee_id,
          project_id,
          hours_allocated: hours,
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to apply optimization' }, { status: 500 });
  }
}

// Helper functions
function calculateAverageUtilization(utilization: Record<string, { allocated: number; capacity: number }>): number {
  const values = Object.values(utilization);
  if (values.length === 0) return 0;

  const total = values.reduce((sum, v) => sum + (v.allocated / v.capacity), 0);
  return Math.round((total / values.length) * 100);
}

function calculateAverageAssetUtilization(utilization: Record<string, number>): number {
  const values = Object.values(utilization);
  if (values.length === 0) return 0;

  const total = values.reduce((sum, v) => sum + v, 0);
  return Math.round((total / values.length / 30) * 100);
}

function generateWorkforceRecommendations(underutilized: any[], overutilized: any[], skillGaps: string[]): string[] {
  const recommendations: string[] = [];

  if (underutilized.length > 0) {
    recommendations.push(`${underutilized.length} employees are underutilized. Consider reassigning to active projects.`);
  }

  if (overutilized.length > 0) {
    recommendations.push(`${overutilized.length} employees are overutilized. Consider redistributing workload.`);
  }

  if (skillGaps.length > 0) {
    recommendations.push(`Skill gaps identified: ${skillGaps.join(', ')}. Consider training or hiring.`);
  }

  return recommendations;
}

function generateAssetRecommendations(underutilized: any[]): string[] {
  const recommendations: string[] = [];

  if (underutilized.length > 0) {
    recommendations.push(`${underutilized.length} assets have low utilization. Consider rental, sale, or cross-project sharing.`);
  }

  return recommendations;
}

function generateBudgetRecommendations(analysis: any[]): string[] {
  const recommendations: string[] = [];

  const overBudget = analysis.filter(a => parseFloat(a.budget_variance) > 10);
  const underBudget = analysis.filter(a => parseFloat(a.budget_variance) < -20);

  if (overBudget.length > 0) {
    recommendations.push(`${overBudget.length} categories are over budget. Review spending in: ${overBudget.map(a => a.category).join(', ')}`);
  }

  if (underBudget.length > 0) {
    recommendations.push(`${underBudget.length} categories have surplus. Consider reallocating from: ${underBudget.map(a => a.category).join(', ')}`);
  }

  return recommendations;
}
