import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// GET - Get procurement analytics and spend analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'category' | 'vendor' | 'trend' | 'savings' | 'diversity'
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end_date') || new Date().toISOString();

    if (type === 'category') {
      // Spend analysis by category
      const { data: pos, error } = await supabase
        .from('purchase_orders')
        .select(`
          total_amount,
          category,
          items:po_line_items(category, total_price)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .in('status', ['approved', 'sent', 'received', 'completed']);

      if (error) throw error;

      // Aggregate by category
      const byCategory: Record<string, { spend: number; count: number }> = {};

      pos?.forEach(po => {
        const category = po.category || 'Uncategorized';
        if (!byCategory[category]) byCategory[category] = { spend: 0, count: 0 };
        byCategory[category].spend += po.total_amount;
        byCategory[category].count++;
      });

      const totalSpend = Object.values(byCategory).reduce((sum, c) => sum + c.spend, 0);

      const categoryAnalysis = Object.entries(byCategory).map(([cat, data]) => ({
        category: cat,
        spend: data.spend,
        count: data.count,
        percentage: totalSpend > 0 ? Math.round((data.spend / totalSpend) * 10000) / 100 : 0,
      })).sort((a, b) => b.spend - a.spend);

      return NextResponse.json({
        by_category: categoryAnalysis,
        total_spend: totalSpend,
        category_count: categoryAnalysis.length,
      });
    }

    if (type === 'vendor') {
      // Spend analysis by vendor
      const { data: pos, error } = await supabase
        .from('purchase_orders')
        .select(`
          total_amount,
          vendor_id,
          vendor:vendors(id, name, category)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .in('status', ['approved', 'sent', 'received', 'completed']);

      if (error) throw error;

      // Aggregate by vendor
      const byVendor: Record<string, { name: string; spend: number; count: number; category: string }> = {};

      pos?.forEach(po => {
        const vendorId = po.vendor_id;
        const vendor = po.vendor as any;
        if (!byVendor[vendorId]) {
          byVendor[vendorId] = {
            name: vendor?.name || 'Unknown',
            spend: 0,
            count: 0,
            category: vendor?.category || 'Uncategorized',
          };
        }
        byVendor[vendorId].spend += po.total_amount;
        byVendor[vendorId].count++;
      });

      const totalSpend = Object.values(byVendor).reduce((sum, v) => sum + v.spend, 0);

      const vendorAnalysis = Object.entries(byVendor).map(([id, data]) => ({
        vendor_id: id,
        vendor_name: data.name,
        category: data.category,
        spend: data.spend,
        po_count: data.count,
        percentage: totalSpend > 0 ? Math.round((data.spend / totalSpend) * 10000) / 100 : 0,
        average_po_value: data.count > 0 ? Math.round(data.spend / data.count * 100) / 100 : 0,
      })).sort((a, b) => b.spend - a.spend);

      // Top 10 vendors
      const top10 = vendorAnalysis.slice(0, 10);
      const top10Spend = top10.reduce((sum, v) => sum + v.spend, 0);

      return NextResponse.json({
        by_vendor: vendorAnalysis,
        top_10_vendors: top10,
        top_10_concentration: totalSpend > 0 ? Math.round((top10Spend / totalSpend) * 10000) / 100 : 0,
        total_spend: totalSpend,
        vendor_count: vendorAnalysis.length,
      });
    }

    if (type === 'trend') {
      // Spend trend over time
      const { data: pos, error } = await supabase
        .from('purchase_orders')
        .select('total_amount, created_at, category')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .in('status', ['approved', 'sent', 'received', 'completed'])
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by month
      const byMonth: Record<string, { spend: number; count: number }> = {};

      pos?.forEach(po => {
        const month = po.created_at.substring(0, 7);
        if (!byMonth[month]) byMonth[month] = { spend: 0, count: 0 };
        byMonth[month].spend += po.total_amount;
        byMonth[month].count++;
      });

      const trend = Object.entries(byMonth).map(([month, data]) => ({
        month,
        spend: data.spend,
        count: data.count,
      })).sort((a, b) => a.month.localeCompare(b.month));

      // Calculate MoM growth
      const trendWithGrowth = trend.map((t, i) => ({
        ...t,
        mom_growth: i > 0 && trend[i - 1].spend > 0 
          ? Math.round(((t.spend - trend[i - 1].spend) / trend[i - 1].spend) * 10000) / 100 
          : 0,
      }));

      // Calculate average monthly spend
      const avgMonthlySpend = trend.length > 0 
        ? trend.reduce((sum, t) => sum + t.spend, 0) / trend.length 
        : 0;

      return NextResponse.json({
        trend: trendWithGrowth,
        average_monthly_spend: Math.round(avgMonthlySpend * 100) / 100,
        total_spend: trend.reduce((sum, t) => sum + t.spend, 0),
      });
    }

    if (type === 'savings') {
      // Savings analysis
      const { data: pos, error } = await supabase
        .from('purchase_orders')
        .select(`
          total_amount,
          original_amount,
          discount_amount,
          vendor_id,
          vendor:vendors(id, name)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .in('status', ['approved', 'sent', 'received', 'completed']);

      if (error) throw error;

      // Calculate savings
      let totalOriginal = 0;
      let totalActual = 0;
      let totalDiscount = 0;

      const savingsByVendor: Record<string, { name: string; original: number; actual: number; savings: number }> = {};

      pos?.forEach(po => {
        const original = po.original_amount || po.total_amount;
        const actual = po.total_amount;
        const discount = po.discount_amount || 0;

        totalOriginal += original;
        totalActual += actual;
        totalDiscount += discount;

        const vendorId = po.vendor_id;
        const vendor = po.vendor as any;
        if (!savingsByVendor[vendorId]) {
          savingsByVendor[vendorId] = {
            name: vendor?.name || 'Unknown',
            original: 0,
            actual: 0,
            savings: 0,
          };
        }
        savingsByVendor[vendorId].original += original;
        savingsByVendor[vendorId].actual += actual;
        savingsByVendor[vendorId].savings += original - actual;
      });

      const vendorSavings = Object.entries(savingsByVendor)
        .map(([id, data]) => ({
          vendor_id: id,
          vendor_name: data.name,
          original_spend: data.original,
          actual_spend: data.actual,
          savings: data.savings,
          savings_percentage: data.original > 0 
            ? Math.round((data.savings / data.original) * 10000) / 100 
            : 0,
        }))
        .filter(v => v.savings > 0)
        .sort((a, b) => b.savings - a.savings);

      return NextResponse.json({
        savings_summary: {
          total_original: totalOriginal,
          total_actual: totalActual,
          total_savings: totalOriginal - totalActual,
          total_discounts: totalDiscount,
          savings_percentage: totalOriginal > 0 
            ? Math.round(((totalOriginal - totalActual) / totalOriginal) * 10000) / 100 
            : 0,
        },
        by_vendor: vendorSavings,
      });
    }

    if (type === 'diversity') {
      // Supplier diversity tracking
      const { data: vendors, error } = await supabase
        .from('vendors')
        .select(`
          id,
          name,
          diversity_classification,
          purchase_orders(total_amount, created_at, status)
        `);

      if (error) throw error;

      // Calculate spend by diversity classification
      const byClassification: Record<string, { vendors: number; spend: number }> = {};

      vendors?.forEach(vendor => {
        const classification = vendor.diversity_classification || 'Non-Diverse';
        const vendorSpend = (vendor.purchase_orders as any[])
          ?.filter(po => 
            po.status && ['approved', 'sent', 'received', 'completed'].includes(po.status) &&
            po.created_at >= startDate && po.created_at <= endDate
          )
          .reduce((sum, po) => sum + po.total_amount, 0) || 0;

        if (!byClassification[classification]) {
          byClassification[classification] = { vendors: 0, spend: 0 };
        }
        byClassification[classification].vendors++;
        byClassification[classification].spend += vendorSpend;
      });

      const totalSpend = Object.values(byClassification).reduce((sum, c) => sum + c.spend, 0);
      const diverseSpend = Object.entries(byClassification)
        .filter(([key]) => key !== 'Non-Diverse')
        .reduce((sum, [, data]) => sum + data.spend, 0);

      const diversityReport = Object.entries(byClassification).map(([classification, data]) => ({
        classification,
        vendor_count: data.vendors,
        spend: data.spend,
        percentage: totalSpend > 0 ? Math.round((data.spend / totalSpend) * 10000) / 100 : 0,
      })).sort((a, b) => b.spend - a.spend);

      return NextResponse.json({
        diversity_report: diversityReport,
        summary: {
          total_spend: totalSpend,
          diverse_spend: diverseSpend,
          diverse_percentage: totalSpend > 0 
            ? Math.round((diverseSpend / totalSpend) * 10000) / 100 
            : 0,
          total_vendors: vendors?.length || 0,
          diverse_vendors: vendors?.filter(v => v.diversity_classification && v.diversity_classification !== 'Non-Diverse').length || 0,
        },
      });
    }

    // Default: return overall summary
    const { data: pos, error } = await supabase
      .from('purchase_orders')
      .select('total_amount, status, created_at')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    const approved = pos?.filter(po => ['approved', 'sent', 'received', 'completed'].includes(po.status)) || [];
    const totalSpend = approved.reduce((sum, po) => sum + po.total_amount, 0);

    return NextResponse.json({
      summary: {
        total_spend: totalSpend,
        po_count: approved.length,
        average_po_value: approved.length > 0 ? Math.round(totalSpend / approved.length * 100) / 100 : 0,
        period: { start: startDate, end: endDate },
      },
    });
  } catch (error: any) {
    console.error('Spend analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
