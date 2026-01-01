'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Interface matching the asset_maintenance_events 3NF table schema exactly
export interface MaintenanceRecord {
  id: string;
  asset_id: string;
  event_type: string;
  event_date: string;
  description: string | null;
  next_scheduled: string | null;
  cost: number | null;
  performed_by: string | null;
  vendor_id: string | null;
  attachments: string[] | null;
  created_at: string;
}

interface MaintenanceFilters {
  asset_id?: string;
  event_type?: string;
}

// Fetch all maintenance records
export function useMaintenance(filters?: MaintenanceFilters) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['maintenance', filters],
    queryFn: async () => {
      let q = supabase
        .from('asset_maintenance_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (filters?.asset_id) {
        q = q.eq('asset_id', filters.asset_id);
      }

      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as MaintenanceRecord[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: {
      asset_id: string;
      event_type: string;
      event_date: string;
      description?: string;
      performed_by?: string;
      cost?: number;
      next_scheduled?: string;
      vendor_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('asset_maintenance_events')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as MaintenanceRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MaintenanceRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('asset_maintenance_events')
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

  const deleteMutation = useMutation({
    mutationFn: async (ids: string | string[]) => {
      const idsArray = Array.isArray(ids) ? ids : [ids];
      const { error } = await supabase
        .from('asset_maintenance_events')
        .delete()
        .in('id', idsArray);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
  });

  return {
    records: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createRecord: createMutation.mutate,
    createRecordAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateRecord: updateMutation.mutate,
    updateRecordAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteRecords: deleteMutation.mutate,
    deleteRecordsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

// Fetch single maintenance record
export function useMaintenanceRecord(id: string) {
  return useQuery({
    queryKey: ['maintenance', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_maintenance_events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return (data as unknown) as MaintenanceRecord;
    },
    enabled: !!id,
  });
}
