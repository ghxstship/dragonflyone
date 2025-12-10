'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UpcomingEvent {
  id: string;
  event_id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  image?: string;
  ticket_count: number;
  ticket_type: string;
  order_id: string;
  reminder_enabled: boolean;
  reminder_time: string;
  days_until: number;
}

const DEMO_EVENTS: UpcomingEvent[] = [
  { id: '1', event_id: 'e1', title: 'Summer Festival 2024', date: '2025-07-15', time: '7:00 PM', venue: 'Central Park', city: 'New York', ticket_count: 2, ticket_type: 'VIP', order_id: 'ord-001', reminder_enabled: true, reminder_time: '24h', days_until: 5 },
  { id: '2', event_id: 'e2', title: 'Jazz Night', date: '2025-03-20', time: '8:00 PM', venue: 'Blue Note', city: 'New York', ticket_count: 1, ticket_type: 'General', order_id: 'ord-002', reminder_enabled: false, reminder_time: '', days_until: 15 },
];

export const myEventsKeys = {
  all: ['my-events'] as const,
  list: () => [...myEventsKeys.all, 'list'] as const,
};

export function useMyEventsList() {
  return useQuery({
    queryKey: myEventsKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/user/events');
      if (response.status === 401) {
        return { upcoming: DEMO_EVENTS, past: [] };
      }
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      return {
        upcoming: data.upcoming || [],
        past: data.past || [],
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, enabled, time }: { eventId: string; enabled: boolean; time: string }) => {
      const response = await fetch(`/api/user/events/${eventId}/reminder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, time }),
      });
      if (!response.ok) {
        throw new Error('Failed to update reminder');
      }
      return { eventId, enabled, time };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myEventsKeys.all });
    },
  });
}

export function useMyEventsData() {
  const eventsQuery = useMyEventsList();
  const updateReminderMutation = useUpdateReminder();

  const data = eventsQuery.data || { upcoming: [], past: [] };

  return {
    events: data.upcoming,
    pastEvents: data.past,
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
    updateReminder: updateReminderMutation.mutateAsync,
  };
}
