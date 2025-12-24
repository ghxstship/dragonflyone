'use client';

import {
  Body,
  Button,
  H1,
  H3,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

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
            <H1 className="text-h2-md font-weight-bold text-foreground">Revenue Analytics</H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Deep dive into revenue performance
            </Body>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-muted/30 rounded-button p-1">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 rounded-button text-body-sm transition-colors ${
                dateRange === range
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Text className="text-body-sm text-muted-foreground">Total Revenue</Text>
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <Body className="text-h2-md font-weight-bold text-foreground">
            {formatCurrency(metrics.total_revenue)}
          </Body>
          <div className={`flex items-center gap-1 mt-2 text-body-sm ${
            metrics.revenue_change_percent >= 0 ? 'text-success-600' : 'text-error-600'
          }`}>
            {metrics.revenue_change_percent >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <Text>{Math.abs(metrics.revenue_change_percent).toFixed(1)}% vs previous period</Text>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Text className="text-body-sm text-muted-foreground">Average Event Value</Text>
            <BarChart3 className="h-5 w-5 text-secondary" />
          </div>
          <Body className="text-h2-md font-weight-bold text-foreground">
            {formatCurrency(metrics.average_event_value)}
          </Body>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Text className="text-body-sm text-muted-foreground">Revenue Sources</Text>
            <PieChart className="h-5 w-5 text-accent" />
          </div>
          <Body className="text-h2-md font-weight-bold text-foreground">
            {metrics.revenue_by_source.length}
          </Body>
          <Body className="text-body-xs text-muted-foreground mt-1">Active revenue streams</Body>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <H3 className="text-body-md font-weight-semibold text-foreground mb-4">Revenue by Source</H3>
          {metrics.revenue_by_source.length === 0 ? (
            <Body className="text-body-sm text-muted-foreground text-center py-8">No data available</Body>
          ) : (
            <div className="space-y-3">
              {metrics.revenue_by_source.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-1">
                    <Text className="text-body-sm text-foreground capitalize">{source.source}</Text>
                    <Text className="text-body-sm font-weight-medium text-foreground">
                      {formatCurrency(source.amount)}
                    </Text>
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
          <H3 className="text-body-md font-weight-semibold text-foreground mb-4">Revenue by Event Type</H3>
          {metrics.revenue_by_event_type.length === 0 ? (
            <Body className="text-body-sm text-muted-foreground text-center py-8">No data available</Body>
          ) : (
            <div className="space-y-3">
              {metrics.revenue_by_event_type.map((type) => (
                <div key={type.event_type} className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
                  <div>
                    <Body className="text-body-sm font-weight-medium text-foreground capitalize">
                      {type.event_type.replace('_', ' ')}
                    </Body>
                    <Body className="text-body-xs text-muted-foreground">{type.count} events</Body>
                  </div>
                  <Body className="text-body-md font-weight-semibold text-foreground">
                    {formatCurrency(type.amount)}
                  </Body>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <H3 className="text-body-md font-weight-semibold text-foreground mb-4">Monthly Trend</H3>
        {metrics.monthly_trend.length === 0 ? (
          <Body className="text-body-sm text-muted-foreground text-center py-8">No data available</Body>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="text-left py-3 text-body-sm font-weight-medium text-muted-foreground">Month</TableHead>
                  <TableHead className="text-right py-3 text-body-sm font-weight-medium text-muted-foreground">Revenue</TableHead>
                  <TableHead className="text-right py-3 text-body-sm font-weight-medium text-muted-foreground">Bookings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {metrics.monthly_trend.map((month) => (
                  <TableRow key={month.month}>
                    <TableCell className="py-3 text-body-sm text-foreground">{month.month}</TableCell>
                    <TableCell className="py-3 text-body-sm text-foreground text-right font-weight-medium">
                      {formatCurrency(month.revenue)}
                    </TableCell>
                    <TableCell className="py-3 text-body-sm text-foreground text-right">{month.booking_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
