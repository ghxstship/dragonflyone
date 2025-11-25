import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ForecastSchema = z.object({
  period: z.enum(['month', 'quarter', 'year']),
  start_date: z.string(),
  end_date: z.string(),
  categories: z.array(z.object({
    name: z.string(),
    forecast_amount: z.number(),
    probability: z.number().min(0).max(100),
  })).optional(),
  notes: z.string().optional(),
});

// GET /api/crm/pipeline-forecasting - Get pipeline and forecasts
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
    const period = searchParams.get('period') || 'quarter';

    if (action === 'pipeline_summary') {
      // Get deals by stage
      const { data: deals } = await supabase
        .from('deals')
        .select('id, value, stage, probability, expected_close_date, owner_id')
        .not('stage', 'eq', 'closed_lost');

      // Group by stage
      const byStage: Record<string, { count: number; value: number; weighted_value: number }> = {};
      const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won'];

      stages.forEach(stage => {
        byStage[stage] = { count: 0, value: 0, weighted_value: 0 };
      });

      deals?.forEach(deal => {
        const stage = deal.stage || 'lead';
        if (byStage[stage]) {
          byStage[stage].count++;
          byStage[stage].value += deal.value || 0;
          byStage[stage].weighted_value += (deal.value || 0) * ((deal.probability || 0) / 100);
        }
      });

      const totalPipeline = deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;
      const weightedPipeline = deals?.reduce((sum, d) => sum + ((d.value || 0) * ((d.probability || 0) / 100)), 0) || 0;

      return NextResponse.json({
        pipeline: {
          total_value: totalPipeline,
          weighted_value: weightedPipeline,
          deal_count: deals?.length || 0,
          by_stage: byStage,
        },
      });
    }

    if (action === 'forecast') {
      // Get current period dates
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (period === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
      }

      // Get deals expected to close in period
      const { data: deals } = await supabase
        .from('deals')
        .select('*')
        .gte('expected_close_date', startDate.toISOString())
        .lte('expected_close_date', endDate.toISOString())
        .not('stage', 'eq', 'closed_lost');

      // Calculate forecast categories
      const committed = deals?.filter(d => (d.probability || 0) >= 90) || [];
      const bestCase = deals?.filter(d => (d.probability || 0) >= 70 && (d.probability || 0) < 90) || [];
      const pipeline = deals?.filter(d => (d.probability || 0) >= 30 && (d.probability || 0) < 70) || [];
      const upside = deals?.filter(d => (d.probability || 0) < 30) || [];

      const committedValue = committed.reduce((sum, d) => sum + (d.value || 0), 0);
      const bestCaseValue = bestCase.reduce((sum, d) => sum + (d.value || 0), 0);
      const pipelineValue = pipeline.reduce((sum, d) => sum + (d.value || 0), 0);
      const upsideValue = upside.reduce((sum, d) => sum + (d.value || 0), 0);

      // Get closed won in period
      const { data: closedWon } = await supabase
        .from('deals')
        .select('value')
        .eq('stage', 'closed_won')
        .gte('closed_at', startDate.toISOString())
        .lte('closed_at', endDate.toISOString());

      const closedValue = closedWon?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;

      // Get saved forecast if exists
      const { data: savedForecast } = await supabase
        .from('sales_forecasts')
        .select('*')
        .eq('period', period)
        .gte('start_date', startDate.toISOString())
        .lte('end_date', endDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return NextResponse.json({
        forecast: {
          period,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          closed: closedValue,
          committed: {
            value: committedValue,
            deals: committed.length,
          },
          best_case: {
            value: bestCaseValue,
            deals: bestCase.length,
          },
          pipeline: {
            value: pipelineValue,
            deals: pipeline.length,
          },
          upside: {
            value: upsideValue,
            deals: upside.length,
          },
          total_forecast: closedValue + committedValue + (bestCaseValue * 0.7) + (pipelineValue * 0.5),
          saved_forecast: savedForecast,
        },
      });
    }

    if (action === 'trends') {
      // Get historical data for trends
      const months = parseInt(searchParams.get('months') || '12');
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const { data: closedDeals } = await supabase
        .from('deals')
        .select('value, closed_at')
        .eq('stage', 'closed_won')
        .gte('closed_at', startDate.toISOString())
        .order('closed_at');

      // Group by month
      const monthlyData: Record<string, number> = {};
      closedDeals?.forEach(deal => {
        const month = deal.closed_at?.slice(0, 7);
        if (month) {
          monthlyData[month] = (monthlyData[month] || 0) + (deal.value || 0);
        }
      });

      // Calculate trend
      const values = Object.values(monthlyData);
      const avgValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      const recentAvg = values.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, values.length) || 0;
      const trend = avgValue > 0 ? ((recentAvg - avgValue) / avgValue * 100) : 0;

      return NextResponse.json({
        trends: {
          monthly_data: monthlyData,
          average_monthly: avgValue,
          recent_average: recentAvg,
          trend_percent: trend.toFixed(1),
          trend_direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat',
        },
      });
    }

    if (action === 'by_owner') {
      // Get pipeline by sales rep
      const { data: deals } = await supabase
        .from('deals')
        .select(`
          value, probability, stage, owner_id,
          owner:platform_users!owner_id(first_name, last_name)
        `)
        .not('stage', 'in', '("closed_won","closed_lost")');

      const byOwner: Record<string, { name: string; pipeline: number; weighted: number; deals: number }> = {};

      deals?.forEach(deal => {
        const ownerId = deal.owner_id || 'unassigned';
        const ownerName = deal.owner 
          ? `${(deal.owner as any).first_name} ${(deal.owner as any).last_name}`
          : 'Unassigned';

        if (!byOwner[ownerId]) {
          byOwner[ownerId] = { name: ownerName, pipeline: 0, weighted: 0, deals: 0 };
        }

        byOwner[ownerId].pipeline += deal.value || 0;
        byOwner[ownerId].weighted += (deal.value || 0) * ((deal.probability || 0) / 100);
        byOwner[ownerId].deals++;
      });

      return NextResponse.json({
        by_owner: Object.entries(byOwner).map(([id, data]) => ({
          owner_id: id,
          ...data,
        })),
      });
    }

    if (action === 'velocity') {
      // Calculate sales velocity metrics
      const { data: closedDeals } = await supabase
        .from('deals')
        .select('value, created_at, closed_at')
        .eq('stage', 'closed_won')
        .gte('closed_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      const { data: allDeals } = await supabase
        .from('deals')
        .select('id')
        .not('stage', 'in', '("closed_won","closed_lost")');

      const { data: wonDeals } = await supabase
        .from('deals')
        .select('id')
        .eq('stage', 'closed_won')
        .gte('closed_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      const { data: lostDeals } = await supabase
        .from('deals')
        .select('id')
        .eq('stage', 'closed_lost')
        .gte('closed_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      // Calculate average deal size
      const avgDealSize = closedDeals?.length 
        ? closedDeals.reduce((sum, d) => sum + (d.value || 0), 0) / closedDeals.length 
        : 0;

      // Calculate average sales cycle
      const cycleTimes = closedDeals?.map(d => {
        const created = new Date(d.created_at).getTime();
        const closed = new Date(d.closed_at).getTime();
        return (closed - created) / (1000 * 60 * 60 * 24); // days
      }) || [];
      const avgCycle = cycleTimes.length ? cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length : 0;

      // Calculate win rate
      const totalClosed = (wonDeals?.length || 0) + (lostDeals?.length || 0);
      const winRate = totalClosed > 0 ? ((wonDeals?.length || 0) / totalClosed * 100) : 0;

      // Sales velocity = (# opportunities × avg deal size × win rate) / sales cycle
      const velocity = avgCycle > 0 
        ? ((allDeals?.length || 0) * avgDealSize * (winRate / 100)) / avgCycle 
        : 0;

      return NextResponse.json({
        velocity: {
          opportunities: allDeals?.length || 0,
          average_deal_size: avgDealSize,
          win_rate: winRate.toFixed(1),
          average_cycle_days: avgCycle.toFixed(1),
          sales_velocity: velocity.toFixed(2),
          velocity_interpretation: `$${velocity.toFixed(0)} potential revenue per day`,
        },
      });
    }

    // Default: Get overview
    return NextResponse.json({
      message: 'Use action parameter: pipeline_summary, forecast, trends, by_owner, velocity',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch CRM data' }, { status: 500 });
  }
}

// POST /api/crm/pipeline-forecasting - Save forecast or update deal
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
    const action = body.action || 'save_forecast';

    if (action === 'save_forecast') {
      const validated = ForecastSchema.parse(body);

      const { data: forecast, error } = await supabase
        .from('sales_forecasts')
        .insert({
          ...validated,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ forecast }, { status: 201 });
    } else if (action === 'update_probability') {
      const { deal_id, probability, notes } = body;

      const { data: deal, error } = await supabase
        .from('deals')
        .update({
          probability,
          probability_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', deal_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ deal });
    } else if (action === 'move_stage') {
      const { deal_id, new_stage, notes } = body;

      // Get current deal
      const { data: currentDeal } = await supabase
        .from('deals')
        .select('stage')
        .eq('id', deal_id)
        .single();

      // Update deal
      const updates: any = {
        stage: new_stage,
        updated_at: new Date().toISOString(),
      };

      if (new_stage === 'closed_won' || new_stage === 'closed_lost') {
        updates.closed_at = new Date().toISOString();
      }

      const { data: deal, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', deal_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log stage change
      await supabase.from('deal_stage_history').insert({
        deal_id,
        from_stage: currentDeal?.stage,
        to_stage: new_stage,
        notes,
        changed_by: user.id,
      });

      return NextResponse.json({ deal });
    } else if (action === 'bulk_update_forecast') {
      const { deals } = body;

      const updates = [];
      for (const dealUpdate of deals) {
        const { data } = await supabase
          .from('deals')
          .update({
            probability: dealUpdate.probability,
            expected_close_date: dealUpdate.expected_close_date,
            updated_at: new Date().toISOString(),
          })
          .eq('id', dealUpdate.deal_id)
          .select()
          .single();

        if (data) updates.push(data);
      }

      return NextResponse.json({ updated: updates.length });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
