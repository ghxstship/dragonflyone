'use client';

import { useQuery } from '@tanstack/react-query';

export interface Destination {
  id: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  description: string;
  image_url?: string;
  venue_count: number;
  upcoming_events: number;
  featured_events: string[];
  popular_genres: string[];
  average_ticket_price: number;
  is_trending: boolean;
}

export interface DestinationSummary {
  total_destinations: number;
  trending_count: number;
  total_events: number;
  featured_count: number;
}

const DEMO_DESTINATIONS: Destination[] = [
  { id: 'demo-1', name: 'New York City', city: 'New York', state: 'NY', country: 'USA', description: 'The city that never sleeps', venue_count: 245, upcoming_events: 1234, featured_events: ['MSG Concert'], popular_genres: ['Rock', 'Hip-Hop'], average_ticket_price: 125, is_trending: true },
  { id: 'demo-2', name: 'Los Angeles', city: 'Los Angeles', state: 'CA', country: 'USA', description: 'Entertainment capital', venue_count: 189, upcoming_events: 987, featured_events: ['Hollywood Bowl'], popular_genres: ['Pop', 'Electronic'], average_ticket_price: 110, is_trending: true },
];

const DEMO_SUMMARY: DestinationSummary = {
  total_destinations: 85,
  trending_count: 12,
  total_events: 4500,
  featured_count: 24,
};

export const destinationsKeys = {
  all: ['destinations'] as const,
  list: (search?: string) => [...destinationsKeys.all, 'list', search] as const,
  summary: () => [...destinationsKeys.all, 'summary'] as const,
};

export function useDestinationsList(search?: string) {
  return useQuery({
    queryKey: destinationsKeys.list(search),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const response = await fetch(`/api/destinations?${params.toString()}`);
      if (response.status === 401) return DEMO_DESTINATIONS;
      if (!response.ok) return DEMO_DESTINATIONS;
      const data = await response.json();
      return data.destinations || DEMO_DESTINATIONS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDestinationsSummary() {
  return useQuery({
    queryKey: destinationsKeys.summary(),
    queryFn: async () => {
      const response = await fetch('/api/destinations/summary');
      if (response.status === 401) return DEMO_SUMMARY;
      if (!response.ok) return DEMO_SUMMARY;
      const data = await response.json();
      return data.summary || DEMO_SUMMARY;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDestinationsData(search?: string) {
  const destinationsQuery = useDestinationsList(search);
  const summaryQuery = useDestinationsSummary();

  return {
    destinations: destinationsQuery.data || [],
    summary: summaryQuery.data || DEMO_SUMMARY,
    isLoading: destinationsQuery.isLoading || summaryQuery.isLoading,
    error: destinationsQuery.error || summaryQuery.error,
    refetch: () => {
      destinationsQuery.refetch();
      summaryQuery.refetch();
    },
  };
}
