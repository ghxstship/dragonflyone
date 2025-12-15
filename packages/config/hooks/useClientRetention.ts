import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ClientRetention {
  id: string;
  clientName: string;
  segment: string;
  totalRevenue: number;
  totalDeals: number;
  avgDealSize: number;
  firstDealDate: string;
  lastDealDate: string;
  daysSinceLastDeal: number;
  healthScore: number;
  npsScore?: number;
  status: 'Active' | 'At Risk' | 'Churned' | 'New';
}

const API_BASE = '/api/analytics/client-retention';

async function fetchClientRetention(params?: {
  status?: string;
  segment?: string;
}): Promise<ClientRetention[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.segment) searchParams.set('segment', params.segment);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch client retention data');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    clientName: item.client_name as string || item.clientName as string || '',
    segment: item.segment as string || '',
    totalRevenue: item.total_revenue as number || item.totalRevenue as number || 0,
    totalDeals: item.total_deals as number || item.totalDeals as number || 0,
    avgDealSize: item.avg_deal_size as number || item.avgDealSize as number || 0,
    firstDealDate: item.first_deal_date as string || item.firstDealDate as string || '',
    lastDealDate: item.last_deal_date as string || item.lastDealDate as string || '',
    daysSinceLastDeal: item.days_since_last_deal as number || item.daysSinceLastDeal as number || 0,
    healthScore: item.health_score as number || item.healthScore as number || 0,
    npsScore: item.nps_score as number | undefined,
    status: item.status as ClientRetention['status'] || 'Active',
  }));
}

async function deleteClientRetentionRecords(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete client retention records');
  }
}

export function useClientRetentionQuery(params?: { status?: string; segment?: string }) {
  return useQuery({
    queryKey: ['client-retention', params],
    queryFn: () => fetchClientRetention(params),
    staleTime: 60000,
  });
}

export function useDeleteClientRetentionRecords() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClientRetentionRecords,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-retention'] });
    },
  });
}

export function useClientRetention() {
  const retentionQuery = useClientRetentionQuery();
  const deleteMutation = useDeleteClientRetentionRecords();

  return {
    clients: retentionQuery.data || [],
    isLoading: retentionQuery.isLoading,
    error: retentionQuery.error,
    refetch: retentionQuery.refetch,
    deleteRecords: deleteMutation.mutate,
    deleteRecordsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
