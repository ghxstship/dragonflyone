'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  user_id?: string;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'demo-1',
    type: 'project_update',
    title: 'Project Budget Updated',
    message: 'Summer Festival 2024 budget has been approved.',
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    type: 'finance',
    title: 'Invoice Approved',
    message: 'Invoice #INV-2024-0456 for $12,500 has been approved.',
    read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'demo-3',
    type: 'system',
    title: 'Report Ready',
    message: 'Your Q4 financial report is ready for download.',
    read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (filterType?: string) => [...notificationKeys.all, 'list', filterType] as const,
};

async function fetchNotifications(filterType?: string): Promise<Notification[]> {
  const params = new URLSearchParams();
  if (filterType && filterType !== 'all') {
    params.append('type', filterType);
  }
  const response = await fetch(`/api/notifications?${params.toString()}`);
  if (response.status === 401 || response.status === 403) {
    return DEMO_NOTIFICATIONS;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  const data = await response.json();
  // Map API response (is_read) to hook interface (read)
  return (data.notifications || []).map((n: Record<string, unknown>) => ({
    id: n.id as string,
    type: n.type as string,
    title: n.title as string,
    message: n.message as string,
    read: n.is_read as boolean,
    created_at: n.created_at as string,
    user_id: n.user_id as string | undefined,
  }));
}

interface MarkReadParams {
  notificationId: string;
  read: boolean;
}

async function markNotificationRead({ notificationId, read }: MarkReadParams): Promise<void> {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_read: read }),
  });
  if (!response.ok) {
    throw new Error('Failed to update notification');
  }
}

async function markAllRead(): Promise<void> {
  const response = await fetch('/api/notifications/mark-all-read', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to mark all as read');
  }
}

export function useNotificationsList(filterType?: string) {
  return useQuery({
    queryKey: notificationKeys.list(filterType),
    queryFn: () => fetchNotifications(filterType),
    staleTime: 60 * 1000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error) => {
      log.error('Failed to mark notification read:', error);
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error) => {
      log.error('Failed to mark all as read:', error);
    },
  });
}

export function useNotificationsData(filterType?: string) {
  const notificationsQuery = useNotificationsList(filterType);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllRead();

  return {
    notifications: notificationsQuery.data || [],
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error,
    markRead: markReadMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
    markAllRead: markAllReadMutation.mutateAsync,
    isMarkingAllRead: markAllReadMutation.isPending,
    refetch: notificationsQuery.refetch,
  };
}
