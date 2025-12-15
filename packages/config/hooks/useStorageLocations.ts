import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface StorageLocation {
  id: string;
  name: string;
  type: 'Warehouse' | 'Bay' | 'Container' | 'Shelf' | 'Zone';
  category: string;
  capacity: number;
  used: number;
  available: number;
  climate: 'Climate Controlled' | 'Standard' | 'Outdoor';
  status: 'Active' | 'Full' | 'Maintenance' | 'Inactive';
  address?: string;
  notes?: string;
}

export interface CreateStorageLocationParams {
  name: string;
  type: string;
  category: string;
  capacity: number;
  climate: string;
  address?: string;
  notes?: string;
}

const API_BASE = '/api/storage-locations';

async function fetchStorageLocations(params?: {
  status?: string;
  type?: string;
  climate?: string;
}): Promise<StorageLocation[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.type) searchParams.set('type', params.type);
  if (params?.climate) searchParams.set('climate', params.climate);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch storage locations');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    name: item.name as string,
    type: item.type as StorageLocation['type'],
    category: item.category as string || 'General',
    capacity: item.capacity as number || 0,
    used: item.used as number || 0,
    available: (item.capacity as number || 0) - (item.used as number || 0),
    climate: item.climate as StorageLocation['climate'] || 'Standard',
    status: item.status as StorageLocation['status'] || 'Active',
    address: item.address as string | undefined,
    notes: item.notes as string | undefined,
  }));
}

async function createStorageLocation(params: CreateStorageLocationParams): Promise<StorageLocation> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create storage location');
  }

  const { data } = await response.json();
  return data;
}

async function updateStorageLocation(id: string, updates: Partial<CreateStorageLocationParams & { status: string }>): Promise<StorageLocation> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update storage location');
  }

  const { data } = await response.json();
  return data;
}

async function deleteStorageLocations(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete storage locations');
  }
}

export function useStorageLocationsQuery(params?: {
  status?: string;
  type?: string;
  climate?: string;
}) {
  return useQuery({
    queryKey: ['storage-locations', params],
    queryFn: () => fetchStorageLocations(params),
    staleTime: 60000,
  });
}

export function useCreateStorageLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStorageLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-locations'] });
    },
  });
}

export function useUpdateStorageLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateStorageLocationParams & { status: string }> }) =>
      updateStorageLocation(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-locations'] });
    },
  });
}

export function useDeleteStorageLocations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStorageLocations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage-locations'] });
    },
  });
}

export function useStorageLocations() {
  const locationsQuery = useStorageLocationsQuery();
  const createMutation = useCreateStorageLocation();
  const updateMutation = useUpdateStorageLocation();
  const deleteMutation = useDeleteStorageLocations();

  return {
    locations: locationsQuery.data || [],
    isLoading: locationsQuery.isLoading,
    error: locationsQuery.error,
    refetch: locationsQuery.refetch,
    createLocation: createMutation.mutate,
    createLocationAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateLocation: updateMutation.mutate,
    updateLocationAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteLocations: deleteMutation.mutate,
    deleteLocationsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
