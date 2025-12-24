import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface MarketingSource {
  id: string;
  name: string;
  channel: string;
  leads: number;
  conversions: number;
  revenue: number;
  cost: number;
  roi: number;
  created_at?: string;
  updated_at?: string;
}

export interface AttributionCampaign {
  id: string;
  name: string;
  source: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  leads: number;
  conversions: number;
  status: 'Active' | 'Completed' | 'Paused';
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/marketing';

async function fetchSources(): Promise<MarketingSource[]> {
  const response = await fetch(`${API_BASE}/sources`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch marketing sources');
  }

  const { data } = await response.json();
  return data || [];
}

async function fetchCampaigns(): Promise<AttributionCampaign[]> {
  const response = await fetch(`${API_BASE}/campaigns`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch marketing campaigns');
  }

  const { data } = await response.json();
  return data || [];
}

export function useMarketingSourcesQuery() {
  return useQuery({
    queryKey: ['marketing-sources'],
    queryFn: fetchSources,
    staleTime: 60000,
  });
}

export function useMarketingCampaignsQuery() {
  return useQuery({
    queryKey: ['marketing-campaigns'],
    queryFn: fetchCampaigns,
    staleTime: 60000,
  });
}

export function useMarketingAttribution() {
  const queryClient = useQueryClient();
  const sourcesQuery = useMarketingSourcesQuery();
  const campaignsQuery = useMarketingCampaignsQuery();

  const sources = sourcesQuery.data || [];
  const campaigns = campaignsQuery.data || [];

  const totalLeads = sources.reduce((s, src) => s + src.leads, 0);
  const totalRevenue = sources.reduce((s, src) => s + src.revenue, 0);
  const totalCost = sources.reduce((s, src) => s + src.cost, 0);
  const avgROI = totalCost > 0 ? Math.round(((totalRevenue - totalCost) / totalCost) * 100) : 0;

  return {
    sources,
    campaigns,
    summary: {
      totalLeads,
      totalRevenue,
      totalCost,
      avgROI,
      activeCampaigns: campaigns.filter(c => c.status === 'Active').length,
    },
    isLoading: sourcesQuery.isLoading || campaignsQuery.isLoading,
    error: sourcesQuery.error || campaignsQuery.error,
    refetch: () => {
      sourcesQuery.refetch();
      campaignsQuery.refetch();
    },
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-sources'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
    },
  };
}
