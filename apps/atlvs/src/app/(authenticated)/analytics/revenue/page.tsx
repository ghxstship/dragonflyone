'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface RevenueMetrics {
  total_revenue: number;
  revenue_change_percent: number;
  average_event_value: number;
  revenue_by_source: Array<{ source: string; amount: number; percentage: number }>;
  revenue_by_event_type: Array<{ event_type: string; amount: number; count: number }>;
  monthly_trend: Array<{ month: string; revenue: number; booking_count: number }>;
}

export default function RevenueAnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['revenue-analytics', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/revenue?range=${dateRange}`);
      if (!response.ok) {
        return {
          total_revenue: 0,
          revenue_change_percent: 0,
          average_event_value: 0,
          revenue_by_source: [],
          revenue_by_event_type: [],
          monthly_trend: [],
        };
      }
      return response.json() as Promise<RevenueMetrics>;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading revenue data...</div>
      </div>
    );
  }

  const metrics = data || {
    total_revenue: 0,
    revenue_change_percent: 0,
    average_event_value: 0,
    revenue_by_source: [],
    revenue_by_event_type: [],
    monthly_trend: [],
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/analytics"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">Revenue Analytics</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Deep dive into revenue performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-muted/30 rounded-button p-1">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-button text-body-sm transition-colors ${
                dateRange === range
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-sm text-muted-foreground">Total Revenue</span>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="text-h2-md font-weight-bold text-foreground">
            {formatCurrency(metrics.total_revenue)}
          </p>
          <div className={`flex items-center gap-1 mt-2 text-body-sm ${
            metrics.revenue_change_percent >= 0 ? 'text-success-600' : 'text-error-600'
          }`}>
            {metrics.revenue_change_percent >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(metrics.revenue_change_percent).toFixed(1)}% vs previous period</span>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-sm text-muted-foreground">Average Event Value</span>
            <BarChart3 className="h-5 w-5 text-secondary" />
          </div>
          <p className="text-h2-md font-weight-bold text-foreground">
            {formatCurrency(metrics.average_event_value)}
          </p>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-sm text-muted-foreground">Revenue Sources</span>
            <PieChart className="h-5 w-5 text-accent" />
          </div>
          <p className="text-h2-md font-weight-bold text-foreground">
            {metrics.revenue_by_source.length}
          </p>
          <p className="text-body-xs text-muted-foreground mt-1">Active revenue streams</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <h3 className="text-body-md font-weight-semibold text-foreground mb-4">Revenue by Source</h3>
          {metrics.revenue_by_source.length === 0 ? (
            <p className="text-body-sm text-muted-foreground text-center py-8">No data available</p>
          ) : (
            <div className="space-y-3">
              {metrics.revenue_by_source.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-body-sm text-foreground capitalize">{source.source}</span>
                    <span className="text-body-sm font-weight-medium text-foreground">
                      {formatCurrency(source.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-avatar h-2">
                    <div
                      className="bg-primary h-2 rounded-avatar transition-all"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <h3 className="text-body-md font-weight-semibold text-foreground mb-4">Revenue by Event Type</h3>
          {metrics.revenue_by_event_type.length === 0 ? (
            <p className="text-body-sm text-muted-foreground text-center py-8">No data available</p>
          ) : (
            <div className="space-y-3">
              {metrics.revenue_by_event_type.map((type) => (
                <div key={type.event_type} className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
                  <div>
                    <p className="text-body-sm font-weight-medium text-foreground capitalize">
                      {type.event_type.replace('_', ' ')}
                    </p>
                    <p className="text-body-xs text-muted-foreground">{type.count} events</p>
                  </div>
                  <p className="text-body-md font-weight-semibold text-foreground">
                    {formatCurrency(type.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <h3 className="text-body-md font-weight-semibold text-foreground mb-4">Monthly Trend</h3>
        {metrics.monthly_trend.length === 0 ? (
          <p className="text-body-sm text-muted-foreground text-center py-8">No data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-body-sm font-weight-medium text-muted-foreground">Month</th>
                  <th className="text-right py-3 text-body-sm font-weight-medium text-muted-foreground">Revenue</th>
                  <th className="text-right py-3 text-body-sm font-weight-medium text-muted-foreground">Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {metrics.monthly_trend.map((month) => (
                  <tr key={month.month}>
                    <td className="py-3 text-body-sm text-foreground">{month.month}</td>
                    <td className="py-3 text-body-sm text-foreground text-right font-weight-medium">
                      {formatCurrency(month.revenue)}
                    </td>
                    <td className="py-3 text-body-sm text-foreground text-right">{month.booking_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
