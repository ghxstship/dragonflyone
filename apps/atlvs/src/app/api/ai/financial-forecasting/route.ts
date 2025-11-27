import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET /api/ai/financial-forecasting - AI-powered financial forecasting
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
    const months = parseInt(searchParams.get('months') || '12');

    if (action === 'revenue_forecast') {
      // Get historical revenue data
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, paid_at, category')
        .eq('status', 'paid')
        .gte('paid_at', new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString())
        .order('paid_at');

      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at');

      // Group by month
      const monthlyRevenue: Record<string, number> = {};
      invoices?.forEach(inv => {
        const month = inv.paid_at?.slice(0, 7);
        if (month) monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (inv.total_amount || 0);
      });
      orders?.forEach(order => {
        const month = order.created_at?.slice(0, 7);
        if (month) monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (order.total_amount || 0);
      });

      const sortedMonths = Object.keys(monthlyRevenue).sort();
      const values = sortedMonths.map(m => monthlyRevenue[m]);

      // Apply exponential smoothing with trend
      const forecast = exponentialSmoothingForecast(values, months);

      // Detect seasonality
      const seasonality = detectSeasonality(values);

      // Apply seasonal adjustments
      const adjustedForecast = forecast.map((value, index) => {
        const monthIndex = (sortedMonths.length + index) % 12;
        return value * (seasonality[monthIndex] || 1);
      });

      // Generate forecast months
      const lastMonth = sortedMonths[sortedMonths.length - 1];
      const forecastMonths = [];
      const [year, month] = lastMonth.split('-').map(Number);
      for (let i = 1; i <= months; i++) {
        const forecastDate = new Date(year, month - 1 + i, 1);
        forecastMonths.push(forecastDate.toISOString().slice(0, 7));
      }

      return NextResponse.json({
        historical: sortedMonths.map((m, i) => ({ month: m, revenue: values[i] })),
        forecast: forecastMonths.map((m, i) => ({
          month: m,
          predicted_revenue: Math.round(adjustedForecast[i]),
          confidence_low: Math.round(adjustedForecast[i] * 0.85),
          confidence_high: Math.round(adjustedForecast[i] * 1.15),
        })),
        seasonality_factors: seasonality,
        model_accuracy: calculateModelAccuracy(values),
      });
    }

    if (action === 'expense_forecast') {
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount, category, expense_date')
        .gte('expense_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .order('expense_date');

      // Group by category and month
      const categoryExpenses: Record<string, Record<string, number>> = {};
      expenses?.forEach(exp => {
        const month = exp.expense_date?.slice(0, 7);
        const category = exp.category || 'other';
        if (month) {
          if (!categoryExpenses[category]) categoryExpenses[category] = {};
          categoryExpenses[category][month] = (categoryExpenses[category][month] || 0) + (exp.amount || 0);
        }
      });

      // Forecast each category
      const categoryForecasts: Record<string, any[]> = {};
      for (const [category, monthlyData] of Object.entries(categoryExpenses)) {
        const sortedMonths = Object.keys(monthlyData).sort();
        const values = sortedMonths.map(m => monthlyData[m]);
        const forecast = exponentialSmoothingForecast(values, months);

        const lastMonth = sortedMonths[sortedMonths.length - 1];
        const [year, month] = lastMonth.split('-').map(Number);
        categoryForecasts[category] = [];

        for (let i = 0; i < months; i++) {
          const forecastDate = new Date(year, month - 1 + i + 1, 1);
          categoryForecasts[category].push({
            month: forecastDate.toISOString().slice(0, 7),
            predicted_expense: Math.round(forecast[i]),
          });
        }
      }

      return NextResponse.json({ expense_forecasts: categoryForecasts });
    }

    if (action === 'cash_flow') {
      // Get accounts receivable
      const { data: pendingInvoices } = await supabase
        .from('invoices')
        .select('total_amount, due_date')
        .eq('status', 'pending')
        .gte('due_date', new Date().toISOString());

      // Get accounts payable
      const { data: pendingBills } = await supabase
        .from('bills')
        .select('amount, due_date')
        .eq('status', 'pending')
        .gte('due_date', new Date().toISOString());

      // Project cash flow by week
      const weeks = 12;
      const cashFlowProjection = [];
      const now = new Date();

      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

        const inflows = pendingInvoices?.filter(inv => {
          const due = new Date(inv.due_date);
          return due >= weekStart && due < weekEnd;
        }).reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

        const outflows = pendingBills?.filter(bill => {
          const due = new Date(bill.due_date);
          return due >= weekStart && due < weekEnd;
        }).reduce((sum, bill) => sum + (bill.amount || 0), 0) || 0;

        cashFlowProjection.push({
          week: i + 1,
          week_start: weekStart.toISOString().slice(0, 10),
          inflows,
          outflows,
          net: inflows - outflows,
        });
      }

      // Calculate running balance
      let runningBalance = 0;
      cashFlowProjection.forEach(week => {
        runningBalance += week.net;
        (week as any).running_balance = runningBalance;
      });

      return NextResponse.json({
        cash_flow_projection: cashFlowProjection,
        total_receivables: pendingInvoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
        total_payables: pendingBills?.reduce((sum, bill) => sum + (bill.amount || 0), 0) || 0,
      });
    }

    if (action === 'profitability') {
      // Get revenue and costs by project
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, budget, actual_cost, revenue')
        .in('status', ['completed', 'active']);

      const profitabilityAnalysis = projects?.map(project => {
        const revenue = project.revenue || project.budget || 0;
        const cost = project.actual_cost || 0;
        const profit = revenue - cost;
        const margin = revenue > 0 ? (profit / revenue * 100) : 0;

        return {
          project_id: project.id,
          project_name: project.name,
          revenue,
          cost,
          profit,
          margin: margin.toFixed(1),
          status: margin > 20 ? 'healthy' : margin > 10 ? 'moderate' : 'at_risk',
        };
      });

      const avgMargin = profitabilityAnalysis?.length
        ? profitabilityAnalysis.reduce((sum, p) => sum + parseFloat(p.margin), 0) / profitabilityAnalysis.length
        : 0;

      return NextResponse.json({
        projects: profitabilityAnalysis || [],
        average_margin: avgMargin.toFixed(1),
        total_revenue: profitabilityAnalysis?.reduce((sum, p) => sum + p.revenue, 0) || 0,
        total_profit: profitabilityAnalysis?.reduce((sum, p) => sum + p.profit, 0) || 0,
      });
    }

    if (action === 'budget_variance') {
      const { data: budgets } = await supabase
        .from('budgets')
        .select('id, name, category, planned_amount, actual_amount, period_start, period_end')
        .gte('period_end', new Date().toISOString());

      const varianceAnalysis = budgets?.map(budget => {
        const variance = (budget.actual_amount || 0) - (budget.planned_amount || 0);
        const variancePercent = budget.planned_amount > 0
          ? (variance / budget.planned_amount * 100)
          : 0;

        return {
          budget_id: budget.id,
          name: budget.name,
          category: budget.category,
          planned: budget.planned_amount,
          actual: budget.actual_amount || 0,
          variance,
          variance_percent: variancePercent.toFixed(1),
          status: variancePercent > 10 ? 'over_budget' : variancePercent < -10 ? 'under_budget' : 'on_track',
        };
      });

      return NextResponse.json({
        budgets: varianceAnalysis || [],
        total_planned: budgets?.reduce((sum, b) => sum + (b.planned_amount || 0), 0) || 0,
        total_actual: budgets?.reduce((sum, b) => sum + (b.actual_amount || 0), 0) || 0,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate forecast' }, { status: 500 });
  }
}

// Exponential smoothing with trend (Holt's method)
function exponentialSmoothingForecast(data: number[], periods: number): number[] {
  if (data.length < 2) return Array(periods).fill(data[0] || 0);

  const alpha = 0.3; // Level smoothing
  const beta = 0.1; // Trend smoothing

  let level = data[0];
  let trend = data[1] - data[0];

  for (let i = 1; i < data.length; i++) {
    const prevLevel = level;
    level = alpha * data[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  const forecast = [];
  for (let i = 1; i <= periods; i++) {
    forecast.push(level + i * trend);
  }

  return forecast;
}

// Detect seasonality patterns
function detectSeasonality(data: number[]): number[] {
  if (data.length < 12) return Array(12).fill(1);

  const monthlyAverages = Array(12).fill(0);
  const monthlyCounts = Array(12).fill(0);

  data.forEach((value, index) => {
    const monthIndex = index % 12;
    monthlyAverages[monthIndex] += value;
    monthlyCounts[monthIndex]++;
  });

  const overallAverage = data.reduce((a, b) => a + b, 0) / data.length;

  return monthlyAverages.map((sum, i) => {
    const monthAvg = monthlyCounts[i] > 0 ? sum / monthlyCounts[i] : overallAverage;
    return overallAverage > 0 ? monthAvg / overallAverage : 1;
  });
}

// Calculate model accuracy using MAPE
function calculateModelAccuracy(data: number[]): number {
  if (data.length < 6) return 0;

  const trainSize = Math.floor(data.length * 0.8);
  const trainData = data.slice(0, trainSize);
  const testData = data.slice(trainSize);

  const forecast = exponentialSmoothingForecast(trainData, testData.length);

  let totalError = 0;
  testData.forEach((actual, i) => {
    if (actual > 0) {
      totalError += Math.abs((actual - forecast[i]) / actual);
    }
  });

  const mape = (totalError / testData.length) * 100;
  return Math.max(0, 100 - mape);
}
