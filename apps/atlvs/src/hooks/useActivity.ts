'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Activity {
  id: string;
  user_id?: string;
  actor_id?: string;
  action_type: 'created' | 'updated' | 'deleted' | 'commented' | 'shared' | 'assigned' | 'completed' | 'approved' | 'rejected' | 'uploaded' | 'downloaded' | 'mentioned' | 'joined' | 'left';
  entity_type: string;
  entity_id: string;
  entity_name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  actor?: {
    id: string;
    full_name?: string;
    email: string;
  };
}

interface ActivityFilters {
  user_id?: string;
  entity_type?: string;
  entity_id?: string;
  action_type?: string;
  unread_only?: boolean;
}

interface ActivityResponse {
  activities: Activity[];
  summary: {
    total: number;
    unread: number;
    by_action: Record<string, number>;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function useActivity(filters?: ActivityFilters) {
  return useQuery({
    queryKey: ['activity', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.user_id) params.append('user_id', filters.user_id);
      if (filters?.entity_type) params.append('entity_type', filters.entity_type);
      if (filters?.entity_id) params.append('entity_id', filters.entity_id);
      if (filters?.action_type) params.append('action_type', filters.action_type);
      if (filters?.unread_only) params.append('unread_only', 'true');

      const response = await fetch(`/api/activity?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity feed');
      }
      return response.json() as Promise<ActivityResponse>;
    },
  });
}

export function useActivityItem(id: string) {
  return useQuery({
    queryKey: ['activity', id],
    queryFn: async () => {
      const response = await fetch(`/api/activity/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity');
      }
      const data = await response.json();
      return data.activity as Activity;
    },
    enabled: !!id,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activity: Omit<Activity, 'id' | 'created_at' | 'is_read' | 'actor'>) => {
      const response = await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity),
      });
      if (!response.ok) {
        throw new Error('Failed to create activity');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function useMarkActivityRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_read }: { id: string; is_read: boolean }) => {
      const response = await fetch(`/api/activity/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read }),
      });
      if (!response.ok) {
        throw new Error('Failed to update activity');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/activity/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete activity');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function getActivityIcon(actionType: string): string {
  const icons: Record<string, string> = {
    created: 'plus',
    updated: 'pencil',
    deleted: 'trash',
    commented: 'message-circle',
    shared: 'share',
    assigned: 'user-plus',
    completed: 'check-circle',
    approved: 'check',
    rejected: 'x',
    uploaded: 'upload',
    downloaded: 'download',
    mentioned: 'at-sign',
    joined: 'user-plus',
    left: 'user-minus',
  };
  return icons[actionType] || 'activity';
}

export function getActivityColor(actionType: string): string {
  const colors: Record<string, string> = {
    created: 'success',
    updated: 'info',
    deleted: 'error',
    commented: 'info',
    shared: 'info',
    assigned: 'warning',
    completed: 'success',
    approved: 'success',
    rejected: 'error',
    uploaded: 'info',
    downloaded: 'info',
    mentioned: 'warning',
    joined: 'success',
    left: 'ghost',
  };
  return colors[actionType] || 'ghost';
}
