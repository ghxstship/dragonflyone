import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const months = parseInt(searchParams.get('months') || '12');

    if (type === 'retention') {
      const { data: clients } = await supabase
        .from('contacts')
        .select('id, created_at')
        .eq('type', 'client')
        .gte('created_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: invoices } = await supabase
        .from('invoices')
        .select('client_id, created_at')
        .eq('status', 'paid')
        .gte('created_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString());

      // Group clients by acquisition month
      const cohorts: Record<string, { clients: Set<string>; activity: Record<string, Set<string>> }> = {};

      clients?.forEach(client => {
        const cohortMonth = client.created_at.substring(0, 7);
        if (!cohorts[cohortMonth]) {
          cohorts[cohortMonth] = { clients: new Set(), activity: {} };
        }
        cohorts[cohortMonth].clients.add(client.id);
      });

      // Track activity by month for each cohort
      invoices?.forEach(inv => {
        const activityMonth = inv.created_at.substring(0, 7);
        Object.entries(cohorts).forEach(([cohortMonth, cohort]) => {
          if (cohort.clients.has(inv.client_id)) {
            if (!cohort.activity[activityMonth]) {
              cohort.activity[activityMonth] = new Set();
            }
            cohort.activity[activityMonth].add(inv.client_id);
          }
        });
      });

      // Build retention matrix
      const retentionMatrix = Object.entries(cohorts)
        .map(([cohortMonth, cohort]) => {
          const cohortSize = cohort.clients.size;
          const retention: Record<string, number> = {};

          Object.entries(cohort.activity).forEach(([activityMonth, activeClients]) => {
            const monthsAfter = (new Date(activityMonth).getFullYear() - new Date(cohortMonth).getFullYear()) * 12 +
              (new Date(activityMonth).getMonth() - new Date(cohortMonth).getMonth());
            if (monthsAfter >= 0) {
              retention[`month_${monthsAfter}`] = cohortSize > 0 
                ? Math.round((activeClients.size / cohortSize) * 10000) / 100 
                : 0;
            }
          });

          return {
            cohort: cohortMonth,
            cohort_size: cohortSize,
            retention,
          };
        })
        .sort((a, b) => a.cohort.localeCompare(b.cohort));

      return NextResponse.json({ type: 'retention', cohorts: retentionMatrix });
    }

    if (type === 'revenue') {
      const { data: clients } = await supabase
        .from('contacts')
        .select('id, created_at')
        .eq('type', 'client')
        .gte('created_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: invoices } = await supabase
        .from('invoices')
        .select('client_id, total_amount, created_at')
        .eq('status', 'paid')
        .gte('created_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString());

      // Group clients by acquisition month
      const cohorts: Record<string, { clients: Set<string>; revenue: Record<string, number> }> = {};

      clients?.forEach(client => {
        const cohortMonth = client.created_at.substring(0, 7);
        if (!cohorts[cohortMonth]) {
          cohorts[cohortMonth] = { clients: new Set(), revenue: {} };
        }
        cohorts[cohortMonth].clients.add(client.id);
      });

      // Track revenue by month for each cohort
      invoices?.forEach(inv => {
        const activityMonth = inv.created_at.substring(0, 7);
        Object.entries(cohorts).forEach(([cohortMonth, cohort]) => {
          if (cohort.clients.has(inv.client_id)) {
            cohort.revenue[activityMonth] = (cohort.revenue[activityMonth] || 0) + inv.total_amount;
          }
        });
      });

      // Build revenue matrix
      const revenueMatrix = Object.entries(cohorts)
        .map(([cohortMonth, cohort]) => {
          const cohortSize = cohort.clients.size;
          const revenueByMonth: Record<string, number> = {};
          let totalRevenue = 0;

          Object.entries(cohort.revenue).forEach(([activityMonth, revenue]) => {
            const monthsAfter = (new Date(activityMonth).getFullYear() - new Date(cohortMonth).getFullYear()) * 12 +
              (new Date(activityMonth).getMonth() - new Date(cohortMonth).getMonth());
            if (monthsAfter >= 0) {
              revenueByMonth[`month_${monthsAfter}`] = Math.round(revenue * 100) / 100;
              totalRevenue += revenue;
            }
          });

          return {
            cohort: cohortMonth,
            cohort_size: cohortSize,
            total_revenue: Math.round(totalRevenue * 100) / 100,
            avg_revenue_per_client: cohortSize > 0 ? Math.round((totalRevenue / cohortSize) * 100) / 100 : 0,
            revenue_by_month: revenueByMonth,
          };
        })
        .sort((a, b) => a.cohort.localeCompare(b.cohort));

      return NextResponse.json({ type: 'revenue', cohorts: revenueMatrix });
    }

    if (type === 'ltv') {
      const { data: clients } = await supabase
        .from('contacts')
        .select('id, created_at')
        .eq('type', 'client');

      const { data: invoices } = await supabase
        .from('invoices')
        .select('client_id, total_amount')
        .eq('status', 'paid');

      // Calculate LTV by acquisition cohort
      const cohorts: Record<string, { clients: string[]; totalRevenue: number }> = {};

      clients?.forEach(client => {
        const cohortMonth = client.created_at.substring(0, 7);
        if (!cohorts[cohortMonth]) {
          cohorts[cohortMonth] = { clients: [], totalRevenue: 0 };
        }
        cohorts[cohortMonth].clients.push(client.id);
      });

      invoices?.forEach(inv => {
        Object.values(cohorts).forEach(cohort => {
          if (cohort.clients.includes(inv.client_id)) {
            cohort.totalRevenue += inv.total_amount;
          }
        });
      });

      const ltvByCohort = Object.entries(cohorts)
        .map(([cohortMonth, cohort]) => ({
          cohort: cohortMonth,
          client_count: cohort.clients.length,
          total_revenue: Math.round(cohort.totalRevenue * 100) / 100,
          avg_ltv: cohort.clients.length > 0 
            ? Math.round((cohort.totalRevenue / cohort.clients.length) * 100) / 100 
            : 0,
        }))
        .sort((a, b) => a.cohort.localeCompare(b.cohort));

      return NextResponse.json({ type: 'ltv', cohorts: ltvByCohort });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
