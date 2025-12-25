'use client';

import {
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  H2,
  MainContent,
  Select,
  Skeleton,
  Stack,
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
      <>
        <EnterprisePageHeader title="Analytics Dashboard" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Grid cols={4} gap={4}>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </Grid>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Analytics Dashboard" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load analytics"
              description="There was an error loading your analytics data."
              action={{ label: 'Retry', onClick: () => refetch() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Analytics Dashboard"
        subtitle="Track performance metrics and trends"
      />
      <Box className="px-6 py-3 border-b border-border flex items-center justify-end gap-3">
        <Select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="365d">Last year</option>
        </Select>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </Box>
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={4} gap={4}>
              {metricCards.map((metric, index) => (
                <Card key={index} className="p-4">
                  <Stack direction="horizontal" className="justify-between mb-2">
                    <Text size="sm" className="text-muted-foreground">{metric.title}</Text>
                    {metric.icon}
                  </Stack>
                  <Body className="font-weight-bold">{metric.value}</Body>
                  <Stack direction="horizontal" gap={1} className="mt-1 items-center">
                    {metric.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <Text size="xs" className={metric.change >= 0 ? 'text-success' : 'text-destructive'}>
                      {formatChange(metric.change)}
                    </Text>
                    <Text size="xs" className="text-muted-foreground">{metric.changeLabel}</Text>
                  </Stack>
                </Card>
              ))}
            </Grid>

            <Grid cols={2} gap={6}>
              <Card className="p-6">
                <Stack direction="horizontal" className="justify-between mb-4">
                  <H2>Revenue Trend</H2>
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </Stack>
                {revenueByMonth.length === 0 ? (
                  <Box className="h-48 flex items-center justify-center text-muted-foreground">
                    No revenue data available
                  </Box>
                ) : (
                  <Stack gap={3}>
                    {revenueByMonth.slice(0, 6).map((item: { month: string; revenue: number }, index: number) => {
                      const maxRevenue = Math.max(...revenueByMonth.map((r: { revenue: number }) => r.revenue));
                      const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                      return (
                        <Box key={index}>
                          <Stack direction="horizontal" className="justify-between mb-1">
                            <Text size="sm" className="text-muted-foreground">{item.month}</Text>
                            <Text size="sm" className="font-weight-medium">{formatCurrency(item.revenue)}</Text>
                          </Stack>
                          <Box className="h-2 bg-muted rounded-badge overflow-hidden">
                            <Box
                              className="h-full bg-primary rounded-badge transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Card>

              <Card className="p-6">
                <Stack direction="horizontal" className="justify-between mb-4">
                  <H2>Events by Type</H2>
                  <PieChart className="h-5 w-5 text-muted-foreground" />
                </Stack>
                {eventsByType.length === 0 ? (
                  <Box className="h-48 flex items-center justify-center text-muted-foreground">
                    No event data available
                  </Box>
                ) : (
                  <Stack gap={3}>
                    {eventsByType.slice(0, 6).map((item: { type: string; count: number }, index: number) => {
                      const colors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-success', 'bg-warning', 'bg-destructive'];
                      return (
                        <Stack key={index} direction="horizontal" gap={3} className="items-center">
                          <Box className={`w-3 h-3 rounded-avatar ${colors[index % colors.length]}`} />
                          <Text size="sm" className="flex-1">{item.type}</Text>
                          <Text size="sm" className="font-weight-medium">{item.count}</Text>
                        </Stack>
                      );
                    })}
                  </Stack>
                )}
              </Card>
            </Grid>

            <Card className="p-6">
              <Stack direction="horizontal" className="justify-between mb-4">
                <H2>Top Clients</H2>
                <Link href="/analytics/clients" className="text-primary hover:underline flex items-center gap-1">
                  <Text size="sm">View all</Text>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Stack>
              {topClients.length === 0 ? (
                <Box className="py-8 text-center text-muted-foreground">
                  No client data available
                </Box>
              ) : (
                <Box className="divide-y divide-border">
                  {topClients.slice(0, 5).map((client: { id: string; name: string; total_revenue: number; event_count: number }, index: number) => (
                    <Stack key={client.id} direction="horizontal" className="py-3 justify-between items-center">
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Text className="w-6 h-6 rounded-avatar bg-primary/10 text-primary font-weight-bold flex items-center justify-center" size="xs">
                          {index + 1}
                        </Text>
                        <Text size="sm" className="font-weight-medium">{client.name}</Text>
                      </Stack>
                      <Stack direction="horizontal" gap={6}>
                        <Stack gap={0} className="text-right">
                          <Body size="sm" className="font-weight-bold">{formatCurrency(client.total_revenue)}</Body>
                          <Body size="xs" className="text-muted-foreground">Revenue</Body>
                        </Stack>
                        <Stack gap={0} className="text-right">
                          <Body size="sm" className="font-weight-bold">{client.event_count}</Body>
                          <Body size="xs" className="text-muted-foreground">Events</Body>
                        </Stack>
                      </Stack>
                    </Stack>
                  ))}
                </Box>
              )}
            </Card>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
