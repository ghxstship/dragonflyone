export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth, PlatformRole, logger } from '@ghxstship/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GVTEWAY_ROLES = [
  PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_VENUE_MANAGER, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - GVTEWAY access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const locationId = searchParams.get('location_id');

    let query = supabase
      .from('pos_transactions')
      .select('id, total, payment_method, created_at, terminal:pos_terminals(id, name, venue_id)')
      .eq('status', 'completed');

    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data: transactions, error } = await query;

    if (error) {
      logger.error('Error fetching sales data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const filteredTransactions = locationId 
      ? transactions?.filter(t => {
          const terminal = t.terminal as unknown as { venue_id: string } | null;
          return terminal?.venue_id === locationId;
        }) 
      : transactions;

    const totalSales = filteredTransactions?.reduce((sum, t) => sum + (t.total || 0), 0) || 0;
    const transactionCount = filteredTransactions?.length || 0;
    const averageTransaction = transactionCount > 0 ? totalSales / transactionCount : 0;

    const paymentBreakdown = filteredTransactions?.reduce((acc, t) => {
      const method = t.payment_method || 'other';
      acc[method] = (acc[method] || 0) + (t.total || 0);
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      data: {
        total_sales: totalSales,
        transaction_count: transactionCount,
        average_transaction: averageTransaction,
        payment_breakdown: paymentBreakdown,
        transactions: filteredTransactions?.slice(0, 100) || [],
      }
    });
  } catch (error) {
    logger.error('Error in GET /api/admin/sales:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 });
  }
}
