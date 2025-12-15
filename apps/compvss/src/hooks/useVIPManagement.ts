'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// VIP MANAGEMENT HOOKS
// Manage VIP guests and access zones
// =============================================================================

export interface VIPGuest {
  id: string;
  name: string;
  email: string;
  passType: 'VIP' | 'Backstage' | 'All Access' | 'Press' | 'Artist';
  accessAreas: string[];
  status: 'Pending' | 'Approved' | 'Checked In' | 'Denied';
  notes?: string;
  production_id?: string;
}

export interface AccessZone {
  id: string;
  name: string;
  currentOccupancy: number;
  maxCapacity: number;
  status: 'Open' | 'Restricted' | 'Closed';
}

// Fetch VIP guests
export function useVIPGuests(productionId?: string) {
  return useQuery({
    queryKey: ['vip-guests', productionId],
    queryFn: async () => {
      let query = supabase
        .from('vip_guests')
        .select('*')
        .order('name', { ascending: true });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(g => ({
        id: g.id,
        name: g.name,
        email: g.email,
        passType: g.pass_type,
        accessAreas: g.access_areas || [],
        status: g.status,
        notes: g.notes,
        production_id: g.production_id,
      })) as VIPGuest[];
    },
  });
}

// Fetch access zones
export function useAccessZones(productionId?: string) {
  return useQuery({
    queryKey: ['access-zones', productionId],
    queryFn: async () => {
      let query = supabase
        .from('access_zones')
        .select('*')
        .order('name', { ascending: true });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(z => ({
        id: z.id,
        name: z.name,
        currentOccupancy: z.current_occupancy || 0,
        maxCapacity: z.max_capacity || 100,
        status: z.status || 'Open',
      })) as AccessZone[];
    },
  });
}

// Add VIP guest
export function useAddVIPGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guest: Omit<VIPGuest, 'id'>) => {
      const { data, error } = await supabase
        .from('vip_guests')
        .insert({
          name: guest.name,
          email: guest.email,
          pass_type: guest.passType,
          access_areas: guest.accessAreas,
          status: guest.status,
          notes: guest.notes,
          production_id: guest.production_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vip-guests'] });
    },
  });
}

// Update VIP guest status
export function useUpdateVIPGuestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: VIPGuest['status'] }) => {
      const { data, error } = await supabase
        .from('vip_guests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vip-guests'] });
    },
  });
}
