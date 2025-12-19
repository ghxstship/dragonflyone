import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ReportColumn {
  id: string;
  field: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'datetime' | 'boolean' | 'percentage';
  aggregate?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  format?: string;
  width?: number;
  sortable: boolean;
  visible: boolean;
}

export interface ReportFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in' | 'is_null' | 'is_not_null' | 'between';
  value: unknown;
  value2?: unknown;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description?: string;
  data_source: 'bookings' | 'contacts' | 'invoices' | 'payments' | 'leads' | 'vendors' | 'inventory' | 'custom';
  columns: ReportColumn[];
  filters: ReportFilter[];
  group_by?: string[];
  sort_by?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  date_range?: {
    field: string;
    preset?: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'this_year' | 'last_year' | 'custom';
    start?: string;
    end?: string;
  };
  visualization?: {
    type: 'table' | 'bar' | 'line' | 'pie' | 'area' | 'scatter';
    x_axis?: string;
    y_axis?: string;
    series?: string[];
  };
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    day_of_week?: number;
    day_of_month?: number;
    recipients: string[];
    format: 'pdf' | 'csv' | 'xlsx';
  };
  is_public: boolean;
  is_favorite: boolean;
  folder_id?: string;
  created_by: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface ReportExecution {
  id: string;
  report_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  row_count?: number;
  execution_time_ms?: number;
  file_url?: string;
  error_message?: string;
  executed_by: string;
  executed_at: string;
  completed_at?: string;
}

async function fetchReports(filters?: { folder_id?: string; is_favorite?: boolean }): Promise<{
  reports: ReportDefinition[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (filters?.folder_id) params.set('folder_id', filters.folder_id);
  if (filters?.is_favorite) params.set('is_favorite', 'true');

  const response = await fetch(`/api/reports?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }
  return response.json();
}

async function fetchReport(id: string): Promise<ReportDefinition> {
  const response = await fetch(`/api/reports/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch report');
  }
  return response.json();
}

async function createReport(input: Omit<ReportDefinition, 'id' | 'created_by' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<ReportDefinition> {
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

async function updateReport(input: { id: string } & Partial<ReportDefinition>): Promise<ReportDefinition> {
  const { id, ...data } = input;
  const response = await fetch(`/api/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update report');
  }
  return response.json();
}

async function deleteReport(id: string): Promise<void> {
  const response = await fetch(`/api/reports/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete report');
  }
}

async function executeReport(id: string, format?: 'json' | 'csv' | 'xlsx' | 'pdf'): Promise<ReportExecution> {
  const params = new URLSearchParams();
  if (format) params.set('format', format);

  const response = await fetch(`/api/reports/${id}/execute?${params}`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to execute report');
  }
  return response.json();
}

async function previewReport(input: Partial<ReportDefinition>): Promise<{
  data: Record<string, unknown>[];
  total: number;
  preview_limited: boolean;
}> {
  const response = await fetch('/api/reports/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Failed to preview report');
  }
  return response.json();
}

async function duplicateReport(id: string): Promise<ReportDefinition> {
  const response = await fetch(`/api/reports/${id}/duplicate`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to duplicate report');
  }
  return response.json();
}

export function useReports(filters?: { folder_id?: string; is_favorite?: boolean }) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => fetchReports(filters),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => fetchReport(id),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateReport,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', data.id] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useExecuteReport() {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format?: 'json' | 'csv' | 'xlsx' | 'pdf' }) => executeReport(id, format),
  });
}

export function usePreviewReport() {
  return useMutation({
    mutationFn: previewReport,
  });
}

export function useDuplicateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
