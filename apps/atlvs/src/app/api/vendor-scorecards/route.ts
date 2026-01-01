export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const vendorId = searchParams.get('vendor_id');
    const category = searchParams.get('category');

    if (type === 'scorecard' && vendorId) {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      const { data: pos } = await supabase
        .from('finance_purchase_orders')
        .select('total_amount, status, created_at, expected_delivery')
        .eq('vendor_id', vendorId)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      const { data: receipts } = await supabase
        .from('po_receipts')
        .select('received_date, purchase_order:purchase_orders!inner(vendor_id, expected_delivery)')
        .eq('purchase_order.vendor_id', vendorId);

      const totalPOs = pos?.length || 0;
      const completedPOs = pos?.filter(p => ['received', 'completed'].includes(p.status)).length || 0;
      const totalSpend = pos?.reduce((sum, p) => sum + p.total_amount, 0) || 0;

      let onTimeDeliveries = 0;
      let lateDeliveries = 0;
      interface PurchaseOrderData { expected_delivery?: string }
      receipts?.forEach(r => {
        const po = r.purchase_order as PurchaseOrderData | null;
        if (po?.expected_delivery) {
          if (new Date(r.received_date) <= new Date(po.expected_delivery)) {
            onTimeDeliveries++;
          } else {
            lateDeliveries++;
          }
        }
      });

      const deliveryScore = (onTimeDeliveries + lateDeliveries) > 0 
        ? Math.round((onTimeDeliveries / (onTimeDeliveries + lateDeliveries)) * 100) 
        : 100;

      const qualityScore = vendor?.rating ? Math.round(vendor.rating * 20) : 80;
      const overallScore = Math.round((deliveryScore + qualityScore) / 2);

      return NextResponse.json({
        vendor,
        scorecard: {
          overall_score: overallScore,
          delivery_score: deliveryScore,
          quality_score: qualityScore,
          total_pos: totalPOs,
          completed_pos: completedPOs,
          total_spend: totalSpend,
          on_time_deliveries: onTimeDeliveries,
          late_deliveries: lateDeliveries,
        },
      });
    }

    if (type === 'comparison') {
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '50', 10);
      const offset = (page - 1) * limit;

      let vendorQuery = supabase
        .from('vendors')
        .select('id, name, category, rating', { count: 'exact' })
        .eq('status', 'active');

      if (category) {
        vendorQuery = vendorQuery.eq('category', category);
      }

      const { data: vendors, count } = await vendorQuery
        .order('rating', { ascending: false })
        .range(offset, offset + limit - 1);

      const scorecards = [];
      for (const vendor of vendors || []) {
        const { data: pos } = await supabase
          .from('finance_purchase_orders')
          .select('total_amount, status')
          .eq('vendor_id', vendor.id)
          .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

        const totalSpend = pos?.reduce((sum, p) => sum + p.total_amount, 0) || 0;
        const qualityScore = vendor.rating ? Math.round(vendor.rating * 20) : 80;

        scorecards.push({
          vendor_id: vendor.id,
          vendor_name: vendor.name,
          category: vendor.category,
          quality_score: qualityScore,
          total_spend: totalSpend,
          po_count: pos?.length || 0,
        });
      }

      const totalCount = count || (scorecards.length ?? 0);
      const pagination = {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: offset + scorecards.length < totalCount,
      };

      return NextResponse.json({ scorecards: scorecards.sort((a, b) => b.quality_score - a.quality_score), pagination });
    }

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const { data: vendors, count } = await supabase
      .from('vendors')
      .select('id, name, category, rating', { count: 'exact' })
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1);

    const totalCount = count || (vendors?.length ?? 0);
    const pagination = {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: offset + (vendors?.length ?? 0) < totalCount,
    };

    return NextResponse.json({ top_vendors: vendors, pagination });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
