import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  widgetCount: number;
  isDefault: boolean;
  createdAt: string;
  lastModified: string;
  status: 'Active' | 'Draft';
}

const API_BASE = '/api/dashboards';

async function fetchDashboards(params?: {
  status?: string;
}): Promise<DashboardConfig[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch dashboards');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    name: item.name as string || '',
    description: item.description as string | undefined,
    widgetCount: item.widget_count as number || item.widgetCount as number || 0,
    isDefault: item.is_default as boolean || item.isDefault as boolean || false,
    createdAt: item.created_at as string || item.createdAt as string || '',
    lastModified: item.last_modified as string || item.lastModified as string || item.updated_at as string || '',
    status: item.status as DashboardConfig['status'] || 'Draft',
  }));
}

async function createDashboard(data: Partial<DashboardConfig>): Promise<DashboardConfig> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create dashboard');
  }

  const { data: result } = await response.json();
  return result;
}

async function duplicateDashboard(id: string): Promise<DashboardConfig> {
  const response = await fetch(`${API_BASE}/${id}/duplicate`, { method: 'POST' });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to duplicate dashboard');
  }

  const { data: result } = await response.json();
  return result;
}

async function deleteDashboards(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete dashboards');
  }
}

export function useDashboardsQuery(params?: { status?: string }) {
  return useQuery({
    queryKey: ['dashboard-builder', params],
    queryFn: () => fetchDashboards(params),
    staleTime: 60000,
  });
}

export function useCreateDashboard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDashboard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard-builder'] }),
  });
}

export function useDuplicateDashboardConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: duplicateDashboard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard-builder'] }),
  });
}

export function useDeleteDashboards() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDashboards,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard-builder'] }),
  });
}

export function useDashboardBuilder() {
  const dashboardsQuery = useDashboardsQuery();
  const createMutation = useCreateDashboard();
  const duplicateMutation = useDuplicateDashboardConfig();
  const deleteMutation = useDeleteDashboards();

  return {
    dashboards: dashboardsQuery.data || [],
    isLoading: dashboardsQuery.isLoading,
    error: dashboardsQuery.error,
    refetch: dashboardsQuery.refetch,
    createDashboard: createMutation.mutate,
    createDashboardAsync: createMutation.mutateAsync,
    duplicateDashboard: duplicateMutation.mutate,
    duplicateDashboardAsync: duplicateMutation.mutateAsync,
    deleteDashboards: deleteMutation.mutate,
    deleteDashboardsAsync: deleteMutation.mutateAsync,
  };
}
