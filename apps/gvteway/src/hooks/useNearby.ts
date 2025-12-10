'use client';

import { useQuery } from '@tanstack/react-query';

export interface NearbyEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  distance: number;
  category: string;
  price: number;
  image?: string;
}

const DEMO_EVENTS: NearbyEvent[] = [
  { id: '1', title: 'Summer Concert', date: new Date(Date.now() + 86400000).toISOString(), venue: 'Central Park', city: 'New York', distance: 2.5, category: 'music', price: 75 },
  { id: '2', title: 'Jazz Night', date: new Date(Date.now() + 172800000).toISOString(), venue: 'Blue Note', city: 'New York', distance: 3.2, category: 'music', price: 45 },
];

export const nearbyKeys = {
  all: ['nearby'] as const,
  events: (params: { lat?: number; lng?: number; radius?: string; category?: string }) => [...nearbyKeys.all, 'events', params] as const,
};

export function useNearbyEvents(params: { lat?: number; lng?: number; radius?: string; category?: string }) {
  return useQuery({
    queryKey: nearbyKeys.events(params),
    queryFn: async () => {
      if (!params.lat || !params.lng) {
        return DEMO_EVENTS;
      }
      const searchParams = new URLSearchParams({
        lat: String(params.lat),
        lng: String(params.lng),
        radius: params.radius || '25',
      });
      if (params.category && params.category !== 'all') {
        searchParams.append('category', params.category);
      }
      const response = await fetch(`/api/events/nearby?${searchParams.toString()}`);
      if (!response.ok) {
        return DEMO_EVENTS;
      }
      const data = await response.json();
      return data.events || DEMO_EVENTS;
    },
    enabled: !!params.lat && !!params.lng,
    staleTime: 5 * 60 * 1000,
  });
}

export function useNearbyData(params: { lat?: number; lng?: number; radius?: string; category?: string }) {
  const eventsQuery = useNearbyEvents(params);

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
  };
}
