'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  image_url?: string;
  action_url?: string;
  action_text?: string;
  event_id?: string;
  event_name?: string;
  audience_type: 'all' | 'segment' | 'topic' | 'device';
  audience_segment_id?: string;
  topic?: string;
  scheduled_at?: string;
  sent_at?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  created_at: string;
  updated_at: string;
}

const DEMO_PUSH_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'PN-001',
    title: '🎉 Lineup Announced!',
    body: 'The Summer Fest 2025 lineup is here! Check out the incredible artists performing this year.',
    action_url: '/events/summer-fest-2025',
    action_text: 'View Lineup',
    event_name: 'Summer Fest 2025',
    audience_type: 'all',
    status: 'sent',
    sent_at: '2024-11-15T10:00:00Z',
    stats: { sent: 125000, delivered: 118750, opened: 47500, clicked: 19000, failed: 6250 },
    created_at: '2024-11-14T08:00:00Z',
    updated_at: '2024-11-15T10:00:00Z',
  },
  {
    id: 'PN-002',
    title: '⏰ Early Bird Ends Tonight!',
    body: 'Last chance to save 20% on tickets. Early bird pricing ends at midnight!',
    action_url: '/tickets',
    action_text: 'Get Tickets',
    event_name: 'Summer Fest 2025',
    audience_type: 'segment',
    status: 'scheduled',
    scheduled_at: '2024-12-01T18:00:00Z',
    stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 },
    created_at: '2024-11-20T14:00:00Z',
    updated_at: '2024-11-20T14:00:00Z',
  },
  {
    id: 'PN-003',
    title: '🎁 Flash Sale!',
    body: '30% off all remaining tickets for the next 2 hours only!',
    action_url: '/tickets',
    action_text: 'Shop Now',
    audience_type: 'all',
    status: 'sending',
    stats: { sent: 45000, delivered: 42750, opened: 12825, clicked: 5130, failed: 2250 },
    created_at: '2024-11-22T12:00:00Z',
    updated_at: '2024-11-22T12:30:00Z',
  },
  {
    id: 'PN-004',
    title: 'Event Tomorrow!',
    body: 'Don\'t forget - Summer Fest starts tomorrow! Gates open at 2PM.',
    action_url: '/account/tickets',
    action_text: 'View Tickets',
    event_name: 'Summer Fest 2025',
    audience_type: 'segment',
    status: 'draft',
    stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 },
    created_at: '2024-11-21T09:00:00Z',
    updated_at: '2024-11-21T09:00:00Z',
  },
];

export const pushNotificationKeys = {
  all: ['push-notifications'] as const,
  list: (filters?: Record<string, string>) => [...pushNotificationKeys.all, 'list', filters] as const,
  detail: (id: string) => [...pushNotificationKeys.all, 'detail', id] as const,
};

interface FetchNotificationsParams {
  status?: string;
  page?: number;
  limit?: number;
}

async function fetchPushNotifications(params?: FetchNotificationsParams): Promise<{ data: PushNotification[]; pagination: { total: number; page: number; limit: number } }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`/api/marketing/push-notifications?${searchParams.toString()}`);
  
  if (response.status === 401 || response.status === 404) {
    return { data: DEMO_PUSH_NOTIFICATIONS, pagination: { total: DEMO_PUSH_NOTIFICATIONS.length, page: 1, limit: 20 } };
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch push notifications');
  }
  
  return response.json();
}

interface CreatePushNotificationData {
  title: string;
  body: string;
  image_url?: string;
  action_url?: string;
  action_text?: string;
  event_id?: string;
  audience_type: PushNotification['audience_type'];
  audience_segment_id?: string;
  topic?: string;
  scheduled_at?: string;
}

async function createPushNotification(data: CreatePushNotificationData): Promise<PushNotification> {
  const response = await fetch('/api/marketing/push-notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Failed to create notification');
  }
  
  const result = await response.json();
  return result.data;
}

async function sendPushNotification(id: string): Promise<void> {
  const response = await fetch(`/api/marketing/push-notifications/${id}/send`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to send notification');
  }
}

async function deletePushNotification(id: string): Promise<void> {
  const response = await fetch(`/api/marketing/push-notifications/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }
}

export function usePushNotifications(params?: FetchNotificationsParams) {
  return useQuery({
    queryKey: pushNotificationKeys.list(params as Record<string, string>),
    queryFn: () => fetchPushNotifications(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePushNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPushNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pushNotificationKeys.all });
    },
    onError: (error) => {
      log.error('Failed to create push notification:', error);
    },
  });
}

export function useSendPushNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendPushNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pushNotificationKeys.all });
    },
    onError: (error) => {
      log.error('Failed to send push notification:', error);
    },
  });
}

export function useDeletePushNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePushNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pushNotificationKeys.all });
    },
    onError: (error) => {
      log.error('Failed to delete push notification:', error);
    },
  });
}

export function usePushNotificationsData(params?: FetchNotificationsParams) {
  const notificationsQuery = usePushNotifications(params);
  const createMutation = useCreatePushNotification();
  const sendMutation = useSendPushNotification();
  const deleteMutation = useDeletePushNotification();

  return {
    notifications: notificationsQuery.data?.data || [],
    pagination: notificationsQuery.data?.pagination,
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error,
    
    createNotification: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    
    sendNotification: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    
    deleteNotification: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    
    refetch: notificationsQuery.refetch,
  };
}
