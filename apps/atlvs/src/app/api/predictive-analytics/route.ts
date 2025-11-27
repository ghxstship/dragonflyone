import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Predictive analytics and forecasting models
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model'); // 'revenue', 'demand', 'resource', 'risk'
    const months = parseInt(searchParams.get('months') || '6');

    const results: any = {};

    if (!model || model === 'revenue') {
      results.revenue = await predictRevenue(months);
    }

    if (!model || model === 'demand') {
      results.demand = await predictDemand(months);
    }

    if (!model || model === 'resource') {
      results.resource = await predictResourceNeeds(months);
    }

    if (!model || model === 'risk') {
      results.risk = await predictRisks();
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate predictions' }, { status: 500 });
  }
}

async function predictRevenue(months: number) {
  // Get historical revenue data
  const { data: historicalRevenue } = await supabase.from('invoices').select('amount, created_at')
    .eq('status', 'paid').order('created_at', { ascending: true });

  // Group by month
  const monthlyRevenue: Record<string, number> = {};
  historicalRevenue?.forEach(inv => {
    const month = inv.created_at.substring(0, 7);
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + inv.amount;
  });

  const sortedMonths = Object.keys(monthlyRevenue).sort();
  const recentMonths = sortedMonths.slice(-12);
  const avgGrowth = calculateGrowthRate(recentMonths.map(m => monthlyRevenue[m]));

  // Generate forecast
  const forecast: any[] = [];
  let lastValue = monthlyRevenue[recentMonths[recentMonths.length - 1]] || 0;

  for (let i = 1; i <= months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const predictedValue = lastValue * (1 + avgGrowth);
    
    forecast.push({
      month: date.toISOString().substring(0, 7),
      predicted: Math.round(predictedValue),
      confidence: Math.max(50, 95 - (i * 5)),
      range: {
        low: Math.round(predictedValue * 0.85),
        high: Math.round(predictedValue * 1.15)
      }
    });
    
    lastValue = predictedValue;
  }

  return {
    historical: recentMonths.map(m => ({ month: m, actual: monthlyRevenue[m] })),
    forecast,
    growth_rate: Math.round(avgGrowth * 100)
  };
}

async function predictDemand(months: number) {
  const { data: historicalProjects } = await supabase.from('projects').select('created_at, category')
    .order('created_at', { ascending: true });

  const monthlyDemand: Record<string, number> = {};
  historicalProjects?.forEach(proj => {
    const month = proj.created_at.substring(0, 7);
    monthlyDemand[month] = (monthlyDemand[month] || 0) + 1;
  });

  const sortedMonths = Object.keys(monthlyDemand).sort().slice(-12);
  const avgDemand = sortedMonths.reduce((s, m) => s + monthlyDemand[m], 0) / sortedMonths.length;

  const forecast: any[] = [];
  for (let i = 1; i <= months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    
    // Apply seasonality (simplified)
    const seasonalFactor = 1 + (Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.2);
    
    forecast.push({
      month: date.toISOString().substring(0, 7),
      predicted_projects: Math.round(avgDemand * seasonalFactor),
      confidence: Math.max(50, 90 - (i * 5))
    });
  }

  return { historical: sortedMonths.map(m => ({ month: m, projects: monthlyDemand[m] })), forecast };
}

async function predictResourceNeeds(months: number) {
  const { data: employees } = await supabase.from('employees').select('id, department');
  const { data: allocations } = await supabase.from('resource_allocations').select('*');

  const currentUtilization = employees?.length ? 
    (allocations?.reduce((s, a) => s + (a.allocation_percent || 0), 0) || 0) / (employees.length * 100) : 0;

  const forecast: any[] = [];
  for (let i = 1; i <= months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    
    forecast.push({
      month: date.toISOString().substring(0, 7),
      predicted_utilization: Math.min(100, Math.round(currentUtilization * 100 * (1 + i * 0.02))),
      hiring_recommendation: currentUtilization > 0.85 ? 'Consider hiring' : 'Adequate staffing'
    });
  }

  return { current_utilization: Math.round(currentUtilization * 100), forecast };
}

async function predictRisks() {
  const { data: projects } = await supabase.from('projects').select('*').eq('status', 'active');

  const risks = projects?.map(proj => {
    const budgetRisk = proj.spent_amount > proj.budget * 0.9 ? 'high' : proj.spent_amount > proj.budget * 0.7 ? 'medium' : 'low';
    const scheduleRisk = new Date(proj.end_date) < new Date() ? 'high' : 'low';
    
    return {
      project: proj.name,
      budget_risk: budgetRisk,
      schedule_risk: scheduleRisk,
      overall_risk: budgetRisk === 'high' || scheduleRisk === 'high' ? 'high' : 'medium'
    };
  }).filter(r => r.overall_risk !== 'low');

  return { at_risk_projects: risks, total_at_risk: risks?.length || 0 };
}

function calculateGrowthRate(values: number[]): number {
  if (values.length < 2) return 0.05;
  const growthRates = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i - 1] > 0) {
      growthRates.push((values[i] - values[i - 1]) / values[i - 1]);
    }
  }
  return growthRates.length > 0 ? growthRates.reduce((s, r) => s + r, 0) / growthRates.length : 0.05;
}
