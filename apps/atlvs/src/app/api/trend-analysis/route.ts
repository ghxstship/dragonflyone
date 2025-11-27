import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const period = searchParams.get('period') || 'month';
    const comparePeriods = parseInt(searchParams.get('compare_periods') || '12');

    if (metric === 'revenue') {
      const { data: invoices } = await supabase
        .from('invoices')
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
        .from('purchase_orders')
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
