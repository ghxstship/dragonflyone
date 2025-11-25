// apps/atlvs/src/app/api/advancing/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/advancing/analytics
 * Get analytics data for advancing requests
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const orgId = request.headers.get('x-organization-id');

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID required' },
        { status: 400 }
      );
    }

    // Build base query
    let query = supabaseAdmin
      .from('production_advances')
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: advances, error, count } = await query;

    if (error) {
      console.error('Error fetching advances for analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data', details: error.message },
        { status: 500 }
      );
    }

    // Calculate metrics
    type AdvanceRecord = { id: string; status: string; estimated_cost: number | null; actual_cost: number | null };
    type ItemRecord = { item_name: string; catalog_item_id: string | null; quantity: number };
    
    const totalRequests = count || 0;
    const statusCounts = (advances as AdvanceRecord[] | null)?.reduce((acc: Record<string, number>, adv) => {
      const status = adv.status as string;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalEstimatedCost = (advances as AdvanceRecord[] | null)?.reduce(
      (sum: number, adv) => sum + (adv.estimated_cost || 0),
      0
    ) || 0;

    const totalActualCost = (advances as AdvanceRecord[] | null)?.reduce(
      (sum: number, adv) => sum + (adv.actual_cost || 0),
      0
    ) || 0;

    const avgEstimatedCost = totalRequests > 0 ? totalEstimatedCost / totalRequests : 0;
    const avgActualCost = totalRequests > 0 ? totalActualCost / totalRequests : 0;

    // Fetch most requested items
    const { data: items } = await supabaseAdmin
      .from('production_advance_items')
      .select('item_name, catalog_item_id, quantity')
      .in(
        'advance_id',
        (advances as AdvanceRecord[] | null)?.map((a) => a.id) || []
      );

    const itemCounts = (items as ItemRecord[] | null)?.reduce((acc: Record<string, number>, item) => {
      const key = (item.catalog_item_id || item.item_name) as string;
      acc[key] = (acc[key] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>) || {};

    const topItems = Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      data: {
        totalRequests,
        statusCounts,
        costs: {
          totalEstimated: totalEstimatedCost,
          totalActual: totalActualCost,
          avgEstimated: avgEstimatedCost,
          avgActual: avgActualCost,
          variance: totalActualCost - totalEstimatedCost,
          variancePercent:
            totalEstimatedCost > 0
              ? ((totalActualCost - totalEstimatedCost) / totalEstimatedCost) * 100
              : 0,
        },
        topItems,
        timeRange: {
          start: startDate,
          end: endDate,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in analytics route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
