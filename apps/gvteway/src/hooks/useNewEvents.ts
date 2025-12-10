'use client';

import { useQuery } from '@tanstack/react-query';

export interface NewEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  price: number;
  image?: string;
  announced_at: string;
  on_sale_date?: string;
  presale_date?: string;
}

const DEMO_EVENTS: NewEvent[] = [
  { id: '1', title: 'Summer Festival 2024', date: new Date(Date.now() + 30 * 86400000).toISOString(), venue: 'Central Park', category: 'music', price: 149, announced_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', title: 'Jazz Night', date: new Date(Date.now() + 45 * 86400000).toISOString(), venue: 'Blue Note', category: 'music', price: 75, announced_at: new Date(Date.now() - 86400000).toISOString() },
];

export const newEventsKeys = {
  all: ['new-events'] as const,
  list: (params: { timeframe?: string; category?: string }) => [...newEventsKeys.all, 'list', params] as const,
};

export function useNewEventsList(params: { timeframe?: string; category?: string }) {
  return useQuery({
    queryKey: newEventsKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams({ new: 'true' });
      if (params.timeframe) searchParams.append('timeframe', params.timeframe);
      if (params.category && params.category !== 'all') searchParams.append('category', params.category);
      
      const response = await fetch(`/api/events?${searchParams.toString()}`);
      if (!response.ok) return DEMO_EVENTS;
      const data = await response.json();
      return data.events || DEMO_EVENTS;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useNewEventsData(params: { timeframe?: string; category?: string }) {
  const eventsQuery = useNewEventsList(params);

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
  };
}
