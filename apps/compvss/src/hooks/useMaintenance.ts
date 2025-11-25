'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface MaintenanceRecord {
  id: string;
  equipment_id?: string;
  equipment_name?: string;
  type: 'scheduled' | 'repair' | 'inspection' | 'preventive';
  description?: string;
  last_service?: string;
  next_due?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'scheduled' | 'completed' | 'cancelled';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface MaintenanceFilters {
  status?: string;
  priority?: string;
  equipment_id?: string;
}

// Fetch all maintenance records
export function useMaintenance(filters?: MaintenanceFilters) {
  return useQuery({
    queryKey: ['maintenance', filters],
    queryFn: async () => {
      let query = supabase
        .from('maintenance_records')
        .select('*')
        .order('next_due', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.equipment_id) {
        query = query.eq('equipment_id', filters.equipment_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MaintenanceRecord[];
    },
  });
}

// Fetch single maintenance record
export function useMaintenanceRecord(id: string) {
  return useQuery({
    queryKey: ['maintenance', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as MaintenanceRecord;
    },
    enabled: !!id,
  });
}

// Create maintenance record
export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('maintenance_records')
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
}

// Update maintenance record
export function useUpdateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MaintenanceRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('maintenance_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
}

// Delete maintenance record
export function useDeleteMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('maintenance_records').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });
}
