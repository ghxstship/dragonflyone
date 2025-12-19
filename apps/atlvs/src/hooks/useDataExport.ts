import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ExportJob {
  id: string;
  export_type: 'contacts' | 'bookings' | 'invoices' | 'payments' | 'vendors' | 'reports' | 'full_backup';
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  filters?: Record<string, unknown>;
  file_url?: string;
  file_size?: number;
  row_count?: number;
  error_message?: string;
  requested_by: string;
  started_at?: string;
  completed_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface CreateExportInput {
  export_type: ExportJob['export_type'];
  format: ExportJob['format'];
  filters?: Record<string, unknown>;
  columns?: string[];
  date_range?: { start: string; end: string };
  include_related?: boolean;
}

async function fetchExportJobs(): Promise<{ jobs: ExportJob[]; total: number }> {
  const response = await fetch('/api/exports');
  if (!response.ok) {
    throw new Error('Failed to fetch export jobs');
  }
  return response.json();
}

async function fetchExportJob(id: string): Promise<ExportJob> {
  const response = await fetch(`/api/exports/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch export job');
  }
  return response.json();
}

async function createExportJob(input: CreateExportInput): Promise<ExportJob> {
  const response = await fetch('/api/exports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create export job');
  }
  return response.json();
}

async function cancelExportJob(id: string): Promise<ExportJob> {
  const response = await fetch(`/api/exports/${id}/cancel`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to cancel export job');
  }
  return response.json();
}

async function deleteExportJob(id: string): Promise<void> {
  const response = await fetch(`/api/exports/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete export job');
  }
}

async function getExportableFields(exportType: ExportJob['export_type']): Promise<{
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    default_included: boolean;
  }>;
}> {
  const response = await fetch(`/api/exports/fields/${exportType}`);
  if (!response.ok) {
    throw new Error('Failed to get exportable fields');
  }
  return response.json();
}

export function useExportJobs() {
  return useQuery({
    queryKey: ['export-jobs'],
    queryFn: fetchExportJobs,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.jobs.some((job: ExportJob) => job.status === 'processing' || job.status === 'pending')) {
        return 5000; // Poll every 5 seconds if any job is in progress
      }
      return false;
    },
  });
}

export function useExportJob(id: string) {
  return useQuery({
    queryKey: ['export-job', id],
    queryFn: () => fetchExportJob(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'processing' || data?.status === 'pending') {
        return 2000; // Poll every 2 seconds
      }
      return false;
    },
  });
}

export function useCreateExportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExportJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-jobs'] });
    },
  });
}

export function useCancelExportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelExportJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-jobs'] });
    },
  });
}

export function useDeleteExportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExportJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-jobs'] });
    },
  });
}

export function useExportableFields(exportType: ExportJob['export_type']) {
  return useQuery({
    queryKey: ['exportable-fields', exportType],
    queryFn: () => getExportableFields(exportType),
    enabled: !!exportType,
  });
}
