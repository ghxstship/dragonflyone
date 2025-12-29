export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const periodType = searchParams.get('period_type') || 'monthly';
    const limit = parseInt(searchParams.get('limit') || '12');

    const { data: metrics, error } = await supabase
      .from('vendor_metrics')
      .select('*')
      .eq('vendor_profile_id', id)
      .eq('period_type', periodType)
      .order('metric_period', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const [ordersResult, issuesResult, reviewsResult] = await Promise.all([
      supabase
        .from('vendor_orders')
        .select('status, total', { count: 'exact' })
        .eq('vendor_profile_id', id),
      supabase
        .from('vendor_issues')
        .select('severity, status', { count: 'exact' })
        .eq('vendor_profile_id', id),
      supabase
        .from('vendor_reviews')
        .select('overall_rating')
        .eq('vendor_profile_id', id)
        .eq('status', 'published'),
    ]);

    const orders = ordersResult.data || [];
    const issues = issuesResult.data || [];
    const reviews = reviewsResult.data || [];

    const summary = {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      completed_orders: orders.filter(o => o.status === 'completed').length,
      open_issues: issues.filter(i => i.status === 'open' || i.status === 'in_progress').length,
      critical_issues: issues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length,
      average_rating: reviews.length
        ? reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length
        : 0,
      total_reviews: reviews.length,
    };

    return NextResponse.json({ metrics, summary });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
