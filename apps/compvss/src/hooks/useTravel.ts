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

const DEMO_BOOKINGS: TravelBooking[] = [
  { id: '1', booking_reference: 'TRV-001', crew_member_id: 'c1', crew_member_name: 'John Smith', project_id: 'p1', project_name: 'Summer Festival', travel_type: 'flight', departure_date: '2025-02-15', return_date: '2025-02-20', origin: 'LAX', destination: 'JFK', carrier: 'Delta', flight_number: 'DL123', cost: 450, status: 'confirmed' },
  { id: '2', booking_reference: 'TRV-002', crew_member_id: 'c2', crew_member_name: 'Jane Doe', project_id: 'p1', project_name: 'Summer Festival', travel_type: 'flight', departure_date: '2025-02-15', origin: 'SFO', destination: 'JFK', carrier: 'United', cost: 380, status: 'pending' },
];

export const travelKeys = {
  all: ['travel'] as const,
  list: () => [...travelKeys.all, 'list'] as const,
};

export function useTravelBookings() {
  return useQuery({
    queryKey: travelKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/travel');
      if (response.status === 401) {
        return DEMO_BOOKINGS;
      }
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
