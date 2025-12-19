import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  resource_name?: string;
  actor_id: string;
  actor_name: string;
  actor_email: string;
  actor_type: 'user' | 'system' | 'api' | 'webhook';
  ip_address?: string;
  user_agent?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  details: Record<string, unknown>;
  changes?: Array<{
    field: string;
    from: unknown;
    to: unknown;
  }>;
  status: 'success' | 'failure' | 'warning';
  error_message?: string;
  request_id?: string;
  duration_ms?: number;
  organization_id: string;
  created_at: string;
}

export interface AuditLogFilters {
  resource_type?: string;
  resource_id?: string;
  actor_id?: string;
  action?: string;
  status?: AuditLogEntry['status'];
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface AuditLogStats {
  total_entries: number;
  by_action: Record<string, number>;
  by_resource_type: Record<string, number>;
  by_status: Record<string, number>;
  by_actor: Array<{ actor_id: string; actor_name: string; count: number }>;
  timeline: Array<{ date: string; count: number }>;
}

async function fetchAuditLog(
  filters?: AuditLogFilters,
  page: number = 1,
  pageSize: number = 50
): Promise<{
  entries: AuditLogEntry[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}> {
  const params = new URLSearchParams();
  if (filters?.resource_type) params.set('resource_type', filters.resource_type);
  if (filters?.resource_id) params.set('resource_id', filters.resource_id);
  if (filters?.actor_id) params.set('actor_id', filters.actor_id);
  if (filters?.action) params.set('action', filters.action);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);
  if (filters?.search) params.set('search', filters.search);
  params.set('page', page.toString());
  params.set('page_size', pageSize.toString());

  const response = await fetch(`/api/audit-log?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch audit log');
  }
  return response.json();
}

async function fetchAuditLogStats(dateRange?: { start: string; end: string }): Promise<AuditLogStats> {
  const params = new URLSearchParams();
  if (dateRange?.start) params.set('start', dateRange.start);
  if (dateRange?.end) params.set('end', dateRange.end);

  const response = await fetch(`/api/audit-log/stats?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch audit log stats');
  }
  return response.json();
}

async function fetchAuditLogEntry(id: string): Promise<AuditLogEntry> {
  const response = await fetch(`/api/audit-log/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch audit log entry');
  }
  return response.json();
}

async function exportAuditLog(filters?: AuditLogFilters, format: 'csv' | 'json' = 'csv'): Promise<{ download_url: string }> {
  const params = new URLSearchParams();
  if (filters?.resource_type) params.set('resource_type', filters.resource_type);
  if (filters?.actor_id) params.set('actor_id', filters.actor_id);
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);
  params.set('format', format);

  const response = await fetch(`/api/audit-log/export?${params}`);
  if (!response.ok) {
    throw new Error('Failed to export audit log');
  }
  return response.json();
}

export function useAuditLog(filters?: AuditLogFilters, pageSize: number = 50) {
  return useInfiniteQuery({
    queryKey: ['audit-log', filters, pageSize],
    queryFn: ({ pageParam = 1 }) => fetchAuditLog(filters, pageParam, pageSize),
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useAuditLogStats(dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ['audit-log-stats', dateRange],
    queryFn: () => fetchAuditLogStats(dateRange),
  });
}

export function useAuditLogEntry(id: string) {
  return useQuery({
    queryKey: ['audit-log-entry', id],
    queryFn: () => fetchAuditLogEntry(id),
    enabled: !!id,
  });
}

export function useExportAuditLog() {
  return {
    exportLog: async (filters?: AuditLogFilters, format: 'csv' | 'json' = 'csv') => {
      const result = await exportAuditLog(filters, format);
      window.open(result.download_url, '_blank');
      return result;
    },
  };
}
