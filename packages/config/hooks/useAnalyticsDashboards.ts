import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  owner: string;
  visibility: 'private' | 'team' | 'organization';
  widgets: number;
  lastModified: string;
  starred: boolean;
  views: number;
}

const API_BASE = '/api/analytics/dashboards';

async function fetchDashboards(params?: {
  visibility?: string;
  starred?: boolean;
}): Promise<AnalyticsDashboard[]> {
  const searchParams = new URLSearchParams();
  if (params?.visibility) searchParams.set('visibility', params.visibility);
  if (params?.starred !== undefined) searchParams.set('starred', String(params.starred));

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
    description: item.description as string || '',
    owner: item.owner as string || 'Unknown',
    visibility: item.visibility as AnalyticsDashboard['visibility'] || 'private',
    widgets: item.widgets as number || item.widget_count as number || 0,
    lastModified: item.last_modified as string || item.updated_at as string || new Date().toISOString(),
    starred: item.starred as boolean || item.is_starred as boolean || false,
    views: item.views as number || item.view_count as number || 0,
  }));
}

async function toggleStarred(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}/star`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle star');
  }
}

async function duplicateDashboard(id: string): Promise<AnalyticsDashboard> {
  const response = await fetch(`${API_BASE}/${id}/duplicate`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to duplicate dashboard');
  }

  const { data } = await response.json();
  return data;
}

async function deleteDashboard(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete dashboard');
  }
}

export function useAnalyticsDashboardsQuery(params?: { visibility?: string; starred?: boolean }) {
  return useQuery({
    queryKey: ['analytics-dashboards', params],
    queryFn: () => fetchDashboards(params),
    staleTime: 60000,
  });
}

export function useToggleDashboardStar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleStarred,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboards'] });
    },
  });
}

export function useDuplicateDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateDashboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboards'] });
    },
  });
}

export function useDeleteDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDashboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboards'] });
    },
  });
}

export function useAnalyticsDashboards() {
  const dashboardsQuery = useAnalyticsDashboardsQuery();
  const toggleStarMutation = useToggleDashboardStar();
  const duplicateMutation = useDuplicateDashboard();
  const deleteMutation = useDeleteDashboard();

  return {
    dashboards: dashboardsQuery.data || [],
    isLoading: dashboardsQuery.isLoading,
    error: dashboardsQuery.error,
    refetch: dashboardsQuery.refetch,
    toggleStar: toggleStarMutation.mutate,
    toggleStarAsync: toggleStarMutation.mutateAsync,
    duplicate: duplicateMutation.mutate,
    duplicateAsync: duplicateMutation.mutateAsync,
    deleteDashboard: deleteMutation.mutate,
    deleteDashboardAsync: deleteMutation.mutateAsync,
  };
}
