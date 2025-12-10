'use client';

import { useQuery } from '@tanstack/react-query';

export interface TourDate {
  id: string;
  event_id: string;
  date: string;
  city: string;
  state: string;
  venue: string;
  price_min: number;
  tickets_available: number;
  status: 'on_sale' | 'presale' | 'sold_out' | 'announced';
}

export interface Tour {
  id: string;
  artist_id: string;
  artist_name: string;
  artist_image?: string;
  tour_name: string;
  dates: TourDate[];
  total_dates: number;
}

const DEMO_TOURS: Tour[] = [
  {
    id: 'tour-001',
    artist_id: 'artist-001',
    artist_name: 'The Midnight',
    tour_name: 'Endless Summer Tour',
    dates: [
      { id: 'd1', event_id: 'e1', date: '2024-07-15', city: 'Los Angeles', state: 'CA', venue: 'The Forum', price_min: 75, tickets_available: 500, status: 'on_sale' },
      { id: 'd2', event_id: 'e2', date: '2024-07-18', city: 'San Francisco', state: 'CA', venue: 'Bill Graham', price_min: 65, tickets_available: 300, status: 'on_sale' },
    ],
    total_dates: 2,
  },
];

export const toursKeys = {
  all: ['tours'] as const,
  list: (filters?: { artist?: string; city?: string }) => [...toursKeys.all, 'list', filters] as const,
};

export function useToursList(filters?: { artist?: string; city?: string }) {
  return useQuery({
    queryKey: toursKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.artist) params.append('artist', filters.artist);
      if (filters?.city) params.append('city', filters.city);
      const response = await fetch(`/api/tours?${params.toString()}`);
      if (!response.ok) return DEMO_TOURS;
      const data = await response.json();
      return data.tours || DEMO_TOURS;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useToursData(filters?: { artist?: string; city?: string }) {
  const toursQuery = useToursList(filters);

  // Extract unique cities from tours
  const availableCities = toursQuery.data?.reduce((cities: string[], tour: Tour) => {
    tour.dates.forEach(date => {
      const city = `${date.city}, ${date.state}`;
      if (!cities.includes(city)) cities.push(city);
    });
    return cities;
  }, []).sort() || [];

  return {
    tours: toursQuery.data || [],
    availableCities,
    isLoading: toursQuery.isLoading,
    error: toursQuery.error,
    refetch: toursQuery.refetch,
  };
}
