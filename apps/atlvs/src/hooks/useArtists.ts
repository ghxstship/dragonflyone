'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Artist {
  id: string;
  organization_id?: string;
  name: string;
  slug?: string;
  bio?: string;
  artist_type: 'solo' | 'band' | 'dj' | 'orchestra' | 'ensemble' | 'other';
  genres?: string[];
  hometown?: string;
  country?: string;
  website?: string;
  email?: string;
  phone?: string;
  image_url?: string;
  status: 'active' | 'inactive' | 'pending';
  verified: boolean;
  created_at: string;
  updated_at?: string;
}

interface ArtistFilters {
  organization_id?: string;
  status?: string;
  artist_type?: string;
  search?: string;
}

export function useArtists(filters?: ArtistFilters) {
  return useQuery({
    queryKey: ['artists', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.artist_type) params.append('artist_type', filters.artist_type);
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/artists?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch artists');
      }
      const data = await response.json();
      return data.artists || [];
    },
  });
}

export function useArtist(id: string) {
  return useQuery({
    queryKey: ['artists', id],
    queryFn: async () => {
      const response = await fetch(`/api/artists/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch artist');
      }
      const data = await response.json();
      return data.artist;
    },
    enabled: !!id,
  });
}

interface CreateArtistInput {
  organization_id: string;
  name: string;
  artist_type?: string;
  genres?: string[];
  bio?: string;
  hometown?: string;
  country?: string;
  website?: string;
  email?: string;
  phone?: string;
  image_url?: string;
}

export function useCreateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateArtistInput) => {
      const response = await fetch('/api/artists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create artist');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}

export function useUpdateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Artist> & { id: string }) => {
      const response = await fetch(`/api/artists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update artist');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['artists', variables.id] });
    },
  });
}

export function useDeleteArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/artists/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete artist');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}
