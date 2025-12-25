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
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Target, Clock, DollarSign, BarChart3 } from 'lucide-react';
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
      <>
        <EnterprisePageHeader title="Pipeline Analytics" subtitle="Loading..." />
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
    <>
      <EnterprisePageHeader
        title="Pipeline Analytics"
        subtitle="Deal flow and conversion analysis"
        backHref="/analytics"
      />
      <Box className="px-6 py-3 border-b border-border flex justify-end">
        <Stack direction="horizontal" gap={2} className="bg-muted/30 rounded-button p-1">
          {(['30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? 'solid' : 'ghost'}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
        </Stack>
      </Box>
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Grid cols={4} gap={4}>
              <Card className="p-6">
                <Stack direction="horizontal" className="justify-between mb-2">
                  <Text size="sm" className="text-muted-foreground">Total Pipeline Value</Text>
                  <DollarSign className="h-5 w-5 text-primary" />
                </Stack>
                <Body className="font-weight-bold">{formatCurrency(metrics.total_value)}</Body>
                <Body size="xs" className="text-muted-foreground mt-1">
                  Weighted: {formatCurrency(metrics.weighted_value)}
                </Body>
              </Card>

              <Card className="p-6">
                <Stack direction="horizontal" className="justify-between mb-2">
                  <Text size="sm" className="text-muted-foreground">Win Rate</Text>
                  <Target className="h-5 w-5 text-success-600" />
                </Stack>
                <Body className="font-weight-bold">{metrics.win_rate.toFixed(1)}%</Body>
              </Card>

              <Card className="p-6">
                <Stack direction="horizontal" className="justify-between mb-2">
                  <Text size="sm" className="text-muted-foreground">Avg Days to Close</Text>
                  <Clock className="h-5 w-5 text-secondary" />
                </Stack>
                <Body className="font-weight-bold">{metrics.average_days_to_close.toFixed(0)}</Body>
              </Card>

              <Card className="p-6">
                <Stack direction="horizontal" className="justify-between mb-2">
                  <Text size="sm" className="text-muted-foreground">Deals Created</Text>
                  <BarChart3 className="h-5 w-5 text-accent" />
                </Stack>
                <Body className="font-weight-bold">{metrics.trends.deals_created_this_month}</Body>
                <Stack direction="horizontal" gap={1} className={`mt-1 items-center ${
                  dealsCreatedChange >= 0 ? 'text-success-600' : 'text-error-600'
                }`}>
                  {dealsCreatedChange >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <Text size="xs">{Math.abs(dealsCreatedChange).toFixed(1)}% vs last month</Text>
                </Stack>
              </Card>
            </Grid>

            <Card className="p-6">
              <H3 className="mb-4">Pipeline by Stage</H3>
              {metrics.deals_by_stage.length === 0 ? (
                <Body size="sm" className="text-muted-foreground text-center py-8">No data available</Body>
              ) : (
                <Stack gap={4}>
                  {metrics.deals_by_stage.map((stage) => (
                    <Box key={stage.stage_id}>
                      <Stack direction="horizontal" className="justify-between mb-2">
                        <Stack direction="horizontal" gap={2}>
                          <Text size="sm" className="font-weight-medium">{stage.stage_name}</Text>
                          <Text size="xs" className="text-muted-foreground">({stage.count} deals)</Text>
                        </Stack>
                        <Text size="sm" className="font-weight-medium">{formatCurrency(stage.value)}</Text>
                      </Stack>
                      <Box className="w-full bg-muted rounded-badge h-3">
                        <Box
                          className="bg-primary h-3 rounded-badge transition-all"
                          style={{ width: `${stage.probability}%` }}
                        />
                      </Box>
                      <Body size="xs" className="text-muted-foreground mt-1">
                        {stage.probability}% probability
                      </Body>
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>

            <Card className="p-6">
              <H3 className="mb-4">Stage Conversion Rates</H3>
              {metrics.conversion_rates.length === 0 ? (
                <Body size="sm" className="text-muted-foreground text-center py-8">No data available</Body>
              ) : (
                <Grid cols={3} gap={4}>
                  {metrics.conversion_rates.map((conv, i) => (
                    <Card key={i} className="p-4 bg-muted/30">
                      <Stack direction="horizontal" gap={2} className="mb-2">
                        <Text size="sm">{conv.from_stage}</Text>
                        <Text className="text-muted-foreground">→</Text>
                        <Text size="sm">{conv.to_stage}</Text>
                      </Stack>
                      <Body className="font-weight-bold text-primary">
                        {conv.rate.toFixed(1)}%
                      </Body>
                    </Card>
                  ))}
                </Grid>
              )}
            </Card>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
