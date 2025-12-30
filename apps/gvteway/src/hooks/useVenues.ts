'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// VENUES HOOKS (3NF: legend_places + places_profile_venue)
// =============================================================================

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

// Transform 3NF data to Venue interface
function transformToVenue(place: Record<string, unknown>): Venue {
  const profile = place.places_profile_venue as Record<string, unknown> | null;
  const meta = place.metadata as Record<string, unknown> | null;
  return {
    id: place.id as string,
    name: place.name as string,
    address: place.address_line1 as string || '',
    city: place.city as string || '',
    state: place.state_province as string || '',
    zip_code: place.postal_code as string,
    capacity: (profile?.capacity as number) || 0,
    description: place.description as string,
    amenities: profile?.amenities as string[],
    contact_name: meta?.contact_name as string,
    contact_email: meta?.contact_email as string,
    contact_phone: meta?.contact_phone as string,
    status: (place.status as 'active' | 'inactive') || 'active',
    created_at: place.created_at as string,
    updated_at: place.updated_at as string,
  };
}

// Fetch all venues (3NF: legend_places + places_profile_venue)
export function useVenues(filters?: VenueFilters) {
  return useQuery({
    queryKey: ['venues', filters],
    queryFn: async () => {
      let query = supabase
        .from('legend_places')
        .select('*, places_profile_venue!place_id(*)')
        .not('places_profile_venue', 'is', null)
        .order('name', { ascending: true });

      if (filters?.city) {
        query = query.eq('city', filters.city);
      }
      if (filters?.state) {
        query = query.eq('state_province', filters.state);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let venues = (data || []).map(transformToVenue);
      if (filters?.minCapacity) {
        venues = venues.filter(v => v.capacity >= filters.minCapacity!);
      }
      return venues;
    },
  });
}

// Fetch single venue (3NF: legend_places + places_profile_venue)
export function useVenue(id: string) {
  return useQuery({
    queryKey: ['venues', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_places')
        .select('*, places_profile_venue!place_id(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return transformToVenue(data);
    },
    enabled: !!id,
  });
}

// Create venue (3NF: legend_places + places_profile_venue)
export function useCreateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venue: Omit<Venue, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: place, error: placeError } = await supabase
        .from('legend_places')
        .insert({
          name: venue.name,
          address_line1: venue.address,
          city: venue.city,
          state_province: venue.state,
          postal_code: venue.zip_code,
          description: venue.description,
          status: venue.status || 'active',
          metadata: {
            contact_name: venue.contact_name,
            contact_email: venue.contact_email,
            contact_phone: venue.contact_phone,
          },
        })
        .select()
        .single();

      if (placeError) throw placeError;

      const { error: profileError } = await supabase
        .from('places_profile_venue')
        .insert({
          place_id: place.id,
          capacity: venue.capacity,
          amenities: venue.amenities,
        });

      if (profileError) {
        await supabase.from('legend_places').delete().eq('id', place.id);
        throw profileError;
      }

      return place;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}

// Update venue (3NF: legend_places + places_profile_venue)
export function useUpdateVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Venue> & { id: string }) => {
      const placeUpdates: Record<string, unknown> = {};
      if (updates.name) placeUpdates.name = updates.name;
      if (updates.address) placeUpdates.address_line1 = updates.address;
      if (updates.city) placeUpdates.city = updates.city;
      if (updates.state) placeUpdates.state_province = updates.state;
      if (updates.zip_code) placeUpdates.postal_code = updates.zip_code;
      if (updates.description) placeUpdates.description = updates.description;
      if (updates.status) placeUpdates.status = updates.status;

      if (Object.keys(placeUpdates).length > 0) {
        await supabase.from('legend_places').update(placeUpdates).eq('id', id);
      }

      const profileUpdates: Record<string, unknown> = {};
      if (updates.capacity !== undefined) profileUpdates.capacity = updates.capacity;
      if (updates.amenities) profileUpdates.amenities = updates.amenities;

      if (Object.keys(profileUpdates).length > 0) {
        await supabase.from('places_profile_venue').update(profileUpdates).eq('place_id', id);
      }

      const { data, error } = await supabase
        .from('legend_places')
        .select('*, places_profile_venue!place_id(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}

// Delete venue (3NF: cascades via FK)
export function useDeleteVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('legend_places').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}
