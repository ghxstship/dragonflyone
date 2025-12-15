import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface DataSource {
  id: string;
  name: string;
  type: 'Database' | 'API' | 'File' | 'Streaming';
  recordCount: number;
  syncFrequency: string;
  lastSync: string;
  status: 'Connected' | 'Syncing' | 'Error' | 'Disconnected';
}

const API_BASE = '/api/data-sources';

async function fetchDataSources(params?: {
  type?: string;
  status?: string;
}): Promise<DataSource[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch data sources');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    name: item.name as string || '',
    type: item.type as DataSource['type'] || 'Database',
    recordCount: item.record_count as number || item.recordCount as number || 0,
    syncFrequency: item.sync_frequency as string || item.syncFrequency as string || 'Daily',
    lastSync: item.last_sync as string || item.lastSync as string || '',
    status: item.status as DataSource['status'] || 'Disconnected',
  }));
}

async function createDataSource(data: Omit<DataSource, 'id'>): Promise<DataSource> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create data source');
  }

  const { data: result } = await response.json();
  return result;
}

async function syncDataSource(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}/sync`, { method: 'POST' });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync data source');
  }
}

async function deleteDataSources(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete data sources');
  }
}

async function bulkSyncDataSources(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk-sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync data sources');
  }
}

export function useDataSourcesQuery(params?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: ['data-sources', params],
    queryFn: () => fetchDataSources(params),
    staleTime: 60000,
  });
}

export function useCreateDataSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDataSource,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data-sources'] }),
  });
}

export function useSyncDataSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncDataSource,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data-sources'] }),
  });
}

export function useDeleteDataSources() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDataSources,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data-sources'] }),
  });
}

export function useBulkSyncDataSources() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkSyncDataSources,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data-sources'] }),
  });
}

export function useDataWarehouse() {
  const sourcesQuery = useDataSourcesQuery();
  const createMutation = useCreateDataSource();
  const syncMutation = useSyncDataSource();
  const deleteMutation = useDeleteDataSources();
  const bulkSyncMutation = useBulkSyncDataSources();

  return {
    dataSources: sourcesQuery.data || [],
    isLoading: sourcesQuery.isLoading,
    error: sourcesQuery.error,
    refetch: sourcesQuery.refetch,
    createDataSource: createMutation.mutate,
    createDataSourceAsync: createMutation.mutateAsync,
    syncDataSource: syncMutation.mutate,
    syncDataSourceAsync: syncMutation.mutateAsync,
    deleteDataSources: deleteMutation.mutate,
    deleteDataSourcesAsync: deleteMutation.mutateAsync,
    bulkSync: bulkSyncMutation.mutate,
    bulkSyncAsync: bulkSyncMutation.mutateAsync,
  };
}
