export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.ATLVS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
];

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || new Date(new Date().getFullYear(), 0, 1).toISOString();
    const endDate = searchParams.get('end_date') || new Date().toISOString();
    const organizationId = searchParams.get('organization_id');

    let revenueQuery = supabase
      .from('invoices')
      .select('total_amount')
      .eq('status', 'paid')
      .gte('paid_at', startDate)
      .lte('paid_at', endDate);

    let expenseQuery = supabase
      .from('expenses')
      .select('amount')
      .gte('date', startDate)
      .lte('date', endDate);

    if (organizationId) {
      revenueQuery = revenueQuery.eq('organization_id', organizationId);
      expenseQuery = expenseQuery.eq('organization_id', organizationId);
    }

    const [revenueResult, expenseResult] = await Promise.all([
      revenueQuery,
      expenseQuery,
    ]);

    const totalRevenue = (revenueResult.data || []).reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const totalExpenses = (expenseResult.data || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return NextResponse.json({
      report: {
        period: { start_date: startDate, end_date: endDate },
        revenue: {
          total: totalRevenue,
          invoice_count: revenueResult.data?.length || 0 },
        expenses: {
          total: totalExpenses,
          expense_count: expenseResult.data?.length || 0 },
        net_profit: netProfit,
        profit_margin: Math.round(profitMargin * 100) / 100 } });
  } catch (error) {
    logger.error('Error in GET /api/reports/profit-loss:', error instanceof Error ? error : undefined);
    return NextResponse.json({
      report: {
        period: { start_date: null, end_date: null },
        revenue: { total: 0, invoice_count: 0 },
        expenses: { total: 0, expense_count: 0 },
        net_profit: 0,
        profit_margin: 0 } });
  }
}
