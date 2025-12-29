import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const vendorId = params.id;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '12m';

    // Get vendor details
    const { data: vendor, error: vendorError } = await supabase
      .from('vendor_profiles')
      .select('id, name, company_name, rating, status')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '3m':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '6m':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1y':
      case '12m':
      default:
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    // Get completed orders for this vendor
    const { data: orders, error: ordersError } = await supabase
      .from('vendor_orders')
      .select('id, total_amount, status, created_at, completed_at')
      .eq('vendor_profile_id', vendorId)
      .gte('created_at', startDate.toISOString());

    if (ordersError) {
      // Continue with empty orders array
    }

    // Get vendor reviews/ratings
    const { data: reviews, error: reviewsError } = await supabase
      .from('vendor_reviews')
      .select('id, rating, review_text, reviewer_name, created_at')
      .eq('vendor_profile_id', vendorId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (reviewsError) {
      // Continue with empty reviews array
    }

    // Get vendor issues/incidents
    const { data: issues, error: issuesError } = await supabase
      .from('vendor_issues')
      .select('id, issue_type, severity, status, resolved_at, created_at')
      .eq('vendor_profile_id', vendorId)
      .gte('created_at', startDate.toISOString());

    if (issuesError) {
      // Continue with empty issues array
    }

    // Calculate performance metrics
    const completedOrders = orders?.filter(o => o.status === 'completed') || [];
    const totalOrders = orders?.length || 0;
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const completionRate = totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;

    // Calculate average rating
    const ratings = reviews?.map(r => r.rating) || [];
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
      : vendor.rating || 0;

    // Calculate on-time delivery rate (simplified)
    const onTimeOrders = completedOrders.filter(o => {
      if (!o.completed_at) return false;
      // Assume orders should be completed within 30 days
      const orderDate = new Date(o.created_at);
      const completedDate = new Date(o.completed_at);
      const daysDiff = (completedDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });
    const onTimeRate = completedOrders.length > 0 
      ? (onTimeOrders.length / completedOrders.length) * 100 
      : 100;

    // Issue analysis
    const openIssues = issues?.filter(i => i.status !== 'resolved').length || 0;
    const resolvedIssues = issues?.filter(i => i.status === 'resolved').length || 0;
    const criticalIssues = issues?.filter(i => i.severity === 'critical').length || 0;

    // Monthly performance trend
    const monthlyPerformance: Array<{ month: string; orders: number; revenue: number }> = [];
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthOrders = completedOrders.filter(o => {
        const orderDate = new Date(o.completed_at || o.created_at);
        return orderDate >= monthStart && orderDate < monthEnd;
      });

      monthlyPerformance.unshift({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
      });
    }

    return NextResponse.json({
      vendor: {
        id: vendor.id,
        name: vendor.name || vendor.company_name,
        status: vendor.status,
      },
      metrics: {
        average_rating: parseFloat(averageRating.toFixed(1)),
        total_orders: totalOrders,
        completed_orders: completedOrders.length,
        total_revenue: totalRevenue,
        completion_rate: parseFloat(completionRate.toFixed(1)),
        on_time_rate: parseFloat(onTimeRate.toFixed(1)),
        review_count: reviews?.length || 0,
      },
      issues: {
        total: issues?.length || 0,
        open: openIssues,
        resolved: resolvedIssues,
        critical: criticalIssues,
      },
      recent_reviews: reviews || [],
      monthly_trend: monthlyPerformance,
      period,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
