import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AssetUtilization {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  currentValue: number;
  totalRevenue: number;
  utilizationRate: number;
  daysDeployed: number;
  projectCount: number;
  roi: number;
  costPerDay: number;
  hoursUsed: number;
  hoursAvailable: number;
  status: string;
  trend: 'up' | 'down' | 'stable';
}

const API_BASE = '/api/asset-utilization';

async function fetchAssetUtilization(params?: {
  category?: string;
  period?: string;
}): Promise<AssetUtilization[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.period) searchParams.set('period', params.period);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch asset utilization');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string || item.asset_id as string,
    name: item.name as string || ((item.asset as Record<string, unknown>)?.name as string) || 'Unknown',
    category: item.category as string || ((item.asset as Record<string, unknown>)?.category as string) || 'General',
    purchasePrice: item.purchase_price as number || 0,
    currentValue: item.current_value as number || 0,
    totalRevenue: item.total_revenue as number || 0,
    utilizationRate: item.utilization_rate as number || 0,
    daysDeployed: item.days_deployed as number || 0,
    projectCount: item.project_count as number || 0,
    roi: item.roi as number || 0,
    costPerDay: item.cost_per_day as number || 0,
    hoursUsed: item.hours_used as number || 0,
    hoursAvailable: item.hours_available as number || 0,
    status: item.status as string || 'Active',
    trend: (item.trend as 'up' | 'down' | 'stable') || 'stable',
  }));
}

async function deleteAssetUtilization(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete asset utilization records');
  }
}

export function useAssetUtilizationQuery(params?: {
  category?: string;
  period?: string;
}) {
  return useQuery({
    queryKey: ['asset-utilization', params],
    queryFn: () => fetchAssetUtilization(params),
    staleTime: 60000,
  });
}

export function useDeleteAssetUtilization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAssetUtilization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-utilization'] });
    },
  });
}

export function useAssetUtilization() {
  const utilizationQuery = useAssetUtilizationQuery();
  const deleteMutation = useDeleteAssetUtilization();

  return {
    utilization: utilizationQuery.data || [],
    isLoading: utilizationQuery.isLoading,
    error: utilizationQuery.error,
    refetch: utilizationQuery.refetch,
    deleteUtilization: deleteMutation.mutate,
    deleteUtilizationAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
