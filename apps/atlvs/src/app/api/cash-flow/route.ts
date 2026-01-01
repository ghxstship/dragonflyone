export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createScenarioSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  scenario_type: z.enum(['optimistic', 'pessimistic', 'base', 'custom']),
  assumptions: z.record(z.unknown()).optional(),
  adjustments: z.object({
    revenue_growth: z.number().optional(),
    cost_reduction: z.number().optional(),
  }).optional(),
  forecast_months: z.number().min(1).max(60).optional(),
});

// GET - Fetch cash flow data and forecasts
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || new Date().toISOString().split('T')[0];
    const endDate = searchParams.get('end_date');
    const forecastMonths = parseInt(searchParams.get('forecast_months') || '6');

    // Fetch actual cash flow data
    const { data: ledgerEntries, error: ledgerError } = await supabase
      .from('ledger_entries')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate || new Date().toISOString())
      .order('date', { ascending: true });

    if (ledgerError) {
      return NextResponse.json({ error: ledgerError.message }, { status: 500 });
    }

    // Calculate actual cash flow by category
    const cashFlowByCategory = ledgerEntries.reduce((acc: Record<string, number>, entry) => {
      const category = entry.category || 'other';
      acc[category] = (acc[category] || 0) + (entry.amount || 0);
      return acc;
    }, {});

    // Fetch pending receivables
    const { data: receivables } = await supabase
      .from('docs_profile_invoice')
      .select('*')
      .eq('status', 'pending')
      .gte('due_date', new Date().toISOString());

    // Fetch pending payables
    const { data: payables } = await supabase
      .from('finance_expenses')
      .select('*')
      .in('status', ['pending', 'approved'])
      .gte('due_date', new Date().toISOString());

    // Calculate totals
    const totalReceivables = receivables?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;
    const totalPayables = payables?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;

    // Generate forecast
    const forecast = generateCashFlowForecast(
      ledgerEntries,
      receivables || [],
      payables || [],
      forecastMonths
    );

    // Get current cash position
    const { data: bankAccounts } = await supabase
      .from('bank_accounts')
      .select('balance')
      .eq('is_active', true);

    const currentCash = bankAccounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

    return NextResponse.json({
      current_cash: currentCash,
      cash_flow_by_category: cashFlowByCategory,
      pending_receivables: totalReceivables,
      pending_payables: totalPayables,
      net_working_capital: currentCash + totalReceivables - totalPayables,
      forecast,
      receivables_aging: calculateAging(receivables || []),
      payables_aging: calculateAging(payables || []),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cash flow data' },
      { status: 500 }
    );
  }
}

// POST - Create cash flow scenario
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createScenarioSchema.parse(body);
    const {
      name,
      description,
      scenario_type,
      assumptions,
      adjustments,
      forecast_months,
    } = validatedData;

    const { data: scenario, error } = await supabase
      .from('cash_flow_scenarios')
      .insert({
        name,
        description,
        scenario_type,
        assumptions,
        adjustments,
        forecast_months: forecast_months || 12,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    // Generate scenario forecast
    const forecast = await generateScenarioForecast(scenario);

    return NextResponse.json({ scenario, forecast }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create scenario' },
      { status: 500 }
    );
  }
}

function generateCashFlowForecast(
  historicalData: unknown[],
  receivables: unknown[],
  payables: unknown[],
  months: number
): unknown[] {
  const forecast: unknown[] = [];
  const today = new Date();

  // Calculate average monthly inflows and outflows from historical data
  const monthlyData = historicalData.reduce((acc: Record<string, { inflows: number; outflows: number }>, entry) => {
    const month = entry.date.substring(0, 7);
    if (!acc[month]) acc[month] = { inflows: 0, outflows: 0 };
    if (entry.amount > 0) {
      acc[month].inflows += entry.amount;
    } else {
      acc[month].outflows += Math.abs(entry.amount);
    }
    return acc;
  }, {});

  const monthlyValues = Object.values(monthlyData);
  const avgInflows = monthlyValues.length > 0
    ? monthlyValues.reduce((sum, m) => sum + m.inflows, 0) / monthlyValues.length
    : 0;
  const avgOutflows = monthlyValues.length > 0
    ? monthlyValues.reduce((sum, m) => sum + m.outflows, 0) / monthlyValues.length
    : 0;

  let runningBalance = 0;

  for (let i = 0; i < months; i++) {
    const forecastDate = new Date(today);
    forecastDate.setMonth(forecastDate.getMonth() + i);
    const monthStr = forecastDate.toISOString().substring(0, 7);

    // Add expected receivables for this month
    const expectedReceivables = receivables
      .filter(r => r.due_date?.substring(0, 7) === monthStr)
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    // Add expected payables for this month
    const expectedPayables = payables
      .filter(p => p.due_date?.substring(0, 7) === monthStr)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const projectedInflows = avgInflows + expectedReceivables;
    const projectedOutflows = avgOutflows + expectedPayables;
    const netCashFlow = projectedInflows - projectedOutflows;
    runningBalance += netCashFlow;

    forecast.push({
      month: monthStr,
      projected_inflows: Math.round(projectedInflows),
      projected_outflows: Math.round(projectedOutflows),
      net_cash_flow: Math.round(netCashFlow),
      ending_balance: Math.round(runningBalance),
      confidence: i < 3 ? 'high' : i < 6 ? 'medium' : 'low',
    });
  }

  return forecast;
}

function calculateAging(items: unknown[]): Record<string, number> {
  const today = new Date();
  const aging = {
    current: 0,
    '1-30': 0,
    '31-60': 0,
    '61-90': 0,
    '90+': 0,
  };

  items.forEach(item => {
    const dueDate = new Date(item.due_date);
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    const amount = item.amount || 0;

    if (daysDiff <= 0) {
      aging.current += amount;
    } else if (daysDiff <= 30) {
      aging['1-30'] += amount;
    } else if (daysDiff <= 60) {
      aging['31-60'] += amount;
    } else if (daysDiff <= 90) {
      aging['61-90'] += amount;
    } else {
      aging['90+'] += amount;
    }
  });

  return aging;
}

interface Scenario { forecast_months: number; adjustments?: { revenue_growth?: number; cost_reduction?: number }; scenario_type?: string }
interface ForecastItem { month: string; projected_inflows: number; projected_outflows: number; net_cash_flow: number }
async function generateScenarioForecast(scenario: Scenario): Promise<ForecastItem[]> {
  // Simplified scenario forecast generation
  const forecast: ForecastItem[] = [];
  const adjustments = scenario.adjustments || {};

  for (let i = 0; i < scenario.forecast_months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);

    let baseInflows = 100000; // Base assumption
    let baseOutflows = 80000;

    // Apply scenario adjustments
    if (scenario.scenario_type === 'optimistic') {
      baseInflows *= 1.2;
      baseOutflows *= 0.9;
    } else if (scenario.scenario_type === 'pessimistic') {
      baseInflows *= 0.8;
      baseOutflows *= 1.1;
    }

    // Apply custom adjustments
    if (adjustments.revenue_growth) {
      baseInflows *= (1 + adjustments.revenue_growth / 100);
    }
    if (adjustments.cost_reduction) {
      baseOutflows *= (1 - adjustments.cost_reduction / 100);
    }

    forecast.push({
      month: date.toISOString().substring(0, 7),
      projected_inflows: Math.round(baseInflows),
      projected_outflows: Math.round(baseOutflows),
      net_cash_flow: Math.round(baseInflows - baseOutflows),
    });
  }

  return forecast;
}
