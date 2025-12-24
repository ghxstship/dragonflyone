import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface CampaignMetric {
  id: string;
  name: string;
  channel: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  spend: number;
  revenue: number;
  roas: number;
  created_at?: string;
  updated_at?: string;
}

export interface AttributionSource {
  source: string;
  conversions: number;
  revenue: number;
  percentage: number;
}

const API_BASE = '/api/marketing/analytics';

async function fetchCampaignMetrics(): Promise<CampaignMetric[]> {
  const response = await fetch(`${API_BASE}/campaigns`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch campaign metrics');
  }
  const { data } = await response.json();
  return data || [];
}

async function fetchAttributionSources(): Promise<AttributionSource[]> {
  const response = await fetch(`${API_BASE}/attribution`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch attribution sources');
  }
  const { data } = await response.json();
  return data || [];
}

export function useCampaignMetricsQuery() {
  return useQuery({
    queryKey: ['campaign-metrics'],
    queryFn: fetchCampaignMetrics,
    staleTime: 60000,
  });
}

export function useAttributionSourcesQuery() {
  return useQuery({
    queryKey: ['attribution-sources'],
    queryFn: fetchAttributionSources,
    staleTime: 60000,
  });
}

export function useCampaignMetrics() {
  const queryClient = useQueryClient();
  const campaignsQuery = useCampaignMetricsQuery();
  const attributionQuery = useAttributionSourcesQuery();

  const campaigns = campaignsQuery.data || [];
  const attribution = attributionQuery.data || [];

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const overallROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return {
    campaigns,
    attribution,
    summary: {
      totalSpend,
      totalRevenue,
      totalConversions,
      overallROAS,
    },
    isLoading: campaignsQuery.isLoading || attributionQuery.isLoading,
    error: campaignsQuery.error || attributionQuery.error,
    refetch: () => {
      campaignsQuery.refetch();
      attributionQuery.refetch();
    },
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['attribution-sources'] });
    },
  };
}
