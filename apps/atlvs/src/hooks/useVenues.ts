'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// VENUES & ZONES HOOKS (3NF: legend_places + places_profile_venue)
// Manage venues, zones, and spatial configurations for productions
// Event-level roles: Production Manager, Venue Manager, Operations Director
// =============================================================================

export interface Venue {
  id: string;
  production_id: string;
  name: string;
  venue_type: 'indoor' | 'outdoor' | 'hybrid';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  capacity?: number;
  square_footage?: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  rental_cost?: number;
  deposit_amount?: number;
  status: 'prospective' | 'confirmed' | 'contracted' | 'active' | 'completed';
  contract_start?: string;
  contract_end?: string;
  load_in_date?: string;
  load_out_date?: string;
  notes?: string;
  amenities?: string[];
  restrictions?: string[];
  created_at: string;
  updated_at: string;
}

// Transform 3NF data to Venue interface
function transformToVenue(place: Record<string, unknown>): Venue {
  const profile = place.places_profile_venue as Record<string, unknown> | null;
  const meta = place.metadata as Record<string, unknown> | null;
  return {
    id: place.id as string,
    production_id: meta?.production_id as string || '',
    name: place.name as string,
    venue_type: (profile?.venue_type as Venue['venue_type']) || 'indoor',
    address: place.address_line1 as string,
    city: place.city as string,
    state: place.state_province as string,
    country: place.country as string,
    postal_code: place.postal_code as string,
    capacity: profile?.capacity as number,
    square_footage: profile?.square_footage as number,
    contact_name: meta?.contact_name as string,
    contact_email: meta?.contact_email as string,
    contact_phone: meta?.contact_phone as string,
    rental_cost: profile?.rental_cost as number,
    deposit_amount: profile?.deposit_amount as number,
    status: (place.status as Venue['status']) || 'prospective',
    contract_start: profile?.contract_start as string,
    contract_end: profile?.contract_end as string,
    load_in_date: profile?.load_in_date as string,
    load_out_date: profile?.load_out_date as string,
    notes: place.description as string,
    amenities: profile?.amenities as string[],
    restrictions: profile?.restrictions as string[],
    created_at: place.created_at as string,
    updated_at: place.updated_at as string,
  };
}

export interface VenueZone {
  id: string;
  venue_id: string;
  name: string;
  zone_type: 'stage' | 'audience' | 'backstage' | 'vip' | 'vendor' | 'parking' | 'loading' | 'storage' | 'other';
  capacity?: number;
  square_footage?: number;
  access_level: 'public' | 'restricted' | 'staff_only' | 'vip_only';
  description?: string;
  coordinates?: { x: number; y: number; width: number; height: number };
  parent_zone_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  venue?: Venue;
  parent_zone?: VenueZone;
}

interface VenueFilters {
  productionId?: string;
  status?: string;
  venueType?: string;
}

interface ZoneFilters {
  venueId?: string;
  zoneType?: string;
  accessLevel?: string;
}

// Fetch venues (3NF: legend_places + places_profile_venue)
export function useVenues(filters?: VenueFilters) {
  return useQuery({
    queryKey: ['venues', filters],
    queryFn: async () => {
      let query = supabase
        .from('legend_places')
        .select('*, places_profile_venue!place_id(*)')
        .not('places_profile_venue', 'is', null)
        .order('name', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status === 'active' ? 'active' : 'inactive');
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let venues = (data || []).map(transformToVenue);
      if (filters?.productionId) {
        venues = venues.filter(v => v.production_id === filters.productionId);
      }
      if (filters?.venueType) {
        venues = venues.filter(v => v.venue_type === filters.venueType);
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

// Fetch zones
export function useVenueZones(filters?: ZoneFilters) {
  return useQuery({
    queryKey: ['venue_zones', filters],
    queryFn: async () => {
      let query = supabase
        .from('legend_places')
        .select(`
          *,
          venue:venues(id, name),
          parent_zone:venue_zones!parent_zone_id(id, name)
        `)
        .order('name', { ascending: true });

      if (filters?.venueId) {
        query = query.eq('venue_id', filters.venueId);
      }
      if (filters?.zoneType) {
        query = query.eq('zone_type', filters.zoneType);
      }
      if (filters?.accessLevel) {
        query = query.eq('access_level', filters.accessLevel);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as VenueZone[];
    },
  });
}

// Fetch single zone
export function useVenueZone(id: string) {
  return useQuery({
    queryKey: ['venue_zones', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_places')
        .select(`
          *,
          venue:venues(*),
          parent_zone:venue_zones!parent_zone_id(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as VenueZone;
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
          country: venue.country,
          postal_code: venue.postal_code,
          description: venue.notes,
          status: 'active',
          metadata: {
            production_id: venue.production_id,
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
          venue_type: venue.venue_type,
          capacity: venue.capacity,
          square_footage: venue.square_footage,
          rental_cost: venue.rental_cost,
          deposit_amount: venue.deposit_amount,
          amenities: venue.amenities,
          restrictions: venue.restrictions,
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
      if (updates.country) placeUpdates.country = updates.country;
      if (updates.postal_code) placeUpdates.postal_code = updates.postal_code;
      if (updates.notes) placeUpdates.description = updates.notes;

      if (Object.keys(placeUpdates).length > 0) {
        await supabase.from('legend_places').update(placeUpdates).eq('id', id);
      }

      const profileUpdates: Record<string, unknown> = {};
      if (updates.venue_type) profileUpdates.venue_type = updates.venue_type;
      if (updates.capacity !== undefined) profileUpdates.capacity = updates.capacity;
      if (updates.square_footage !== undefined) profileUpdates.square_footage = updates.square_footage;
      if (updates.rental_cost !== undefined) profileUpdates.rental_cost = updates.rental_cost;
      if (updates.deposit_amount !== undefined) profileUpdates.deposit_amount = updates.deposit_amount;
      if (updates.amenities) profileUpdates.amenities = updates.amenities;
      if (updates.restrictions) profileUpdates.restrictions = updates.restrictions;

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues', variables.id] });
    },
  });
}

// Delete venue (3NF: cascades via FK)
export function useDeleteVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('legend_places')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
}

// Create zone
export function useCreateVenueZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (zone: Omit<VenueZone, 'id' | 'created_at' | 'updated_at' | 'venue' | 'parent_zone'>) => {
      const { data, error } = await supabase
        .from('legend_places')
        .insert(zone)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue_zones'] });
    },
  });
}

// Update zone
export function useUpdateVenueZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VenueZone> & { id: string }) => {
      const { data, error } = await supabase
        .from('legend_places')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venue_zones'] });
      queryClient.invalidateQueries({ queryKey: ['venue_zones', variables.id] });
    },
  });
}

// Delete zone
export function useDeleteVenueZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('legend_places')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue_zones'] });
    },
  });
}

// Get venue statistics (3NF: legend_places + places_profile_venue)
export function useVenueStats(productionId?: string) {
  return useQuery({
    queryKey: ['venues', 'stats', productionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_places')
        .select('status, metadata, places_profile_venue!place_id(capacity, rental_cost)')
        .not('places_profile_venue', 'is', null);

      if (error) throw error;

      let venues = (data || []).map(transformToVenue);
      if (productionId) {
        venues = venues.filter(v => v.production_id === productionId);
      }

      return {
        total: venues.length,
        confirmed: venues.filter(v => v.status === 'confirmed' || v.status === 'contracted' || v.status === 'active').length,
        prospective: venues.filter(v => v.status === 'prospective').length,
        totalCapacity: venues.reduce((sum, v) => sum + (v.capacity || 0), 0),
        totalRentalCost: venues.reduce((sum, v) => sum + (v.rental_cost || 0), 0),
      };
    },
  });
}

// Get zone statistics for a venue
export function useZoneStats(venueId?: string) {
  return useQuery({
    queryKey: ['venue_zones', 'stats', venueId],
    queryFn: async () => {
      let query = supabase.from('legend_places').select('zone_type, capacity, is_active');
      
      if (venueId) {
        query = query.eq('venue_id', venueId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const zones = data || [];
      return {
        total: zones.length,
        active: zones.filter(z => z.is_active).length,
        totalCapacity: zones.reduce((sum, z) => sum + (z.capacity || 0), 0),
        byType: {
          stage: zones.filter(z => z.zone_type === 'stage').length,
          audience: zones.filter(z => z.zone_type === 'audience').length,
          backstage: zones.filter(z => z.zone_type === 'backstage').length,
          vip: zones.filter(z => z.zone_type === 'vip').length,
          vendor: zones.filter(z => z.zone_type === 'vendor').length,
        },
      };
    },
  });
}
