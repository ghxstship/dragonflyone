import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET /api/analytics/cross-platform - Get analytics across all platforms
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
    const action = searchParams.get('action');
    const period = searchParams.get('period') || 'month';

    const now = new Date();
    let rangeStart: Date;

    switch (period) {
      case 'week':
        rangeStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        rangeStart = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        rangeStart = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (action === 'overview') {
      const { data: projects } = await supabase
        .from('projects')
        .select('id, budget, status')
        .gte('created_at', rangeStart.toISOString());

      const { data: deals } = await supabase
        .from('deals')
        .select('id, value, stage')
        .gte('created_at', rangeStart.toISOString());

      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, total_amount, status')
        .gte('created_at', rangeStart.toISOString());

      const { data: compvssProjects } = await supabase
        .from('compvss_projects')
        .select('id, budget, status')
        .gte('created_at', rangeStart.toISOString());

      const { data: events } = await supabase
        .from('events')
        .select('id, tickets_sold')
        .gte('event_date', rangeStart.toISOString());

      const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, status')
        .gte('created_at', rangeStart.toISOString());

      const atlvsRevenue = invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;
      const gvtewayRevenue = orders?.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      return NextResponse.json({
        period: { start: rangeStart, end: now },
        atlvs: {
          projects: projects?.length || 0,
          deals: deals?.length || 0,
          revenue: atlvsRevenue,
        },
        compvss: {
          projects: compvssProjects?.length || 0,
        },
        gvteway: {
          events: events?.length || 0,
          tickets_sold: events?.reduce((sum, e) => sum + (e.tickets_sold || 0), 0) || 0,
          revenue: gvtewayRevenue,
        },
        totals: {
          combined_revenue: atlvsRevenue + gvtewayRevenue,
        },
      });
    }

    if (action === 'kpis') {
      const { data: revenue } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('status', 'paid')
        .gte('paid_at', rangeStart.toISOString());

      const { data: deals } = await supabase
        .from('deals')
        .select('value, stage')
        .not('stage', 'in', '("closed_won","closed_lost")');

      const { data: tickets } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', rangeStart.toISOString());

      return NextResponse.json({
        kpis: {
          total_revenue: (revenue?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0) +
                        (tickets?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0),
          pipeline_value: deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0,
          active_deals: deals?.length || 0,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
