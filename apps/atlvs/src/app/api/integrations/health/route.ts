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

interface IntegrationHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: string;
  responseTime?: number;
  errorRate?: number;
  details?: Record<string, unknown>;
}

/**
 * GET /api/integrations/health
 * Returns health status of all integrations
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

    // Get webhook subscription health
    const { data: webhookStats } = await supabase
      .from('webhook_subscriptions')
      .select('id, name, status, last_success_at, last_failure_at, consecutive_failures, provider')
      .eq('organization_id', organizationId);

    // Get recent delivery stats (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentDeliveries } = await supabase
      .from('webhook_deliveries')
      .select('subscription_id, success, duration_ms, created_at')
      .gte('created_at', twentyFourHoursAgo);

    // Calculate health metrics per subscription
    const subscriptionHealth: Record<string, { total: number; success: number; avgDuration: number }> = {};
    
    (recentDeliveries || []).forEach(delivery => {
      if (!subscriptionHealth[delivery.subscription_id]) {
        subscriptionHealth[delivery.subscription_id] = { total: 0, success: 0, avgDuration: 0 };
      }
      subscriptionHealth[delivery.subscription_id].total++;
      if (delivery.success) {
        subscriptionHealth[delivery.subscription_id].success++;
      }
      subscriptionHealth[delivery.subscription_id].avgDuration += delivery.duration_ms || 0;
    });

    // Calculate averages
    Object.keys(subscriptionHealth).forEach(id => {
      const stats = subscriptionHealth[id];
      if (stats.total > 0) {
        stats.avgDuration = Math.round(stats.avgDuration / stats.total);
      }
    });

    // Build integration health report
    const integrations: IntegrationHealth[] = [];

    // Webhook integrations
    (webhookStats || []).forEach(webhook => {
      const stats = subscriptionHealth[webhook.id] || { total: 0, success: 0, avgDuration: 0 };
      const successRate = stats.total > 0 ? (stats.success / stats.total) * 100 : 100;
      
      let status: IntegrationHealth['status'] = 'healthy';
      if (webhook.status === 'failed' || webhook.consecutive_failures >= 10) {
        status = 'unhealthy';
      } else if (webhook.consecutive_failures >= 3 || successRate < 90) {
        status = 'degraded';
      } else if (webhook.status === 'paused') {
        status = 'unknown';
      }

      integrations.push({
        name: `${webhook.provider}: ${webhook.name}`,
        status,
        lastCheck: webhook.last_success_at || webhook.last_failure_at || new Date().toISOString(),
        responseTime: stats.avgDuration,
        errorRate: stats.total > 0 ? Math.round((1 - stats.success / stats.total) * 100) : 0,
        details: {
          provider: webhook.provider,
          consecutiveFailures: webhook.consecutive_failures,
          deliveries24h: stats.total,
          successRate24h: Math.round(successRate) } });
    });

    // Check external service health (Supabase, Stripe, etc.)
    const externalServices: IntegrationHealth[] = [
      {
        name: 'Supabase Database',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        details: { type: 'database' } },
      {
        name: 'Supabase Auth',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        details: { type: 'authentication' } },
    ];

    // Test Supabase connection
    try {
      const start = Date.now();
      await supabase.from('organizations').select('id').limit(1);
      const responseTime = Date.now() - start;
      
      externalServices[0].responseTime = responseTime;
      externalServices[0].status = responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'unhealthy';
    } catch {
      externalServices[0].status = 'unhealthy';
    }

    // Calculate overall health
    const allIntegrations = [...integrations, ...externalServices];
    const healthyCount = allIntegrations.filter(i => i.status === 'healthy').length;
    const degradedCount = allIntegrations.filter(i => i.status === 'degraded').length;
    const unhealthyCount = allIntegrations.filter(i => i.status === 'unhealthy').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    }

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      summary: {
        total: allIntegrations.length,
        healthy: healthyCount,
        degraded: degradedCount,
        unhealthy: unhealthyCount },
      integrations: allIntegrations });
  } catch (error) {
    console.error('Integration health check error:', error);
    return NextResponse.json(
      { error: 'Failed to check integration health' },
      { status: 500 }
    );
  }
}
