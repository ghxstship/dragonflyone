'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  H2,
  H3,
  Body,
  Card,
  Stack,
  Grid,
  Badge,
  Alert,
  Button,
  Select,
  Kicker,
} from '@ghxstship/ui';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Ticket,
  DollarSign,
  BarChart3,
  Calendar,
  RefreshCw,
  Download,
  Eye,
  Share2,
  Clock,
} from 'lucide-react';
import { useEvent } from '@/hooks/useEvents';
import { useEventBoxOfficeData, type TicketTier } from '@/hooks/useEventOperations';

interface AnalyticsMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

export default function EventAnalyticsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [dateRange, setDateRange] = useState('7d');

  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(eventId);
  const { tiers, isLoading: boxOfficeLoading, refetch } = useEventBoxOfficeData(eventId);

  const isLoading = eventLoading || boxOfficeLoading;

  // Calculate analytics from box office data
  const totals = tiers?.reduce(
    (acc: { capacity: number; sold: number; available: number; revenue: number }, tier: TicketTier) => ({
      capacity: acc.capacity + tier.capacity,
      sold: acc.sold + tier.sold,
      available: acc.available + tier.available,
      revenue: acc.revenue + tier.revenue,
    }),
    { capacity: 0, sold: 0, available: 0, revenue: 0 }
  ) || { capacity: 0, sold: 0, available: 0, revenue: 0 };

  const soldPercentage = totals.capacity > 0 
    ? Math.round((totals.sold / totals.capacity) * 100) 
    : 0;

  const avgTicketPrice = totals.sold > 0 
    ? (totals.revenue / totals.sold).toFixed(2) 
    : '0.00';

  // Mock additional analytics data
  const pageViews = Math.floor(totals.sold * 8.5);
  const conversionRate = totals.sold > 0 ? ((totals.sold / pageViews) * 100).toFixed(1) : '0.0';
  const socialShares = Math.floor(totals.sold * 0.3);

  const metrics: AnalyticsMetric[] = [
    {
      label: 'Total Revenue',
      value: `$${totals.revenue.toLocaleString()}`,
      change: 12.5,
      trend: 'up',
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: 'Tickets Sold',
      value: totals.sold.toLocaleString(),
      change: 8.2,
      trend: 'up',
      icon: <Ticket className="w-5 h-5" />,
    },
    {
      label: 'Capacity Filled',
      value: `${soldPercentage}%`,
      change: soldPercentage > 50 ? 5.1 : -2.3,
      trend: soldPercentage > 50 ? 'up' : 'down',
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: 'Avg Ticket Price',
      value: `$${avgTicketPrice}`,
      change: 0,
      trend: 'neutral',
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];

  const engagementMetrics: AnalyticsMetric[] = [
    {
      label: 'Page Views',
      value: pageViews.toLocaleString(),
      change: 15.3,
      trend: 'up',
      icon: <Eye className="w-5 h-5" />,
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      change: 2.1,
      trend: 'up',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: 'Social Shares',
      value: socialShares.toLocaleString(),
      change: 8.7,
      trend: 'up',
      icon: <Share2 className="w-5 h-5" />,
    },
    {
      label: 'Avg Time on Page',
      value: '2m 34s',
      change: -5.2,
      trend: 'down',
      icon: <Clock className="w-5 h-5" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <Body className="text-muted">Loading analytics...</Body>
        </div>
      </div>
    );
  }

  if (eventError) {
    return (
      <Alert variant="error">
        <Body>Failed to load event analytics: {eventError instanceof Error ? eventError.message : 'Unknown error'}</Body>
      </Alert>
    );
  }

  return (
    <Stack gap={10}>
      <div className="flex items-center justify-between">
        <Stack gap={2}>
          <Kicker colorScheme="on-dark">Analytics</Kicker>
          <H2 size="lg" className="text-white">{event?.name || 'Event'} Analytics</H2>
          <Body className="text-on-dark-muted">Track performance and engagement metrics</Body>
        </Stack>

        <Stack direction="horizontal" gap={4}>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-32"
          >
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </Select>

          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </Stack>
      </div>

      {/* Sales Metrics */}
      <Stack gap={4}>
        <H3>Sales Performance</H3>
        <Grid cols={4}>
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-6">
              <Stack gap={4}>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-card bg-primary/10 text-primary">
                    {metric.icon}
                  </div>
                  {metric.change !== undefined && metric.change !== 0 && (
                    <Badge
                      variant={metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'error' : 'info'}
                      className="flex items-center gap-1"
                    >
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : null}
                      {Math.abs(metric.change)}%
                    </Badge>
                  )}
                </div>
                <div>
                  <Body className="text-muted text-body-sm">{metric.label}</Body>
                  <H2 size="lg">{metric.value}</H2>
                </div>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Stack>

      {/* Engagement Metrics */}
      <Stack gap={4}>
        <H3>Engagement Metrics</H3>
        <Grid cols={4}>
          {engagementMetrics.map((metric) => (
            <Card key={metric.label} className="p-6">
              <Stack gap={4}>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-card bg-secondary/10 text-secondary">
                    {metric.icon}
                  </div>
                  {metric.change !== undefined && metric.change !== 0 && (
                    <Badge
                      variant={metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'error' : 'info'}
                      className="flex items-center gap-1"
                    >
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : null}
                      {Math.abs(metric.change)}%
                    </Badge>
                  )}
                </div>
                <div>
                  <Body className="text-muted text-body-sm">{metric.label}</Body>
                  <H2 size="lg">{metric.value}</H2>
                </div>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Stack>

      {/* Ticket Tier Breakdown */}
      <Stack gap={4}>
        <H3>Sales by Ticket Tier</H3>
        <Card className="p-6">
          <Stack gap={4}>
            {tiers && tiers.length > 0 ? (
              tiers.map((tier: TicketTier) => {
                const tierPercentage = tier.capacity > 0 
                  ? Math.round((tier.sold / tier.capacity) * 100) 
                  : 0;
                
                return (
                  <div key={tier.name} className="flex items-center justify-between p-4 border-2 rounded-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Body className="font-weight-semibold">{tier.name}</Body>
                        <Badge variant="outline">${tier.price}</Badge>
                      </div>
                      <div className="w-full bg-muted rounded-avatar h-2">
                        <div
                          className={`h-2 rounded-avatar ${
                            tierPercentage >= 90
                              ? 'bg-error'
                              : tierPercentage >= 70
                              ? 'bg-warning'
                              : 'bg-success'
                          }`}
                          style={{ width: `${tierPercentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right ml-6 min-w-[150px]">
                      <Body className="font-weight-semibold">{tier.sold} / {tier.capacity}</Body>
                      <Body className="text-muted text-body-sm">${tier.revenue.toLocaleString()} revenue</Body>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted" />
                <Body className="text-muted">No ticket tier data available</Body>
              </div>
            )}
          </Stack>
        </Card>
      </Stack>

      {/* Event Info */}
      <Stack gap={4}>
        <H3>Event Details</H3>
        <Card className="p-6">
          <Grid cols={3}>
            <div>
              <Body className="text-muted text-body-sm">Event Date</Body>
              <Body className="font-weight-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {event?.start_date 
                  ? new Date(event.start_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Not set'}
              </Body>
            </div>
            <div>
              <Body className="text-muted text-body-sm">Venue</Body>
              <Body className="font-weight-semibold">{event?.venue || 'Not set'}</Body>
            </div>
            <div>
              <Body className="text-muted text-body-sm">Status</Body>
              <Badge variant={event?.status === 'published' ? 'success' : 'info'}>
                {event?.status?.toUpperCase() || 'DRAFT'}
              </Badge>
            </div>
          </Grid>
        </Card>
      </Stack>
    </Stack>
  );
}
