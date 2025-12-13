'use client';

import { useQuery } from '@tanstack/react-query';

export interface AuditLog {
  id: string;
  organization_id?: string;
  user_id?: string;
  session_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  changes?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  request_method?: string;
  request_path?: string;
  response_status?: number;
  duration_ms?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
  user?: {
    id: string;
    full_name?: string;
    email: string;
  };
}

interface AuditLogFilters {
  action?: string;
  resource_type?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  summary: {
    total: number;
    by_action: Record<string, number>;
    by_resource: Record<string, number>;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.action) params.append('action', filters.action);
      if (filters?.resource_type) params.append('resource_type', filters.resource_type);
      if (filters?.user_id) params.append('user_id', filters.user_id);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);

      const response = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      return response.json() as Promise<AuditLogsResponse>;
    },
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: ['audit-logs', id],
    queryFn: async () => {
      const response = await fetch(`/api/audit-logs/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch audit log');
      }
      const data = await response.json();
      return data.log as AuditLog;
    },
    enabled: !!id,
  });
}

export function useAuditLogStats() {
  return useQuery({
    queryKey: ['audit-logs', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/audit-logs');
      if (!response.ok) {
        throw new Error('Failed to fetch audit log stats');
      }
      const data = await response.json() as AuditLogsResponse;
      return data.summary;
    },
  });
}
