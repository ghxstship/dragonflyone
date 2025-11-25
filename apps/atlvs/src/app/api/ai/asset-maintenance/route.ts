import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/ai/asset-maintenance - Predictive maintenance for assets
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const assetId = searchParams.get('asset_id');

    if (action === 'predictions') {
      // Get all assets with maintenance history
      const { data: assets } = await supabase
        .from('assets')
        .select(`
          id, name, category, purchase_date, warranty_expiry,
          maintenance_interval_days, last_maintenance_date,
          usage_hours, expected_lifespan_hours
        `)
        .eq('status', 'active');

      // Get maintenance history
      const { data: maintenanceHistory } = await supabase
        .from('asset_maintenance')
        .select('asset_id, maintenance_type, maintenance_date, cost, issues_found')
        .order('maintenance_date', { ascending: false });

      // Build maintenance map
      const maintenanceMap: Record<string, any[]> = {};
      maintenanceHistory?.forEach(m => {
        if (!maintenanceMap[m.asset_id]) maintenanceMap[m.asset_id] = [];
        maintenanceMap[m.asset_id].push(m);
      });

      // Generate predictions
      const predictions = assets?.map(asset => {
        const history = maintenanceMap[asset.id] || [];
        const prediction = predictMaintenance(asset, history);

        return {
          asset_id: asset.id,
          asset_name: asset.name,
          category: asset.category,
          ...prediction,
        };
      });

      // Sort by urgency
      predictions?.sort((a, b) => a.days_until_maintenance - b.days_until_maintenance);

      return NextResponse.json({
        predictions: predictions || [],
        urgent_count: predictions?.filter(p => p.risk_level === 'high').length || 0,
        upcoming_count: predictions?.filter(p => p.days_until_maintenance <= 30).length || 0,
      });
    }

    if (action === 'asset_health' && assetId) {
      const { data: asset } = await supabase
        .from('assets')
        .select('*')
        .eq('id', assetId)
        .single();

      if (!asset) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      }

      const { data: history } = await supabase
        .from('asset_maintenance')
        .select('*')
        .eq('asset_id', assetId)
        .order('maintenance_date', { ascending: false });

      // Calculate health score
      const healthScore = calculateHealthScore(asset, history || []);

      // Analyze failure patterns
      const failurePatterns = analyzeFailurePatterns(history || []);

      // Estimate remaining life
      const remainingLife = estimateRemainingLife(asset, history || []);

      return NextResponse.json({
        asset,
        health_score: healthScore,
        failure_patterns: failurePatterns,
        remaining_life: remainingLife,
        maintenance_history: history?.slice(0, 10) || [],
        recommendations: generateRecommendations(asset, healthScore, failurePatterns),
      });
    }

    if (action === 'cost_analysis') {
      // Get maintenance costs by asset category
      const { data: costs } = await supabase
        .from('asset_maintenance')
        .select(`
          cost, maintenance_date,
          asset:assets(category, name)
        `)
        .gte('maintenance_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      // Group by category
      const categoryTotals: Record<string, { total: number; count: number }> = {};
      costs?.forEach(c => {
        const category = (c.asset as any)?.category || 'other';
        if (!categoryTotals[category]) categoryTotals[category] = { total: 0, count: 0 };
        categoryTotals[category].total += c.cost || 0;
        categoryTotals[category].count++;
      });

      // Calculate averages and project future costs
      const costAnalysis = Object.entries(categoryTotals).map(([category, data]) => ({
        category,
        total_cost: data.total,
        maintenance_count: data.count,
        average_cost: data.count > 0 ? Math.round(data.total / data.count) : 0,
        projected_annual: Math.round(data.total * 1.05), // 5% inflation
      }));

      return NextResponse.json({
        cost_analysis: costAnalysis,
        total_maintenance_cost: costs?.reduce((sum, c) => sum + (c.cost || 0), 0) || 0,
      });
    }

    if (action === 'schedule_optimization') {
      // Get assets needing maintenance
      const { data: assets } = await supabase
        .from('assets')
        .select('id, name, category, last_maintenance_date, maintenance_interval_days, location')
        .eq('status', 'active');

      // Calculate optimal schedule
      const schedule = optimizeMaintenanceSchedule(assets || []);

      return NextResponse.json({
        optimized_schedule: schedule,
        efficiency_gain: calculateEfficiencyGain(schedule),
      });
    }

    if (action === 'anomaly_detection') {
      // Get recent sensor/usage data
      const { data: usageData } = await supabase
        .from('asset_usage_logs')
        .select('asset_id, metric_type, value, recorded_at')
        .gte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: false });

      // Detect anomalies
      const anomalies = detectAnomalies(usageData || []);

      return NextResponse.json({
        anomalies,
        anomaly_count: anomalies.length,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate predictions' }, { status: 500 });
  }
}

// POST /api/ai/asset-maintenance - Log maintenance or update predictions
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'log_maintenance';

    if (action === 'log_maintenance') {
      const { asset_id, maintenance_type, cost, issues_found, notes, parts_replaced } = body;

      const { data: maintenance, error } = await supabase
        .from('asset_maintenance')
        .insert({
          asset_id,
          maintenance_type,
          maintenance_date: new Date().toISOString(),
          cost,
          issues_found,
          notes,
          parts_replaced,
          performed_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update asset last maintenance date
      await supabase
        .from('assets')
        .update({
          last_maintenance_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', asset_id);

      return NextResponse.json({ maintenance }, { status: 201 });
    } else if (action === 'update_usage') {
      const { asset_id, usage_hours, metrics } = body;

      // Update asset usage
      await supabase
        .from('assets')
        .update({
          usage_hours,
          updated_at: new Date().toISOString(),
        })
        .eq('id', asset_id);

      // Log usage metrics
      if (metrics) {
        const usageLogs = Object.entries(metrics).map(([metric_type, value]) => ({
          asset_id,
          metric_type,
          value,
          recorded_at: new Date().toISOString(),
        }));

        await supabase.from('asset_usage_logs').insert(usageLogs);
      }

      return NextResponse.json({ success: true });
    } else if (action === 'schedule_maintenance') {
      const { asset_id, scheduled_date, maintenance_type, notes } = body;

      const { data: scheduled, error } = await supabase
        .from('scheduled_maintenance')
        .insert({
          asset_id,
          scheduled_date,
          maintenance_type,
          notes,
          status: 'scheduled',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ scheduled }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper functions
function predictMaintenance(asset: any, history: any[]): any {
  const now = Date.now();
  const lastMaintenance = asset.last_maintenance_date
    ? new Date(asset.last_maintenance_date).getTime()
    : now - 365 * 24 * 60 * 60 * 1000;

  const daysSinceLastMaintenance = Math.floor((now - lastMaintenance) / (1000 * 60 * 60 * 24));
  const interval = asset.maintenance_interval_days || 90;

  // Calculate average time between failures from history
  let avgTimeBetweenMaintenance = interval;
  if (history.length >= 2) {
    const intervals = [];
    for (let i = 1; i < history.length; i++) {
      const diff = new Date(history[i - 1].maintenance_date).getTime() -
                   new Date(history[i].maintenance_date).getTime();
      intervals.push(diff / (1000 * 60 * 60 * 24));
    }
    avgTimeBetweenMaintenance = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  }

  // Usage-based adjustment
  let usageMultiplier = 1;
  if (asset.usage_hours && asset.expected_lifespan_hours) {
    const usageRatio = asset.usage_hours / asset.expected_lifespan_hours;
    usageMultiplier = 1 + (usageRatio * 0.5); // Higher usage = more frequent maintenance
  }

  const adjustedInterval = avgTimeBetweenMaintenance / usageMultiplier;
  const daysUntilMaintenance = Math.max(0, Math.round(adjustedInterval - daysSinceLastMaintenance));

  // Determine risk level
  let riskLevel = 'low';
  if (daysUntilMaintenance <= 7) riskLevel = 'high';
  else if (daysUntilMaintenance <= 30) riskLevel = 'medium';

  // Estimate failure probability
  const failureProbability = Math.min(100, Math.round(
    (daysSinceLastMaintenance / adjustedInterval) * 100
  ));

  return {
    days_until_maintenance: daysUntilMaintenance,
    recommended_date: new Date(now + daysUntilMaintenance * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    risk_level: riskLevel,
    failure_probability: failureProbability,
    days_since_last_maintenance: daysSinceLastMaintenance,
    maintenance_count: history.length,
  };
}

function calculateHealthScore(asset: any, history: any[]): number {
  let score = 100;

  // Age factor
  if (asset.purchase_date) {
    const ageYears = (Date.now() - new Date(asset.purchase_date).getTime()) / (365 * 24 * 60 * 60 * 1000);
    score -= Math.min(30, ageYears * 3);
  }

  // Usage factor
  if (asset.usage_hours && asset.expected_lifespan_hours) {
    const usageRatio = asset.usage_hours / asset.expected_lifespan_hours;
    score -= Math.min(40, usageRatio * 40);
  }

  // Maintenance history factor
  const recentIssues = history.filter(h =>
    h.issues_found && new Date(h.maintenance_date) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
  ).length;
  score -= recentIssues * 5;

  // Overdue maintenance
  if (asset.last_maintenance_date && asset.maintenance_interval_days) {
    const daysSince = (Date.now() - new Date(asset.last_maintenance_date).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > asset.maintenance_interval_days) {
      score -= Math.min(20, (daysSince - asset.maintenance_interval_days) / 2);
    }
  }

  return Math.max(0, Math.round(score));
}

function analyzeFailurePatterns(history: any[]): any[] {
  const patterns: Record<string, number> = {};

  history.forEach(h => {
    if (h.issues_found) {
      const issues = Array.isArray(h.issues_found) ? h.issues_found : [h.issues_found];
      issues.forEach((issue: string) => {
        patterns[issue] = (patterns[issue] || 0) + 1;
      });
    }
  });

  return Object.entries(patterns)
    .map(([issue, count]) => ({ issue, occurrences: count }))
    .sort((a, b) => b.occurrences - a.occurrences);
}

function estimateRemainingLife(asset: any, history: any[]): any {
  if (!asset.expected_lifespan_hours || !asset.usage_hours) {
    return { estimate: 'unknown', confidence: 'low' };
  }

  const remainingHours = asset.expected_lifespan_hours - asset.usage_hours;
  const avgDailyUsage = asset.usage_hours / 365; // Assume 1 year of data

  return {
    remaining_hours: Math.max(0, remainingHours),
    remaining_days: avgDailyUsage > 0 ? Math.round(remainingHours / avgDailyUsage) : null,
    usage_percentage: Math.round((asset.usage_hours / asset.expected_lifespan_hours) * 100),
    confidence: history.length >= 5 ? 'high' : history.length >= 2 ? 'medium' : 'low',
  };
}

function generateRecommendations(asset: any, healthScore: number, patterns: any[]): string[] {
  const recommendations = [];

  if (healthScore < 50) {
    recommendations.push('Consider replacement planning - asset health is critically low');
  } else if (healthScore < 70) {
    recommendations.push('Schedule comprehensive inspection soon');
  }

  if (patterns.length > 0) {
    recommendations.push(`Address recurring issue: ${patterns[0].issue}`);
  }

  if (asset.warranty_expiry && new Date(asset.warranty_expiry) < new Date()) {
    recommendations.push('Warranty expired - consider extended warranty or replacement');
  }

  return recommendations;
}

function optimizeMaintenanceSchedule(assets: any[]): any[] {
  // Group by location for efficiency
  const byLocation: Record<string, any[]> = {};
  assets.forEach(asset => {
    const location = asset.location || 'default';
    if (!byLocation[location]) byLocation[location] = [];
    byLocation[location].push(asset);
  });

  const schedule: Array<{ asset_id: string; asset_name: string; location: string; scheduled_date: string }> = [];
  const startDate = new Date();

  Object.entries(byLocation).forEach(([location, locationAssets]) => {
    // Sort by urgency
    locationAssets.sort((a, b) => {
      const aUrgency = a.last_maintenance_date
        ? (Date.now() - new Date(a.last_maintenance_date).getTime()) / (a.maintenance_interval_days || 90)
        : 2;
      const bUrgency = b.last_maintenance_date
        ? (Date.now() - new Date(b.last_maintenance_date).getTime()) / (b.maintenance_interval_days || 90)
        : 2;
      return bUrgency - aUrgency;
    });

    locationAssets.forEach((asset, index) => {
      const scheduledDate = new Date(startDate.getTime() + index * 2 * 24 * 60 * 60 * 1000);
      schedule.push({
        asset_id: asset.id,
        asset_name: asset.name,
        location,
        scheduled_date: scheduledDate.toISOString().slice(0, 10),
      });
    });
  });

  return schedule;
}

function calculateEfficiencyGain(schedule: any[]): number {
  // Estimate travel time savings from location grouping
  const locations = new Set(schedule.map(s => s.location));
  const baseTrips = schedule.length;
  const optimizedTrips = locations.size * Math.ceil(schedule.length / locations.size / 3);
  return Math.round((1 - optimizedTrips / baseTrips) * 100);
}

function detectAnomalies(usageData: any[]): any[] {
  // Group by asset and metric
  const grouped: Record<string, number[]> = {};
  usageData.forEach(d => {
    const key = `${d.asset_id}-${d.metric_type}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d.value);
  });

  const anomalies: any[] = [];

  Object.entries(grouped).forEach(([key, values]) => {
    if (values.length < 5) return;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);

    const latestValue = values[0];
    const zScore = stdDev > 0 ? Math.abs((latestValue - mean) / stdDev) : 0;

    if (zScore > 2) {
      const [assetId, metricType] = key.split('-');
      anomalies.push({
        asset_id: assetId,
        metric_type: metricType,
        current_value: latestValue,
        expected_range: { min: mean - 2 * stdDev, max: mean + 2 * stdDev },
        severity: zScore > 3 ? 'high' : 'medium',
      });
    }
  });

  return anomalies;
}
