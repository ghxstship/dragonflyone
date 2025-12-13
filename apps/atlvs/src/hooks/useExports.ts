'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ExportJob {
  id: string;
  name: string;
  export_type: 'full' | 'incremental' | 'snapshot';
  tables_included?: string[];
  format: 'parquet' | 'csv' | 'json' | 'avro' | 'excel' | 'pdf';
  compression?: 'none' | 'gzip' | 'snappy' | 'zstd';
  destination_path?: string;
  schedule_cron?: string;
  is_active: boolean;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  file_url?: string;
  record_count?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  destination?: {
    id: string;
    name: string;
    connection_type: string;
  };
  created_by_user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

interface ExportFilters {
  is_active?: boolean;
  include_history?: boolean;
  page?: number;
  limit?: number;
}

interface ExportsResponse {
  data: ExportJob[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function useExports(filters?: ExportFilters) {
  return useQuery({
    queryKey: ['exports', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      if (filters?.include_history) params.append('include_history', 'true');
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.limit) params.append('limit', String(filters.limit));

      const response = await fetch(`/api/data-warehouse/exports?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch exports');
      }
      return response.json() as Promise<ExportsResponse>;
    },
  });
}

export function useExportJob(id: string) {
  return useQuery({
    queryKey: ['exports', id],
    queryFn: async () => {
      const response = await fetch(`/api/data-warehouse/exports/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch export job');
      }
      const data = await response.json();
      return data.data as ExportJob;
    },
    enabled: !!id,
  });
}

interface CreateExportInput {
  name: string;
  export_type: 'full' | 'incremental' | 'snapshot';
  tables_included: string[];
  format: 'parquet' | 'csv' | 'json' | 'avro';
  compression?: 'none' | 'gzip' | 'snappy' | 'zstd';
  destination_connection_id: string;
  destination_path: string;
  schedule_cron?: string;
  retention_days?: number;
}

export function useCreateExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exportJob: CreateExportInput) => {
      const response = await fetch('/api/data-warehouse/exports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportJob),
      });
      if (!response.ok) {
        throw new Error('Failed to create export job');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exports'] });
    },
  });
}

export function useRunExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/data-warehouse/exports/${id}/run`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to run export');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exports'] });
    },
  });
}

export function useDeleteExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/data-warehouse/exports/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete export job');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exports'] });
    },
  });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getExportStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    failed: 'error',
  };
  return colors[status] || 'ghost';
}
