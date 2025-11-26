'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface RFP {
  id: string;
  title: string;
  description: string;
  issuer: string;
  deadline: string;
  budget_range?: string;
  status: 'draft' | 'published' | 'submitted' | 'awarded' | 'closed';
  category?: string;
  requirements?: string[];
  attachments?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const useRFPs = (filters?: { status?: string; category?: string }) => {
  return useQuery({
    queryKey: ['rfps', filters],
    queryFn: async () => {
      let query = supabase
        .from('rfps' as any)
        .select('*')
        .order('deadline', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as RFP[];
    },
  });
};

export const useCreateRFP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rfp: Omit<RFP, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('rfps')
        .insert(rfp)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
  });
};

export const useUpdateRFP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RFP> & { id: string }) => {
      const { data, error } = await supabase
        .from('rfps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
  });
};

export const useDeleteRFP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('rfps')
        .delete()
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
  });
};
