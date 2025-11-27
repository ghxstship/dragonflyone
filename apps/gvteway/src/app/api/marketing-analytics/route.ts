import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const type = searchParams.get('type');

    if (type === 'attribution') {
      let query = supabase
        .from('orders')
        .select('id, total, utm_source, utm_medium, utm_campaign, affiliate_code, created_at');

      if (eventId) query = query.eq('event_id', eventId);
      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data: orders } = await query;

      // Group by source
      const bySource = orders?.reduce((acc: Record<string, { orders: number; revenue: number }>, order) => {
        const source = order.utm_source || order.affiliate_code || 'direct';
        if (!acc[source]) acc[source] = { orders: 0, revenue: 0 };
        acc[source].orders++;
        acc[source].revenue += order.total;
        return acc;
      }, {});

      // Group by campaign
      const byCampaign = orders?.reduce((acc: Record<string, { orders: number; revenue: number }>, order) => {
        const campaign = order.utm_campaign || 'none';
        if (!acc[campaign]) acc[campaign] = { orders: 0, revenue: 0 };
        acc[campaign].orders++;
        acc[campaign].revenue += order.total;
        return acc;
      }, {});

      return NextResponse.json({
        attribution: {
          by_source: bySource,
          by_campaign: byCampaign,
          total_orders: orders?.length || 0,
          total_revenue: orders?.reduce((sum, o) => sum + o.total, 0) || 0,
        },
      });
    }

    if (type === 'funnel') {
      // Get funnel metrics
      const { count: pageViews } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      const { count: ticketViews } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('page_type', 'ticket_selection');

      const { count: checkoutStarts } = await supabase
        .from('checkout_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      const { count: purchases } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'completed');

      const funnel = [
        { stage: 'Event Page Views', count: pageViews || 0, rate: 100 },
        { stage: 'Ticket Selection', count: ticketViews || 0, rate: pageViews ? ((ticketViews || 0) / pageViews * 100).toFixed(1) : 0 },
        { stage: 'Checkout Started', count: checkoutStarts || 0, rate: pageViews ? ((checkoutStarts || 0) / pageViews * 100).toFixed(1) : 0 },
        { stage: 'Purchase Complete', count: purchases || 0, rate: pageViews ? ((purchases || 0) / pageViews * 100).toFixed(1) : 0 },
      ];

      // Calculate drop-offs
      const dropOffs = funnel.slice(0, -1).map((stage, i) => ({
        from: stage.stage,
        to: funnel[i + 1].stage,
        drop_off_rate: stage.count > 0 ? ((stage.count - funnel[i + 1].count) / stage.count * 100).toFixed(1) : 0,
        lost_users: stage.count - funnel[i + 1].count,
      }));

      return NextResponse.json({ funnel, drop_offs: dropOffs });
    }

    if (type === 'campaign_performance') {
      const { data: campaigns } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('event_id', eventId);

      const performance = await Promise.all((campaigns || []).map(async (campaign) => {
        const { count: clicks } = await supabase
          .from('campaign_clicks')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id);

        const { data: conversions } = await supabase
          .from('orders')
          .select('total')
          .eq('utm_campaign', campaign.utm_campaign);

        return {
          campaign_id: campaign.id,
          campaign_name: campaign.name,
          budget: campaign.budget,
          spent: campaign.spent,
          clicks: clicks || 0,
          conversions: conversions?.length || 0,
          revenue: conversions?.reduce((sum, c) => sum + c.total, 0) || 0,
          cpc: clicks && campaign.spent ? (campaign.spent / clicks).toFixed(2) : 0,
          roas: campaign.spent ? ((conversions?.reduce((sum, c) => sum + c.total, 0) || 0) / campaign.spent).toFixed(2) : 0,
        };
      }));

      return NextResponse.json({ campaign_performance: performance });
    }

    if (type === 'overview') {
      // Get overview metrics
      let ordersQuery = supabase.from('orders').select('total, created_at').eq('status', 'completed');
      if (eventId) ordersQuery = ordersQuery.eq('event_id', eventId);
      if (startDate) ordersQuery = ordersQuery.gte('created_at', startDate);
      if (endDate) ordersQuery = ordersQuery.lte('created_at', endDate);

      const { data: orders } = await ordersQuery;

      const totalRevenue = orders?.reduce((sum, o) => sum + o.total, 0) || 0;
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return NextResponse.json({
        overview: {
          total_revenue: totalRevenue,
          total_orders: totalOrders,
          average_order_value: Math.round(avgOrderValue * 100) / 100,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
