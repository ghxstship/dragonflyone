'use client';

import { useQuery } from '@tanstack/react-query';

export interface EventDetails {
  id: string;
  title: string;
  date: string;
  venue: string;
  description?: string;
  imageUrl?: string;
}

const DEMO_EVENT: EventDetails = {
  id: 'demo-event',
  title: 'Summer Music Festival 2024',
  date: '2024-12-15T19:00:00Z',
  venue: 'Madison Square Garden',
  description: 'An incredible night of live music',
};

export const eventDetailsKeys = {
  all: ['event-details'] as const,
  detail: (eventId: string) => [...eventDetailsKeys.all, eventId] as const,
};

export function useEventDetails(eventId: string) {
  return useQuery({
    queryKey: eventDetailsKeys.detail(eventId),
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

export function useEventDetailsData(eventId: string) {
  const eventQuery = useEventDetails(eventId);

  return {
    event: eventQuery.data || null,
    isLoading: eventQuery.isLoading,
    error: eventQuery.error,
    refetch: eventQuery.refetch,
  };
}
