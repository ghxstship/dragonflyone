import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET /api/asset-analytics - Get asset performance analytics and failure prediction
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('asset_id');
    const category = searchParams.get('category');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const reportType = searchParams.get('report_type') || 'overview';

    // Get asset utilization data
    let utilizationQuery = supabase
      .from('asset_utilization_logs')
      .select('*');

    if (assetId) {
      utilizationQuery = utilizationQuery.eq('asset_id', assetId);
    }

    if (dateFrom) {
      utilizationQuery = utilizationQuery.gte('date', dateFrom);
    }

    if (dateTo) {
      utilizationQuery = utilizationQuery.lte('date', dateTo);
    }

    const { data: utilizationData } = await utilizationQuery;

    // Get maintenance history
    let maintenanceQuery = supabase
      .from('asset_maintenance_logs')
      .select('*')
      .order('maintenance_date', { ascending: false });

    if (assetId) {
      maintenanceQuery = maintenanceQuery.eq('asset_id', assetId);
    }

    const { data: maintenanceData } = await maintenanceQuery;

    // Get failure/incident data
    let failureQuery = supabase
      .from('asset_incidents')
      .select('*')
      .order('incident_date', { ascending: false });

    if (assetId) {
      failureQuery = failureQuery.eq('asset_id', assetId);
    }

    const { data: failureData } = await failureQuery;

    // Calculate analytics
    const totalUtilizationHours = utilizationData?.reduce((sum, log) => sum + (log.hours_used || 0), 0) || 0;
    const totalMaintenanceCost = maintenanceData?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;
    const totalFailures = failureData?.length || 0;

    // Calculate MTBF (Mean Time Between Failures)
    const mtbf = totalFailures > 0 ? totalUtilizationHours / totalFailures : totalUtilizationHours;

    // Calculate failure prediction based on historical data
    const failurePrediction = calculateFailurePrediction(utilizationData || [], maintenanceData || [], failureData || []);

    // Calculate asset health score
    const healthScore = calculateHealthScore(utilizationData || [], maintenanceData || [], failureData || []);

    // Get top performing assets
    const { data: topAssets } = await supabase
      .from('assets')
      .select('id, name, category, utilization_rate, health_score')
      .order('utilization_rate', { ascending: false })
      .limit(10);

    // Get assets needing attention
    const { data: attentionAssets } = await supabase
      .from('assets')
      .select('id, name, category, health_score, next_maintenance_date')
      .lt('health_score', 70)
      .order('health_score', { ascending: true })
      .limit(10);

    return NextResponse.json({
      overview: {
        total_utilization_hours: totalUtilizationHours,
        total_maintenance_cost: totalMaintenanceCost,
        total_failures: totalFailures,
        mtbf,
        average_health_score: healthScore,
      },
      failure_prediction: failurePrediction,
      utilization_trend: calculateUtilizationTrend(utilizationData || []),
      maintenance_trend: calculateMaintenanceTrend(maintenanceData || []),
      top_performing_assets: topAssets || [],
      assets_needing_attention: attentionAssets || [],
      recent_failures: failureData?.slice(0, 10) || [],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch asset analytics' }, { status: 500 });
  }
}

function calculateFailurePrediction(
  utilization: any[],
  maintenance: any[],
  failures: any[]
): { risk_level: string; probability: number; recommended_action: string; next_likely_failure_date: string | null } {
  // Simple prediction model based on historical patterns
  const recentFailures = failures.filter(f => {
    const failureDate = new Date(f.incident_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return failureDate > thirtyDaysAgo;
  });

  const lastMaintenance = maintenance[0];
  const daysSinceLastMaintenance = lastMaintenance
    ? Math.floor((Date.now() - new Date(lastMaintenance.maintenance_date).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  let riskLevel = 'low';
  let probability = 0.1;
  let recommendedAction = 'Continue regular monitoring';
  let nextLikelyFailureDate: string | null = null;

  if (recentFailures.length >= 3) {
    riskLevel = 'critical';
    probability = 0.85;
    recommendedAction = 'Immediate inspection and preventive maintenance required';
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 7);
    nextLikelyFailureDate = nextDate.toISOString().split('T')[0];
  } else if (recentFailures.length >= 1 || daysSinceLastMaintenance > 90) {
    riskLevel = 'high';
    probability = 0.6;
    recommendedAction = 'Schedule preventive maintenance within 2 weeks';
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 21);
    nextLikelyFailureDate = nextDate.toISOString().split('T')[0];
  } else if (daysSinceLastMaintenance > 60) {
    riskLevel = 'medium';
    probability = 0.35;
    recommendedAction = 'Plan maintenance within 30 days';
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 45);
    nextLikelyFailureDate = nextDate.toISOString().split('T')[0];
  }

  return {
    risk_level: riskLevel,
    probability,
    recommended_action: recommendedAction,
    next_likely_failure_date: nextLikelyFailureDate,
  };
}

function calculateHealthScore(utilization: any[], maintenance: any[], failures: any[]): number {
  let score = 100;

  // Deduct for failures
  const recentFailures = failures.filter(f => {
    const failureDate = new Date(f.incident_date);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    return failureDate > ninetyDaysAgo;
  });
  score -= recentFailures.length * 10;

  // Deduct for overdue maintenance
  const lastMaintenance = maintenance[0];
  if (lastMaintenance) {
    const daysSince = Math.floor((Date.now() - new Date(lastMaintenance.maintenance_date).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 90) score -= 20;
    else if (daysSince > 60) score -= 10;
    else if (daysSince > 30) score -= 5;
  } else {
    score -= 15;
  }

  // Bonus for regular utilization
  const avgUtilization = utilization.reduce((sum, u) => sum + (u.utilization_rate || 0), 0) / (utilization.length || 1);
  if (avgUtilization > 70) score += 5;

  return Math.max(0, Math.min(100, score));
}

function calculateUtilizationTrend(utilization: any[]): { period: string; hours: number; rate: number }[] {
  const grouped: Record<string, { hours: number; count: number }> = {};

  utilization.forEach(u => {
    const month = u.date?.substring(0, 7) || 'unknown';
    if (!grouped[month]) {
      grouped[month] = { hours: 0, count: 0 };
    }
    grouped[month].hours += u.hours_used || 0;
    grouped[month].count += 1;
  });

  return Object.entries(grouped)
    .map(([period, data]) => ({
      period,
      hours: data.hours,
      rate: data.count > 0 ? (data.hours / (data.count * 24)) * 100 : 0,
    }))
    .sort((a, b) => a.period.localeCompare(b.period))
    .slice(-12);
}

function calculateMaintenanceTrend(maintenance: any[]): { period: string; count: number; cost: number }[] {
  const grouped: Record<string, { count: number; cost: number }> = {};

  maintenance.forEach(m => {
    const month = m.maintenance_date?.substring(0, 7) || 'unknown';
    if (!grouped[month]) {
      grouped[month] = { count: 0, cost: 0 };
    }
    grouped[month].count += 1;
    grouped[month].cost += m.cost || 0;
  });

  return Object.entries(grouped)
    .map(([period, data]) => ({
      period,
      count: data.count,
      cost: data.cost,
    }))
    .sort((a, b) => a.period.localeCompare(b.period))
    .slice(-12);
}
