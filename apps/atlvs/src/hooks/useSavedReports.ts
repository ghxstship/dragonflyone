import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  report_type: 'revenue' | 'bookings' | 'pipeline' | 'ar' | 'custom';
  filters: Record<string, unknown>;
  columns: string[];
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    last_sent_at?: string;
  };
  is_favorite: boolean;
  created_by: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface ReportExecution {
  id: string;
  report_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  row_count?: number;
  file_url?: string;
  error_message?: string;
}

export interface CreateReportInput {
  name: string;
  description?: string;
  report_type: SavedReport['report_type'];
  filters?: Record<string, unknown>;
  columns?: string[];
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  schedule?: SavedReport['schedule'];
}

export interface UpdateReportInput extends Partial<CreateReportInput> {
  id: string;
}

async function fetchSavedReports(): Promise<{ reports: SavedReport[]; total: number }> {
  const response = await fetch('/api/reports');
  if (!response.ok) {
    throw new Error('Failed to fetch saved reports');
  }
  return response.json();
}

async function fetchSavedReport(id: string): Promise<SavedReport> {
  const response = await fetch(`/api/reports/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch report');
  }
  return response.json();
}

async function createSavedReport(input: CreateReportInput): Promise<SavedReport> {
  const response = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create report');
  }
  return response.json();
}

async function updateSavedReport({ id, ...input }: UpdateReportInput): Promise<SavedReport> {
  const response = await fetch(`/api/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update report');
  }
  return response.json();
}

async function deleteSavedReport(id: string): Promise<void> {
  const response = await fetch(`/api/reports/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete report');
  }
}

async function runReport(id: string): Promise<ReportExecution> {
  const response = await fetch(`/api/reports/${id}/run`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to run report');
  }
  return response.json();
}

async function toggleReportFavorite(id: string): Promise<SavedReport> {
  const response = await fetch(`/api/reports/${id}/favorite`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle favorite');
  }
  return response.json();
}

export function useSavedReports() {
  return useQuery({
    queryKey: ['saved-reports'],
    queryFn: fetchSavedReports,
  });
}

export function useSavedReport(id: string) {
  return useQuery({
    queryKey: ['saved-report', id],
    queryFn: () => fetchSavedReport(id),
    enabled: !!id,
  });
}

export function useCreateSavedReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSavedReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
    },
  });
}

export function useUpdateSavedReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSavedReport,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
      queryClient.invalidateQueries({ queryKey: ['saved-report', data.id] });
    },
  });
}

export function useDeleteSavedReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSavedReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
    },
  });
}

export function useRunReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runReport,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['saved-report', id] });
    },
  });
}

export function useToggleReportFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleReportFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
    },
  });
}
