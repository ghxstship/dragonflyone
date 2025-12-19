import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export interface ActivityLogEntry {
  id: string;
  entity_type: 'booking' | 'contact' | 'invoice' | 'contract' | 'proposal' | 'payment' | 'vendor' | 'user' | 'space' | 'event';
  entity_id: string;
  entity_name?: string;
  action: 'created' | 'updated' | 'deleted' | 'viewed' | 'sent' | 'signed' | 'paid' | 'approved' | 'rejected' | 'cancelled' | 'assigned' | 'commented';
  description: string;
  changes?: Array<{
    field: string;
    old_value: unknown;
    new_value: unknown;
  }>;
  metadata?: Record<string, unknown>;
  user_id: string;
  user_name: string;
  user_email: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ActivityLogFilters {
  entity_type?: ActivityLogEntry['entity_type'];
  entity_id?: string;
  action?: ActivityLogEntry['action'];
  user_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

async function fetchActivityLog(filters?: ActivityLogFilters, page: number = 1, pageSize: number = 50): Promise<{
  entries: ActivityLogEntry[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}> {
  const params = new URLSearchParams();
  if (filters?.entity_type) params.set('entity_type', filters.entity_type);
  if (filters?.entity_id) params.set('entity_id', filters.entity_id);
  if (filters?.action) params.set('action', filters.action);
  if (filters?.user_id) params.set('user_id', filters.user_id);
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);
  if (filters?.search) params.set('search', filters.search);
  params.set('page', page.toString());
  params.set('page_size', pageSize.toString());

  const response = await fetch(`/api/activity-log?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch activity log');
  }
  return response.json();
}

async function fetchEntityTimeline(entityType: string, entityId: string): Promise<{
  entries: ActivityLogEntry[];
  total: number;
}> {
  const response = await fetch(`/api/activity-log/${entityType}/${entityId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch entity timeline');
  }
  return response.json();
}

async function fetchUserActivity(userId: string, dateRange?: { start: string; end: string }): Promise<{
  entries: ActivityLogEntry[];
  summary: {
    total_actions: number;
    by_action: Record<string, number>;
    by_entity_type: Record<string, number>;
    most_active_day: string;
    peak_hour: number;
  };
}> {
  const params = new URLSearchParams();
  if (dateRange?.start) params.set('start', dateRange.start);
  if (dateRange?.end) params.set('end', dateRange.end);

  const response = await fetch(`/api/activity-log/user/${userId}?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user activity');
  }
  return response.json();
}

export function useActivityLog(filters?: ActivityLogFilters, pageSize: number = 50) {
  return useInfiniteQuery({
    queryKey: ['activity-log', filters, pageSize],
    queryFn: ({ pageParam = 1 }) => fetchActivityLog(filters, pageParam, pageSize),
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

export function useEntityTimeline(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['entity-timeline', entityType, entityId],
    queryFn: () => fetchEntityTimeline(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
}

export function useUserActivity(userId: string, dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ['user-activity', userId, dateRange],
    queryFn: () => fetchUserActivity(userId, dateRange),
    enabled: !!userId,
  });
}
