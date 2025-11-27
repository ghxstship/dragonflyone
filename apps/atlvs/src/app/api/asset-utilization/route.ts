import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET - Get asset utilization reports and ROI analysis
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'utilization' | 'roi' | 'idle' | 'category' | 'trends'
    const assetId = searchParams.get('asset_id');
    const category = searchParams.get('category');
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end_date') || new Date().toISOString();

    if (type === 'utilization') {
      // Get utilization data for assets
      let query = supabase
        .from('assets')
        .select(`
          id,
          name,
          asset_tag,
          category,
          status,
          purchase_price,
          purchase_date,
          checkouts:asset_checkouts(id, checkout_date, return_date, project_id)
        `);

      if (assetId) {
        query = query.eq('id', assetId);
      }
      if (category) {
        query = query.eq('category', category);
      }

      const { data: assets, error } = await query;

      if (error) throw error;

      // Calculate utilization for each asset
      const periodDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000));

      const utilizationData = assets?.map(asset => {
        const checkouts = (asset.checkouts as any[]) || [];
        
        // Calculate days in use
        let daysInUse = 0;
        checkouts.forEach(checkout => {
          const checkoutStart = new Date(checkout.checkout_date);
          const checkoutEnd = checkout.return_date ? new Date(checkout.return_date) : new Date();
          
          // Only count days within the period
          const effectiveStart = checkoutStart < new Date(startDate) ? new Date(startDate) : checkoutStart;
          const effectiveEnd = checkoutEnd > new Date(endDate) ? new Date(endDate) : checkoutEnd;
          
          if (effectiveEnd > effectiveStart) {
            daysInUse += Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (24 * 60 * 60 * 1000));
          }
        });

        const utilizationRate = periodDays > 0 ? (daysInUse / periodDays) * 100 : 0;
        const idleDays = periodDays - daysInUse;

        return {
          asset_id: asset.id,
          asset_name: asset.name,
          asset_tag: asset.asset_tag,
          category: asset.category,
          status: asset.status,
          period_days: periodDays,
          days_in_use: daysInUse,
          idle_days: idleDays,
          utilization_rate: Math.round(utilizationRate * 100) / 100,
          checkout_count: checkouts.length,
          utilization_grade: getUtilizationGrade(utilizationRate),
        };
      });

      // Sort by utilization rate
      utilizationData?.sort((a, b) => b.utilization_rate - a.utilization_rate);

      // Calculate averages
      const avgUtilization = utilizationData?.length 
        ? utilizationData.reduce((sum, a) => sum + a.utilization_rate, 0) / utilizationData.length 
        : 0;

      return NextResponse.json({
        assets: utilizationData,
        summary: {
          total_assets: utilizationData?.length || 0,
          average_utilization: Math.round(avgUtilization * 100) / 100,
          highly_utilized: utilizationData?.filter(a => a.utilization_rate >= 70).length || 0,
          underutilized: utilizationData?.filter(a => a.utilization_rate < 30).length || 0,
        },
        period: { start: startDate, end: endDate },
      });
    }

    if (type === 'roi') {
      // Get ROI analysis for assets
      const { data: assets, error } = await supabase
        .from('assets')
        .select(`
          id,
          name,
          asset_tag,
          category,
          purchase_price,
          purchase_date,
          current_value,
          checkouts:asset_checkouts(id, project_id),
          maintenance:maintenance_records(total_cost)
        `);

      if (error) throw error;

      // Get project revenue data
      const { data: projects } = await supabase
        .from('projects')
        .select('id, revenue, profit');

      const projectMap = new Map(projects?.map(p => [p.id, p]) || []);

      const roiData = assets?.map(asset => {
        const purchasePrice = asset.purchase_price || 0;
        const currentValue = asset.current_value || 0;
        const checkouts = (asset.checkouts as any[]) || [];
        const maintenanceRecords = (asset.maintenance as any[]) || [];

        // Calculate total maintenance cost
        const maintenanceCost = maintenanceRecords.reduce((sum, m) => sum + (m.total_cost || 0), 0);

        // Calculate revenue contribution (simplified - based on projects used)
        let revenueContribution = 0;
        const uniqueProjects = new Set(checkouts.map(c => c.project_id).filter(Boolean));
        uniqueProjects.forEach(projectId => {
          const project = projectMap.get(projectId);
          if (project?.revenue) {
            // Assume equal contribution from all assets on a project
            revenueContribution += project.revenue * 0.1; // 10% attribution per asset
          }
        });

        // Calculate depreciation
        const depreciation = purchasePrice - currentValue;
        
        // Calculate total cost of ownership
        const totalCost = purchasePrice + maintenanceCost;
        
        // Calculate ROI
        const roi = totalCost > 0 ? ((revenueContribution - totalCost) / totalCost) * 100 : 0;

        // Calculate payback period (months)
        const monthlyRevenue = revenueContribution / 12;
        const paybackMonths = monthlyRevenue > 0 ? totalCost / monthlyRevenue : null;

        return {
          asset_id: asset.id,
          asset_name: asset.name,
          asset_tag: asset.asset_tag,
          category: asset.category,
          purchase_price: purchasePrice,
          current_value: currentValue,
          depreciation,
          maintenance_cost: maintenanceCost,
          total_cost_of_ownership: totalCost,
          revenue_contribution: Math.round(revenueContribution * 100) / 100,
          roi: Math.round(roi * 100) / 100,
          payback_months: paybackMonths ? Math.round(paybackMonths) : null,
          projects_used: uniqueProjects.size,
        };
      });

      // Sort by ROI
      roiData?.sort((a, b) => b.roi - a.roi);

      const avgRoi = roiData?.length 
        ? roiData.reduce((sum, a) => sum + a.roi, 0) / roiData.length 
        : 0;

      return NextResponse.json({
        assets: roiData,
        summary: {
          total_assets: roiData?.length || 0,
          average_roi: Math.round(avgRoi * 100) / 100,
          positive_roi_count: roiData?.filter(a => a.roi > 0).length || 0,
          negative_roi_count: roiData?.filter(a => a.roi < 0).length || 0,
          total_investment: roiData?.reduce((sum, a) => sum + a.purchase_price, 0) || 0,
          total_maintenance: roiData?.reduce((sum, a) => sum + a.maintenance_cost, 0) || 0,
        },
      });
    }

    if (type === 'idle') {
      // Get idle assets report
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: assets, error } = await supabase
        .from('assets')
        .select(`
          id,
          name,
          asset_tag,
          category,
          status,
          purchase_price,
          last_checkout:asset_checkouts(checkout_date, return_date)
        `)
        .eq('status', 'available');

      if (error) throw error;

      const idleAssets = assets?.filter(asset => {
        const checkouts = (asset.last_checkout as any[]) || [];
        if (checkouts.length === 0) return true;
        
        const lastCheckout = checkouts.sort((a, b) => 
          new Date(b.return_date || b.checkout_date).getTime() - new Date(a.return_date || a.checkout_date).getTime()
        )[0];
        
        const lastActivity = lastCheckout.return_date || lastCheckout.checkout_date;
        return new Date(lastActivity) < new Date(thirtyDaysAgo);
      }).map(asset => {
        const checkouts = (asset.last_checkout as any[]) || [];
        const lastCheckout = checkouts.length > 0 
          ? checkouts.sort((a, b) => 
              new Date(b.return_date || b.checkout_date).getTime() - new Date(a.return_date || a.checkout_date).getTime()
            )[0]
          : null;
        
        const lastActivityDate = lastCheckout?.return_date || lastCheckout?.checkout_date || null;
        const idleDays = lastActivityDate 
          ? Math.floor((Date.now() - new Date(lastActivityDate).getTime()) / (24 * 60 * 60 * 1000))
          : null;

        return {
          asset_id: asset.id,
          asset_name: asset.name,
          asset_tag: asset.asset_tag,
          category: asset.category,
          purchase_price: asset.purchase_price,
          last_activity: lastActivityDate,
          idle_days: idleDays,
          recommendation: getIdleRecommendation(idleDays, asset.purchase_price),
        };
      });

      // Sort by idle days
      idleAssets?.sort((a, b) => (b.idle_days || 999) - (a.idle_days || 999));

      const totalIdleValue = idleAssets?.reduce((sum, a) => sum + (a.purchase_price || 0), 0) || 0;

      return NextResponse.json({
        idle_assets: idleAssets,
        summary: {
          total_idle: idleAssets?.length || 0,
          total_idle_value: totalIdleValue,
          never_used: idleAssets?.filter(a => a.idle_days === null).length || 0,
          idle_over_90_days: idleAssets?.filter(a => a.idle_days && a.idle_days > 90).length || 0,
        },
      });
    }

    if (type === 'category') {
      // Get utilization by category
      const { data: assets, error } = await supabase
        .from('assets')
        .select(`
          id,
          category,
          purchase_price,
          checkouts:asset_checkouts(id, checkout_date, return_date)
        `);

      if (error) throw error;

      const periodDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (24 * 60 * 60 * 1000));

      // Group by category
      const categoryData: Record<string, { 
        count: number; 
        totalValue: number; 
        totalUtilization: number;
        checkoutCount: number;
      }> = {};

      assets?.forEach(asset => {
        const cat = asset.category || 'uncategorized';
        if (!categoryData[cat]) {
          categoryData[cat] = { count: 0, totalValue: 0, totalUtilization: 0, checkoutCount: 0 };
        }

        categoryData[cat].count++;
        categoryData[cat].totalValue += asset.purchase_price || 0;
        
        const checkouts = (asset.checkouts as any[]) || [];
        categoryData[cat].checkoutCount += checkouts.length;

        // Calculate utilization
        let daysInUse = 0;
        checkouts.forEach(checkout => {
          const checkoutStart = new Date(checkout.checkout_date);
          const checkoutEnd = checkout.return_date ? new Date(checkout.return_date) : new Date();
          const effectiveStart = checkoutStart < new Date(startDate) ? new Date(startDate) : checkoutStart;
          const effectiveEnd = checkoutEnd > new Date(endDate) ? new Date(endDate) : checkoutEnd;
          if (effectiveEnd > effectiveStart) {
            daysInUse += Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (24 * 60 * 60 * 1000));
          }
        });
        categoryData[cat].totalUtilization += periodDays > 0 ? (daysInUse / periodDays) * 100 : 0;
      });

      const categories = Object.entries(categoryData).map(([category, data]) => ({
        category,
        asset_count: data.count,
        total_value: data.totalValue,
        average_utilization: Math.round((data.totalUtilization / data.count) * 100) / 100,
        total_checkouts: data.checkoutCount,
        avg_checkouts_per_asset: Math.round((data.checkoutCount / data.count) * 100) / 100,
      }));

      categories.sort((a, b) => b.average_utilization - a.average_utilization);

      return NextResponse.json({
        categories,
        period: { start: startDate, end: endDate },
      });
    }

    if (type === 'trends') {
      // Get utilization trends over time
      const { data: checkouts, error } = await supabase
        .from('asset_checkouts')
        .select('checkout_date, return_date, asset_id')
        .gte('checkout_date', startDate)
        .lte('checkout_date', endDate)
        .order('checkout_date', { ascending: true });

      if (error) throw error;

      // Group by month
      const monthlyData: Record<string, { checkouts: number; returns: number; activeAssets: Set<string> }> = {};

      checkouts?.forEach(checkout => {
        const month = checkout.checkout_date.substring(0, 7);
        if (!monthlyData[month]) {
          monthlyData[month] = { checkouts: 0, returns: 0, activeAssets: new Set() };
        }
        monthlyData[month].checkouts++;
        monthlyData[month].activeAssets.add(checkout.asset_id);

        if (checkout.return_date) {
          const returnMonth = checkout.return_date.substring(0, 7);
          if (!monthlyData[returnMonth]) {
            monthlyData[returnMonth] = { checkouts: 0, returns: 0, activeAssets: new Set() };
          }
          monthlyData[returnMonth].returns++;
        }
      });

      const trends = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          checkouts: data.checkouts,
          returns: data.returns,
          unique_assets_used: data.activeAssets.size,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return NextResponse.json({
        trends,
        period: { start: startDate, end: endDate },
      });
    }

    // Default: return summary
    const { data: assets, error } = await supabase
      .from('assets')
      .select('id, category, status, purchase_price');

    if (error) throw error;

    const statusCounts = assets?.reduce((acc: Record<string, number>, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    const totalValue = assets?.reduce((sum, a) => sum + (a.purchase_price || 0), 0) || 0;

    return NextResponse.json({
      summary: {
        total_assets: assets?.length || 0,
        total_value: totalValue,
        status_distribution: statusCounts,
      },
    });
  } catch (error: any) {
    console.error('Asset utilization error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper functions
function getUtilizationGrade(rate: number): string {
  if (rate >= 80) return 'Excellent';
  if (rate >= 60) return 'Good';
  if (rate >= 40) return 'Fair';
  if (rate >= 20) return 'Low';
  return 'Very Low';
}

function getIdleRecommendation(idleDays: number | null, purchasePrice: number | null): string {
  if (idleDays === null) return 'Review - Never used since tracking began';
  if (idleDays > 180) return 'Consider disposal or sale';
  if (idleDays > 90) return 'Review for potential rental or reallocation';
  if (idleDays > 60) return 'Monitor - Extended idle period';
  return 'Normal idle period';
}
