'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  capacity: number;
  type: string;
  status: 'active' | 'inactive';
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export const useVenues = (filters?: { status?: string; city?: string }) => {
  return useQuery({
    queryKey: ['compvss-venues', filters],
    queryFn: async () => {
      let query = supabase
        .from('legend_places')
        .select('*, places_profile_venue!place_id(*)')
        .not('places_profile_venue', 'is', null)
        .order('name');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.city) {
        query = query.eq('city', filters.city);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown) as Venue[];
    },
  });
};

export const useCreateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venue: Omit<Venue, 'id' | 'created_at' | 'updated_at'>) => {
      // 3NF: legend_places + places_profile_venue
      const { data, error } = await supabase
        .from('legend_places')
        .insert({
          name: venue.name,
          place_type: 'venue',
          status: venue.status || 'active',
          metadata: venue,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compvss-venues'] });
    },
  });
};

export const useUpdateVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Venue> & { id: string }) => {
      // 3NF: legend_places + places_profile_venue
      const { error: updateError } = await supabase
        .from('legend_places')
        .update(updates)
        .eq('id', id);
      if (updateError) throw updateError;

      const { data, error } = await supabase
        .from('legend_places')
        .select('*, places_profile_venue!place_id(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compvss-venues'] });
    },
  });
};

export const useDeleteVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // 3NF: Delete from legend_places (cascades to profile)
      const { error } = await supabase
        .from('legend_places')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compvss-venues'] });
    },
  });
};
