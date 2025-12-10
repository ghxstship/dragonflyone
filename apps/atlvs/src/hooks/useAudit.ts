'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface AuditLog {
  id: string;
  timestamp: string;
  user_id?: string;
  user_email?: string;
  user?: { id: string; email: string; full_name: string };
  action: string;
  resource_type: string;
  resource_id: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface AuditSummary {
  total: number;
  today: number;
  active_users: number;
  failed_attempts: number;
}

const DEMO_AUDIT: { logs: AuditLog[]; summary: AuditSummary } = {
  logs: [
    { id: '1', timestamp: new Date().toISOString(), user_email: 'admin@example.com', action: 'login', resource_type: 'session', resource_id: 'sess-001', created_at: new Date().toISOString() },
    { id: '2', timestamp: new Date(Date.now() - 3600000).toISOString(), user_email: 'user@example.com', action: 'update', resource_type: 'project', resource_id: 'proj-001', details: 'Updated budget', created_at: new Date(Date.now() - 3600000).toISOString() },
  ],
  summary: { total: 2, today: 2, active_users: 2, failed_attempts: 0 },
};

export const auditKeys = {
  all: ['audit'] as const,
  logs: () => [...auditKeys.all, 'logs'] as const,
};

export function useAuditLogs() {
  return useQuery({
    queryKey: auditKeys.logs(),
    queryFn: async () => {
      const response = await fetch('/api/kpi/audit-logs');
      if (response.status === 401) {
        return DEMO_AUDIT;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      const data = await response.json();
      return {
        logs: data.logs || [],
        summary: data.summary || { total: 0, today: 0, active_users: 0, failed_attempts: 0 },
      };
    },
    staleTime: 60 * 1000,
  });
}

export function useAuditData() {
  const auditQuery = useAuditLogs();
  const queryClient = useQueryClient();

  const data = auditQuery.data || DEMO_AUDIT;

  return {
    logs: data.logs,
    summary: data.summary,
    isLoading: auditQuery.isLoading,
    error: auditQuery.error,
    refetch: auditQuery.refetch,
    createLog: async (record: Record<string, unknown>) => {
      await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
    },
  };
}
