import { useQuery } from '@tanstack/react-query';

export interface RevenueMetrics {
  total_revenue: number;
  total_revenue_previous_period: number;
  revenue_change_percent: number;
  average_event_value: number;
  average_booking_value: number;
  revenue_by_source: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
  revenue_by_event_type: Array<{
    event_type: string;
    amount: number;
    count: number;
  }>;
  revenue_by_space: Array<{
    space_id: string;
    space_name: string;
    amount: number;
    booking_count: number;
  }>;
  monthly_trend: Array<{
    month: string;
    revenue: number;
    booking_count: number;
  }>;
}

export interface RevenueForecast {
  projected_revenue_30_days: number;
  projected_revenue_60_days: number;
  projected_revenue_90_days: number;
  confidence_level: number;
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  pipeline_value: number;
  expected_close_rate: number;
}

export interface RevenueComparison {
  current_period: {
    start: string;
    end: string;
    revenue: number;
    booking_count: number;
  };
  previous_period: {
    start: string;
    end: string;
    revenue: number;
    booking_count: number;
  };
  change: {
    revenue_change: number;
    revenue_change_percent: number;
    booking_change: number;
    booking_change_percent: number;
  };
}

async function fetchRevenueMetrics(dateRange?: { start: string; end: string }): Promise<RevenueMetrics> {
  const params = new URLSearchParams();
  if (dateRange?.start) params.set('start', dateRange.start);
  if (dateRange?.end) params.set('end', dateRange.end);

  const response = await fetch(`/api/analytics/revenue?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch revenue metrics');
  }
  return response.json();
}

async function fetchRevenueForecast(): Promise<RevenueForecast> {
  const response = await fetch('/api/analytics/revenue/forecast');
  if (!response.ok) {
    throw new Error('Failed to fetch revenue forecast');
  }
  return response.json();
}

async function fetchRevenueComparison(period: 'week' | 'month' | 'quarter' | 'year'): Promise<RevenueComparison> {
  const response = await fetch(`/api/analytics/revenue/comparison?period=${period}`);
  if (!response.ok) {
    throw new Error('Failed to fetch revenue comparison');
  }
  return response.json();
}

export function useRevenueMetrics(dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ['revenue-metrics', dateRange],
    queryFn: () => fetchRevenueMetrics(dateRange),
  });
}

export function useRevenueForecast() {
  return useQuery({
    queryKey: ['revenue-forecast'],
    queryFn: fetchRevenueForecast,
  });
}

export function useRevenueComparison(period: 'week' | 'month' | 'quarter' | 'year') {
  return useQuery({
    queryKey: ['revenue-comparison', period],
    queryFn: () => fetchRevenueComparison(period),
  });
}
