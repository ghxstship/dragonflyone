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
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const useVenues = (filters?: { status?: string; city?: string }) => {
  return useQuery({
    queryKey: ['compvss-venues', filters],
    queryFn: async () => {
      let query = supabase
        .from('venues')
        .select('*')
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
      const { data, error } = await supabase
        .from('venues')
        .insert(venue)
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
      const { data, error } = await supabase
        .from('venues')
        .update(updates)
        .eq('id', id)
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

export const useDeleteVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compvss-venues'] });
    },
  });
};
