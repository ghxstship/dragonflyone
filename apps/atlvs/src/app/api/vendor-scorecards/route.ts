import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
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
        .from('purchase_orders')
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
      receipts?.forEach(r => {
        const po = r.purchase_order as any;
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
      const { data: vendors } = await supabase
        .from('vendors')
        .select('id, name, category, rating')
        .eq('status', 'active');

      const scorecards = [];
      for (const vendor of vendors || []) {
        const { data: pos } = await supabase
          .from('purchase_orders')
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

      if (category) {
        const filtered = scorecards.filter(s => s.category === category);
        return NextResponse.json({ scorecards: filtered.sort((a, b) => b.quality_score - a.quality_score) });
      }

      return NextResponse.json({ scorecards: scorecards.sort((a, b) => b.quality_score - a.quality_score) });
    }

    const { data: vendors } = await supabase
      .from('vendors')
      .select('id, name, category, rating')
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .limit(20);

    return NextResponse.json({ top_vendors: vendors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
