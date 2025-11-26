'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Shipment {
  id: string;
  equipment_id?: string;
  equipment_name?: string;
  origin: string;
  destination: string;
  status: 'scheduled' | 'loading' | 'in-transit' | 'delivered' | 'cancelled';
  eta?: string;
  driver_name?: string;
  truck_id?: string;
  created_at: string;
  updated_at: string;
}

interface LogisticsFilters {
  status?: string;
  driver_name?: string;
}

// Fetch all shipments
export function useShipments(filters?: LogisticsFilters) {
  return useQuery({
    queryKey: ['shipments', filters],
    queryFn: async () => {
      let query = supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.driver_name) {
        query = query.ilike('driver_name', `%${filters.driver_name}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown) as Shipment[];
    },
  });
}

// Fetch single shipment
export function useShipment(id: string) {
  return useQuery({
    queryKey: ['shipments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return (data as unknown) as Shipment;
    },
    enabled: !!id,
  });
}

// Create shipment
export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shipment: Omit<Shipment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('shipments')
        .insert(shipment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

// Update shipment
export function useUpdateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Shipment> & { id: string }) => {
      const { data, error } = await supabase
        .from('shipments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}

// Delete shipment
export function useDeleteShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shipments').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
}
