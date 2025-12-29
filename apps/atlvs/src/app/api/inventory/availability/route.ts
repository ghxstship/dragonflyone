import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const itemId = searchParams.get('item_id');
    const categoryId = searchParams.get('category_id');

    // Build inventory items query
    let query = supabase
      .from('inventory_items')
      .select(`
        id,
        name,
        sku,
        category,
        quantity_total,
        quantity_available,
        unit_cost,
        status
      `)
      .eq('status', 'active');

    if (itemId) {
      query = query.eq('id', itemId);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data: items, error: itemsError } = await query;

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to fetch inventory items' },
        { status: 500 }
      );
    }

    // If date range provided, check for reservations
    const reservedQuantities: Record<string, number> = {};
    
    if (startDate && endDate) {
      const { data: transactions, error: txError } = await supabase
        .from('inventory_transactions')
        .select('inventory_item_id, quantity, transaction_type, expected_return_date')
        .eq('transaction_type', 'check_out')
        .is('returned_at', null)
        .or(`expected_return_date.gte.${startDate},expected_return_date.is.null`);

      if (!txError && transactions) {
        transactions.forEach((tx) => {
          if (!reservedQuantities[tx.inventory_item_id]) {
            reservedQuantities[tx.inventory_item_id] = 0;
          }
          reservedQuantities[tx.inventory_item_id] += tx.quantity;
        });
      }
    }

    // Calculate availability for each item
    const availability = items?.map((item) => {
      const reserved = reservedQuantities[item.id] || 0;
      const available = Math.max(0, (item.quantity_available || 0) - reserved);
      const utilizationRate = item.quantity_total > 0 
        ? ((item.quantity_total - available) / item.quantity_total) * 100 
        : 0;

      return {
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity_total: item.quantity_total,
        quantity_available: item.quantity_available,
        quantity_reserved: reserved,
        quantity_free: available,
        utilization_rate: parseFloat(utilizationRate.toFixed(1)),
        is_available: available > 0,
        unit_cost: item.unit_cost,
      };
    }) || [];

    // Calculate summary stats
    const totalItems = availability.length;
    const availableItems = availability.filter((a) => a.is_available).length;
    const fullyBookedItems = availability.filter((a) => !a.is_available).length;
    const avgUtilization = totalItems > 0
      ? availability.reduce((sum, a) => sum + a.utilization_rate, 0) / totalItems
      : 0;

    return NextResponse.json({
      items: availability,
      summary: {
        total_items: totalItems,
        available_items: availableItems,
        fully_booked_items: fullyBookedItems,
        average_utilization: parseFloat(avgUtilization.toFixed(1)),
      },
      date_range: startDate && endDate ? { start: startDate, end: endDate } : null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
