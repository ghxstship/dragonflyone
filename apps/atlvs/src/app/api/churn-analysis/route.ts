import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Client retention and churn analysis
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '12'; // months

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(period));

    // Get all clients
    const { data: clients } = await supabase.from('contacts').select('*')
      .eq('type', 'client').lte('created_at', startDate.toISOString());

    // Get churned clients (no activity in last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: recentProjects } = await supabase.from('projects').select('client_id')
      .gte('created_at', sixMonthsAgo.toISOString());

    const activeClientIds = new Set(recentProjects?.map(p => p.client_id) || []);
    const churnedClients = clients?.filter(c => !activeClientIds.has(c.id)) || [];

    // Calculate monthly churn
    const monthlyChurn: any[] = [];
    for (let i = 0; i < parseInt(period); i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i - 1);
      const monthEnd = new Date();
      monthEnd.setMonth(monthEnd.getMonth() - i);

      const { data: monthClients } = await supabase.from('contacts').select('id')
        .eq('type', 'client').lte('created_at', monthStart.toISOString());

      const { data: monthProjects } = await supabase.from('projects').select('client_id')
        .gte('created_at', monthStart.toISOString()).lte('created_at', monthEnd.toISOString());

      const monthActiveIds = new Set(monthProjects?.map(p => p.client_id) || []);
      const monthChurned = monthClients?.filter(c => !monthActiveIds.has(c.id)).length || 0;

      monthlyChurn.unshift({
        month: monthStart.toISOString().substring(0, 7),
        total_clients: monthClients?.length || 0,
        churned: monthChurned,
        churn_rate: monthClients?.length ? Math.round((monthChurned / monthClients.length) * 100) : 0
      });
    }

    // Churn reasons analysis
    const { data: churnReasons } = await supabase.from('client_churn_records').select('reason, count')
      .gte('churned_at', startDate.toISOString());

    const reasonCounts = churnReasons?.reduce((acc: any, r) => {
      acc[r.reason] = (acc[r.reason] || 0) + 1;
      return acc;
    }, {}) || {};

    // Retention rate
    const retentionRate = clients?.length ? Math.round(((clients.length - churnedClients.length) / clients.length) * 100) : 100;

    return NextResponse.json({
      summary: {
        total_clients: clients?.length || 0,
        active_clients: activeClientIds.size,
        churned_clients: churnedClients.length,
        retention_rate: retentionRate,
        churn_rate: 100 - retentionRate
      },
      monthly_trend: monthlyChurn,
      churn_reasons: reasonCounts,
      at_risk_clients: await getAtRiskClients()
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch churn data' }, { status: 500 });
  }
}

async function getAtRiskClients() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const { data: clients } = await supabase.from('contacts').select('id, name, company')
    .eq('type', 'client');

  const { data: recentActivity } = await supabase.from('projects').select('client_id')
    .gte('created_at', threeMonthsAgo.toISOString());

  const activeIds = new Set(recentActivity?.map(p => p.client_id) || []);
  
  return clients?.filter(c => !activeIds.has(c.id)).slice(0, 10) || [];
}
