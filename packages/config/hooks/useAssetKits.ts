import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AssetKitItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
}

export interface AssetKit {
  id: string;
  name: string;
  category: string;
  itemCount: number;
  totalValue: number;
  status: 'Available' | 'Deployed' | 'Partial' | 'Maintenance';
  description: string;
  items: AssetKitItem[];
  lastUsed?: string;
}

export interface CreateAssetKitParams {
  name: string;
  category: string;
  description?: string;
  items?: { asset_id: string; quantity: number }[];
}

const API_BASE = '/api/asset-kits';

async function fetchAssetKits(params?: {
  status?: string;
  category?: string;
}): Promise<AssetKit[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.category) searchParams.set('category', params.category);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch asset kits');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    name: item.name as string,
    category: item.category as string,
    itemCount: (item.items as unknown[])?.length || item.item_count as number || 0,
    totalValue: item.total_value as number || 0,
    status: item.status as AssetKit['status'],
    description: item.description as string || '',
    items: ((item.items as Record<string, unknown>[]) || []).map((i) => ({
      id: i.id as string || i.asset_id as string,
      name: i.name as string || (i.asset as Record<string, unknown>)?.name as string || 'Unknown',
      category: i.category as string || (i.asset as Record<string, unknown>)?.category as string || 'General',
      quantity: i.quantity as number || 1,
    })),
    lastUsed: item.last_used as string | undefined,
  }));
}

async function createAssetKit(params: CreateAssetKitParams): Promise<AssetKit> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create asset kit');
  }

  const { data } = await response.json();
  return data;
}

async function updateAssetKit(id: string, updates: Partial<CreateAssetKitParams & { status: string }>): Promise<AssetKit> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update asset kit');
  }

  const { data } = await response.json();
  return data;
}

async function deleteAssetKits(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete asset kits');
  }
}

async function deployAssetKits(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk-deploy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to deploy asset kits');
  }
}

export function useAssetKitsQuery(params?: {
  status?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: ['asset-kits', params],
    queryFn: () => fetchAssetKits(params),
    staleTime: 60000,
  });
}

export function useCreateAssetKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAssetKit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-kits'] });
    },
  });
}

export function useUpdateAssetKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateAssetKitParams & { status: string }> }) =>
      updateAssetKit(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-kits'] });
    },
  });
}

export function useDeleteAssetKits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAssetKits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-kits'] });
    },
  });
}

export function useDeployAssetKits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deployAssetKits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-kits'] });
    },
  });
}

export function useAssetKits() {
  const kitsQuery = useAssetKitsQuery();
  const createMutation = useCreateAssetKit();
  const updateMutation = useUpdateAssetKit();
  const deleteMutation = useDeleteAssetKits();
  const deployMutation = useDeployAssetKits();

  return {
    kits: kitsQuery.data || [],
    isLoading: kitsQuery.isLoading,
    error: kitsQuery.error,
    refetch: kitsQuery.refetch,
    createKit: createMutation.mutate,
    createKitAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateKit: updateMutation.mutate,
    updateKitAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteKits: deleteMutation.mutate,
    deleteKitsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deployKits: deployMutation.mutate,
    deployKitsAsync: deployMutation.mutateAsync,
    isDeploying: deployMutation.isPending,
  };
}
