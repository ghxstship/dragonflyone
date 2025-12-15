import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


export interface AnalyticsReport {
  id: string;
  name: string;
  type: 'financial' | 'operational' | 'hr' | 'custom';
  schedule: 'daily' | 'weekly' | 'monthly' | 'on-demand';
  lastRun: string;
  nextRun?: string;
  status: 'active' | 'paused' | 'error';
  format: 'pdf' | 'excel' | 'csv';
}

const API_BASE = '/api/analytics/reports';

async function fetchAnalyticsReports(params?: {
  type?: string;
  status?: string;
}): Promise<AnalyticsReport[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch analytics reports');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    name: item.name as string || '',
    type: item.type as AnalyticsReport['type'] || 'custom',
    schedule: item.schedule as AnalyticsReport['schedule'] || 'on-demand',
    lastRun: item.last_run as string || item.lastRun as string || new Date().toISOString(),
    nextRun: item.next_run as string | undefined,
    status: item.status as AnalyticsReport['status'] || 'active',
    format: item.format as AnalyticsReport['format'] || 'pdf',
  }));
}

async function runReport(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}/run`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to run report');
  }
}

async function toggleReportStatus(id: string, status: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update report status');
  }
}

async function deleteReports(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete reports');
  }
}

export function useAnalyticsReportsQuery(params?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: ['analytics-reports', params],
    queryFn: () => fetchAnalyticsReports(params),
    staleTime: 60000,
  });
}

export function useRunReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-reports'] });
    },
  });
}

export function useToggleReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      toggleReportStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-reports'] });
    },
  });
}

export function useDeleteReports() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReports,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-reports'] });
    },
  });
}

export function useAnalyticsReports() {
  const reportsQuery = useAnalyticsReportsQuery();
  const runMutation = useRunReport();
  const toggleStatusMutation = useToggleReportStatus();
  const deleteMutation = useDeleteReports();

  return {
    reports: reportsQuery.data || [],
    isLoading: reportsQuery.isLoading,
    error: reportsQuery.error,
    refetch: reportsQuery.refetch,
    runReport: runMutation.mutate,
    runReportAsync: runMutation.mutateAsync,
    isRunning: runMutation.isPending,
    toggleStatus: toggleStatusMutation.mutate,
    toggleStatusAsync: toggleStatusMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,
    deleteReports: deleteMutation.mutate,
    deleteReportsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
