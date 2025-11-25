'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  capacity: number;
  description?: string;
  amenities?: string[];
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface VenueFilters {
  city?: string;
  state?: string;
  status?: string;
  minCapacity?: number;
}

// Fetch all venues
export function useVenues(filters?: VenueFilters) {
  return useQuery({
    queryKey: ['venues', filters],
    queryFn: async () => {
      let query = supabase
        .from('venues')
        .select('*')
        .order('name', { ascending: true });

      if (filters?.city) {
        query = query.eq('city', filters.city);
      }
      if (filters?.state) {
        query = query.eq('state', filters.state);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.minCapacity) {
        query = query.gte('capacity', filters.minCapacity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Venue[];
    },
  });
}

// Fetch single venue
export function useVenue(id: string) {
  return useQuery({
    queryKey: ['venues', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Venue;
    },
    enabled: !!id,
  });
}

// Create venue
export function useCreateVenue() {
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
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}

// Update venue
export function useUpdateVenue() {
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
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}

// Delete venue
export function useDeleteVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('venues').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}
