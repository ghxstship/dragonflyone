import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const BudgetAlertSchema = z.object({
  project_id: z.string().uuid(),
  threshold_percent: z.number().min(0).max(100).default(10),
  alert_channels: z.array(z.enum(['in_app', 'email', 'sms'])).default(['in_app', 'email']),
  alert_recipients: z.array(z.string().uuid()).optional(),
});

// GET /api/budget-variance - Get budget vs actual analysis
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
    const projectId = searchParams.get('project_id');
    const action = searchParams.get('action');

    if (action === 'alerts') {
      // Get active budget alerts
      const { data: alerts } = await supabase
        .from('budget_alerts')
        .select(`
          *,
          project:projects(id, name, budget)
        `)
        .eq('is_active', true)
        .order('triggered_at', { ascending: false });

      return NextResponse.json({ alerts: alerts || [] });
    }

    if (action === 'summary') {
      // Get organization-wide budget summary
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, budget, status');

      const summaries = await Promise.all(
        (projects || []).map(async (project) => {
          const { data: expenses } = await supabase
            .from('expenses')
            .select('amount')
            .eq('project_id', project.id);

          const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
          const variance = (project.budget || 0) - totalExpenses;
          const variancePercent = project.budget ? (variance / project.budget) * 100 : 0;

          return {
            project_id: project.id,
            project_name: project.name,
            budget: project.budget || 0,
            actual: totalExpenses,
            variance,
            variance_percent: variancePercent,
            status: variancePercent < -10 ? 'over_budget' : variancePercent < 0 ? 'at_risk' : 'on_track',
          };
        })
      );

      const totalBudget = summaries.reduce((sum, s) => sum + s.budget, 0);
      const totalActual = summaries.reduce((sum, s) => sum + s.actual, 0);
      const overBudgetCount = summaries.filter(s => s.status === 'over_budget').length;
      const atRiskCount = summaries.filter(s => s.status === 'at_risk').length;

      return NextResponse.json({
        summary: {
          total_budget: totalBudget,
          total_actual: totalActual,
          total_variance: totalBudget - totalActual,
          projects_over_budget: overBudgetCount,
          projects_at_risk: atRiskCount,
          projects_on_track: summaries.length - overBudgetCount - atRiskCount,
        },
        projects: summaries,
      });
    }

    if (projectId) {
      // Get detailed budget vs actual for specific project
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Get expenses by category
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, category, description, created_at, vendor_id')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      // Get budget line items
      const { data: budgetItems } = await supabase
        .from('budget_line_items')
        .select('*')
        .eq('project_id', projectId);

      // Calculate by category
      const byCategory: Record<string, { budget: number; actual: number; variance: number }> = {};

      budgetItems?.forEach(item => {
        byCategory[item.category] = {
          budget: item.amount || 0,
          actual: 0,
          variance: item.amount || 0,
        };
      });

      expenses?.forEach(expense => {
        if (!byCategory[expense.category]) {
          byCategory[expense.category] = { budget: 0, actual: 0, variance: 0 };
        }
        byCategory[expense.category].actual += expense.amount || 0;
        byCategory[expense.category].variance = 
          byCategory[expense.category].budget - byCategory[expense.category].actual;
      });

      const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const variance = (project.budget || 0) - totalExpenses;
      const variancePercent = project.budget ? (variance / project.budget) * 100 : 0;

      // Get monthly trend
      const monthlyTrend = calculateMonthlyTrend(expenses || []);

      return NextResponse.json({
        project: {
          id: project.id,
          name: project.name,
          budget: project.budget || 0,
          actual: totalExpenses,
          variance,
          variance_percent: variancePercent,
          status: variancePercent < -10 ? 'over_budget' : variancePercent < 0 ? 'at_risk' : 'on_track',
        },
        by_category: byCategory,
        monthly_trend: monthlyTrend,
        recent_expenses: expenses?.slice(0, 10) || [],
      });
    }

    return NextResponse.json({ error: 'Project ID or action required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch budget data' }, { status: 500 });
  }
}

// POST /api/budget-variance - Create alert or update budget
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
    const action = body.action || 'create_alert_config';

    if (action === 'create_alert_config') {
      const validated = BudgetAlertSchema.parse(body);

      const { data: config, error } = await supabase
        .from('budget_alert_configs')
        .upsert({
          project_id: validated.project_id,
          threshold_percent: validated.threshold_percent,
          alert_channels: validated.alert_channels,
          alert_recipients: validated.alert_recipients,
          is_active: true,
          created_by: user.id,
        }, { onConflict: 'project_id' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ config }, { status: 201 });
    } else if (action === 'check_variances') {
      // Check all projects for budget variances and trigger alerts
      const { data: configs } = await supabase
        .from('budget_alert_configs')
        .select(`
          *,
          project:projects(id, name, budget)
        `)
        .eq('is_active', true);

      const alerts = [];

      for (const config of configs || []) {
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('project_id', config.project_id);

        const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
        const budget = config.project?.budget || 0;
        const variancePercent = budget ? ((totalExpenses - budget) / budget) * 100 : 0;

        if (variancePercent > config.threshold_percent) {
          // Create alert
          const { data: alert } = await supabase
            .from('budget_alerts')
            .insert({
              project_id: config.project_id,
              config_id: config.id,
              budget: budget,
              actual: totalExpenses,
              variance_percent: variancePercent,
              threshold_percent: config.threshold_percent,
              is_active: true,
              triggered_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (alert) {
            alerts.push(alert);

            // Send notifications
            const recipients = config.alert_recipients || [user.id];
            for (const recipientId of recipients) {
              await supabase.from('unified_notifications').insert({
                user_id: recipientId,
                title: 'Budget Alert',
                message: `Project "${config.project?.name}" is ${variancePercent.toFixed(1)}% over budget`,
                type: 'warning',
                priority: variancePercent > 20 ? 'urgent' : 'high',
                channels: config.alert_channels,
                source_platform: 'atlvs',
                source_entity_type: 'project',
                source_entity_id: config.project_id,
                link: `/projects/${config.project_id}/budget`,
              });
            }
          }
        }
      }

      return NextResponse.json({
        checked: configs?.length || 0,
        alerts_triggered: alerts.length,
        alerts,
      });
    } else if (action === 'add_budget_line') {
      const { project_id, category, amount, description } = body;

      const { data: lineItem, error } = await supabase
        .from('budget_line_items')
        .insert({
          project_id,
          category,
          amount,
          description,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ line_item: lineItem }, { status: 201 });
    } else if (action === 'dismiss_alert') {
      const { alert_id } = body;

      const { error } = await supabase
        .from('budget_alerts')
        .update({
          is_active: false,
          dismissed_at: new Date().toISOString(),
          dismissed_by: user.id,
        })
        .eq('id', alert_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper function to calculate monthly trend
function calculateMonthlyTrend(expenses: any[]): any[] {
  const monthlyData: Record<string, number> = {};

  expenses.forEach(expense => {
    const month = new Date(expense.created_at).toISOString().slice(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + (expense.amount || 0);
  });

  return Object.entries(monthlyData)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
