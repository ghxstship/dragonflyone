'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface WaitlistEntry {
  id: string;
  user_id: string;
  event_id: string;
  email: string;
  phone?: string;
  position: number;
  status: 'waiting' | 'notified' | 'converted' | 'expired';
  created_at: string;
  notified_at?: string;
}

export interface WaitlistStats {
  total: number;
  waiting: number;
  notified: number;
  converted: number;
}

export function useWaitlist(eventId?: string) {
  return useQuery({
    queryKey: ['waitlist', eventId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (eventId) params.append('event_id', eventId);
      
      const response = await fetch(`/api/waitlist?${params}`);
      if (!response.ok) throw new Error('Failed to fetch waitlist');
      return response.json();
    },
    enabled: !!eventId,
  });
}

export function useJoinWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { event_id: string; email: string; phone?: string; user_id?: string }) => {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to join waitlist');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['waitlist', variables.event_id] });
    },
  });
}

export function useLeaveWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ entryId }: { entryId: string; eventId: string }) => {
      const response = await fetch(`/api/waitlist?id=${entryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to leave waitlist');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['waitlist', variables.eventId] });
    },
  });
}

export function useWaitlistPosition(eventId?: string, userId?: string) {
  return useQuery({
    queryKey: ['waitlist-position', eventId, userId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (eventId) params.append('event_id', eventId);
      if (userId) params.append('user_id', userId);
      
      const response = await fetch(`/api/waitlist?${params}`);
      if (!response.ok) throw new Error('Failed to fetch waitlist position');
      const data = await response.json();
      return data.entries?.[0] || null;
    },
    enabled: !!eventId && !!userId,
  });
}
