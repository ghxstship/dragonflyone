import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface OptimizationRecommendation {
  id: string;
  asset_id: string;
  asset_name: string;
  category: string;
  type: 'underutilized' | 'overutilized' | 'maintenance_due' | 'replacement' | 'consolidation';
  current_utilization: number;
  target_utilization: number;
  priority: 'high' | 'medium' | 'low';
  potential_savings: number;
  recommendation: string;
  action_items: string[];
  status: 'pending' | 'in_progress' | 'implemented' | 'dismissed';
}

const API_BASE = '/api/optimization';

async function fetchOptimizationRecommendations(params?: {
  type?: string;
  priority?: string;
  status?: string;
}): Promise<OptimizationRecommendation[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.priority) searchParams.set('priority', params.priority);
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch optimization recommendations');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    asset_id: item.asset_id as string,
    asset_name: item.asset_name as string || ((item.asset as Record<string, unknown>)?.name as string) || 'Unknown',
    category: item.category as string || ((item.asset as Record<string, unknown>)?.category as string) || 'General',
    type: item.type as OptimizationRecommendation['type'],
    current_utilization: item.current_utilization as number || 0,
    target_utilization: item.target_utilization as number || 0,
    priority: item.priority as OptimizationRecommendation['priority'] || 'medium',
    potential_savings: item.potential_savings as number || 0,
    recommendation: item.recommendation as string || '',
    action_items: (item.action_items as string[]) || [],
    status: item.status as OptimizationRecommendation['status'] || 'pending',
  }));
}

async function updateOptimizationStatus(id: string, status: string): Promise<OptimizationRecommendation> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update optimization status');
  }

  const { data } = await response.json();
  return data;
}

async function deleteOptimizationRecommendations(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete optimization recommendations');
  }
}

async function bulkUpdateOptimizationStatus(ids: string[], status: string): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to bulk update optimization status');
  }
}

export function useOptimizationQuery(params?: {
  type?: string;
  priority?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['optimization', params],
    queryFn: () => fetchOptimizationRecommendations(params),
    staleTime: 60000,
  });
}

export function useUpdateOptimizationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOptimizationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optimization'] });
    },
  });
}

export function useDeleteOptimizationRecommendations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOptimizationRecommendations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optimization'] });
    },
  });
}

export function useBulkUpdateOptimizationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) => bulkUpdateOptimizationStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['optimization'] });
    },
  });
}

export function useOptimization() {
  const recommendationsQuery = useOptimizationQuery();
  const updateStatusMutation = useUpdateOptimizationStatus();
  const deleteMutation = useDeleteOptimizationRecommendations();
  const bulkUpdateMutation = useBulkUpdateOptimizationStatus();

  return {
    recommendations: recommendationsQuery.data || [],
    isLoading: recommendationsQuery.isLoading,
    error: recommendationsQuery.error,
    refetch: recommendationsQuery.refetch,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
    deleteRecommendations: deleteMutation.mutate,
    deleteRecommendationsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    bulkUpdateStatus: bulkUpdateMutation.mutate,
    bulkUpdateStatusAsync: bulkUpdateMutation.mutateAsync,
    isBulkUpdating: bulkUpdateMutation.isPending,
  };
}
