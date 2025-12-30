'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// ARTISTS HOOKS (3NF: legend_people + people_profile_artist)
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

// Transform 3NF data to Artist interface
function transformToArtist(person: Record<string, unknown>): Artist {
  const profile = person.people_profile_artist as Record<string, unknown> | null;
  const meta = person.metadata as Record<string, unknown> | null;
  return {
    id: person.id as string,
    name: `${person.first_name || ''} ${person.last_name || ''}`.trim() || (person.stage_name as string) || '',
    genre: (profile?.primary_genre as string) || '',
    type: (profile?.artist_type as Artist['type']) || 'Solo',
    manager: meta?.manager as string,
    manager_email: meta?.manager_email as string,
    manager_phone: meta?.manager_phone as string,
    agent: meta?.agent as string,
    technical_rider: (profile?.has_technical_rider as boolean) || false,
    hospitality_rider: (profile?.has_hospitality_rider as boolean) || false,
    input_list: (profile?.has_input_list as boolean) || false,
    stageplot: (profile?.has_stageplot as boolean) || false,
    upcoming_shows: (profile?.upcoming_shows as number) || 0,
    notes: person.bio as string,
    created_at: person.created_at as string,
    updated_at: person.updated_at as string,
  };
}

// Fetch all artists (3NF: legend_people + people_profile_artist)
export function useArtists(filters?: ArtistFilters) {
  return useQuery({
    queryKey: ['artists', filters],
    queryFn: async () => {
      let query = supabase
        .from('legend_people')
        .select('*, people_profile_artist!person_id(*)')
        .not('people_profile_artist', 'is', null)
        .order('first_name', { ascending: true });

      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let artists = (data || []).map(transformToArtist);
      if (filters?.type) {
        artists = artists.filter(a => a.type === filters.type);
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
      const nameParts = artist.name.split(' ');
      const { data: person, error: personError } = await supabase
        .from('legend_people')
        .insert({
          first_name: nameParts[0] || artist.name,
          last_name: nameParts.slice(1).join(' ') || '',
          bio: artist.notes,
          metadata: {
            manager: artist.manager,
            manager_email: artist.manager_email,
            manager_phone: artist.manager_phone,
            agent: artist.agent,
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
          artist_type: artist.type,
          primary_genre: artist.genre,
          has_technical_rider: artist.technical_rider,
          has_hospitality_rider: artist.hospitality_rider,
          has_input_list: artist.input_list,
          has_stageplot: artist.stageplot,
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
      if (updates.name) {
        const nameParts = updates.name.split(' ');
        personUpdates.first_name = nameParts[0];
        personUpdates.last_name = nameParts.slice(1).join(' ');
      }
      if (updates.notes) personUpdates.bio = updates.notes;

      if (Object.keys(personUpdates).length > 0) {
        await supabase.from('legend_people').update(personUpdates).eq('id', id);
      }

      const profileUpdates: Record<string, unknown> = {};
      if (updates.type) profileUpdates.artist_type = updates.type;
      if (updates.genre) profileUpdates.primary_genre = updates.genre;
      if (updates.technical_rider !== undefined) profileUpdates.has_technical_rider = updates.technical_rider;
      if (updates.hospitality_rider !== undefined) profileUpdates.has_hospitality_rider = updates.hospitality_rider;
      if (updates.input_list !== undefined) profileUpdates.has_input_list = updates.input_list;
      if (updates.stageplot !== undefined) profileUpdates.has_stageplot = updates.stageplot;

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['artists', variables.id] });
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

// Get artist statistics (3NF: legend_people + people_profile_artist)
export function useArtistStats() {
  return useQuery({
    queryKey: ['artists', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_people')
        .select('*, people_profile_artist!person_id(*)')
        .not('people_profile_artist', 'is', null);

      if (error) throw error;

      const artists = (data || []).map(transformToArtist);
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
