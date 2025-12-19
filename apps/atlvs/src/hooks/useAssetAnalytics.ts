import { useQuery } from '@tanstack/react-query';

export interface AssetMetrics {
  asset_id: string;
  asset_name: string;
  metric_date: string;
  utilization_rate: number;
  hours_used: number;
  bookings_count: number;
  revenue_generated: number;
  maintenance_cost: number;
  net_value: number;
}

export interface AssetAnalytics {
  asset_id: string;
  asset_name: string;
  category: string;
  total_value: number;
  purchase_date: string;
  current_condition: 'excellent' | 'good' | 'fair' | 'poor';
  metrics: {
    total_bookings: number;
    total_revenue: number;
    total_hours: number;
    average_utilization: number;
    roi: number;
    days_since_last_use: number;
  };
  trends: {
    utilization_trend: Array<{ date: string; rate: number }>;
    revenue_trend: Array<{ date: string; amount: number }>;
    booking_trend: Array<{ date: string; count: number }>;
  };
  comparisons: {
    vs_category_average: {
      utilization: number;
      revenue: number;
    };
    vs_organization_average: {
      utilization: number;
      revenue: number;
    };
  };
}

export interface UtilizationReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    total_assets: number;
    active_assets: number;
    average_utilization: number;
    total_revenue: number;
    underutilized_count: number;
    overutilized_count: number;
  };
  by_category: Array<{
    category: string;
    asset_count: number;
    average_utilization: number;
    total_revenue: number;
  }>;
  top_performers: Array<{
    asset_id: string;
    asset_name: string;
    utilization_rate: number;
    revenue: number;
  }>;
  underperformers: Array<{
    asset_id: string;
    asset_name: string;
    utilization_rate: number;
    potential_revenue: number;
    recommendation: string;
  }>;
}

async function fetchAssetAnalytics(assetId: string): Promise<AssetAnalytics> {
  const response = await fetch(`/api/assets/${assetId}/analytics`);
  if (!response.ok) {
    throw new Error('Failed to fetch asset analytics');
  }
  return response.json();
}

async function fetchUtilizationReport(dateRange?: { start: string; end: string }): Promise<UtilizationReport> {
  const params = new URLSearchParams();
  if (dateRange?.start) params.set('start', dateRange.start);
  if (dateRange?.end) params.set('end', dateRange.end);

  const response = await fetch(`/api/assets/utilization?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch utilization report');
  }
  return response.json();
}

async function fetchAssetComparison(assetIds: string[]): Promise<{
  assets: AssetAnalytics[];
  comparison: {
    best_performer: string;
    worst_performer: string;
    average_metrics: {
      utilization: number;
      revenue: number;
      roi: number;
    };
  };
}> {
  const response = await fetch('/api/assets/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset_ids: assetIds }),
  });
  if (!response.ok) {
    throw new Error('Failed to compare assets');
  }
  return response.json();
}

export function useAssetAnalytics(assetId: string) {
  return useQuery({
    queryKey: ['asset-analytics', assetId],
    queryFn: () => fetchAssetAnalytics(assetId),
    enabled: !!assetId,
  });
}

export function useUtilizationReport(dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ['utilization-report', dateRange],
    queryFn: () => fetchUtilizationReport(dateRange),
  });
}

export function useAssetComparison(assetIds: string[]) {
  return useQuery({
    queryKey: ['asset-comparison', assetIds],
    queryFn: () => fetchAssetComparison(assetIds),
    enabled: assetIds.length > 0,
  });
}
