'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Location {
  id: string;
  organization_id: string;
  name: string;
  address?: string;
  type: 'warehouse' | 'venue' | 'popup' | 'virtual' | 'storage' | 'office';
  is_active: boolean;
  capacity?: number;
  notes?: string;
  created_at: string;
}

interface LocationFilters {
  organization_id?: string;
  type?: string;
  is_active?: boolean;
}

export function useLocations(filters?: LocationFilters) {
  return useQuery({
    queryKey: ['locations', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));

      const response = await fetch(`/api/locations?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      const data = await response.json();
      return data.locations as Location[];
    },
  });
}

export function useLocation(id: string) {
  return useQuery({
    queryKey: ['locations', id],
    queryFn: async () => {
      const response = await fetch(`/api/locations/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch location');
      }
      const data = await response.json();
      return data.location as Location;
    },
    enabled: !!id,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: Omit<Location, 'id' | 'created_at'>) => {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location),
      });
      if (!response.ok) {
        throw new Error('Failed to create location');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Location> & { id: string }) => {
      const response = await fetch(`/api/locations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update location');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['locations', variables.id] });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/locations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete location');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}
