'use client';

import {
  Body,
  Box,
  Button,
  Card,
  Container,
  EnterprisePageHeader,
  Grid,
  H3,
  MainContent,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart } from 'lucide-react';
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
      <>
        <EnterprisePageHeader title="Revenue Analytics" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Grid cols={3} gap={4}>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </Grid>
          </Container>
        </MainContent>
      </>
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
    <>
      <EnterprisePageHeader
        title="Revenue Analytics"
        subtitle="Deep dive into revenue performance"
        backHref="/analytics"
      />
      <Box className="px-6 py-3 border-b border-border flex justify-end">
        <Stack direction="horizontal" gap={2} className="bg-muted/30 rounded-button p-1">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'solid' : 'ghost'}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
        </Stack>
      </Box>
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={3} gap={4}>
              <Card className="p-6">
                <Stack direction="horizontal" className="justify-between mb-2">
                  <Text size="sm" className="text-muted-foreground">Total Revenue</Text>
                  <DollarSign className="h-5 w-5 text-primary" />
                </Stack>
                <Body className="text-h2-md font-weight-bold">
                  {formatCurrency(metrics.total_revenue)}
                </Body>
                <Stack direction="horizontal" gap={1} className={`mt-2 items-center ${
                  metrics.revenue_change_percent >= 0 ? 'text-success-600' : 'text-error-600'
                }`}>
                  {metrics.revenue_change_percent >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <Text size="sm">{Math.abs(metrics.revenue_change_percent).toFixed(1)}% vs previous period</Text>
                </Stack>
              </Card>

              <Card className="p-6">
                <Stack direction="horizontal" className="justify-between mb-2">
                  <Text size="sm" className="text-muted-foreground">Average Event Value</Text>
                  <BarChart3 className="h-5 w-5 text-secondary" />
                </Stack>
                <Body className="text-h2-md font-weight-bold">
                  {formatCurrency(metrics.average_event_value)}
                </Body>
              </Card>

              <Card className="p-6">
                <Stack direction="horizontal" className="justify-between mb-2">
                  <Text size="sm" className="text-muted-foreground">Revenue Sources</Text>
                  <PieChart className="h-5 w-5 text-accent" />
                </Stack>
                <Body className="text-h2-md font-weight-bold">
                  {metrics.revenue_by_source.length}
                </Body>
                <Body size="xs" className="text-muted-foreground mt-1">Active revenue streams</Body>
              </Card>
            </Grid>

            <Grid cols={2} gap={6}>
              <Card className="p-6">
                <H3 className="mb-4">Revenue by Source</H3>
                {metrics.revenue_by_source.length === 0 ? (
                  <Body size="sm" className="text-muted-foreground text-center py-8">No data available</Body>
                ) : (
                  <Stack gap={3}>
                    {metrics.revenue_by_source.map((source) => (
                      <Box key={source.source}>
                        <Stack direction="horizontal" className="justify-between mb-1">
                          <Text size="sm" className="capitalize">{source.source}</Text>
                          <Text size="sm" className="font-weight-medium">
                            {formatCurrency(source.amount)}
                          </Text>
                        </Stack>
                        <Box className="w-full bg-muted rounded-avatar h-2">
                          <Box
                            className="bg-primary h-2 rounded-avatar transition-all"
                            style={{ width: `${source.percentage}%` }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Card>

              <Card className="p-6">
                <H3 className="mb-4">Revenue by Event Type</H3>
                {metrics.revenue_by_event_type.length === 0 ? (
                  <Body size="sm" className="text-muted-foreground text-center py-8">No data available</Body>
                ) : (
                  <Stack gap={3}>
                    {metrics.revenue_by_event_type.map((type) => (
                      <Card key={type.event_type} className="p-3 bg-muted/30">
                        <Stack direction="horizontal" className="justify-between items-center">
                          <Stack gap={0}>
                            <Body size="sm" className="font-weight-medium capitalize">
                              {type.event_type.replace('_', ' ')}
                            </Body>
                            <Body size="xs" className="text-muted-foreground">{type.count} events</Body>
                          </Stack>
                          <Body className="font-weight-semibold">
                            {formatCurrency(type.amount)}
                          </Body>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Card>
            </Grid>

            <Card className="p-6">
              <H3 className="mb-4">Monthly Trend</H3>
              {metrics.monthly_trend.length === 0 ? (
                <Body size="sm" className="text-muted-foreground text-center py-8">No data available</Body>
              ) : (
                <Box className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Bookings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.monthly_trend.map((month) => (
                        <TableRow key={month.month}>
                          <TableCell>{month.month}</TableCell>
                          <TableCell className="text-right font-weight-medium">
                            {formatCurrency(month.revenue)}
                          </TableCell>
                          <TableCell className="text-right">{month.booking_count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Card>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
