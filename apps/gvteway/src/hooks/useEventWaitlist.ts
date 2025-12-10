'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface WaitlistEntry {
  id: string;
  email: string;
  name: string;
  ticket_type: string;
  quantity: number;
  position: number;
  status: 'waiting' | 'notified' | 'converted' | 'expired';
  created_at: string;
  notified_at?: string;
}

export interface WaitlistEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  status: string;
}

const DEMO_EVENT: WaitlistEvent = {
  id: 'demo-1',
  title: 'Summer Festival 2024',
  date: new Date(Date.now() + 7 * 86400000).toISOString(),
  venue: 'Central Park',
  status: 'sold_out',
};

const DEMO_WAITLIST: WaitlistEntry[] = [
  { id: 'w1', email: 'user@example.com', name: 'John Doe', ticket_type: 'GA', quantity: 2, position: 1, status: 'waiting', created_at: new Date().toISOString() },
];

export const waitlistKeys = {
  all: ['waitlist'] as const,
  event: (eventId: string) => [...waitlistKeys.all, 'event', eventId] as const,
  list: (eventId: string) => [...waitlistKeys.all, 'list', eventId] as const,
};

export function useWaitlistEvent(eventId: string) {
  return useQuery({
    queryKey: waitlistKeys.event(eventId),
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) return DEMO_EVENT;
      const data = await response.json();
      return data.event || DEMO_EVENT;
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useWaitlistEntries(eventId: string) {
  return useQuery({
    queryKey: waitlistKeys.list(eventId),
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/waitlist`);
      if (!response.ok) return DEMO_WAITLIST;
      const data = await response.json();
      return data.waitlist || DEMO_WAITLIST;
    },
    enabled: !!eventId,
    staleTime: 60 * 1000,
  });
}

export function useJoinWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: { email: string; name: string; ticket_type: string; quantity: number } }) => {
      const response = await fetch(`/api/events/${eventId}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join waitlist');
      }
      return response.json();
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: waitlistKeys.list(eventId) });
    },
  });
}

export function useEventWaitlistData(eventId: string) {
  const eventQuery = useWaitlistEvent(eventId);
  const waitlistQuery = useWaitlistEntries(eventId);
  const joinMutation = useJoinWaitlist();

  return {
    event: eventQuery.data || null,
    waitlist: waitlistQuery.data || [],
    isLoading: eventQuery.isLoading || waitlistQuery.isLoading,
    error: eventQuery.error || waitlistQuery.error,
    joinWaitlist: (data: { email: string; name: string; ticket_type: string; quantity: number }) => 
      joinMutation.mutateAsync({ eventId, data }),
    isJoining: joinMutation.isPending,
  };
}
