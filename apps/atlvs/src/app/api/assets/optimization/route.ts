import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    // Get asset utilization data
    const { data: assets } = await supabase
      .from('assets')
      .select(`
        *,
        checkouts:asset_checkouts(id, checkout_date, return_date)
      `);

    if (!assets) {
      return NextResponse.json({ recommendations: [], patterns: [] });
    }

    const now = new Date();
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const daysInQuarter = Math.ceil((now.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate usage patterns
    const patterns = assets.map(asset => {
      const checkouts = asset.checkouts || [];
      const totalCheckoutDays = checkouts.reduce((sum: number, c: any) => {
        const start = new Date(c.checkout_date);
        const end = c.return_date ? new Date(c.return_date) : now;
        return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }, 0);

      const avgUtilization = Math.round((totalCheckoutDays / daysInQuarter) * 100);
      const idleDays = daysInQuarter - totalCheckoutDays;

      return {
        asset_id: asset.id,
        asset_name: asset.name,
        category: asset.category,
        avg_utilization: Math.min(100, avgUtilization),
        peak_utilization: Math.min(100, avgUtilization + 20),
        idle_days: Math.max(0, idleDays),
        total_checkouts: checkouts.length,
        avg_checkout_duration: checkouts.length > 0 ? Math.round(totalCheckoutDays / checkouts.length) : 0,
        trend: avgUtilization > 70 ? 'increasing' : avgUtilization < 30 ? 'decreasing' : 'stable',
      };
    });

    // Generate recommendations
    const recommendations = [];

    for (const pattern of patterns) {
      // Underutilized assets
      if (pattern.avg_utilization < 30 && pattern.idle_days > 60) {
        recommendations.push({
          id: `REC-${pattern.asset_id}-under`,
          type: 'underutilized',
          priority: pattern.avg_utilization < 15 ? 'high' : 'medium',
          asset_id: pattern.asset_id,
          asset_name: pattern.asset_name,
          category: pattern.category,
          current_utilization: pattern.avg_utilization,
          target_utilization: 60,
          recommendation: `Asset has been idle for ${pattern.idle_days} days. Consider rental pooling, sale, or reallocation.`,
          potential_savings: Math.round(pattern.idle_days * 100), // Simplified calculation
          action_items: ['Review upcoming project needs', 'List on rental marketplace', 'Get appraisal for sale'],
          status: 'pending',
        });
      }

      // Overutilized assets
      if (pattern.avg_utilization > 85) {
        recommendations.push({
          id: `REC-${pattern.asset_id}-over`,
          type: 'overutilized',
          priority: 'medium',
          asset_id: pattern.asset_id,
          asset_name: pattern.asset_name,
          category: pattern.category,
          current_utilization: pattern.avg_utilization,
          target_utilization: 75,
          recommendation: 'High demand asset. Consider purchasing additional units to reduce scheduling conflicts.',
          potential_savings: Math.round(pattern.total_checkouts * 500),
          action_items: ['Request capital budget', 'Evaluate rental costs vs purchase', 'Review booking conflicts'],
          status: 'pending',
        });
      }
    }

    // Filter if requested
    let filteredRecs = recommendations;
    if (type) {
      filteredRecs = filteredRecs.filter(r => r.type === type);
    }
    if (priority) {
      filteredRecs = filteredRecs.filter(r => r.priority === priority);
    }

    return NextResponse.json({
      recommendations: filteredRecs,
      patterns,
      summary: {
        total_assets: assets.length,
        underutilized: patterns.filter(p => p.avg_utilization < 30).length,
        overutilized: patterns.filter(p => p.avg_utilization > 85).length,
        avg_utilization: Math.round(patterns.reduce((sum, p) => sum + p.avg_utilization, 0) / patterns.length),
        potential_savings: recommendations.reduce((sum, r) => sum + r.potential_savings, 0),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
