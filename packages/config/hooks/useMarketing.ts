import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface MarketingCampaign {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  campaign_type: 'email' | 'social' | 'paid_ads' | 'content' | 'influencer' | 'event' | 'partnership' | 'other';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  budget?: number;
  spent?: number;
  target_audience?: string;
  goals?: string;
  channels?: string[];
  metrics?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

const API_BASE = '/api/marketing/campaigns';

async function fetchCampaigns(params?: {
  status?: string;
  campaign_type?: string;
}): Promise<MarketingCampaign[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.campaign_type) searchParams.set('campaign_type', params.campaign_type);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch campaigns');
  }

  const { data } = await response.json();
  return data || [];
}

async function createCampaign(data: Partial<MarketingCampaign>): Promise<MarketingCampaign> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create campaign');
  }

  const result = await response.json();
  return result.data;
}

async function updateCampaign(id: string, data: Partial<MarketingCampaign>): Promise<MarketingCampaign> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update campaign');
  }

  const result = await response.json();
  return result.data;
}

async function deleteCampaigns(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete campaigns');
  }
}

export function useCampaignsQuery(params?: { status?: string; campaign_type?: string }) {
  return useQuery({
    queryKey: ['marketing-campaigns', params],
    queryFn: () => fetchCampaigns(params),
    staleTime: 60000,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] }),
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MarketingCampaign> }) => updateCampaign(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] }),
  });
}

export function useDeleteCampaigns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCampaigns,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] }),
  });
}

export function useMarketing(params?: { status?: string; campaign_type?: string }) {
  const query = useCampaignsQuery(params);
  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();
  const deleteMutation = useDeleteCampaigns();

  return {
    campaigns: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createCampaign: createMutation.mutate,
    updateCampaign: updateMutation.mutate,
    deleteCampaigns: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
