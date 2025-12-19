'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Target, Clock, DollarSign, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface PipelineMetrics {
  total_deals: number;
  total_value: number;
  weighted_value: number;
  average_deal_size: number;
  win_rate: number;
  average_days_to_close: number;
  deals_by_stage: Array<{
    stage_id: string;
    stage_name: string;
    count: number;
    value: number;
    probability: number;
  }>;
  conversion_rates: Array<{
    from_stage: string;
    to_stage: string;
    rate: number;
  }>;
  trends: {
    deals_created_this_month: number;
    deals_created_last_month: number;
    deals_closed_this_month: number;
    deals_closed_last_month: number;
  };
}

export default function PipelineAnalyticsPage() {
  const [dateRange, setDateRange] = useState<'30d' | '90d' | '1y'>('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['pipeline-analytics', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/pipeline?range=${dateRange}`);
      if (!response.ok) {
        return {
          total_deals: 0,
          total_value: 0,
          weighted_value: 0,
          average_deal_size: 0,
          win_rate: 0,
          average_days_to_close: 0,
          deals_by_stage: [],
          conversion_rates: [],
          trends: {
            deals_created_this_month: 0,
            deals_created_last_month: 0,
            deals_closed_this_month: 0,
            deals_closed_last_month: 0,
          },
        };
      }
      return response.json() as Promise<PipelineMetrics>;
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
        <div className="animate-pulse text-muted-foreground">Loading pipeline data...</div>
      </div>
    );
  }

  const metrics = data || {
    total_deals: 0,
    total_value: 0,
    weighted_value: 0,
    average_deal_size: 0,
    win_rate: 0,
    average_days_to_close: 0,
    deals_by_stage: [],
    conversion_rates: [],
    trends: {
      deals_created_this_month: 0,
      deals_created_last_month: 0,
      deals_closed_this_month: 0,
      deals_closed_last_month: 0,
    },
  };

  const dealsCreatedChange = metrics.trends.deals_created_last_month > 0
    ? ((metrics.trends.deals_created_this_month - metrics.trends.deals_created_last_month) / metrics.trends.deals_created_last_month) * 100
    : 0;

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
            <h1 className="text-h2-md font-weight-bold text-foreground">Pipeline Analytics</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Deal flow and conversion analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-muted/30 rounded-button p-1">
          {(['30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-button text-body-sm transition-colors ${
                dateRange === range
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-sm text-muted-foreground">Total Pipeline Value</span>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">
            {formatCurrency(metrics.total_value)}
          </p>
          <p className="text-body-xs text-muted-foreground mt-1">
            Weighted: {formatCurrency(metrics.weighted_value)}
          </p>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-sm text-muted-foreground">Win Rate</span>
            <Target className="h-5 w-5 text-success-600" />
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">
            {metrics.win_rate.toFixed(1)}%
          </p>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-sm text-muted-foreground">Avg Days to Close</span>
            <Clock className="h-5 w-5 text-secondary" />
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">
            {metrics.average_days_to_close.toFixed(0)}
          </p>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-body-sm text-muted-foreground">Deals Created</span>
            <BarChart3 className="h-5 w-5 text-accent" />
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">
            {metrics.trends.deals_created_this_month}
          </p>
          <div className={`flex items-center gap-1 mt-1 text-body-xs ${
            dealsCreatedChange >= 0 ? 'text-success-600' : 'text-error-600'
          }`}>
            {dealsCreatedChange >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(dealsCreatedChange).toFixed(1)}% vs last month</span>
          </div>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <h3 className="text-body-md font-weight-semibold text-foreground mb-4">Pipeline by Stage</h3>
        {metrics.deals_by_stage.length === 0 ? (
          <p className="text-body-sm text-muted-foreground text-center py-8">No data available</p>
        ) : (
          <div className="space-y-4">
            {metrics.deals_by_stage.map((stage) => (
              <div key={stage.stage_id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm font-weight-medium text-foreground">
                      {stage.stage_name}
                    </span>
                    <span className="text-body-xs text-muted-foreground">
                      ({stage.count} deals)
                    </span>
                  </div>
                  <span className="text-body-sm font-weight-medium text-foreground">
                    {formatCurrency(stage.value)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-badge h-3">
                  <div
                    className="bg-primary h-3 rounded-badge transition-all"
                    style={{ width: `${stage.probability}%` }}
                  />
                </div>
                <p className="text-body-xs text-muted-foreground mt-1">
                  {stage.probability}% probability
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <h3 className="text-body-md font-weight-semibold text-foreground mb-4">Stage Conversion Rates</h3>
        {metrics.conversion_rates.length === 0 ? (
          <p className="text-body-sm text-muted-foreground text-center py-8">No data available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.conversion_rates.map((conv, i) => (
              <div key={i} className="p-4 bg-muted/30 rounded-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-body-sm text-foreground">{conv.from_stage}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-body-sm text-foreground">{conv.to_stage}</span>
                </div>
                <p className="text-h4-md font-weight-bold text-primary">
                  {conv.rate.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
