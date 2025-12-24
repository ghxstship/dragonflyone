'use client';

import {
  Body,
  Button,
  H1,
  H2,
  Select,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, FileText, BarChart3, PieChart, ArrowRight, RefreshCw } from 'lucide-react';
import { useAnalyticsDashboard } from '@/hooks/useAnalytics';

interface MetricCard {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
}

export default function AnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState('30d');
  const { data, isLoading, error, refetch } = useAnalyticsDashboard(dateRange);

  const metrics = data?.metrics || {
    total_revenue: 0,
    total_bookings: 0,
    total_events: 0,
    total_clients: 0,
    revenue_change: 0,
    bookings_change: 0,
    events_change: 0,
    clients_change: 0,
  };

  const revenueByMonth = data?.revenue_by_month || [];
  const topClients = data?.top_clients || [];
  const eventsByType = data?.events_by_type || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatChange = (change: number) => {
    const prefix = change >= 0 ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };

  const metricCards: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.total_revenue),
      change: metrics.revenue_change,
      changeLabel: 'vs last period',
      icon: <DollarSign className="h-5 w-5 text-success" />,
    },
    {
      title: 'Total Bookings',
      value: metrics.total_bookings.toString(),
      change: metrics.bookings_change,
      changeLabel: 'vs last period',
      icon: <FileText className="h-5 w-5 text-primary" />,
    },
    {
      title: 'Events',
      value: metrics.total_events.toString(),
      change: metrics.events_change,
      changeLabel: 'vs last period',
      icon: <Calendar className="h-5 w-5 text-accent" />,
    },
    {
      title: 'Active Clients',
      value: metrics.total_clients.toString(),
      change: metrics.clients_change,
      changeLabel: 'vs last period',
      icon: <Users className="h-5 w-5 text-secondary" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load analytics</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Analytics Dashboard</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Track performance metrics and trends
          </Body>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last year</option>
          </Select>
          <Button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button font-weight-medium text-body-sm hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <div key={index} className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center justify-between mb-2">
              <Text className="text-body-sm text-muted-foreground">{metric.title}</Text>
              {metric.icon}
            </div>
            <Body className="text-h3-md font-weight-bold text-foreground">{metric.value}</Body>
            <div className="flex items-center gap-1 mt-1">
              {metric.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <Text className={`text-body-xs ${metric.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatChange(metric.change)}
              </Text>
              <Text className="text-body-xs text-muted-foreground">{metric.changeLabel}</Text>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground">Revenue Trend</H2>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          {revenueByMonth.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No revenue data available
            </div>
          ) : (
            <div className="space-y-3">
              {revenueByMonth.slice(0, 6).map((item: { month: string; revenue: number }, index: number) => {
                const maxRevenue = Math.max(...revenueByMonth.map((r: { revenue: number }) => r.revenue));
                const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-body-sm mb-1">
                      <Text className="text-muted-foreground">{item.month}</Text>
                      <Text className="font-weight-medium text-foreground">{formatCurrency(item.revenue)}</Text>
                    </div>
                    <div className="h-2 bg-muted rounded-badge overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-badge transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <H2 className="text-h4-md font-weight-semibold text-foreground">Events by Type</H2>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </div>
          {eventsByType.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No event data available
            </div>
          ) : (
            <div className="space-y-3">
              {eventsByType.slice(0, 6).map((item: { type: string; count: number }, index: number) => {
                const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-success', 'bg-warning', 'bg-destructive'];
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-avatar ${colors[index % colors.length]}`} />
                    <Text className="flex-1 text-body-sm text-foreground">{item.type}</Text>
                    <Text className="text-body-sm font-weight-medium text-foreground">{item.count}</Text>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center justify-between mb-4">
          <H2 className="text-h4-md font-weight-semibold text-foreground">Top Clients</H2>
          <Link href="/analytics/clients" className="text-body-sm text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {topClients.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No client data available
          </div>
        ) : (
          <div className="divide-y divide-border">
            {topClients.slice(0, 5).map((client: { id: string; name: string; total_revenue: number; event_count: number }, index: number) => (
              <div key={client.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Text className="w-6 h-6 rounded-avatar bg-primary/10 text-primary text-body-xs font-weight-bold flex items-center justify-center">
                    {index + 1}
                  </Text>
                  <Text className="text-body-sm font-weight-medium text-foreground">{client.name}</Text>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <Body className="text-body-sm font-weight-bold text-foreground">{formatCurrency(client.total_revenue)}</Body>
                    <Body className="text-body-xs text-muted-foreground">Revenue</Body>
                  </div>
                  <div className="text-right">
                    <Body className="text-body-sm font-weight-bold text-foreground">{client.event_count}</Body>
                    <Body className="text-body-xs text-muted-foreground">Events</Body>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
