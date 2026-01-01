export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

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

    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const period = searchParams.get('period') || 'month';
    const comparePeriods = parseInt(searchParams.get('compare_periods') || '12');

    if (metric === 'revenue') {
      const { data: invoices } = await supabase
        .from('docs_profile_invoice')
        .select('total_amount, created_at')
        .eq('status', 'paid')
        .gte('created_at', new Date(Date.now() - comparePeriods * 30 * 24 * 60 * 60 * 1000).toISOString());

      const byPeriod: Record<string, number> = {};
      invoices?.forEach(inv => {
        const key = period === 'month' 
          ? inv.created_at.substring(0, 7) 
          : inv.created_at.substring(0, 10);
        byPeriod[key] = (byPeriod[key] || 0) + inv.total_amount;
      });

      const trend = Object.entries(byPeriod)
        .map(([p, value]) => ({ period: p, value }))
        .sort((a, b) => a.period.localeCompare(b.period));

      const trendWithChange = trend.map((t, i) => ({
        ...t,
        change: i > 0 && trend[i - 1].value > 0 
          ? Math.round(((t.value - trend[i - 1].value) / trend[i - 1].value) * 10000) / 100 
          : 0,
      }));

      const avgValue = trend.length > 0 ? trend.reduce((sum, t) => sum + t.value, 0) / trend.length : 0;
      const latestValue = trend.length > 0 ? trend[trend.length - 1].value : 0;
      const previousValue = trend.length > 1 ? trend[trend.length - 2].value : 0;

      return NextResponse.json({
        metric: 'revenue',
        trend: trendWithChange,
        summary: {
          average: Math.round(avgValue * 100) / 100,
          latest: latestValue,
          previous: previousValue,
          change_percent: previousValue > 0 ? Math.round(((latestValue - previousValue) / previousValue) * 10000) / 100 : 0,
          trend_direction: latestValue > avgValue ? 'up' : latestValue < avgValue ? 'down' : 'stable',
        },
      });
    }

    if (metric === 'expenses') {
      const { data: pos } = await supabase
        .from('finance_purchase_orders')
        .select('total_amount, created_at')
        .in('status', ['approved', 'sent', 'received', 'completed'])
        .gte('created_at', new Date(Date.now() - comparePeriods * 30 * 24 * 60 * 60 * 1000).toISOString());

      const byPeriod: Record<string, number> = {};
      pos?.forEach(po => {
        const key = period === 'month' ? po.created_at.substring(0, 7) : po.created_at.substring(0, 10);
        byPeriod[key] = (byPeriod[key] || 0) + po.total_amount;
      });

      const trend = Object.entries(byPeriod)
        .map(([p, value]) => ({ period: p, value }))
        .sort((a, b) => a.period.localeCompare(b.period));

      return NextResponse.json({ metric: 'expenses', trend });
    }

    if (metric === 'deals') {
      const { data: deals } = await supabase
        .from('deals')
        .select('value, stage, created_at, closed_at')
        .gte('created_at', new Date(Date.now() - comparePeriods * 30 * 24 * 60 * 60 * 1000).toISOString());

      const byPeriod: Record<string, { created: number; won: number; value: number }> = {};
      deals?.forEach(deal => {
        const key = deal.created_at.substring(0, 7);
        if (!byPeriod[key]) byPeriod[key] = { created: 0, won: 0, value: 0 };
        byPeriod[key].created++;
        if (deal.stage === 'closed_won') {
          byPeriod[key].won++;
          byPeriod[key].value += deal.value;
        }
      });

      const trend = Object.entries(byPeriod)
        .map(([p, data]) => ({
          period: p,
          deals_created: data.created,
          deals_won: data.won,
          won_value: data.value,
          win_rate: data.created > 0 ? Math.round((data.won / data.created) * 10000) / 100 : 0,
        }))
        .sort((a, b) => a.period.localeCompare(b.period));

      return NextResponse.json({ metric: 'deals', trend });
    }

    if (metric === 'clients') {
      const { data: contacts } = await supabase
        .from('contacts')
        .select('id, created_at, type')
        .eq('type', 'client')
        .gte('created_at', new Date(Date.now() - comparePeriods * 30 * 24 * 60 * 60 * 1000).toISOString());

      const byPeriod: Record<string, number> = {};
      contacts?.forEach(c => {
        const key = c.created_at.substring(0, 7);
        byPeriod[key] = (byPeriod[key] || 0) + 1;
      });

      const trend = Object.entries(byPeriod)
        .map(([p, count]) => ({ period: p, new_clients: count }))
        .sort((a, b) => a.period.localeCompare(b.period));

      // Calculate cumulative
      let cumulative = 0;
      const trendWithCumulative = trend.map(t => {
        cumulative += t.new_clients;
        return { ...t, cumulative };
      });

      return NextResponse.json({ metric: 'clients', trend: trendWithCumulative });
    }

    return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
