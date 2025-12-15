import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface IdleAsset {
  id: string;
  name: string;
  category: string;
  idleDays: number;
  lastUsed: string;
  location: string;
  value: number;
  monthlyCarryCost: number;
  monthlyDepreciation: number;
  recommendation: 'Sell' | 'Rent Out' | 'Redeploy' | 'Monitor';
  status: string;
}

const API_BASE = '/api/idle-assets';

async function fetchIdleAssets(params?: {
  category?: string;
  recommendation?: string;
}): Promise<IdleAsset[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.recommendation) searchParams.set('recommendation', params.recommendation);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch idle assets');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string || item.asset_id as string,
    name: item.name as string || ((item.asset as Record<string, unknown>)?.name as string) || 'Unknown',
    category: item.category as string || ((item.asset as Record<string, unknown>)?.category as string) || 'General',
    idleDays: item.idle_days as number || 0,
    lastUsed: item.last_used as string || '',
    location: item.location as string || 'Unknown',
    value: item.value as number || item.current_value as number || 0,
    monthlyCarryCost: item.monthly_carry_cost as number || 0,
    monthlyDepreciation: item.monthly_depreciation as number || 0,
    recommendation: (item.recommendation as IdleAsset['recommendation']) || 'Monitor',
    status: item.status as string || 'Idle',
  }));
}

async function deleteIdleAssets(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete idle assets');
  }
}

export function useIdleAssetsQuery(params?: {
  category?: string;
  recommendation?: string;
}) {
  return useQuery({
    queryKey: ['idle-assets', params],
    queryFn: () => fetchIdleAssets(params),
    staleTime: 60000,
  });
}

export function useDeleteIdleAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIdleAssets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idle-assets'] });
    },
  });
}

export function useIdleAssets() {
  const assetsQuery = useIdleAssetsQuery();
  const deleteMutation = useDeleteIdleAssets();

  return {
    assets: assetsQuery.data || [],
    isLoading: assetsQuery.isLoading,
    error: assetsQuery.error,
    refetch: assetsQuery.refetch,
    deleteAssets: deleteMutation.mutate,
    deleteAssetsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
