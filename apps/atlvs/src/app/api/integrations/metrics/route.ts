export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { withAuth, PlatformRole } from '@ghxstship/config';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.ATLVS_TEAM_MEMBER,
  PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

interface EventTypeMetrics {
  eventType: string;
  count: number;
  successRate: number;
  avgResponseTime: number;
}

/**
 * GET /api/integrations/metrics
 * Returns integration metrics and analytics
 */
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();

  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const organizationId = authResult.user?.organizationId;
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';
    const subscriptionId = searchParams.get('subscription_id');

    // Calculate time range
    let startTime: Date;
    const endTime = new Date();

    switch (period) {
      case '1h':
        startTime = new Date(endTime.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
    }

    // Get webhook subscriptions for this org
    const { data: subscriptions } = await supabase
      .from('webhook_subscriptions')
      .select('id')
      .eq('organization_id', organizationId);

    const subscriptionIds = subscriptions?.map(s => s.id) || [];

    if (subscriptionIds.length === 0) {
      return NextResponse.json({
        period: { start: startTime.toISOString(), end: endTime.toISOString() },
        summary: {
          totalEvents: 0,
          successfulDeliveries: 0,
          failedDeliveries: 0,
          avgResponseTime: 0,
          successRate: 100 },
        byEventType: [],
        byHour: [],
        topErrors: [] });
    }

    // Build query for deliveries
    let deliveriesQuery = supabase
      .from('webhook_deliveries')
      .select('*')
      .in('subscription_id', subscriptionIds)
      .gte('created_at', startTime.toISOString())
      .lte('created_at', endTime.toISOString())
      .order('created_at', { ascending: false });

    if (subscriptionId) {
      deliveriesQuery = deliveriesQuery.eq('subscription_id', subscriptionId);
    }

    const { data: deliveries } = await deliveriesQuery;

    // Calculate summary metrics
    const totalEvents = deliveries?.length || 0;
    const successfulDeliveries = deliveries?.filter(d => d.success).length || 0;
    const failedDeliveries = totalEvents - successfulDeliveries;
    const avgResponseTime = totalEvents > 0
      ? Math.round((deliveries?.reduce((sum, d) => sum + (d.duration_ms || 0), 0) || 0) / totalEvents)
      : 0;
    const successRate = totalEvents > 0
      ? Math.round((successfulDeliveries / totalEvents) * 100 * 100) / 100
      : 100;

    // Group by event type
    const eventTypeMap: Record<string, { count: number; success: number; totalDuration: number }> = {};
    deliveries?.forEach(d => {
      if (!eventTypeMap[d.event_type]) {
        eventTypeMap[d.event_type] = { count: 0, success: 0, totalDuration: 0 };
      }
      eventTypeMap[d.event_type].count++;
      if (d.success) eventTypeMap[d.event_type].success++;
      eventTypeMap[d.event_type].totalDuration += d.duration_ms || 0;
    });

    const byEventType: EventTypeMetrics[] = Object.entries(eventTypeMap).map(([eventType, stats]) => ({
      eventType,
      count: stats.count,
      successRate: Math.round((stats.success / stats.count) * 100 * 100) / 100,
      avgResponseTime: Math.round(stats.totalDuration / stats.count) })).sort((a, b) => b.count - a.count);

    // Group by hour for time series
    const hourlyMap: Record<string, { count: number; success: number }> = {};
    deliveries?.forEach(d => {
      const hour = new Date(d.created_at).toISOString().slice(0, 13) + ':00:00Z';
      if (!hourlyMap[hour]) {
        hourlyMap[hour] = { count: 0, success: 0 };
      }
      hourlyMap[hour].count++;
      if (d.success) hourlyMap[hour].success++;
    });

    const byHour = Object.entries(hourlyMap)
      .map(([hour, stats]) => ({
        hour,
        count: stats.count,
        successRate: Math.round((stats.success / stats.count) * 100) }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    // Get top errors
    const errorMap: Record<string, number> = {};
    deliveries?.filter(d => !d.success && d.error_message).forEach(d => {
      const error = d.error_message || 'Unknown error';
      errorMap[error] = (errorMap[error] || 0) + 1;
    });

    const topErrors = Object.entries(errorMap)
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      period: {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        label: period },
      summary: {
        totalEvents,
        successfulDeliveries,
        failedDeliveries,
        avgResponseTime,
        successRate },
      byEventType,
      byHour,
      topErrors });
  } catch (error) {
    console.error('Integration metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integration metrics' },
      { status: 500 }
    );
  }
}
