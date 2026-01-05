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

    let inflowQuery = supabase
      .from('payments')
      .select('amount, payment_date, payment_type')
      .eq('direction', 'inflow')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate);

    let outflowQuery = supabase
      .from('payments')
      .select('amount, payment_date, payment_type')
      .eq('direction', 'outflow')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate);

    if (organizationId) {
      inflowQuery = inflowQuery.eq('organization_id', organizationId);
      outflowQuery = outflowQuery.eq('organization_id', organizationId);
    }

    const [inflowResult, outflowResult] = await Promise.all([
      inflowQuery,
      outflowQuery,
    ]);

    const totalInflow = (inflowResult.data || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOutflow = (outflowResult.data || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    const netCashFlow = totalInflow - totalOutflow;

    const inflowByType = (inflowResult.data || []).reduce((acc, p) => {
      const type = p.payment_type || 'other';
      acc[type] = (acc[type] || 0) + (p.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const outflowByType = (outflowResult.data || []).reduce((acc, p) => {
      const type = p.payment_type || 'other';
      acc[type] = (acc[type] || 0) + (p.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      report: {
        period: { start_date: startDate, end_date: endDate },
        inflow: {
          total: totalInflow,
          count: inflowResult.data?.length || 0,
          by_type: inflowByType },
        outflow: {
          total: totalOutflow,
          count: outflowResult.data?.length || 0,
          by_type: outflowByType },
        net_cash_flow: netCashFlow } });
  } catch (error) {
    logger.error('Error in GET /api/reports/cash-flow:', error instanceof Error ? error : undefined);
    return NextResponse.json({
      report: {
        period: { start_date: null, end_date: null },
        inflow: { total: 0, count: 0, by_type: {} },
        outflow: { total: 0, count: 0, by_type: {} },
        net_cash_flow: 0 } });
  }
}
