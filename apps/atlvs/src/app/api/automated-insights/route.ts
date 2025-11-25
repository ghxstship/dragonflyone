import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/automated-insights - Get insights and recommendations
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const insightType = searchParams.get('type');
    const severity = searchParams.get('severity');
    const unacknowledgedOnly = searchParams.get('unacknowledged_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('automated_insights')
      .select('*', { count: 'exact' })
      .order('generated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (insightType) {
      query = query.eq('insight_type', insightType);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (unacknowledgedOnly) {
      query = query.eq('is_acknowledged', false);
    }

    const { data: insights, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get summary by type
    const { data: typeCounts } = await supabase
      .from('automated_insights')
      .select('insight_type, severity')
      .eq('is_acknowledged', false);

    const summary = {
      total_unacknowledged: typeCounts?.length || 0,
      by_type: {} as Record<string, number>,
      by_severity: {} as Record<string, number>,
    };

    typeCounts?.forEach(i => {
      summary.by_type[i.insight_type] = (summary.by_type[i.insight_type] || 0) + 1;
      summary.by_severity[i.severity] = (summary.by_severity[i.severity] || 0) + 1;
    });

    return NextResponse.json({
      insights: insights || [],
      total: count || 0,
      summary,
      limit,
      offset,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}

// POST /api/automated-insights - Generate insights or take action
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
    const action = body.action || 'generate';

    if (action === 'generate') {
      const insights: any[] = [];

      // Revenue trend analysis
      const revenueTrend = await analyzeRevenueTrend();
      if (revenueTrend) insights.push(revenueTrend);

      // Deal pipeline health
      const pipelineHealth = await analyzePipelineHealth();
      if (pipelineHealth) insights.push(pipelineHealth);

      // Overdue items
      const overdueItems = await analyzeOverdueItems();
      if (overdueItems) insights.push(overdueItems);

      // Asset utilization
      const assetUtilization = await analyzeAssetUtilization();
      if (assetUtilization) insights.push(assetUtilization);

      // Budget variance
      const budgetVariance = await analyzeBudgetVariance();
      if (budgetVariance) insights.push(budgetVariance);

      // Save insights
      if (insights.length > 0) {
        await supabase.from('automated_insights').insert(insights);
      }

      return NextResponse.json({
        generated_count: insights.length,
        insights,
      });
    } else if (action === 'acknowledge') {
      const { insight_id } = body;

      const { error } = await supabase
        .from('automated_insights')
        .update({
          is_acknowledged: true,
          acknowledged_by: user.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('id', insight_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else if (action === 'acknowledge_all') {
      const { category, insight_type } = body;

      let query = supabase
        .from('automated_insights')
        .update({
          is_acknowledged: true,
          acknowledged_by: user.id,
          acknowledged_at: new Date().toISOString(),
        })
        .eq('is_acknowledged', false);

      if (category) {
        query = query.eq('category', category);
      }

      if (insight_type) {
        query = query.eq('insight_type', insight_type);
      }

      const { error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else if (action === 'get_recommendations') {
      const { insight_id } = body;

      const { data: insight } = await supabase
        .from('automated_insights')
        .select('*')
        .eq('id', insight_id)
        .single();

      if (!insight) {
        return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
      }

      const recommendations = generateRecommendations(insight);

      return NextResponse.json({ recommendations });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Analysis functions
async function analyzeRevenueTrend(): Promise<any | null> {
  const { data: currentPeriod } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('status', 'paid')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const { data: previousPeriod } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('status', 'paid')
    .gte('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
    .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const currentTotal = currentPeriod?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;
  const previousTotal = previousPeriod?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;

  if (previousTotal === 0) return null;

  const changePercent = ((currentTotal - previousTotal) / previousTotal) * 100;

  if (Math.abs(changePercent) < 5) return null;

  return {
    insight_type: 'trend',
    category: 'financial',
    title: changePercent > 0 ? 'Revenue Increasing' : 'Revenue Declining',
    description: `Revenue has ${changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(1)}% compared to the previous 30 days.`,
    severity: changePercent < -15 ? 'critical' : changePercent < -5 ? 'warning' : 'info',
    metric_name: 'monthly_revenue',
    metric_value: currentTotal,
    comparison_value: previousTotal,
    change_percent: changePercent,
  };
}

async function analyzePipelineHealth(): Promise<any | null> {
  const { data: deals } = await supabase
    .from('deals')
    .select('stage, value, created_at')
    .not('stage', 'in', '("closed_won","closed_lost")');

  if (!deals || deals.length === 0) return null;

  const totalPipeline = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const staleDeals = deals.filter(d => {
    const createdAt = new Date(d.created_at);
    const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated > 60;
  });

  if (staleDeals.length === 0) return null;

  const staleValue = staleDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const stalePercent = (staleValue / totalPipeline) * 100;

  if (stalePercent < 20) return null;

  return {
    insight_type: 'recommendation',
    category: 'sales',
    title: 'Stale Deals in Pipeline',
    description: `${staleDeals.length} deals (${stalePercent.toFixed(1)}% of pipeline value) have been open for more than 60 days and may need attention.`,
    severity: stalePercent > 40 ? 'critical' : 'warning',
    metric_name: 'stale_pipeline_percent',
    metric_value: stalePercent,
    data_points: { stale_count: staleDeals.length, stale_value: staleValue },
  };
}

async function analyzeOverdueItems(): Promise<any | null> {
  const { data: overdueInvoices } = await supabase
    .from('invoices')
    .select('id, total_amount')
    .eq('status', 'sent')
    .lt('due_date', new Date().toISOString());

  const { data: overdueTasks } = await supabase
    .from('crm_tasks')
    .select('id')
    .eq('status', 'pending')
    .lt('due_date', new Date().toISOString());

  const overdueInvoiceCount = overdueInvoices?.length || 0;
  const overdueInvoiceValue = overdueInvoices?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;
  const overdueTaskCount = overdueTasks?.length || 0;

  if (overdueInvoiceCount === 0 && overdueTaskCount === 0) return null;

  return {
    insight_type: 'anomaly',
    category: 'operational',
    title: 'Overdue Items Detected',
    description: `There are ${overdueInvoiceCount} overdue invoices ($${overdueInvoiceValue.toLocaleString()}) and ${overdueTaskCount} overdue tasks requiring attention.`,
    severity: overdueInvoiceValue > 50000 ? 'critical' : overdueInvoiceCount > 5 ? 'warning' : 'info',
    metric_name: 'overdue_items',
    data_points: { 
      overdue_invoices: overdueInvoiceCount, 
      overdue_invoice_value: overdueInvoiceValue,
      overdue_tasks: overdueTaskCount,
    },
  };
}

async function analyzeAssetUtilization(): Promise<any | null> {
  const { data: assets } = await supabase
    .from('assets')
    .select('status, purchase_price');

  if (!assets || assets.length === 0) return null;

  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'active').length;
  const utilizationRate = (activeAssets / totalAssets) * 100;

  if (utilizationRate > 70) return null;

  const idleValue = assets
    .filter(a => a.status !== 'active')
    .reduce((sum, a) => sum + (a.purchase_price || 0), 0);

  return {
    insight_type: 'recommendation',
    category: 'asset',
    title: 'Low Asset Utilization',
    description: `Only ${utilizationRate.toFixed(1)}% of assets are currently active. $${idleValue.toLocaleString()} in assets are idle.`,
    severity: utilizationRate < 50 ? 'warning' : 'info',
    metric_name: 'asset_utilization_rate',
    metric_value: utilizationRate,
    data_points: { total_assets: totalAssets, active_assets: activeAssets, idle_value: idleValue },
  };
}

async function analyzeBudgetVariance(): Promise<any | null> {
  const { data: projects } = await supabase
    .from('projects')
    .select('name, budget, actual_cost')
    .eq('status', 'active')
    .not('budget', 'is', null)
    .not('actual_cost', 'is', null);

  if (!projects || projects.length === 0) return null;

  const overBudgetProjects = projects.filter(p => (p.actual_cost || 0) > (p.budget || 0));

  if (overBudgetProjects.length === 0) return null;

  const totalOverage = overBudgetProjects.reduce((sum, p) => 
    sum + ((p.actual_cost || 0) - (p.budget || 0)), 0);

  return {
    insight_type: 'anomaly',
    category: 'financial',
    title: 'Projects Over Budget',
    description: `${overBudgetProjects.length} active projects are over budget by a total of $${totalOverage.toLocaleString()}.`,
    severity: overBudgetProjects.length > 3 ? 'critical' : 'warning',
    metric_name: 'over_budget_projects',
    metric_value: overBudgetProjects.length,
    data_points: { 
      over_budget_count: overBudgetProjects.length, 
      total_overage: totalOverage,
      projects: overBudgetProjects.map(p => p.name),
    },
  };
}

function generateRecommendations(insight: any): string[] {
  const recommendations: string[] = [];

  switch (insight.insight_type) {
    case 'trend':
      if (insight.change_percent < 0) {
        recommendations.push('Review sales pipeline for opportunities to accelerate');
        recommendations.push('Analyze lost deals to identify improvement areas');
        recommendations.push('Consider promotional campaigns to boost revenue');
      } else {
        recommendations.push('Document successful strategies for replication');
        recommendations.push('Ensure capacity to handle increased demand');
      }
      break;
    case 'anomaly':
      if (insight.category === 'operational') {
        recommendations.push('Prioritize overdue items by value and impact');
        recommendations.push('Set up automated reminders for due dates');
        recommendations.push('Review processes causing delays');
      } else if (insight.category === 'financial') {
        recommendations.push('Review project scope and change orders');
        recommendations.push('Implement more frequent budget reviews');
        recommendations.push('Consider cost-cutting measures');
      }
      break;
    case 'recommendation':
      if (insight.category === 'sales') {
        recommendations.push('Review and update deal stages');
        recommendations.push('Schedule follow-ups with stale opportunities');
        recommendations.push('Consider closing unlikely deals');
      } else if (insight.category === 'asset') {
        recommendations.push('Review asset allocation across projects');
        recommendations.push('Consider selling or disposing of unused assets');
        recommendations.push('Implement asset sharing programs');
      }
      break;
  }

  return recommendations;
}
