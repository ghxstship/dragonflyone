'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, DollarSign, BarChart3, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface ForecastData {
  period: string;
  projected_revenue: number;
  projected_expenses: number;
  projected_profit: number;
  actual_revenue?: number;
  actual_expenses?: number;
  actual_profit?: number;
  variance_percentage?: number;
}

interface ForecastSummary {
  total_projected_revenue: number;
  total_projected_expenses: number;
  total_projected_profit: number;
  avg_monthly_revenue: number;
  growth_rate: number;
  accuracy_score: number;
}

const DEMO_FORECAST: ForecastData[] = [
  { period: '2025-01', projected_revenue: 125000, projected_expenses: 85000, projected_profit: 40000, actual_revenue: 128500, actual_expenses: 82000, actual_profit: 46500, variance_percentage: 16.25 },
  { period: '2025-02', projected_revenue: 135000, projected_expenses: 88000, projected_profit: 47000, actual_revenue: 132000, actual_expenses: 90000, actual_profit: 42000, variance_percentage: -10.64 },
  { period: '2025-03', projected_revenue: 145000, projected_expenses: 92000, projected_profit: 53000 },
  { period: '2025-04', projected_revenue: 160000, projected_expenses: 98000, projected_profit: 62000 },
  { period: '2025-05', projected_revenue: 175000, projected_expenses: 105000, projected_profit: 70000 },
  { period: '2025-06', projected_revenue: 190000, projected_expenses: 112000, projected_profit: 78000 },
];

const DEMO_SUMMARY: ForecastSummary = {
  total_projected_revenue: 930000,
  total_projected_expenses: 580000,
  total_projected_profit: 350000,
  avg_monthly_revenue: 155000,
  growth_rate: 8.5,
  accuracy_score: 92,
};

export default function BudgetForecastingPage() {
  const queryClient = useQueryClient();
  const [timeRange, setTimeRange] = useState('6m');
  const [forecastType, setForecastType] = useState<'revenue' | 'expenses' | 'profit'>('revenue');

  const { data, isLoading, error } = useQuery({
    queryKey: ['budget-forecast', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/budgets/forecasting?range=${timeRange}`);
      if (!response.ok) {
        return { forecast: DEMO_FORECAST, summary: DEMO_SUMMARY };
      }
      const result = await response.json();
      return result.forecast?.length ? result : { forecast: DEMO_FORECAST, summary: DEMO_SUMMARY };
    },
  });

  const forecast: ForecastData[] = data?.forecast || DEMO_FORECAST;
  const summary: ForecastSummary = data?.summary || DEMO_SUMMARY;

  const getVarianceColor = (variance?: number) => {
    if (variance === undefined) return 'text-muted-foreground';
    return variance >= 0 ? 'text-success' : 'text-destructive';
  };

  const maxValue = Math.max(
    ...forecast.map((f) =>
      forecastType === 'revenue' ? f.projected_revenue :
      forecastType === 'expenses' ? f.projected_expenses :
      f.projected_profit
    )
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading forecast data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Failed to load forecast data</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['budget-forecast'] })}
            className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/budgets"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">Budget Forecasting</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Financial projections and variance analysis
            </p>
          </div>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['budget-forecast'] })}
          className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="text-body-sm">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-success" />
            <span className="text-body-sm text-muted-foreground">Projected Revenue</span>
          </div>
          <p className="text-h3-md font-weight-bold text-success">
            ${(summary.total_projected_revenue / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-warning" />
            <span className="text-body-sm text-muted-foreground">Projected Expenses</span>
          </div>
          <p className="text-h3-md font-weight-bold text-warning">
            ${(summary.total_projected_expenses / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="bg-background border-2 border-primary/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Projected Profit</span>
          </div>
          <p className="text-h3-md font-weight-bold text-primary">
            ${(summary.total_projected_profit / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="bg-background border-2 border-secondary/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-secondary" />
            <span className="text-body-sm text-muted-foreground">Growth Rate</span>
          </div>
          <p className="text-h3-md font-weight-bold text-secondary">
            +{summary.growth_rate}%
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setForecastType('revenue')}
            className={`px-4 py-2 rounded-button text-body-sm transition-colors ${
              forecastType === 'revenue' ? 'bg-success text-success-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setForecastType('expenses')}
            className={`px-4 py-2 rounded-button text-body-sm transition-colors ${
              forecastType === 'expenses' ? 'bg-warning text-warning-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setForecastType('profit')}
            className={`px-4 py-2 rounded-button text-body-sm transition-colors ${
              forecastType === 'profit' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Profit
          </button>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:border-primary"
        >
          <option value="3m">3 Months</option>
          <option value="6m">6 Months</option>
          <option value="12m">12 Months</option>
          <option value="24m">24 Months</option>
        </select>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <h2 className="text-h4-md font-weight-semibold text-foreground mb-6">
          {forecastType === 'revenue' ? 'Revenue' : forecastType === 'expenses' ? 'Expenses' : 'Profit'} Forecast
        </h2>
        <div className="space-y-4">
          {forecast.map((item) => {
            const projected = forecastType === 'revenue' ? item.projected_revenue :
                             forecastType === 'expenses' ? item.projected_expenses :
                             item.projected_profit;
            const actual = forecastType === 'revenue' ? item.actual_revenue :
                          forecastType === 'expenses' ? item.actual_expenses :
                          item.actual_profit;
            const barWidth = (projected / maxValue) * 100;
            const actualWidth = actual ? (actual / maxValue) * 100 : 0;

            return (
              <div key={item.period} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm font-weight-medium text-foreground w-24">
                    {new Date(item.period + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-4 text-body-xs">
                    <span className="text-muted-foreground">
                      Projected: <span className="font-weight-medium text-foreground">${projected.toLocaleString()}</span>
                    </span>
                    {actual !== undefined && (
                      <span className="text-muted-foreground">
                        Actual: <span className={`font-weight-medium ${getVarianceColor(item.variance_percentage)}`}>
                          ${actual.toLocaleString()}
                        </span>
                      </span>
                    )}
                    {item.variance_percentage !== undefined && (
                      <span className={`font-weight-medium ${getVarianceColor(item.variance_percentage)}`}>
                        {item.variance_percentage >= 0 ? '+' : ''}{item.variance_percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative h-8 bg-muted rounded-button overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-button transition-all ${
                      forecastType === 'revenue' ? 'bg-success/30' :
                      forecastType === 'expenses' ? 'bg-warning/30' :
                      'bg-primary/30'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                  {actual !== undefined && (
                    <div
                      className={`absolute inset-y-0 left-0 rounded-button transition-all ${
                        forecastType === 'revenue' ? 'bg-success' :
                        forecastType === 'expenses' ? 'bg-warning' :
                        'bg-primary'
                      }`}
                      style={{ width: `${actualWidth}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${
              forecastType === 'revenue' ? 'bg-success/30' :
              forecastType === 'expenses' ? 'bg-warning/30' :
              'bg-primary/30'
            }`} />
            <span className="text-body-xs text-muted-foreground">Projected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${
              forecastType === 'revenue' ? 'bg-success' :
              forecastType === 'expenses' ? 'bg-warning' :
              'bg-primary'
            }`} />
            <span className="text-body-xs text-muted-foreground">Actual</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Forecast Accuracy</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${summary.accuracy_score * 2.51} 251`}
                  className="text-success"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-h4-md font-weight-bold text-foreground">{summary.accuracy_score}%</span>
              </div>
            </div>
            <div>
              <p className="text-body-sm text-muted-foreground">
                Your forecasts have been {summary.accuracy_score}% accurate over the past 6 months.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Key Metrics</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-muted-foreground">Avg Monthly Revenue</span>
              <span className="text-body-sm font-weight-semibold text-foreground">
                ${summary.avg_monthly_revenue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-muted-foreground">Profit Margin</span>
              <span className="text-body-sm font-weight-semibold text-success">
                {((summary.total_projected_profit / summary.total_projected_revenue) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-muted-foreground">Expense Ratio</span>
              <span className="text-body-sm font-weight-semibold text-warning">
                {((summary.total_projected_expenses / summary.total_projected_revenue) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-muted-foreground">YoY Growth</span>
              <span className="text-body-sm font-weight-semibold text-primary">
                +{summary.growth_rate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
