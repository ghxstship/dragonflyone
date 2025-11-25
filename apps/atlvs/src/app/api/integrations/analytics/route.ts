import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Integration Usage Analytics Dashboard API
 * Tracks tasks fired, top integrations, error rates, and performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const platform = searchParams.get('platform'); // zapier, make, n8n, custom
    const workspaceId = searchParams.get('workspace_id');

    // Calculate date range
    const now = new Date();
    const periodDays = parseInt(period.replace('d', '')) || 7;
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Build query filters
    let query = supabase
      .from('integration_events')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (platform) {
      query = query.eq('platform', platform);
    }
    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId);
    }

    const { data: events, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate metrics
    const totalTasks = events?.length || 0;
    const successfulTasks = events?.filter(e => e.status === 'success').length || 0;
    const failedTasks = events?.filter(e => e.status === 'error').length || 0;
    const errorRate = totalTasks > 0 ? (failedTasks / totalTasks) * 100 : 0;

    // Group by integration type
    const byPlatform = events?.reduce((acc: Record<string, number>, e) => {
      acc[e.platform] = (acc[e.platform] || 0) + 1;
      return acc;
    }, {}) || {};

    // Group by trigger/action type
    const byEventType = events?.reduce((acc: Record<string, number>, e) => {
      acc[e.event_type] = (acc[e.event_type] || 0) + 1;
      return acc;
    }, {}) || {};

    // Top 10 most used integrations
    const topIntegrations = Object.entries(byEventType)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Calculate average response time
    const responseTimes = events?.filter(e => e.response_time_ms).map(e => e.response_time_ms) || [];
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // Daily breakdown
    const dailyBreakdown = events?.reduce((acc: Record<string, { success: number; error: number; total: number }>, e) => {
      const day = e.created_at.split('T')[0];
      if (!acc[day]) {
        acc[day] = { success: 0, error: 0, total: 0 };
      }
      acc[day].total++;
      if (e.status === 'success') acc[day].success++;
      if (e.status === 'error') acc[day].error++;
      return acc;
    }, {}) || {};

    // Error breakdown by type
    const errorBreakdown = events
      ?.filter(e => e.status === 'error')
      .reduce((acc: Record<string, number>, e) => {
        const errorType = e.error_code || 'unknown';
        acc[errorType] = (acc[errorType] || 0) + 1;
        return acc;
      }, {}) || {};

    // Get recent errors for debugging
    const recentErrors = events
      ?.filter(e => e.status === 'error')
      .slice(0, 10)
      .map(e => ({
        id: e.id,
        event_type: e.event_type,
        platform: e.platform,
        error_code: e.error_code,
        error_message: e.error_message,
        created_at: e.created_at
      })) || [];

    return NextResponse.json({
      period,
      summary: {
        total_tasks: totalTasks,
        successful_tasks: successfulTasks,
        failed_tasks: failedTasks,
        error_rate: Math.round(errorRate * 100) / 100,
        avg_response_time_ms: Math.round(avgResponseTime)
      },
      by_platform: byPlatform,
      top_integrations: topIntegrations,
      daily_breakdown: dailyBreakdown,
      error_breakdown: errorBreakdown,
      recent_errors: recentErrors,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'log_event') {
      // Log an integration event
      const { platform, event_type, status, workspace_id, response_time_ms, error_code, error_message, metadata } = body;

      const { data, error } = await supabase.from('integration_events').insert({
        platform,
        event_type,
        status,
        workspace_id,
        response_time_ms,
        error_code,
        error_message,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      }).select().single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ event: data }, { status: 201 });
    }

    if (action === 'export_report') {
      // Generate exportable report
      const { period, format } = body;
      const periodDays = parseInt(period?.replace('d', '') || '30');
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

      const { data: events } = await supabase
        .from('integration_events')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (format === 'csv') {
        const headers = ['id', 'platform', 'event_type', 'status', 'response_time_ms', 'error_code', 'created_at'];
        const csv = [
          headers.join(','),
          ...(events || []).map(e => headers.map(h => e[h] || '').join(','))
        ].join('\n');

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="integration-report-${period}.csv"`
          }
        });
      }

      return NextResponse.json({ events, period, generated_at: new Date().toISOString() });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
