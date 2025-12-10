'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

// Types
export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
}

export interface ParkingLot {
  id: string;
  name: string;
  type: 'garage' | 'lot' | 'street' | 'valet';
  distance: string;
  price: string;
  spaces_available: number;
  total_spaces: number;
  address: string;
  lat: number;
  lng: number;
  amenities: string[];
}

export interface TransportOption {
  id: string;
  type: 'rideshare' | 'transit' | 'shuttle' | 'bike';
  name: string;
  description: string;
  estimated_time: string;
  estimated_cost?: string;
  pickup_location?: string;
}

export interface DirectionsStep {
  instruction: string;
  distance: string;
  duration: string;
}

// Demo data
const DEMO_VENUE: Venue = {
  id: '1',
  name: 'The Wiltern',
  address: '3790 Wilshire Blvd',
  city: 'Los Angeles',
  state: 'CA',
  zip: '90010',
  lat: 34.0619,
  lng: -118.3087,
};

const DEMO_PARKING: ParkingLot[] = [
  {
    id: '1',
    name: 'Wilshire Garage',
    type: 'garage',
    distance: '0.1 mi',
    price: '$15',
    spaces_available: 45,
    total_spaces: 200,
    address: '3800 Wilshire Blvd',
    lat: 34.0621,
    lng: -118.3090,
    amenities: ['Covered', 'EV Charging'],
  },
];

const DEMO_TRANSPORT: TransportOption[] = [
  {
    id: '1',
    type: 'rideshare',
    name: 'Uber/Lyft',
    description: 'Rideshare pickup at main entrance',
    estimated_time: '5-10 min',
    estimated_cost: '$15-25',
    pickup_location: 'Main Entrance',
  },
  {
    id: '2',
    type: 'transit',
    name: 'Metro Purple Line',
    description: 'Wilshire/Western Station',
    estimated_time: '3 min walk',
  },
];

// Query keys
export const directionsKeys = {
  all: ['directions'] as const,
  venue: (eventId?: string, venueId?: string) => [...directionsKeys.all, 'venue', eventId, venueId] as const,
  parking: (eventId?: string, venueId?: string) => [...directionsKeys.all, 'parking', eventId, venueId] as const,
  transport: (eventId?: string, venueId?: string) => [...directionsKeys.all, 'transport', eventId, venueId] as const,
};

// Fetch functions
async function fetchVenue(eventId?: string, venueId?: string): Promise<Venue | null> {
  const params = new URLSearchParams();
  if (eventId) params.set('event_id', eventId);
  if (venueId) params.set('venue_id', venueId);

  const response = await fetch(`/api/directions/venue?${params}`);
  if (response.status === 401) {
    return DEMO_VENUE;
  }
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data.venue;
}

async function fetchParking(eventId?: string, venueId?: string): Promise<ParkingLot[]> {
  const params = new URLSearchParams();
  if (eventId) params.set('event_id', eventId);
  if (venueId) params.set('venue_id', venueId);

  const response = await fetch(`/api/directions/parking?${params}`);
  if (response.status === 401) {
    return DEMO_PARKING;
  }
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.parking || [];
}

async function fetchTransport(eventId?: string, venueId?: string): Promise<TransportOption[]> {
  const params = new URLSearchParams();
  if (eventId) params.set('event_id', eventId);
  if (venueId) params.set('venue_id', venueId);

  const response = await fetch(`/api/directions/transport?${params}`);
  if (response.status === 401) {
    return DEMO_TRANSPORT;
  }
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.options || [];
}

// Mutation functions
interface GetRouteParams {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  mode: 'driving' | 'walking' | 'transit';
}

async function getRoute(params: GetRouteParams): Promise<DirectionsStep[]> {
  const response = await fetch('/api/directions/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error('Failed to get directions');
  }
  const data = await response.json();
  return data.steps || [];
}

// Hooks
export function useVenue(eventId?: string, venueId?: string) {
  return useQuery({
    queryKey: directionsKeys.venue(eventId, venueId),
    queryFn: () => fetchVenue(eventId, venueId),
    staleTime: 10 * 60 * 1000,
    enabled: !!(eventId || venueId),
  });
}

export function useParking(eventId?: string, venueId?: string) {
  return useQuery({
    queryKey: directionsKeys.parking(eventId, venueId),
    queryFn: () => fetchParking(eventId, venueId),
    staleTime: 2 * 60 * 1000, // Shorter stale time for parking availability
    enabled: !!(eventId || venueId),
  });
}

export function useTransport(eventId?: string, venueId?: string) {
  return useQuery({
    queryKey: directionsKeys.transport(eventId, venueId),
    queryFn: () => fetchTransport(eventId, venueId),
    staleTime: 10 * 60 * 1000,
    enabled: !!(eventId || venueId),
  });
}

export function useGetRoute() {
  return useMutation({
    mutationFn: getRoute,
    onError: (error) => {
      log.error('Failed to get route:', error);
    },
  });
}

// Combined hook
export function useDirectionsData(eventId?: string, venueId?: string) {
  const venueQuery = useVenue(eventId, venueId);
  const parkingQuery = useParking(eventId, venueId);
  const transportQuery = useTransport(eventId, venueId);
  const getRouteMutation = useGetRoute();

  return {
    // Data
    venue: venueQuery.data || null,
    parkingLots: parkingQuery.data || [],
    transportOptions: transportQuery.data || [],

    // Loading states
    isLoading: venueQuery.isLoading || parkingQuery.isLoading || transportQuery.isLoading,

    // Error states
    error: venueQuery.error || parkingQuery.error || transportQuery.error,

    // Mutations
    getRoute: getRouteMutation.mutateAsync,
    isGettingRoute: getRouteMutation.isPending,

    // Refetch
    refetch: () => {
      venueQuery.refetch();
      parkingQuery.refetch();
      transportQuery.refetch();
    },
  };
}
