'use client';

import { useQuery } from '@tanstack/react-query';

export interface CompareEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  category: string;
  price_min: number;
  price_max: number;
  capacity: number;
  tickets_available: number;
  image?: string;
  description?: string;
  amenities?: string[];
  age_restriction?: string;
  parking_available?: boolean;
  accessibility?: boolean;
}

export const compareEventsKeys = {
  all: ['compare-events'] as const,
  list: (ids: string[]) => [...compareEventsKeys.all, 'list', ids] as const,
};

export function useCompareEventsList(eventIds: string[]) {
  return useQuery({
    queryKey: compareEventsKeys.list(eventIds),
    queryFn: async () => {
      if (eventIds.length === 0) return [];
      const eventPromises = eventIds.map(id =>
        fetch(`/api/events/${id}`).then(res => res.json())
      );
      const results = await Promise.all(eventPromises);
      return results.map(r => r.event).filter(Boolean) as CompareEvent[];
    },
    enabled: eventIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompareEventsData(eventIds: string[]) {
  const eventsQuery = useCompareEventsList(eventIds);

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
  };
}
