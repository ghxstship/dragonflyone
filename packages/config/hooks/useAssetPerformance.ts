import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AssetPerformance {
  id: string;
  name: string;
  category: string;
  utilizationRate: number;
  uptime: number;
  mtbf: number;
  mttr: number;
  healthScore: number;
  failureCount: number;
  lastMaintenance: string;
  predictedFailure?: string;
  status: string;
}

const API_BASE = '/api/asset-performance';

async function fetchAssetPerformance(params?: {
  category?: string;
}): Promise<AssetPerformance[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch asset performance');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string || item.asset_id as string,
    name: item.name as string || ((item.asset as Record<string, unknown>)?.name as string) || 'Unknown',
    category: item.category as string || ((item.asset as Record<string, unknown>)?.category as string) || 'General',
    utilizationRate: item.utilization_rate as number || 0,
    uptime: item.uptime as number || 0,
    mtbf: item.mtbf as number || 0,
    mttr: item.mttr as number || 0,
    healthScore: item.health_score as number || 0,
    failureCount: item.failure_count as number || 0,
    lastMaintenance: item.last_maintenance as string || '',
    predictedFailure: item.predicted_failure as string | undefined,
    status: item.status as string || 'Active',
  }));
}

async function deleteAssetPerformance(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete asset performance records');
  }
}

export function useAssetPerformanceQuery(params?: {
  category?: string;
}) {
  return useQuery({
    queryKey: ['asset-performance', params],
    queryFn: () => fetchAssetPerformance(params),
    staleTime: 60000,
  });
}

export function useDeleteAssetPerformance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAssetPerformance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-performance'] });
    },
  });
}

export function useAssetPerformance() {
  const performanceQuery = useAssetPerformanceQuery();
  const deleteMutation = useDeleteAssetPerformance();

  return {
    performance: performanceQuery.data || [],
    isLoading: performanceQuery.isLoading,
    error: performanceQuery.error,
    refetch: performanceQuery.refetch,
    deletePerformance: deleteMutation.mutate,
    deletePerformanceAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
