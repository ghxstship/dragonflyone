'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// VENUES & ZONES HOOKS
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

// Fetch venues
export function useVenues(filters?: VenueFilters) {
  return useQuery({
    queryKey: ['venues', filters],
    queryFn: async () => {
      let query = supabase
        .from('venues')
        .select('*')
        .order('name', { ascending: true });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.venueType) {
        query = query.eq('venue_type', filters.venueType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Venue[];
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
      return data as unknown as Venue;
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
        .from('venue_zones')
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
        .from('venue_zones')
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues', variables.id] });
    },
  });
}

// Delete venue
export function useDeleteVenue() {
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
        .from('venue_zones')
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
        .from('venue_zones')
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
        .from('venue_zones')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue_zones'] });
    },
  });
}

// Get venue statistics
export function useVenueStats(productionId?: string) {
  return useQuery({
    queryKey: ['venues', 'stats', productionId],
    queryFn: async () => {
      let query = supabase.from('venues').select('status, capacity, rental_cost');
      
      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const venues = data || [];
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
      let query = supabase.from('venue_zones').select('zone_type, capacity, is_active');
      
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
