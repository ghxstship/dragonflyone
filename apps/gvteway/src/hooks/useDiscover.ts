'use client';

import { useQuery } from '@tanstack/react-query';

export interface DiscoverEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  price: number;
  image?: string;
  trending?: boolean;
  recommended?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  events: DiscoverEvent[];
}

const DEMO_EVENTS: DiscoverEvent[] = [
  { id: '1', title: 'Summer Festival 2024', date: '2025-07-15', venue: 'Central Park', category: 'festival', price: 99, trending: true },
  { id: '2', title: 'Jazz Night', date: '2025-03-20', venue: 'Blue Note', category: 'concert', price: 45, recommended: true },
];

const DEMO_COLLECTIONS: Collection[] = [
  { id: 'c1', name: 'Weekend Picks', description: 'Best events this weekend', events: DEMO_EVENTS },
];

export const discoverKeys = {
  all: ['discover'] as const,
  trending: () => [...discoverKeys.all, 'trending'] as const,
  recommended: () => [...discoverKeys.all, 'recommended'] as const,
  collections: () => [...discoverKeys.all, 'collections'] as const,
  nearby: () => [...discoverKeys.all, 'nearby'] as const,
};

export function useDiscoverData() {
  const trendingQuery = useQuery({
    queryKey: discoverKeys.trending(),
    queryFn: async () => {
      const response = await fetch('/api/events?trending=true&limit=6');
      if (!response.ok) return DEMO_EVENTS;
      const data = await response.json();
      return data.events || DEMO_EVENTS;
    },
    staleTime: 5 * 60 * 1000,
  });

  const recommendedQuery = useQuery({
    queryKey: discoverKeys.recommended(),
    queryFn: async () => {
      const response = await fetch('/api/events?recommended=true&limit=6');
      if (!response.ok) return DEMO_EVENTS;
      const data = await response.json();
      return data.events || DEMO_EVENTS;
    },
    staleTime: 5 * 60 * 1000,
  });

  const collectionsQuery = useQuery({
    queryKey: discoverKeys.collections(),
    queryFn: async () => {
      const response = await fetch('/api/collections');
      if (!response.ok) return DEMO_COLLECTIONS;
      const data = await response.json();
      return data.collections || DEMO_COLLECTIONS;
    },
    staleTime: 5 * 60 * 1000,
  });

  const nearbyQuery = useQuery({
    queryKey: discoverKeys.nearby(),
    queryFn: async () => {
      const response = await fetch('/api/events?nearby=true&limit=6');
      if (!response.ok) return DEMO_EVENTS;
      const data = await response.json();
      return data.events || DEMO_EVENTS;
    },
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = trendingQuery.isLoading || recommendedQuery.isLoading || collectionsQuery.isLoading || nearbyQuery.isLoading;

  return {
    trendingEvents: trendingQuery.data || [],
    recommendedEvents: recommendedQuery.data || [],
    collections: collectionsQuery.data || [],
    nearbyEvents: nearbyQuery.data || [],
    isLoading,
    error: trendingQuery.error || recommendedQuery.error || collectionsQuery.error || nearbyQuery.error,
  };
}
