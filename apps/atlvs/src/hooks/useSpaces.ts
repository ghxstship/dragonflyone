'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Space {
  id: string;
  organization_id: string;
  venue_id: string;
  name: string;
  description?: string;
  capacity: number;
  photos?: string[];
  amenities?: string[];
  base_price?: number;
  base_pricing?: {
    daily?: number;
    hourly?: number;
    half_day?: number;
  };
  is_active: boolean;
  is_combinable?: boolean;
  combine_with?: string[];
  created_at: string;
  updated_at: string;
  venue?: { id: string; name: string };
}

interface SpacesResponse {
  spaces: Space[];
  count: number;
}

export function useSpaces(venueId?: string) {
  return useQuery({
    queryKey: ['spaces', venueId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (venueId) params.set('venue_id', venueId);

      const response = await fetch(`/api/venue-spaces?${params}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch spaces' }));
        throw new Error(error.error || 'Failed to fetch spaces');
      }
      return response.json() as Promise<SpacesResponse>;
    },
  });
}

export function useSpace(spaceId: string) {
  return useQuery({
    queryKey: ['space', spaceId],
    queryFn: async () => {
      const response = await fetch(`/api/venue-spaces/${spaceId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch space');
      }
      return response.json();
    },
    enabled: !!spaceId,
  });
}

interface CreateSpaceInput {
  venue_id: string;
  name: string;
  description?: string;
  capacity: number;
  photos?: string[];
  amenities?: string[];
  base_price?: number;
  is_active?: boolean;
}

export function useCreateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSpaceInput) => {
      const response = await fetch('/api/venue-spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create space');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}

export function useUpdateSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ spaceId, ...input }: Partial<CreateSpaceInput> & { spaceId: string }) => {
      const response = await fetch(`/api/venue-spaces/${spaceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update space');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      queryClient.invalidateQueries({ queryKey: ['space', variables.spaceId] });
    },
  });
}

export function useDeleteSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spaceId: string) => {
      const response = await fetch(`/api/venue-spaces/${spaceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete space');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}

export function useSpaceCapacityConfigs(spaceId: string) {
  return useQuery({
    queryKey: ['space-capacity-configs', spaceId],
    queryFn: async () => {
      const response = await fetch(`/api/spaces/${spaceId}/capacity-configs`);
      if (!response.ok) {
        throw new Error('Failed to fetch capacity configs');
      }
      return response.json();
    },
    enabled: !!spaceId,
  });
}

export function useSpacePricingRules(spaceId: string) {
  return useQuery({
    queryKey: ['space-pricing-rules', spaceId],
    queryFn: async () => {
      const response = await fetch(`/api/spaces/${spaceId}/pricing-rules`);
      if (!response.ok) {
        throw new Error('Failed to fetch pricing rules');
      }
      return response.json();
    },
    enabled: !!spaceId,
  });
}

export function useSpaceRecommendations(params: {
  guest_count: number;
  date?: string;
  venue_id?: string;
  event_type?: string;
}) {
  return useQuery({
    queryKey: ['space-recommendations', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('guest_count', String(params.guest_count));
      if (params.date) searchParams.set('date', params.date);
      if (params.venue_id) searchParams.set('venue_id', params.venue_id);
      if (params.event_type) searchParams.set('event_type', params.event_type);

      const response = await fetch(`/api/spaces/recommend?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      return response.json();
    },
    enabled: params.guest_count > 0,
  });
}
