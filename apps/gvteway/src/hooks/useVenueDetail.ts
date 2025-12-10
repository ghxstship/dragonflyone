'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  capacity: number;
  image?: string;
  amenities?: string[];
  accessibility_info?: string;
  parking_info?: string;
  public_transit?: string;
}

export interface VenueEvent {
  id: string;
  title: string;
  date: string;
  image?: string;
  price?: number;
}

const DEMO_VENUE: Venue = {
  id: 'demo-1',
  name: 'Madison Square Garden',
  description: 'World-famous arena in the heart of New York City',
  address: '4 Pennsylvania Plaza',
  city: 'New York',
  state: 'NY',
  capacity: 20000,
  amenities: ['Accessible Seating', 'Food & Beverage', 'VIP Lounges'],
  parking_info: 'Multiple parking garages nearby',
  public_transit: 'Penn Station directly below venue',
};

const DEMO_EVENTS: VenueEvent[] = [
  { id: 'e1', title: 'Summer Concert', date: new Date(Date.now() + 7 * 86400000).toISOString(), price: 85 },
  { id: 'e2', title: 'Comedy Night', date: new Date(Date.now() + 14 * 86400000).toISOString(), price: 55 },
];

export const venueDetailKeys = {
  all: ['venue-detail'] as const,
  detail: (venueId: string) => [...venueDetailKeys.all, venueId] as const,
  events: (venueId: string) => [...venueDetailKeys.all, venueId, 'events'] as const,
  followStatus: (venueId: string) => [...venueDetailKeys.all, venueId, 'follow'] as const,
};

export function useVenueDetail(venueId: string) {
  return useQuery({
    queryKey: venueDetailKeys.detail(venueId),
    queryFn: async () => {
      const response = await fetch(`/api/venues/${venueId}`);
      if (!response.ok) return DEMO_VENUE;
      const data = await response.json();
      return data.venue || DEMO_VENUE;
    },
    enabled: !!venueId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useVenueEvents(venueId: string) {
  return useQuery({
    queryKey: venueDetailKeys.events(venueId),
    queryFn: async () => {
      const response = await fetch(`/api/venues/${venueId}/events`);
      if (!response.ok) return DEMO_EVENTS;
      const data = await response.json();
      return data.events || DEMO_EVENTS;
    },
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVenueFollowStatus(venueId: string) {
  return useQuery({
    queryKey: venueDetailKeys.followStatus(venueId),
    queryFn: async () => {
      const response = await fetch(`/api/venues/${venueId}/follow/status`);
      if (!response.ok) return { following: false };
      return response.json();
    },
    enabled: !!venueId,
    staleTime: 60 * 1000,
  });
}

export function useToggleVenueFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ venueId, follow }: { venueId: string; follow: boolean }) => {
      const response = await fetch(`/api/venues/${venueId}/follow`, {
        method: follow ? 'POST' : 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to update follow status');
      return response.json();
    },
    onSuccess: (_, { venueId }) => {
      queryClient.invalidateQueries({ queryKey: venueDetailKeys.followStatus(venueId) });
    },
  });
}

export function useVenueDetailData(venueId: string) {
  const venueQuery = useVenueDetail(venueId);
  const eventsQuery = useVenueEvents(venueId);
  const followQuery = useVenueFollowStatus(venueId);
  const toggleFollowMutation = useToggleVenueFollow();

  return {
    venue: venueQuery.data || null,
    events: eventsQuery.data || [],
    isFollowing: followQuery.data?.following || false,
    isLoading: venueQuery.isLoading || eventsQuery.isLoading,
    error: venueQuery.error || eventsQuery.error,
    toggleFollow: (follow: boolean) => toggleFollowMutation.mutateAsync({ venueId, follow }),
    isToggling: toggleFollowMutation.isPending,
  };
}
