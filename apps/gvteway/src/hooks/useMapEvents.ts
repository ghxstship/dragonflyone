'use client';

import { useQuery } from '@tanstack/react-query';

export interface MapEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  latitude: number;
  longitude: number;
  category: string;
  price_min: number;
  image?: string;
}

export interface MapCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  events: MapEvent[];
}

const DEMO_EVENTS: MapEvent[] = [
  { id: '1', title: 'Summer Festival', date: new Date(Date.now() + 30 * 86400000).toISOString(), venue: 'Central Park', city: 'New York', latitude: 40.7829, longitude: -73.9654, category: 'music', price_min: 75 },
  { id: '2', title: 'Jazz Night', date: new Date(Date.now() + 45 * 86400000).toISOString(), venue: 'Blue Note', city: 'New York', latitude: 40.7308, longitude: -74.0009, category: 'music', price_min: 50 },
];

export const mapEventsKeys = {
  all: ['map-events'] as const,
  list: (params?: { lat?: number; lng?: number; radius?: string; category?: string; dateRange?: string }) => [...mapEventsKeys.all, 'list', params] as const,
};

export function useMapEventsList(params?: { lat?: number; lng?: number; radius?: string; category?: string; dateRange?: string }) {
  return useQuery({
    queryKey: mapEventsKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.lat) searchParams.append('lat', params.lat.toString());
      if (params?.lng) searchParams.append('lng', params.lng.toString());
      if (params?.radius) searchParams.append('radius', params.radius);
      if (params?.category && params.category !== 'all') searchParams.append('category', params.category);
      if (params?.dateRange && params.dateRange !== 'all') searchParams.append('dateRange', params.dateRange);
      
      const response = await fetch(`/api/events/map?${searchParams.toString()}`);
      if (!response.ok) return { events: DEMO_EVENTS, clusters: [] };
      const data = await response.json();
      return { events: data.events || DEMO_EVENTS, clusters: data.clusters || [] };
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!params?.lat && !!params?.lng,
  });
}

export function useMapEventsData(params?: { lat?: number; lng?: number; radius?: string; category?: string; dateRange?: string }) {
  const eventsQuery = useMapEventsList(params);

  return {
    events: eventsQuery.data?.events || [],
    clusters: eventsQuery.data?.clusters || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
  };
}
