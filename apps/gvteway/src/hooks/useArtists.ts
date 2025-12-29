'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Schema: Aligned with API artistSchema - genres is an array
export interface Artist {
  id: string;
  name: string;
  genres?: string[];  // Schema: array of genre strings from API
  genre?: string;     // Legacy: computed first genre for display
  bio?: string;
  short_bio?: string;
  followers?: number;
  upcoming_shows?: number;
  verified: boolean;
  is_verified?: boolean;
  image_url?: string;
  profile_image?: string;
  origin_city?: string;
  origin_country?: string;
  social_links?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    spotify?: string;
    soundcloud?: string;
    youtube?: string;
    tiktok?: string;
  };
  created_at: string;
  updated_at: string;
}

interface ArtistFilters {
  genre?: string;
  verified?: boolean;
}

// Fetch all artists
export function useArtists(filters?: ArtistFilters) {
  return useQuery({
    queryKey: ['artists', filters],
    queryFn: async () => {
      let query = supabase
        .from('artists')
        .select('*')
        .order('followers', { ascending: false });

      if (filters?.genre) {
        query = query.ilike('genre', `%${filters.genre}%`);
      }
      if (filters?.verified !== undefined) {
        query = query.eq('verified', filters.verified);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Artist[];
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
      return data as Artist;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
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
