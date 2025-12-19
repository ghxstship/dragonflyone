'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type SpaceType = 'room' | 'outdoor' | 'hall' | 'tent' | 'rooftop' | 'patio' | 'other';
export type RentalRateType = 'flat' | 'hourly' | 'per_person';

export interface SpaceCapacityConfig {
  id: string;
  space_id: string;
  setup_type: string;
  capacity: number;
  diagram_url?: string;
  description?: string;
  is_default: boolean;
}

export interface SpacePricingRule {
  id: string;
  space_id: string;
  name: string;
  rule_type: string;
  conditions: Record<string, unknown>;
  adjustment_type: string;
  adjustment_value: number;
  priority: number;
  active: boolean;
}

export interface SpaceRestrictions {
  noise_curfew?: string;
  max_capacity?: number;
  no_open_flame?: boolean;
  no_red_wine?: boolean;
  no_glitter?: boolean;
  other?: string[];
}

export interface VenueSpace {
  id: string;
  venue_id: string;
  organization_id: string;
  name: string;
  description?: string;
  space_type: SpaceType;
  photos: string[];
  floor_number?: number;
  square_footage?: number;
  ceiling_height?: number;
  amenities: string[];
  restrictions: SpaceRestrictions;
  base_rental_rate?: number;
  rental_rate_type: RentalRateType;
  minimum_spend?: number;
  setup_time_minutes: number;
  breakdown_time_minutes: number;
  is_combinable: boolean;
  combine_with: string[];
  active: boolean;
  sort_order: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  venue?: {
    id: string;
    name: string;
  };
  capacity_configs?: SpaceCapacityConfig[];
  pricing_rules?: SpacePricingRule[];
}

export interface CreateVenueSpaceInput {
  venue_id: string;
  organization_id: string;
  name: string;
  description?: string;
  space_type?: SpaceType;
  photos?: string[];
  floor_number?: number;
  square_footage?: number;
  ceiling_height?: number;
  amenities?: string[];
  restrictions?: SpaceRestrictions;
  base_rental_rate?: number;
  rental_rate_type?: RentalRateType;
  minimum_spend?: number;
  setup_time_minutes?: number;
  breakdown_time_minutes?: number;
  is_combinable?: boolean;
  combine_with?: string[];
  active?: boolean;
}

export interface UpdateVenueSpaceInput {
  name?: string;
  description?: string;
  space_type?: SpaceType;
  photos?: string[];
  floor_number?: number;
  square_footage?: number;
  ceiling_height?: number;
  amenities?: string[];
  restrictions?: SpaceRestrictions;
  base_rental_rate?: number;
  rental_rate_type?: RentalRateType;
  minimum_spend?: number;
  setup_time_minutes?: number;
  breakdown_time_minutes?: number;
  is_combinable?: boolean;
  combine_with?: string[];
  active?: boolean;
  sort_order?: number;
}

const fetchVenueSpaces = async (
  organizationId?: string,
  venueId?: string,
  activeOnly?: boolean
): Promise<VenueSpace[]> => {
  const params = new URLSearchParams();
  if (organizationId) params.set('organization_id', organizationId);
  if (venueId) params.set('venue_id', venueId);
  if (activeOnly) params.set('active', 'true');

  const response = await fetch(`/api/venue-spaces?${params}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch venue spaces');
  }
  const data = await response.json();
  return data.spaces;
};

const fetchVenueSpace = async (id: string): Promise<VenueSpace> => {
  const response = await fetch(`/api/venue-spaces/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch venue space');
  }
  const data = await response.json();
  return data.space;
};

const createVenueSpace = async (input: CreateVenueSpaceInput): Promise<VenueSpace> => {
  const response = await fetch('/api/venue-spaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create venue space');
  }
  const data = await response.json();
  return data.space;
};

const updateVenueSpace = async ({ id, ...input }: UpdateVenueSpaceInput & { id: string }): Promise<VenueSpace> => {
  const response = await fetch(`/api/venue-spaces/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update venue space');
  }
  const data = await response.json();
  return data.space;
};

const deleteVenueSpace = async (id: string): Promise<void> => {
  const response = await fetch(`/api/venue-spaces/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete venue space');
  }
};

export function useVenueSpaces(organizationId?: string, venueId?: string, activeOnly?: boolean) {
  return useQuery({
    queryKey: ['venue-spaces', organizationId, venueId, activeOnly],
    queryFn: () => fetchVenueSpaces(organizationId, venueId, activeOnly),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVenueSpace(id: string) {
  return useQuery({
    queryKey: ['venue-space', id],
    queryFn: () => fetchVenueSpace(id),
    enabled: !!id,
  });
}

export function useCreateVenueSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVenueSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-spaces'] });
    },
  });
}

export function useUpdateVenueSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVenueSpace,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['venue-spaces'] });
      queryClient.setQueryData(['venue-space', data.id], data);
    },
  });
}

export function useDeleteVenueSpace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVenueSpace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-spaces'] });
    },
  });
}
