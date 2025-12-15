'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// ARTISTS HOOKS
// Manage artists and performers for productions
// Event-level roles: Production Manager, Artist Liaison, Tour Manager
// =============================================================================

export interface Artist {
  id: string;
  name: string;
  genre: string;
  type: 'Solo' | 'Band' | 'DJ' | 'Orchestra' | 'Speaker';
  manager?: string;
  manager_email?: string;
  manager_phone?: string;
  agent?: string;
  technical_rider: boolean;
  hospitality_rider: boolean;
  input_list: boolean;
  stageplot: boolean;
  upcoming_shows: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ArtistFilters {
  type?: string;
  search?: string;
}

// Fetch all artists
export function useArtists(filters?: ArtistFilters) {
  return useQuery({
    queryKey: ['artists', filters],
    queryFn: async () => {
      let query = supabase
        .from('artists')
        .select('*')
        .order('name', { ascending: true });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Artist[];
    },
  });
}

// Fetch single artist
export function useArtist(id: string) {
  return useQuery({
    queryKey: ['artists', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Artist;
    },
    enabled: !!id,
  });
}

// Create artist
export function useCreateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artist: Omit<Artist, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('artists')
        .insert(artist)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}

// Update artist
export function useUpdateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Artist> & { id: string }) => {
      const { data, error } = await supabase
        .from('artists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['artists', variables.id] });
    },
  });
}

// Delete artist
export function useDeleteArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('artists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}

// Get artist statistics
export function useArtistStats() {
  return useQuery({
    queryKey: ['artists', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artists')
        .select('type, technical_rider, upcoming_shows');

      if (error) throw error;

      const artists = data || [];
      return {
        total: artists.length,
        withRiders: artists.filter(a => a.technical_rider).length,
        upcomingTotal: artists.reduce((sum, a) => sum + (a.upcoming_shows || 0), 0),
        activeThisMonth: artists.filter(a => (a.upcoming_shows || 0) > 0).length,
        byType: {
          solo: artists.filter(a => a.type === 'Solo').length,
          band: artists.filter(a => a.type === 'Band').length,
          dj: artists.filter(a => a.type === 'DJ').length,
          orchestra: artists.filter(a => a.type === 'Orchestra').length,
          speaker: artists.filter(a => a.type === 'Speaker').length,
        },
      };
    },
  });
}
