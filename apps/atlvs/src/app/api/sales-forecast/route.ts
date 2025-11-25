import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Sales forecasting with trend analysis
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') || '6');

    // Get pipeline deals
    const { data: deals } = await supabase.from('deals').select('*')
      .in('status', ['qualified', 'proposal', 'negotiation']);

    // Get historical closed deals
    const { data: closedDeals } = await supabase.from('deals').select('*')
      .eq('status', 'closed_won')
      .gte('closed_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    // Calculate weighted pipeline
    const weightedPipeline = deals?.reduce((sum, d) => {
      const probability = getProbability(d.status);
      return sum + (d.value * probability);
    }, 0) || 0;

    // Calculate historical win rate
    const { data: allDeals } = await supabase.from('deals').select('status')
      .in('status', ['closed_won', 'closed_lost']);
    const winRate = allDeals ? allDeals.filter(d => d.status === 'closed_won').length / allDeals.length : 0;

    // Generate monthly forecast
    const forecast = generateForecast(deals || [], closedDeals || [], months, winRate);

    // Trend analysis
    const trend = analyzeTrend(closedDeals || []);

    return NextResponse.json({
      weighted_pipeline: weightedPipeline,
      win_rate: Math.round(winRate * 100),
      forecast,
      trend,
      pipeline_by_stage: {
        qualified: deals?.filter(d => d.status === 'qualified').reduce((s, d) => s + d.value, 0) || 0,
        proposal: deals?.filter(d => d.status === 'proposal').reduce((s, d) => s + d.value, 0) || 0,
        negotiation: deals?.filter(d => d.status === 'negotiation').reduce((s, d) => s + d.value, 0) || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate forecast' }, { status: 500 });
  }
}

function getProbability(stage: string): number {
  const probabilities: Record<string, number> = {
    qualified: 0.2,
    proposal: 0.5,
    negotiation: 0.75,
    closed_won: 1.0
  };
  return probabilities[stage] || 0;
}

function generateForecast(pipeline: any[], historical: any[], months: number, winRate: number): any[] {
  const forecast: any[] = [];
  const avgDealValue = historical.length > 0 
    ? historical.reduce((s, d) => s + d.value, 0) / historical.length 
    : 50000;
  const avgDealsPerMonth = historical.length / 12;

  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const monthStr = date.toISOString().substring(0, 7);

    // Expected from pipeline
    const pipelineExpected = pipeline
      .filter(d => d.expected_close_date?.substring(0, 7) === monthStr)
      .reduce((s, d) => s + (d.value * getProbability(d.status)), 0);

    // Projected new deals
    const projectedNew = avgDealsPerMonth * avgDealValue * winRate;

    forecast.push({
      month: monthStr,
      pipeline_expected: Math.round(pipelineExpected),
      projected_new: Math.round(projectedNew),
      total_forecast: Math.round(pipelineExpected + projectedNew),
      confidence: i < 2 ? 'high' : i < 4 ? 'medium' : 'low'
    });
  }

  return forecast;
}

function analyzeTrend(historical: any[]): any {
  const byMonth: Record<string, number> = {};
  historical.forEach(d => {
    const month = d.closed_at?.substring(0, 7);
    if (month) byMonth[month] = (byMonth[month] || 0) + d.value;
  });

  const months = Object.keys(byMonth).sort();
  if (months.length < 2) return { direction: 'insufficient_data', change: 0 };

  const recent = months.slice(-3);
  const earlier = months.slice(-6, -3);

  const recentAvg = recent.reduce((s, m) => s + byMonth[m], 0) / recent.length;
  const earlierAvg = earlier.length > 0 ? earlier.reduce((s, m) => s + byMonth[m], 0) / earlier.length : recentAvg;

  const change = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;

  return {
    direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
    change: Math.round(change),
    recent_average: Math.round(recentAvg),
    monthly_data: byMonth
  };
}
