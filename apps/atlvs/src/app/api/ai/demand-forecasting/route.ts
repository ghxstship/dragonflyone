import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET /api/ai/demand-forecasting - Machine learning for demand forecasting
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
    const forecastPeriod = parseInt(searchParams.get('periods') || '12');

    if (action === 'sales_forecast') {
      // Get historical sales data
      const { data: salesData } = await supabase
        .from('orders')
        .select('total_amount, created_at, product_category')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at');

      // Group by month
      const monthlySales: Record<string, number> = {};
      salesData?.forEach(order => {
        const month = order.created_at?.slice(0, 7);
        if (month) {
          monthlySales[month] = (monthlySales[month] || 0) + (order.total_amount || 0);
        }
      });

      const months = Object.keys(monthlySales).sort();
      const values = months.map(m => monthlySales[m]);

      // Apply Holt-Winters exponential smoothing
      const forecast = holtWintersForecast(values, forecastPeriod);

      // Generate forecast months
      const lastMonth = months[months.length - 1];
      const [year, month] = lastMonth.split('-').map(Number);
      const forecastMonths = [];
      for (let i = 1; i <= forecastPeriod; i++) {
        const forecastDate = new Date(year, month - 1 + i, 1);
        forecastMonths.push(forecastDate.toISOString().slice(0, 7));
      }

      return NextResponse.json({
        historical: months.map((m, i) => ({ month: m, sales: values[i] })),
        forecast: forecastMonths.map((m, i) => ({
          month: m,
          predicted_sales: Math.round(forecast.predictions[i]),
          confidence_low: Math.round(forecast.predictions[i] * (1 - forecast.confidence[i])),
          confidence_high: Math.round(forecast.predictions[i] * (1 + forecast.confidence[i])),
        })),
        model_metrics: {
          trend: forecast.trend,
          seasonality: forecast.seasonality,
          accuracy: forecast.accuracy,
        },
      });
    }

    if (action === 'inventory_forecast') {
      // Get inventory and sales data
      const { data: products } = await supabase
        .from('merchandise_products')
        .select('id, name, stock_quantity, reorder_point')
        .eq('status', 'active');

      const { data: salesHistory } = await supabase
        .from('order_items')
        .select('product_id, quantity, created_at')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      // Calculate sales velocity per product
      const productSales: Record<string, number[]> = {};
      salesHistory?.forEach(item => {
        if (!productSales[item.product_id]) productSales[item.product_id] = [];
        productSales[item.product_id].push(item.quantity || 0);
      });

      // Forecast inventory needs
      const inventoryForecast = products?.map(product => {
        const sales = productSales[product.id] || [];
        const avgDailySales = sales.length > 0
          ? sales.reduce((a, b) => a + b, 0) / 90
          : 0;

        const daysOfStock = avgDailySales > 0
          ? Math.round((product.stock_quantity || 0) / avgDailySales)
          : 999;

        const forecastedDemand = Math.round(avgDailySales * 30);
        const reorderNeeded = (product.stock_quantity || 0) <= (product.reorder_point || 0);

        return {
          product_id: product.id,
          product_name: product.name,
          current_stock: product.stock_quantity,
          avg_daily_sales: avgDailySales.toFixed(2),
          days_of_stock: daysOfStock,
          forecasted_monthly_demand: forecastedDemand,
          reorder_needed: reorderNeeded,
          recommended_order_quantity: reorderNeeded
            ? Math.max(0, forecastedDemand * 2 - (product.stock_quantity || 0))
            : 0,
        };
      });

      return NextResponse.json({
        inventory_forecast: inventoryForecast?.sort((a, b) => a.days_of_stock - b.days_of_stock) || [],
        summary: {
          products_needing_reorder: inventoryForecast?.filter(p => p.reorder_needed).length || 0,
          low_stock_products: inventoryForecast?.filter(p => p.days_of_stock < 14).length || 0,
        },
      });
    }

    if (action === 'event_demand') {
      // Get event ticket sales data
      const { data: events } = await supabase
        .from('events')
        .select('id, name, event_date, capacity, tickets_sold, genres, venue_city')
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString())
        .lte('event_date', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());

      // Get historical similar events
      const { data: pastEvents } = await supabase
        .from('events')
        .select('genres, venue_city, capacity, tickets_sold, event_date')
        .lt('event_date', new Date().toISOString())
        .gte('event_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      // Forecast demand for each upcoming event
      const eventForecasts = events?.map(event => {
        // Find similar past events
        const similarEvents = pastEvents?.filter(pe =>
          pe.genres?.some((g: string) => event.genres?.includes(g)) ||
          pe.venue_city === event.venue_city
        ) || [];

        // Calculate average sell-through
        const avgSellThrough = similarEvents.length > 0
          ? similarEvents.reduce((sum, e) => sum + ((e.tickets_sold || 0) / (e.capacity || 1)), 0) / similarEvents.length
          : 0.6;

        const predictedSales = Math.round((event.capacity || 1000) * avgSellThrough);
        const currentSales = event.tickets_sold || 0;
        const daysUntil = Math.ceil((new Date(event.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

        // Calculate required daily sales velocity
        const remainingTickets = predictedSales - currentSales;
        const requiredVelocity = daysUntil > 0 ? Math.ceil(remainingTickets / daysUntil) : 0;

        return {
          event_id: event.id,
          event_name: event.name,
          event_date: event.event_date,
          capacity: event.capacity,
          current_sales: currentSales,
          predicted_final_sales: predictedSales,
          predicted_sell_through: Math.round(avgSellThrough * 100),
          days_until_event: daysUntil,
          required_daily_velocity: requiredVelocity,
          on_track: currentSales >= (predictedSales * (1 - daysUntil / 90)),
          risk_level: currentSales < predictedSales * 0.3 && daysUntil < 30 ? 'high' :
                      currentSales < predictedSales * 0.5 && daysUntil < 14 ? 'medium' : 'low',
        };
      });

      return NextResponse.json({
        event_forecasts: eventForecasts || [],
        summary: {
          total_events: events?.length || 0,
          high_risk_events: eventForecasts?.filter(e => e.risk_level === 'high').length || 0,
          total_predicted_revenue: eventForecasts?.reduce((sum, e) => sum + e.predicted_final_sales * 50, 0) || 0, // Assuming avg ticket price
        },
      });
    }

    if (action === 'resource_demand') {
      // Get project pipeline
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, start_date, end_date, budget, team_size, required_skills')
        .in('status', ['planned', 'active'])
        .gte('end_date', new Date().toISOString());

      // Get crew availability
      const { data: crew } = await supabase
        .from('crew_profiles')
        .select('id, skills')
        .eq('is_available', true);

      // Forecast resource needs by week
      const weeklyDemand: Record<string, { projects: number; crew_needed: number; skills_needed: Record<string, number> }> = {};

      projects?.forEach(project => {
        const start = new Date(project.start_date);
        const end = new Date(project.end_date);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
          const week = getWeekKey(d);
          if (!weeklyDemand[week]) {
            weeklyDemand[week] = { projects: 0, crew_needed: 0, skills_needed: {} };
          }
          weeklyDemand[week].projects++;
          weeklyDemand[week].crew_needed += project.team_size || 5;

          project.required_skills?.forEach((skill: string) => {
            weeklyDemand[week].skills_needed[skill] = (weeklyDemand[week].skills_needed[skill] || 0) + 1;
          });
        }
      });

      // Calculate skill availability
      const availableSkills: Record<string, number> = {};
      crew?.forEach(c => {
        c.skills?.forEach((skill: string) => {
          availableSkills[skill] = (availableSkills[skill] || 0) + 1;
        });
      });

      // Identify gaps
      const weeklyForecast = Object.entries(weeklyDemand).map(([week, data]) => {
        const skillGaps = Object.entries(data.skills_needed)
          .filter(([skill, needed]) => (availableSkills[skill] || 0) < needed)
          .map(([skill, needed]) => ({
            skill,
            needed,
            available: availableSkills[skill] || 0,
            gap: needed - (availableSkills[skill] || 0),
          }));

        return {
          week,
          ...data,
          total_crew_available: crew?.length || 0,
          crew_gap: Math.max(0, data.crew_needed - (crew?.length || 0)),
          skill_gaps: skillGaps,
        };
      }).sort((a, b) => a.week.localeCompare(b.week));

      return NextResponse.json({
        weekly_forecast: weeklyForecast,
        summary: {
          peak_demand_week: weeklyForecast.sort((a, b) => b.crew_needed - a.crew_needed)[0]?.week,
          max_crew_needed: Math.max(...weeklyForecast.map(w => w.crew_needed)),
          weeks_with_gaps: weeklyForecast.filter(w => w.crew_gap > 0).length,
        },
      });
    }

    if (action === 'seasonal_patterns') {
      // Analyze seasonal patterns in sales
      const { data: salesData } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString());

      // Group by month of year
      const monthlyPatterns: Record<number, number[]> = {};
      for (let i = 0; i < 12; i++) monthlyPatterns[i] = [];

      salesData?.forEach(order => {
        const month = new Date(order.created_at).getMonth();
        monthlyPatterns[month].push(order.total_amount || 0);
      });

      // Calculate seasonal indices
      const monthlyAverages = Object.entries(monthlyPatterns).map(([month, values]) => ({
        month: parseInt(month),
        average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
        sample_size: values.length,
      }));

      const overallAverage = monthlyAverages.reduce((sum, m) => sum + m.average, 0) / 12;

      const seasonalIndices = monthlyAverages.map(m => ({
        month: m.month,
        month_name: new Date(2024, m.month, 1).toLocaleString('default', { month: 'long' }),
        seasonal_index: overallAverage > 0 ? (m.average / overallAverage).toFixed(2) : '1.00',
        is_peak: m.average > overallAverage * 1.2,
        is_low: m.average < overallAverage * 0.8,
      }));

      return NextResponse.json({
        seasonal_patterns: seasonalIndices,
        peak_months: seasonalIndices.filter(s => s.is_peak).map(s => s.month_name),
        low_months: seasonalIndices.filter(s => s.is_low).map(s => s.month_name),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate forecast' }, { status: 500 });
  }
}

// Holt-Winters exponential smoothing
function holtWintersForecast(data: number[], periods: number): {
  predictions: number[];
  confidence: number[];
  trend: string;
  seasonality: number[];
  accuracy: number;
} {
  if (data.length < 12) {
    // Fall back to simple exponential smoothing
    return simpleExponentialSmoothing(data, periods);
  }

  const alpha = 0.3; // Level
  const beta = 0.1; // Trend
  const gamma = 0.3; // Seasonality
  const seasonLength = 12;

  // Initialize
  let level = data.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
  let trend = (data.slice(seasonLength, seasonLength * 2).reduce((a, b) => a + b, 0) -
               data.slice(0, seasonLength).reduce((a, b) => a + b, 0)) / (seasonLength * seasonLength);

  const seasonality = data.slice(0, seasonLength).map(v => level > 0 ? v / level : 1);

  // Fit model
  for (let i = seasonLength; i < data.length; i++) {
    const seasonIndex = i % seasonLength;
    const prevLevel = level;

    level = alpha * (data[i] / seasonality[seasonIndex]) + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    seasonality[seasonIndex] = gamma * (data[i] / level) + (1 - gamma) * seasonality[seasonIndex];
  }

  // Generate forecasts
  const predictions: number[] = [];
  const confidence: number[] = [];

  for (let i = 1; i <= periods; i++) {
    const seasonIndex = (data.length + i - 1) % seasonLength;
    const forecast = (level + i * trend) * seasonality[seasonIndex];
    predictions.push(Math.max(0, forecast));
    confidence.push(0.1 + (i * 0.02)); // Increasing uncertainty
  }

  // Calculate accuracy (MAPE on last 20% of data)
  const testSize = Math.floor(data.length * 0.2);
  let mape = 0;
  for (let i = data.length - testSize; i < data.length; i++) {
    const seasonIndex = i % seasonLength;
    const predicted = (level + (i - data.length + testSize) * trend) * seasonality[seasonIndex];
    if (data[i] > 0) {
      mape += Math.abs((data[i] - predicted) / data[i]);
    }
  }
  mape = (mape / testSize) * 100;

  return {
    predictions,
    confidence,
    trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
    seasonality,
    accuracy: Math.max(0, 100 - mape),
  };
}

function simpleExponentialSmoothing(data: number[], periods: number): {
  predictions: number[];
  confidence: number[];
  trend: string;
  seasonality: number[];
  accuracy: number;
} {
  const alpha = 0.3;
  let level = data[0];

  for (let i = 1; i < data.length; i++) {
    level = alpha * data[i] + (1 - alpha) * level;
  }

  const predictions = Array(periods).fill(level);
  const confidence = Array(periods).fill(0).map((_, i) => 0.15 + (i * 0.03));

  const trend = data.length >= 2
    ? (data[data.length - 1] > data[0] ? 'increasing' : data[data.length - 1] < data[0] ? 'decreasing' : 'stable')
    : 'stable';

  return {
    predictions,
    confidence,
    trend,
    seasonality: Array(12).fill(1),
    accuracy: 70,
  };
}

function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const oneJan = new Date(year, 0, 1);
  const weekNum = Math.ceil(((date.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
  return `${year}-W${weekNum.toString().padStart(2, '0')}`;
}
