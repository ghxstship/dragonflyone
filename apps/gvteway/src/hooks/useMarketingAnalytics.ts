'use client';

import { useQuery } from '@tanstack/react-query';

export interface CampaignMetric {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  roi: number;
}

export interface AttributionSource {
  source: string;
  conversions: number;
  revenue: number;
  percentage: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

const DEMO_CAMPAIGNS: CampaignMetric[] = [
  { id: 'c1', name: 'Summer Festival Launch', status: 'active', impressions: 125000, clicks: 8500, conversions: 420, spend: 5000, revenue: 42000, roi: 740 },
  { id: 'c2', name: 'Early Bird Promo', status: 'completed', impressions: 85000, clicks: 6200, conversions: 310, spend: 3500, revenue: 31000, roi: 785 },
  { id: 'c3', name: 'VIP Upsell', status: 'active', impressions: 45000, clicks: 3800, conversions: 180, spend: 2000, revenue: 18000, roi: 800 },
];

const DEMO_ATTRIBUTION: AttributionSource[] = [
  { source: 'Paid Social', conversions: 450, revenue: 45000, percentage: 35 },
  { source: 'Organic Search', conversions: 380, revenue: 38000, percentage: 28 },
  { source: 'Email', conversions: 290, revenue: 29000, percentage: 22 },
  { source: 'Direct', conversions: 180, revenue: 18000, percentage: 15 },
];

const DEMO_FUNNEL: FunnelStage[] = [
  { stage: 'Page Views', count: 50000, percentage: 100 },
  { stage: 'Add to Cart', count: 12500, percentage: 25 },
  { stage: 'Checkout Started', count: 6250, percentage: 12.5 },
  { stage: 'Purchase Complete', count: 3125, percentage: 6.25 },
];

export const marketingKeys = {
  all: ['marketing-analytics'] as const,
  campaigns: () => [...marketingKeys.all, 'campaigns'] as const,
  attribution: (model?: string) => [...marketingKeys.all, 'attribution', model] as const,
  funnel: (dateRange?: string) => [...marketingKeys.all, 'funnel', dateRange] as const,
};

export function useCampaignMetrics() {
  return useQuery({
    queryKey: marketingKeys.campaigns(),
    queryFn: async () => {
      const response = await fetch('/api/marketing/campaigns');
      if (response.status === 401) {
        return DEMO_CAMPAIGNS;
      }
      if (!response.ok) {
        return DEMO_CAMPAIGNS;
      }
      const data = await response.json();
      return data.campaigns?.length ? data.campaigns : DEMO_CAMPAIGNS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAttributionData(model?: string) {
  return useQuery({
    queryKey: marketingKeys.attribution(model),
    queryFn: async () => {
      const params = model ? `?model=${model}` : '';
      const response = await fetch(`/api/marketing/attribution${params}`);
      if (!response.ok) {
        return DEMO_ATTRIBUTION;
      }
      const data = await response.json();
      return data.attribution?.length ? data.attribution : DEMO_ATTRIBUTION;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useFunnelData(dateRange?: string) {
  return useQuery({
    queryKey: marketingKeys.funnel(dateRange),
    queryFn: async () => {
      const params = dateRange ? `?range=${dateRange}` : '';
      const response = await fetch(`/api/marketing/funnel${params}`);
      if (!response.ok) {
        return DEMO_FUNNEL;
      }
      const data = await response.json();
      return data.funnel?.length ? data.funnel : DEMO_FUNNEL;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarketingAnalyticsData(options?: { attributionModel?: string; dateRange?: string }) {
  const campaignsQuery = useCampaignMetrics();
  const attributionQuery = useAttributionData(options?.attributionModel);
  const funnelQuery = useFunnelData(options?.dateRange);

  const campaigns = campaignsQuery.data || DEMO_CAMPAIGNS;
  const attribution = attributionQuery.data || DEMO_ATTRIBUTION;
  const funnel = funnelQuery.data || DEMO_FUNNEL;

  // Calculate summary stats
  const totalImpressions = campaigns.reduce((sum: number, c: CampaignMetric) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum: number, c: CampaignMetric) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum: number, c: CampaignMetric) => sum + c.conversions, 0);
  const totalSpend = campaigns.reduce((sum: number, c: CampaignMetric) => sum + c.spend, 0);
  const totalRevenue = campaigns.reduce((sum: number, c: CampaignMetric) => sum + c.revenue, 0);
  const avgROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

  return {
    campaigns,
    attribution,
    funnel,
    summary: {
      totalImpressions,
      totalClicks,
      totalConversions,
      totalSpend,
      totalRevenue,
      avgROI,
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
    },
    isLoading: campaignsQuery.isLoading || attributionQuery.isLoading || funnelQuery.isLoading,
    error: campaignsQuery.error || attributionQuery.error || funnelQuery.error,
    refetchCampaigns: campaignsQuery.refetch,
    refetchAttribution: attributionQuery.refetch,
    refetchFunnel: funnelQuery.refetch,
  };
}
