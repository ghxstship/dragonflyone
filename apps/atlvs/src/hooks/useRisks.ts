'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'financial' | 'operational' | 'strategic' | 'compliance' | 'reputational';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  impact: number;
  status: 'identified' | 'analyzing' | 'mitigating' | 'resolved' | 'accepted';
  mitigation_plan?: string;
  owner_id?: string;
  owner?: {
    name: string;
  };
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export function useRisks(filters?: {
  category?: string;
  severity?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['risks', filters],
    queryFn: async () => {
      let query = supabase
        .from('risks')
        .select(`
          *,
          owner:users(name)
        `)
        .order('severity', { ascending: false })
        .order('probability', { ascending: false });

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters?.severity && filters.severity !== 'all') {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as Risk[];
    },
  });
}

export function useRisk(id: string) {
  return useQuery({
    queryKey: ['risks', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risks')
        .select(`
          *,
          owner:users(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Risk;
    },
    enabled: !!id,
  });
}

export function useCreateRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (risk: Omit<Risk, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('risks')
        .insert([risk])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
    },
  });
}

export function useUpdateRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Risk> & { id: string }) => {
      const { data, error } = await supabase
        .from('risks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
      queryClient.invalidateQueries({ queryKey: ['risks', data.id] });
    },
  });
}

export function useDeleteRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('risks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risks'] });
    },
  });
}
