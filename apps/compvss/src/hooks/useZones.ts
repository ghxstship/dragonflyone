import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ZoneCoordinate {
  x: number;
  y: number;
}

export interface VenueZone {
  id: string;
  venue_id: string;
  name: string;
  description?: string;
  zone_type: 'stage' | 'seating' | 'vip' | 'backstage' | 'service' | 'entrance' | 'exit' | 'utility' | 'custom';
  coordinates: ZoneCoordinate[];
  z_level: number;
  capacity?: number;
  color: string;
  is_accessible: boolean;
  restrictions: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateZoneInput {
  venue_id: string;
  name: string;
  description?: string;
  zone_type: VenueZone['zone_type'];
  coordinates: ZoneCoordinate[];
  z_level?: number;
  capacity?: number;
  color?: string;
  is_accessible?: boolean;
  restrictions?: string[];
}

export interface UpdateZoneInput extends Partial<Omit<CreateZoneInput, 'venue_id'>> {
  id: string;
}

async function fetchVenueZones(venueId: string): Promise<{
  zones: VenueZone[];
  total: number;
  venue_dimensions: { width: number; height: number; levels: number };
}> {
  const response = await fetch(`/api/zones/${venueId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch venue zones');
  }
  return response.json();
}

async function fetchZone(zoneId: string): Promise<VenueZone> {
  const response = await fetch(`/api/zones/detail/${zoneId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch zone');
  }
  return response.json();
}

async function createZone(input: CreateZoneInput): Promise<VenueZone> {
  const response = await fetch('/api/zones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create zone');
  }
  return response.json();
}

async function updateZone({ id, ...input }: UpdateZoneInput): Promise<VenueZone> {
  const response = await fetch(`/api/zones/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update zone');
  }
  return response.json();
}

async function deleteZone(id: string): Promise<void> {
  const response = await fetch(`/api/zones/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete zone');
  }
}

async function duplicateZone(id: string): Promise<VenueZone> {
  const response = await fetch(`/api/zones/${id}/duplicate`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to duplicate zone');
  }
  return response.json();
}

export function useVenueZones(venueId: string) {
  return useQuery({
    queryKey: ['venue-zones', venueId],
    queryFn: () => fetchVenueZones(venueId),
    enabled: !!venueId,
  });
}

export function useZone(zoneId: string) {
  return useQuery({
    queryKey: ['zone', zoneId],
    queryFn: () => fetchZone(zoneId),
    enabled: !!zoneId,
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createZone,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['venue-zones', data.venue_id] });
    },
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateZone,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['venue-zones', data.venue_id] });
      queryClient.invalidateQueries({ queryKey: ['zone', data.id] });
    },
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-zones'] });
    },
  });
}

export function useDuplicateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateZone,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['venue-zones', data.venue_id] });
    },
  });
}
