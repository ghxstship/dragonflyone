import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET /api/analytics/predictive - Get predictive insights
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
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

    if (action === 'revenue_forecast') {
      // Get historical revenue data
      const { data: historicalRevenue } = await supabase
        .from('invoices')
        .select('total_amount, paid_at')
        .eq('status', 'paid')
        .gte('paid_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .order('paid_at');

      // Group by month
      const monthlyRevenue: Record<string, number> = {};
      historicalRevenue?.forEach(inv => {
        const month = inv.paid_at?.slice(0, 7);
        if (month) {
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (inv.total_amount || 0);
        }
      });

      const months = Object.keys(monthlyRevenue).sort();
      const values = months.map(m => monthlyRevenue[m]);

      // Simple linear regression for forecast
      const n = values.length;
      if (n < 3) {
        return NextResponse.json({ error: 'Insufficient data for forecast' }, { status: 400 });
      }

      const sumX = (n * (n - 1)) / 2;
      const sumY = values.reduce((a, b) => a + b, 0);
      const sumXY = values.reduce((sum, y, i) => sum + i * y, 0);
      const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Forecast next 3 months
      const forecast = [];
      for (let i = 0; i < 3; i++) {
        const forecastMonth = new Date();
        forecastMonth.setMonth(forecastMonth.getMonth() + i + 1);
        const monthStr = forecastMonth.toISOString().slice(0, 7);
        const predictedValue = Math.max(0, intercept + slope * (n + i));

        forecast.push({
          month: monthStr,
          predicted_revenue: Math.round(predictedValue),
          confidence: Math.max(0.5, 1 - (i * 0.1)),
        });
      }

      return NextResponse.json({
        historical: months.map((m, i) => ({ month: m, revenue: values[i] })),
        forecast,
        trend: slope > 0 ? 'growing' : slope < 0 ? 'declining' : 'stable',
        growth_rate: values.length > 1 ? ((values[values.length - 1] - values[0]) / values[0] * 100).toFixed(1) : 0,
      });
    }

    if (action === 'deal_probability') {
      // Analyze deal conversion patterns
      const { data: closedDeals } = await supabase
        .from('deals')
        .select('value, stage, created_at, closed_at')
        .in('stage', ['closed_won', 'closed_lost'])
        .gte('closed_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

      const wonDeals = closedDeals?.filter(d => d.stage === 'closed_won') || [];
      const lostDeals = closedDeals?.filter(d => d.stage === 'closed_lost') || [];

      const winRate = closedDeals?.length ? (wonDeals.length / closedDeals.length * 100) : 0;

      // Get open deals
      const { data: openDeals } = await supabase
        .from('deals')
        .select('id, value, stage, probability, expected_close_date, created_at')
        .not('stage', 'in', '("closed_won","closed_lost")');

      // Calculate predicted outcomes
      const predictions = openDeals?.map(deal => {
        const daysOpen = Math.floor((Date.now() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24));
        const stageMultiplier = getStageMultiplier(deal.stage);
        const adjustedProbability = Math.min(100, (deal.probability || 50) * stageMultiplier * (daysOpen < 30 ? 1 : 0.9));

        return {
          deal_id: deal.id,
          current_stage: deal.stage,
          value: deal.value,
          original_probability: deal.probability,
          adjusted_probability: Math.round(adjustedProbability),
          expected_value: Math.round((deal.value || 0) * (adjustedProbability / 100)),
          days_open: daysOpen,
          risk_level: adjustedProbability < 30 ? 'high' : adjustedProbability < 60 ? 'medium' : 'low',
        };
      });

      return NextResponse.json({
        win_rate: winRate.toFixed(1),
        total_analyzed: closedDeals?.length || 0,
        predictions: predictions || [],
        pipeline_expected_value: predictions?.reduce((sum, p) => sum + p.expected_value, 0) || 0,
      });
    }

    if (action === 'churn_risk') {
      // Analyze customer engagement for churn prediction
      const { data: customers } = await supabase
        .from('contacts')
        .select('id, email, last_activity_at, total_revenue, created_at')
        .not('last_activity_at', 'is', null);

      const now = Date.now();
      const churnAnalysis = customers?.map(customer => {
        const daysSinceActivity = Math.floor((now - new Date(customer.last_activity_at).getTime()) / (1000 * 60 * 60 * 24));
        const customerAge = Math.floor((now - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24));

        let churnRisk = 0;
        if (daysSinceActivity > 90) churnRisk = 0.8;
        else if (daysSinceActivity > 60) churnRisk = 0.5;
        else if (daysSinceActivity > 30) churnRisk = 0.3;
        else churnRisk = 0.1;

        return {
          customer_id: customer.id,
          days_since_activity: daysSinceActivity,
          total_revenue: customer.total_revenue || 0,
          churn_risk: churnRisk,
          risk_level: churnRisk > 0.6 ? 'high' : churnRisk > 0.3 ? 'medium' : 'low',
          recommended_action: churnRisk > 0.6 ? 'immediate_outreach' : churnRisk > 0.3 ? 'engagement_campaign' : 'monitor',
        };
      });

      const highRisk = churnAnalysis?.filter(c => c.risk_level === 'high') || [];
      const atRiskRevenue = highRisk.reduce((sum, c) => sum + c.total_revenue, 0);

      return NextResponse.json({
        total_customers: customers?.length || 0,
        high_risk_count: highRisk.length,
        at_risk_revenue: atRiskRevenue,
        analysis: churnAnalysis?.slice(0, 50) || [],
      });
    }

    if (action === 'resource_demand') {
      // Predict resource demand based on project pipeline
      const { data: upcomingProjects } = await supabase
        .from('projects')
        .select('id, name, start_date, end_date, budget, status')
        .in('status', ['planned', 'active'])
        .gte('start_date', new Date().toISOString())
        .lte('start_date', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());

      const { data: compvssProjects } = await supabase
        .from('compvss_projects')
        .select('id, name, start_date, end_date, crew_size')
        .in('status', ['planned', 'active'])
        .gte('start_date', new Date().toISOString())
        .lte('start_date', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());

      // Group by week
      const weeklyDemand: Record<string, { projects: number; crew_needed: number }> = {};

      upcomingProjects?.forEach(p => {
        const week = getWeekNumber(new Date(p.start_date));
        if (!weeklyDemand[week]) weeklyDemand[week] = { projects: 0, crew_needed: 0 };
        weeklyDemand[week].projects++;
      });

      compvssProjects?.forEach(p => {
        const week = getWeekNumber(new Date(p.start_date));
        if (!weeklyDemand[week]) weeklyDemand[week] = { projects: 0, crew_needed: 0 };
        weeklyDemand[week].projects++;
        weeklyDemand[week].crew_needed += p.crew_size || 5;
      });

      return NextResponse.json({
        upcoming_projects: (upcomingProjects?.length || 0) + (compvssProjects?.length || 0),
        weekly_demand: Object.entries(weeklyDemand).map(([week, data]) => ({
          week,
          ...data,
        })),
        peak_week: Object.entries(weeklyDemand).sort((a, b) => b[1].crew_needed - a[1].crew_needed)[0]?.[0],
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate predictions' }, { status: 500 });
  }
}

function getStageMultiplier(stage: string): number {
  const multipliers: Record<string, number> = {
    lead: 0.6,
    qualified: 0.8,
    proposal: 1.0,
    negotiation: 1.1,
  };
  return multipliers[stage] || 1.0;
}

function getWeekNumber(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 604800000;
  const weekNum = Math.ceil(diff / oneWeek);
  return `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}
