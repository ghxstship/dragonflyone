export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const DashboardWidgetSchema = z.object({
  widget_type: z.enum([
    'kpi_card',
    'line_chart',
    'bar_chart',
    'pie_chart',
    'table',
    'gauge',
    'heatmap',
    'funnel',
    'scatter',
    'area_chart',
  ]),
  title: z.string(),
  data_source: z.enum([
    'revenue',
    'expenses',
    'deals',
    'invoices',
    'projects',
    'assets',
    'crew',
    'tickets',
    'events',
    'custom',
  ]),
  metrics: z.array(z.string()),
  dimensions: z.array(z.string()).optional(),
  filters: z.record(z.any()).optional(),
  time_range: z.enum(['today', 'week', 'month', 'quarter', 'year', 'custom']).optional(),
  comparison_period: z.enum(['previous_period', 'same_period_last_year', 'none']).optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
});

const DashboardSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  is_default: z.boolean().default(false),
  is_shared: z.boolean().default(false),
  widgets: z.array(DashboardWidgetSchema),
  refresh_interval: z.number().optional(),
});

// GET /api/analytics/advanced-dashboard - Get dashboards and widget data
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dashboardId = searchParams.get('dashboard_id');
    const action = searchParams.get('action');

    if (action === 'list') {
      // Get all dashboards for user
      const { data: dashboards } = await supabase
        .from('dashboard_configs')
        .select('id, name, description, is_default, is_shared, created_at')
        .or(`created_by.eq.${userId},is_shared.eq.true`)
        .order('is_default', { ascending: false });

      return NextResponse.json({ dashboards: dashboards || [] });
    }

    if (action === 'widget_data' && dashboardId) {
      const widgetId = searchParams.get('widget_id');
      const timeRange = searchParams.get('time_range') || 'month';

      // Get widget configuration
      const { data: widget } = await supabase
        .from('dashboard_widgets')
        .select('*')
        .eq('id', widgetId)
        .single();

      if (!widget) {
        return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
      }

      // Fetch data based on widget configuration
      const data = await fetchWidgetData(widget, timeRange);

      return NextResponse.json({ widget_data: data });
    }

    if (dashboardId) {
      // Get specific dashboard with widgets
      const { data: dashboard } = await supabase
        .from('dashboard_configs')
        .select(`
          *,
          widgets:dashboard_widgets(*)
        `)
        .eq('id', dashboardId)
        .single();

      if (!dashboard) {
        return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
      }

      // Fetch data for all widgets
      interface Widget { id: string; type: string; config?: Record<string, unknown> }
      const widgetsWithData = await Promise.all(
        (dashboard.widgets || []).map(async (widget: Widget) => {
          const data = await fetchWidgetData(widget, 'month');
          return { ...widget, data };
        })
      );

      return NextResponse.json({
        dashboard: {
          ...dashboard,
          widgets: widgetsWithData,
        },
      });
    }

    // Default: Get default dashboard or first available
    const { data: defaultDashboard } = await supabase
      .from('dashboard_configs')
      .select('id')
      .eq('created_by', userId)
      .eq('is_default', true)
      .single();

    if (defaultDashboard) {
      return NextResponse.json({ redirect_to: defaultDashboard.id });
    }

    return NextResponse.json({ dashboards: [], message: 'No dashboards found' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

// POST /api/analytics/advanced-dashboard - Create or update dashboard
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'create';

    if (action === 'create') {
      const validated = DashboardSchema.parse(body);

      // If setting as default, unset other defaults
      if (validated.is_default) {
        await supabase
          .from('dashboard_configs')
          .update({ is_default: false })
          .eq('created_by', userId);
      }

      // Create dashboard
      const { data: dashboard, error } = await supabase
        .from('dashboard_configs')
        .insert({
          name: validated.name,
          description: validated.description,
          is_default: validated.is_default,
          is_shared: validated.is_shared,
          refresh_interval: validated.refresh_interval,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      // Create widgets
      if (validated.widgets.length > 0) {
        const widgetRecords = validated.widgets.map((w, index) => ({
          dashboard_id: dashboard.id,
          widget_type: w.widget_type,
          title: w.title,
          data_source: w.data_source,
          metrics: w.metrics,
          dimensions: w.dimensions,
          filters: w.filters,
          time_range: w.time_range,
          comparison_period: w.comparison_period,
          position: w.position,
          sort_order: index,
        }));

        await supabase.from('dashboard_widgets').insert(widgetRecords);
      }

      return NextResponse.json({ dashboard }, { status: 201 });
    } else if (action === 'add_widget') {
      const { dashboard_id, widget } = body;
      const validatedWidget = DashboardWidgetSchema.parse(widget);

      const { data: newWidget, error } = await supabase
        .from('dashboard_widgets')
        .insert({
          dashboard_id,
          ...validatedWidget,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ widget: newWidget }, { status: 201 });
    } else if (action === 'duplicate') {
      const { dashboard_id } = body;

      // Get original dashboard
      const { data: original } = await supabase
        .from('dashboard_configs')
        .select(`*, widgets:dashboard_widgets(*)`)
        .eq('id', dashboard_id)
        .single();

      if (!original) {
        return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
      }

      // Create copy
      const { data: copy, error } = await supabase
        .from('dashboard_configs')
        .insert({
          name: `${original.name} (Copy)`,
          description: original.description,
          is_default: false,
          is_shared: false,
          refresh_interval: original.refresh_interval,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      // Copy widgets
      if (original.widgets?.length > 0) {
        const widgetCopies = original.widgets.map((w: Record<string, unknown>) => ({
          dashboard_id: copy.id,
          widget_type: w.widget_type,
          title: w.title,
          data_source: w.data_source,
          metrics: w.metrics,
          dimensions: w.dimensions,
          filters: w.filters,
          time_range: w.time_range,
          comparison_period: w.comparison_period,
          position: w.position,
          sort_order: w.sort_order,
        }));

        await supabase.from('dashboard_widgets').insert(widgetCopies);
      }

      return NextResponse.json({ dashboard: copy }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/analytics/advanced-dashboard - Update dashboard or widget
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dashboardId = searchParams.get('dashboard_id');
    const widgetId = searchParams.get('widget_id');

    const body = await request.json();

    if (widgetId) {
      const { data: widget, error } = await supabase
        .from('dashboard_widgets')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', widgetId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ widget });
    }

    if (dashboardId) {
      // If setting as default, unset other defaults
      if (body.is_default) {
        await supabase
          .from('dashboard_configs')
          .update({ is_default: false })
          .eq('created_by', userId)
          .neq('id', dashboardId);
      }

      const { data: dashboard, error } = await supabase
        .from('dashboard_configs')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dashboardId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ dashboard });
    }

    return NextResponse.json({ error: 'Dashboard or widget ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/analytics/advanced-dashboard - Delete dashboard or widget
export async function DELETE(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const dashboardId = searchParams.get('dashboard_id');
    const widgetId = searchParams.get('widget_id');

    if (widgetId) {
      const { error } = await supabase
        .from('dashboard_widgets')
        .delete()
        .eq('id', widgetId);

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (dashboardId) {
      const { error } = await supabase
        .from('dashboard_configs')
        .delete()
        .eq('id', dashboardId);

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Dashboard or widget ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

// Helper function to fetch widget data
interface DashboardWidget { id: string; type: string; config?: Record<string, unknown> }
async function fetchWidgetData(widget: DashboardWidget, timeRange: string): Promise<unknown> {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'quarter':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(now.setMonth(now.getMonth() - 1));
  }

  const startDateStr = startDate.toISOString();

  switch (widget.data_source) {
    case 'revenue': {
      const { data } = await supabase
        .from('docs_profile_invoice')
        .select('total_amount, paid_at, status')
        .eq('status', 'paid')
        .gte('paid_at', startDateStr);

      const total = data?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;
      const count = data?.length || 0;

      return {
        total,
        count,
        average: count > 0 ? total / count : 0,
        trend: calculateTrend(data || [], 'total_amount', 'paid_at'),
      };
    }

    case 'expenses': {
      const { data } = await supabase
        .from('finance_expenses')
        .select('amount, category, created_at')
        .gte('created_at', startDateStr);

      const total = data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
      const byCategory: Record<string, number> = {};
      data?.forEach(e => {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
      });

      return {
        total,
        count: data?.length || 0,
        by_category: byCategory,
      };
    }

    case 'deals': {
      const { data } = await supabase
        .from('deals')
        .select('value, stage, created_at')
        .gte('created_at', startDateStr);

      const totalValue = data?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;
      const byStage: Record<string, { count: number; value: number }> = {};
      data?.forEach(d => {
        if (!byStage[d.stage]) {
          byStage[d.stage] = { count: 0, value: 0 };
        }
        byStage[d.stage].count++;
        byStage[d.stage].value += d.value || 0;
      });

      return {
        total_value: totalValue,
        count: data?.length || 0,
        by_stage: byStage,
      };
    }

    case 'projects': {
      const { data } = await supabase
        .from('projects')
        .select('status, budget, created_at')
        .gte('created_at', startDateStr);

      const byStatus: Record<string, number> = {};
      data?.forEach(p => {
        byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      });

      return {
        count: data?.length || 0,
        total_budget: data?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0,
        by_status: byStatus,
      };
    }

    case 'tickets': {
      const { data } = await supabase
        .from('orders')
        .select('total_amount, status, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDateStr);

      return {
        total_revenue: data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
        count: data?.length || 0,
      };
    }

    default:
      return { message: 'No data available for this source' };
  }
}

function calculateTrend(data: unknown[], valueField: string, dateField: string): number {
  if (data.length < 2) return 0;

  const sorted = [...data].sort((a, b) => 
    new Date(a[dateField]).getTime() - new Date(b[dateField]).getTime()
  );

  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint);
  const secondHalf = sorted.slice(midpoint);

  const firstSum = firstHalf.reduce((sum, item) => sum + (item[valueField] || 0), 0);
  const secondSum = secondHalf.reduce((sum, item) => sum + (item[valueField] || 0), 0);

  if (firstSum === 0) return secondSum > 0 ? 100 : 0;
  return ((secondSum - firstSum) / firstSum) * 100;
}
