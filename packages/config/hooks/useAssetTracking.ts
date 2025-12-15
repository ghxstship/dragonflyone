import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AssetLocation {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  trackingType: 'GPS' | 'RFID' | 'Manual' | 'Bluetooth';
  locationName: string;
  locationAddress?: string;
  zone?: string;
  coordinates?: { lat: number; lng: number };
  lastSeen: string;
  status: 'Active' | 'In Transit' | 'Stationary' | 'Offline';
  batteryLevel?: number;
  assignedProject?: string;
}

const API_BASE = '/api/asset-tracking';

async function fetchAssetLocations(params?: {
  status?: string;
  trackingType?: string;
  category?: string;
}): Promise<AssetLocation[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.trackingType) searchParams.set('tracking_type', params.trackingType);
  if (params?.category) searchParams.set('category', params.category);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch asset locations');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    assetId: item.asset_id as string,
    assetName: ((item.asset as Record<string, unknown>)?.name || item.asset_name || 'Unknown') as string,
    category: ((item.asset as Record<string, unknown>)?.category || item.category || 'General') as string,
    trackingType: (item.tracking_type || item.trackingType) as AssetLocation['trackingType'],
    locationName: item.location_name as string || item.locationName as string || 'Unknown',
    locationAddress: item.location_address as string | undefined,
    zone: item.zone as string | undefined,
    coordinates: item.coordinates as { lat: number; lng: number } | undefined,
    lastSeen: item.last_seen as string || item.updated_at as string,
    status: item.status as AssetLocation['status'],
    batteryLevel: item.battery_level as number | undefined,
    assignedProject: item.assigned_project as string | undefined,
  }));
}

async function deleteAssetTracking(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete asset tracking records');
  }
}

export function useAssetLocationsQuery(params?: {
  status?: string;
  trackingType?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: ['asset-locations', params],
    queryFn: () => fetchAssetLocations(params),
    staleTime: 30000, // 30 seconds for real-time tracking
  });
}

export function useDeleteAssetTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAssetTracking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-locations'] });
    },
  });
}

export function useAssetTracking() {
  const locationsQuery = useAssetLocationsQuery();
  const deleteMutation = useDeleteAssetTracking();

  return {
    locations: locationsQuery.data || [],
    isLoading: locationsQuery.isLoading,
    error: locationsQuery.error,
    refetch: locationsQuery.refetch,
    deleteTracking: deleteMutation.mutate,
    deleteTrackingAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
