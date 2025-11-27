import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

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

    // Verify admin access
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('platform_roles')
      .eq('auth_user_id', user.id)
      .single();

    const isAdmin = platformUser?.platform_roles?.some((role: string) =>
      ['ATLVS_ADMIN', 'LEGEND_ADMIN', 'LEGEND_SUPER_ADMIN'].includes(role)
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    const integration_type = searchParams.get('integration_type');
    const client_id = searchParams.get('client_id');

    // Calculate date range
    let daysBack = 7;
    if (period === '24h') daysBack = 1;
    else if (period === '30d') daysBack = 30;
    else if (period === '90d') daysBack = 90;

    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    // Get daily analytics
    let analyticsQuery = supabase
      .from('integration_analytics_daily')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (integration_type) {
      analyticsQuery = analyticsQuery.eq('integration_type', integration_type);
    }
    if (client_id) {
      analyticsQuery = analyticsQuery.eq('client_id', client_id);
    }

    const { data: dailyAnalytics, error: analyticsError } = await analyticsQuery;

    if (analyticsError) throw analyticsError;

    // Get recent usage logs for detailed view
    let logsQuery = supabase
      .from('integration_usage_logs')
      .select(`
        id, integration_type, action_type, resource_type, status, 
        error_message, request_duration_ms, created_at,
        client:oauth_clients(name)
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (integration_type) {
      logsQuery = logsQuery.eq('integration_type', integration_type);
    }

    const { data: recentLogs } = await logsQuery;

    // Calculate summary metrics
    const summary = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitedRequests: 0,
      uniqueUsers: new Set<string>(),
      avgDurationMs: 0,
      topActions: {} as Record<string, number>,
      byIntegrationType: {} as Record<string, { total: number; success: number; error: number }>,
    };

    let totalDuration = 0;
    let durationCount = 0;

    (dailyAnalytics || []).forEach((day: {
      total_requests: number;
      successful_requests: number;
      failed_requests: number;
      rate_limited_requests: number;
      unique_users: number;
      avg_duration_ms: number;
      top_actions: Record<string, number>;
      integration_type: string;
    }) => {
      summary.totalRequests += day.total_requests || 0;
      summary.successfulRequests += day.successful_requests || 0;
      summary.failedRequests += day.failed_requests || 0;
      summary.rateLimitedRequests += day.rate_limited_requests || 0;

      if (day.avg_duration_ms) {
        totalDuration += day.avg_duration_ms * day.total_requests;
        durationCount += day.total_requests;
      }

      // Aggregate top actions
      if (day.top_actions) {
        Object.entries(day.top_actions).forEach(([action, count]) => {
          summary.topActions[action] = (summary.topActions[action] || 0) + (count as number);
        });
      }

      // Aggregate by integration type
      if (!summary.byIntegrationType[day.integration_type]) {
        summary.byIntegrationType[day.integration_type] = { total: 0, success: 0, error: 0 };
      }
      summary.byIntegrationType[day.integration_type].total += day.total_requests || 0;
      summary.byIntegrationType[day.integration_type].success += day.successful_requests || 0;
      summary.byIntegrationType[day.integration_type].error += day.failed_requests || 0;
    });

    summary.avgDurationMs = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

    // Sort top actions
    const sortedTopActions = Object.entries(summary.topActions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    // Get error breakdown
    const { data: errorBreakdown } = await supabase
      .from('integration_usage_logs')
      .select('error_message, integration_type')
      .eq('status', 'error')
      .gte('created_at', startDate.toISOString())
      .not('error_message', 'is', null)
      .limit(100);

    const errorCounts: Record<string, number> = {};
    (errorBreakdown || []).forEach((log: { error_message: string }) => {
      const msg = log.error_message?.substring(0, 100) || 'Unknown error';
      errorCounts[msg] = (errorCounts[msg] || 0) + 1;
    });

    return NextResponse.json({
      period,
      summary: {
        totalRequests: summary.totalRequests,
        successfulRequests: summary.successfulRequests,
        failedRequests: summary.failedRequests,
        rateLimitedRequests: summary.rateLimitedRequests,
        successRate: summary.totalRequests > 0 
          ? ((summary.successfulRequests / summary.totalRequests) * 100).toFixed(2) + '%'
          : 'N/A',
        avgDurationMs: summary.avgDurationMs,
      },
      byIntegrationType: summary.byIntegrationType,
      topActions: sortedTopActions,
      topErrors: Object.entries(errorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([message, count]) => ({ message, count })),
      dailyTrend: dailyAnalytics,
      recentLogs: recentLogs?.slice(0, 20),
    });
  } catch (error) {
    console.error('Integration analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
