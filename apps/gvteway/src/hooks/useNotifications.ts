'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface GvtewayNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  user_id?: string;
}

const DEMO_NOTIFICATIONS: GvtewayNotification[] = [
  { id: 'demo-1', type: 'event_update', title: 'Event Reminder', message: 'Summer Festival 2024 is tomorrow! Don\'t forget to bring your tickets.', read: false, created_at: new Date().toISOString() },
  { id: 'demo-2', type: 'ticket', title: 'Ticket Confirmed', message: 'Your VIP tickets for Concert Series have been confirmed.', read: false, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'demo-3', type: 'promotion', title: 'Early Bird Special', message: 'Get 20% off tickets to upcoming events. Use code EARLY20.', read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
];

export const notificationKeys = {
  all: ['gvteway-notifications'] as const,
  list: (filters?: { type?: string }) => [...notificationKeys.all, 'list', filters] as const,
};

export function useNotificationsList(filters?: { type?: string }) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      const response = await fetch(`/api/notifications?${params.toString()}`);
      if (response.status === 401) {
        return DEMO_NOTIFICATIONS;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      return data.notifications || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useGvtewayNotificationsData(filters?: { type?: string }) {
  const notificationsQuery = useNotificationsList(filters);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const notifications = notificationsQuery.data || [];
  const unreadCount = notifications.filter((n: GvtewayNotification) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,
    markAsRead: markReadMutation.mutateAsync,
    markAllAsRead: markAllReadMutation.mutateAsync,
  };
}
