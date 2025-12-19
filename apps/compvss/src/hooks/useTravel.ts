'use client';

import { useQuery } from '@tanstack/react-query';

export interface TravelBooking {
  id: string;
  booking_reference: string;
  crew_member_id: string;
  crew_member_name: string;
  project_id: string;
  project_name: string;
  travel_type: string;
  departure_date: string;
  return_date?: string;
  origin: string;
  destination: string;
  carrier?: string;
  flight_number?: string;
  hotel_name?: string;
  confirmation_number?: string;
  cost: number;
  status: string;
  notes?: string;
  [key: string]: unknown;
}

export const travelKeys = {
  all: ['travel'] as const,
  list: () => [...travelKeys.all, 'list'] as const,
};

export function useTravelBookings() {
  return useQuery({
    queryKey: travelKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/travel');
      if (!response.ok) {
        throw new Error('Failed to fetch travel data');
      }
      const data = await response.json();
      return data.bookings || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTravelData() {
  const bookingsQuery = useTravelBookings();

  const bookings = bookingsQuery.data || [];
  const totalCost = bookings.reduce((sum: number, b: TravelBooking) => sum + (b.cost || 0), 0);
  const confirmedCount = bookings.filter((b: TravelBooking) => b.status === 'confirmed').length;
  const pendingCount = bookings.filter((b: TravelBooking) => b.status === 'pending').length;

  return {
    bookings,
    totalCost,
    confirmedCount,
    pendingCount,
    isLoading: bookingsQuery.isLoading,
    error: bookingsQuery.error,
    refetch: bookingsQuery.refetch,
  };
}
