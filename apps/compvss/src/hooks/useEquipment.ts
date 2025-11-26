'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Equipment {
  id: string;
  name: string;
  type: 'camera' | 'lighting' | 'audio' | 'grip' | 'electric' | 'other';
  serial_number?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  purchase_date?: string;
  purchase_price?: number;
  last_maintenance?: string;
  next_maintenance?: string;
  location?: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
}

export function useEquipment(filters?: {
  type?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['equipment', filters],
    queryFn: async () => {
      let query = supabase
        .from('equipment')
        .select('*')
        .order('name', { ascending: true });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data as unknown) as Equipment[];
    },
  });
}

export function useEquipmentItem(id: string) {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return (data as unknown) as Equipment;
    },
    enabled: !!id,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (equipment: Omit<Equipment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('equipment')
        .insert([equipment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Equipment> & { id: string }) => {
      const { data, error } = await supabase
        .from('equipment')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', data.id] });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}
