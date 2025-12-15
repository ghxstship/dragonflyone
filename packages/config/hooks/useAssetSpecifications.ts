import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SpecDetail {
  label: string;
  value: string;
  unit?: string;
}

export interface SpecDocument {
  id: string;
  name: string;
  type: 'Manual' | 'Datasheet' | 'CAD' | 'Firmware' | 'Safety';
  url: string;
  size: string;
}

export interface AssetSpec {
  id: string;
  name: string;
  category: 'Audio' | 'Lighting' | 'Video' | 'Staging' | 'Rigging' | 'Power' | 'Communication';
  manufacturer: string;
  model: string;
  specifications: SpecDetail[];
  documents: SpecDocument[];
  relatedAssets: number;
  lastUpdated: string;
}

export interface CreateAssetSpecParams {
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  specifications?: SpecDetail[];
}

const API_BASE = '/api/asset-specifications';

async function fetchAssetSpecifications(params?: {
  category?: string;
}): Promise<AssetSpec[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch asset specifications');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    name: item.name as string,
    category: item.category as AssetSpec['category'],
    manufacturer: item.manufacturer as string,
    model: item.model as string,
    specifications: (item.specifications as SpecDetail[]) || [],
    documents: (item.documents as SpecDocument[]) || [],
    relatedAssets: item.related_assets as number || 0,
    lastUpdated: item.last_updated as string || item.updated_at as string || '',
  }));
}

async function createAssetSpecification(params: CreateAssetSpecParams): Promise<AssetSpec> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create asset specification');
  }

  const { data } = await response.json();
  return data;
}

async function updateAssetSpecification(id: string, updates: Partial<CreateAssetSpecParams>): Promise<AssetSpec> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update asset specification');
  }

  const { data } = await response.json();
  return data;
}

async function deleteAssetSpecifications(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete asset specifications');
  }
}

export function useAssetSpecificationsQuery(params?: {
  category?: string;
}) {
  return useQuery({
    queryKey: ['asset-specifications', params],
    queryFn: () => fetchAssetSpecifications(params),
    staleTime: 60000,
  });
}

export function useCreateAssetSpecification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAssetSpecification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-specifications'] });
    },
  });
}

export function useUpdateAssetSpecification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateAssetSpecParams> }) =>
      updateAssetSpecification(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-specifications'] });
    },
  });
}

export function useDeleteAssetSpecifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAssetSpecifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-specifications'] });
    },
  });
}

export function useAssetSpecifications() {
  const specsQuery = useAssetSpecificationsQuery();
  const createMutation = useCreateAssetSpecification();
  const updateMutation = useUpdateAssetSpecification();
  const deleteMutation = useDeleteAssetSpecifications();

  return {
    specifications: specsQuery.data || [],
    isLoading: specsQuery.isLoading,
    error: specsQuery.error,
    refetch: specsQuery.refetch,
    createSpec: createMutation.mutate,
    createSpecAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateSpec: updateMutation.mutate,
    updateSpecAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteSpecs: deleteMutation.mutate,
    deleteSpecsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
