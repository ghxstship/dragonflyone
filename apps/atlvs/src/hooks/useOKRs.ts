'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface OKR {
  id: string;
  organization_id: string;
  parent_id?: string;
  okr_type: string;
  title: string;
  description?: string;
  owner_id?: string;
  owner?: string;
  period_start?: string;
  period_end?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  progress_percentage?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useOKRs(filters?: {
  okr_type?: string;
  status?: string;
  owner_id?: string;
}) {
  return useQuery({
    queryKey: ['okrs', filters],
    queryFn: async () => {
      let query = supabase
        .from('kpi_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.okr_type && filters.okr_type !== 'all') {
        query = query.eq('okr_type', filters.okr_type);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.owner_id) {
        query = query.eq('owner_id', filters.owner_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as OKR[];
    },
  });
}

export function useOKR(id: string) {
  return useQuery({
    queryKey: ['okrs', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kpi_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as OKR;
    },
    enabled: !!id,
  });
}

export function useCreateOKR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (okr: {
      organization_id: string;
      okr_type: string;
      title: string;
      description?: string;
      owner_id?: string;
      period_start?: string;
      period_end?: string;
      target_value?: number;
      current_value?: number;
      unit?: string;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from('kpi_reports')
        .insert([okr])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
    },
  });
}

export function useUpdateOKR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OKR> & { id: string }) => {
      const { data, error } = await supabase
        .from('kpi_reports')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
      queryClient.invalidateQueries({ queryKey: ['okrs', data.id] });
    },
  });
}

export function useDeleteOKR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('kpi_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
    },
  });
}
