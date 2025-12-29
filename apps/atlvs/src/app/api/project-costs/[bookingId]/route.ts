import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createAdminClient();
    const bookingId = params.bookingId;

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, booking_number, event_name, estimated_revenue, budget')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Get project costs
    const { data: costs, error: costsError } = await supabase
      .from('project_costs')
      .select(`
        id,
        cost_type,
        category,
        description,
        vendor_id,
        vendor_profile:vendor_profiles(id, name),
        budgeted_amount,
        actual_amount,
        variance,
        status,
        notes,
        created_at
      `)
      .eq('booking_id', bookingId)
      .order('category', { ascending: true });

    if (costsError) {
      return NextResponse.json(
        { error: 'Failed to fetch project costs' },
        { status: 500 }
      );
    }

    // Get vendor invoices for this booking
    const { data: invoices, error: invoicesError } = await supabase
      .from('vendor_invoices')
      .select('id, invoice_number, total_amount, status, vendor_profile:vendor_profiles(id, name)')
      .eq('booking_id', bookingId);

    if (invoicesError) {
      // Continue without invoices
    }

    // Calculate totals
    const totalBudgeted = costs?.reduce((sum, c) => sum + (c.budgeted_amount || 0), 0) || 0;
    const totalActual = costs?.reduce((sum, c) => sum + (c.actual_amount || 0), 0) || 0;
    const totalVariance = totalBudgeted - totalActual;
    const variancePercent = totalBudgeted > 0 ? ((totalVariance / totalBudgeted) * 100) : 0;

    // Group costs by category
    const costsByCategory: Record<string, typeof costs> = {};
    costs?.forEach(cost => {
      const category = cost.category || 'Uncategorized';
      if (!costsByCategory[category]) {
        costsByCategory[category] = [];
      }
      costsByCategory[category].push(cost);
    });

    // Calculate category totals
    const categoryTotals = Object.entries(costsByCategory).map(([category, items]) => ({
      category,
      budgeted: items.reduce((sum, c) => sum + (c.budgeted_amount || 0), 0),
      actual: items.reduce((sum, c) => sum + (c.actual_amount || 0), 0),
      variance: items.reduce((sum, c) => sum + (c.variance || 0), 0),
      item_count: items.length,
    }));

    // Calculate projected profit
    const estimatedRevenue = booking.estimated_revenue || 0;
    const projectedProfit = estimatedRevenue - totalActual;
    const projectedMargin = estimatedRevenue > 0 ? ((projectedProfit / estimatedRevenue) * 100) : 0;

    return NextResponse.json({
      booking: {
        id: booking.id,
        booking_number: booking.booking_number,
        event_name: booking.event_name,
        estimated_revenue: estimatedRevenue,
        budget: booking.budget,
      },
      costs: costs || [],
      invoices: invoices || [],
      summary: {
        total_budgeted: totalBudgeted,
        total_actual: totalActual,
        total_variance: totalVariance,
        variance_percent: parseFloat(variancePercent.toFixed(1)),
        is_over_budget: totalVariance < 0,
        projected_profit: projectedProfit,
        projected_margin: parseFloat(projectedMargin.toFixed(1)),
      },
      by_category: categoryTotals,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
