import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { apiRoute } from '@ghxstship/config/middleware';
import { PlatformRole } from '@ghxstship/config/roles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const forecastSchema = z.object({
  event_id: z.string().uuid(),
  forecast_type: z.enum(['optimistic', 'realistic', 'pessimistic', 'monte_carlo']),
  base_budget: z.number().positive(),
  contingency_percentage: z.number().min(0).max(50).default(10),
  assumptions: z.object({
    labor_cost_increase: z.number().default(0),
    equipment_cost_increase: z.number().default(0),
    vendor_cost_increase: z.number().default(0),
    overhead_percentage: z.number().default(15)
  }).optional(),
  risk_factors: z.array(z.object({
    category: z.string(),
    probability: z.number().min(0).max(100),
    impact_min: z.number(),
    impact_max: z.number()
  })).optional()
});

// GET - Get budget forecast or historical data
export const GET = apiRoute(
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const event_id = searchParams.get('event_id');
    const forecast_id = searchParams.get('forecast_id');
    const action = searchParams.get('action');

    if (action === 'compare' && event_id) {
      // Compare forecast vs actual
      const { data: forecast } = await supabase
        .from('budget_forecasts')
        .select('*')
        .eq('event_id', event_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Use RPC for grouped aggregation since Supabase JS doesn't support .group()
      const { data: actuals } = await supabase
        .rpc('get_expenses_by_category', { p_event_id: event_id });

      const comparison = {
        forecast: forecast?.forecast_data || {},
        actuals: actuals || [],
        variance: calculateVariance(forecast?.forecast_data, actuals)
      };

      return NextResponse.json({ comparison });
    }

    if (forecast_id) {
      const { data, error } = await supabase
        .from('budget_forecasts')
        .select('*')
        .eq('id', forecast_id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ forecast: data });
    }

    // List all forecasts for event
    const { data, error } = await supabase
      .from('budget_forecasts')
      .select(`
        *,
        events (
          id,
          name,
          date,
          total_budget
        )
      `)
      .eq('event_id', event_id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ forecasts: data });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER],
    audit: { action: 'budget_forecast:list', resource: 'budget_forecasts' }
  }
);

// POST - Generate budget forecast
export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const validated = forecastSchema.parse(body);

    // Get historical data for similar events
    const historicalData = await getHistoricalData(validated.event_id);

    // Generate forecast based on type
    let forecastData;
    switch (validated.forecast_type) {
      case 'optimistic':
        forecastData = generateOptimisticForecast(validated, historicalData);
        break;
      case 'pessimistic':
        forecastData = generatePessimisticForecast(validated, historicalData);
        break;
      case 'realistic':
        forecastData = generateRealisticForecast(validated, historicalData);
        break;
      case 'monte_carlo':
        forecastData = generateMonteCarloForecast(validated, historicalData);
        break;
    }

    const { data: forecast, error } = await supabase
      .from('budget_forecasts')
      .insert({
        event_id: validated.event_id,
        forecast_type: validated.forecast_type,
        base_budget: validated.base_budget,
        forecast_data: forecastData,
        assumptions: validated.assumptions,
        risk_factors: validated.risk_factors,
        created_by: context.user.id
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      forecast,
      summary: {
        estimated_total: forecastData.total,
        confidence_interval: forecastData.confidence_interval,
        key_risks: forecastData.top_risks
      }
    }, { status: 201 });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    validation: forecastSchema,
    audit: { action: 'budget_forecast:create', resource: 'budget_forecasts' }
  }
);

// Helper functions
async function getHistoricalData(eventId: string) {
  // Get similar past events
  const { data: event } = await supabase
    .from('events')
    .select('event_type, expected_attendance')
    .eq('id', eventId)
    .single();

  if (!event) return null;

  const { data: historicalEvents } = await supabase
    .from('events')
    .select(`
      id,
      total_budget,
      actual_cost,
      event_expenses (
        category,
        amount
      )
    `)
    .eq('event_type', event.event_type)
    .lte('expected_attendance', event.expected_attendance * 1.2)
    .gte('expected_attendance', event.expected_attendance * 0.8)
    .limit(10);

  return historicalEvents || [];
}

function generateOptimisticForecast(config: any, historical: any[] | null) {
  const base = config.base_budget;
  const contingency = base * (config.contingency_percentage / 100);
  
  const categories = {
    labor: base * 0.35,
    equipment: base * 0.25,
    venue: base * 0.15,
    marketing: base * 0.10,
    production: base * 0.10,
    contingency: contingency * 0.5 // Lower contingency in optimistic
  };

  return {
    total: Object.values(categories).reduce((sum: number, val) => sum + val, 0),
    categories,
    confidence_interval: { min: base * 0.95, max: base * 1.05 },
    top_risks: []
  };
}

function generatePessimisticForecast(config: any, historical: any[] | null) {
  const base = config.base_budget;
  const contingency = base * (config.contingency_percentage / 100);
  
  // Apply cost increases
  const laborIncrease = 1 + ((config.assumptions?.labor_cost_increase || 10) / 100);
  const equipmentIncrease = 1 + ((config.assumptions?.equipment_cost_increase || 15) / 100);
  
  const categories = {
    labor: base * 0.35 * laborIncrease,
    equipment: base * 0.25 * equipmentIncrease,
    venue: base * 0.15 * 1.1,
    marketing: base * 0.10 * 1.05,
    production: base * 0.10 * 1.1,
    contingency: contingency * 1.5 // Higher contingency
  };

  return {
    total: Object.values(categories).reduce((sum: number, val) => sum + val, 0),
    categories,
    confidence_interval: { min: base * 1.1, max: base * 1.4 },
    top_risks: config.risk_factors || []
  };
}

function generateRealisticForecast(config: any, historical: any[] | null) {
  const base = config.base_budget;
  const contingency = base * (config.contingency_percentage / 100);
  
  // Use historical averages if available
  let avgMultiplier = 1.0;
  if (historical && historical.length > 0) {
    const totalActual = historical.reduce((sum, e) => sum + (e.actual_cost || e.total_budget), 0);
    const totalBudget = historical.reduce((sum, e) => sum + e.total_budget, 0);
    avgMultiplier = totalActual / totalBudget;
  }

  const categories = {
    labor: base * 0.35 * avgMultiplier,
    equipment: base * 0.25 * avgMultiplier,
    venue: base * 0.15 * avgMultiplier,
    marketing: base * 0.10 * avgMultiplier,
    production: base * 0.10 * avgMultiplier,
    contingency
  };

  return {
    total: Object.values(categories).reduce((sum: number, val) => sum + val, 0),
    categories,
    confidence_interval: { min: base * 0.95, max: base * 1.15 },
    top_risks: (config.risk_factors || []).filter((r: any) => r.probability > 50)
  };
}

function generateMonteCarloForecast(config: any, historical: any[] | null) {
  const iterations = 1000;
  const results = [];

  for (let i = 0; i < iterations; i++) {
    let total = config.base_budget;
    
    // Apply random variations based on risk factors
    if (config.risk_factors) {
      for (const risk of config.risk_factors) {
        if (Math.random() * 100 < risk.probability) {
          const impact = risk.impact_min + Math.random() * (risk.impact_max - risk.impact_min);
          total += impact;
        }
      }
    }
    
    results.push(total);
  }

  results.sort((a, b) => a - b);
  const p50 = results[Math.floor(iterations * 0.5)];
  const p10 = results[Math.floor(iterations * 0.1)];
  const p90 = results[Math.floor(iterations * 0.9)];

  return {
    total: p50,
    categories: {
      p10_estimate: p10,
      p50_estimate: p50,
      p90_estimate: p90
    },
    confidence_interval: { min: p10, max: p90 },
    top_risks: config.risk_factors || []
  };
}

function calculateVariance(forecast: any, actuals: any[]) {
  if (!forecast || !actuals) return {};
  
  const variance: any = {};
  for (const actual of actuals) {
    const forecastAmount = forecast.categories?.[actual.category] || 0;
    const actualAmount = actual.sum || 0;
    variance[actual.category] = {
      forecast: forecastAmount,
      actual: actualAmount,
      difference: actualAmount - forecastAmount,
      percentage: forecastAmount > 0 ? ((actualAmount - forecastAmount) / forecastAmount) * 100 : 0
    };
  }
  
  return variance;
}

// PUT - Update forecast
export const PUT = apiRoute(
  async (request: NextRequest) => {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('budget_forecasts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ forecast: data });
  },
  {
    auth: true,
    roles: [PlatformRole.COMPVSS_ADMIN],
    audit: { action: 'budget_forecast:update', resource: 'budget_forecasts' }
  }
);
