'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// ARTISTS HOOKS (3NF: legend_people + people_profile_artist)
// =============================================================================

export interface Artist {
  id: string;
  name: string;
  genres?: string[];
  genre?: string;
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

// Transform 3NF data to Artist interface
function transformToArtist(person: Record<string, unknown>): Artist {
  const profile = person.people_profile_artist as Record<string, unknown> | null;
  const meta = person.metadata as Record<string, unknown> | null;
  return {
    id: person.id as string,
    name: (person.stage_name as string) || `${person.first_name || ''} ${person.last_name || ''}`.trim(),
    genres: profile?.genres as string[],
    genre: (profile?.primary_genre as string) || '',
    bio: person.bio as string,
    short_bio: (person.bio as string)?.substring(0, 150),
    followers: (profile?.follower_count as number) || 0,
    upcoming_shows: (profile?.upcoming_shows as number) || 0,
    verified: (profile?.is_verified as boolean) || false,
    is_verified: (profile?.is_verified as boolean) || false,
    image_url: person.avatar_url as string,
    profile_image: person.avatar_url as string,
    origin_city: meta?.origin_city as string,
    origin_country: meta?.origin_country as string,
    social_links: meta?.social_links as Artist['social_links'],
    created_at: person.created_at as string,
    updated_at: person.updated_at as string,
  };
}

// Fetch all artists (3NF: legend_people + people_profile_artist)
export function useArtists(filters?: ArtistFilters) {
  return useQuery({
    queryKey: ['artists', filters],
    queryFn: async () => {
      const query = supabase
        .from('legend_people')
        .select('*, people_profile_artist!person_id(*)')
        .not('people_profile_artist', 'is', null)
        .order('first_name', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;
      
      let artists = (data || []).map(transformToArtist);
      if (filters?.genre) {
        artists = artists.filter(a => a.genre?.toLowerCase().includes(filters.genre!.toLowerCase()));
      }
      if (filters?.verified !== undefined) {
        artists = artists.filter(a => a.verified === filters.verified);
      }
      return artists;
    },
  });
}

// Fetch single artist (3NF: legend_people + people_profile_artist)
export function useArtist(id: string) {
  return useQuery({
    queryKey: ['artists', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_people')
        .select('*, people_profile_artist!person_id(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return transformToArtist(data);
    },
    enabled: !!id,
  });
}

// Create artist (3NF: legend_people + people_profile_artist)
export function useCreateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (artist: Omit<Artist, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: person, error: personError } = await supabase
        .from('legend_people')
        .insert({
          first_name: artist.name,
          stage_name: artist.name,
          bio: artist.bio,
          avatar_url: artist.image_url,
          metadata: {
            origin_city: artist.origin_city,
            origin_country: artist.origin_country,
            social_links: artist.social_links,
          },
          status: 'active',
        })
        .select()
        .single();

      if (personError) throw personError;

      const { error: profileError } = await supabase
        .from('people_profile_artist')
        .insert({
          person_id: person.id,
          primary_genre: artist.genre,
          genres: artist.genres,
          follower_count: artist.followers,
          is_verified: artist.verified,
        });

      if (profileError) {
        await supabase.from('legend_people').delete().eq('id', person.id);
        throw profileError;
      }

      return person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}

// Update artist (3NF: legend_people + people_profile_artist)
export function useUpdateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Artist> & { id: string }) => {
      const personUpdates: Record<string, unknown> = {};
      if (updates.name) personUpdates.stage_name = updates.name;
      if (updates.bio) personUpdates.bio = updates.bio;
      if (updates.image_url) personUpdates.avatar_url = updates.image_url;

      if (Object.keys(personUpdates).length > 0) {
        await supabase.from('legend_people').update(personUpdates).eq('id', id);
      }

      const profileUpdates: Record<string, unknown> = {};
      if (updates.genre) profileUpdates.primary_genre = updates.genre;
      if (updates.genres) profileUpdates.genres = updates.genres;
      if (updates.followers !== undefined) profileUpdates.follower_count = updates.followers;
      if (updates.verified !== undefined) profileUpdates.is_verified = updates.verified;

      if (Object.keys(profileUpdates).length > 0) {
        await supabase.from('people_profile_artist').update(profileUpdates).eq('person_id', id);
      }

      const { data, error } = await supabase
        .from('legend_people')
        .select('*, people_profile_artist!person_id(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}

// Delete artist (3NF: cascades via FK)
export function useDeleteArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('legend_people').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}
