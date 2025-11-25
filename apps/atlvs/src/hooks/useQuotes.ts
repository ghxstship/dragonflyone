import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface OKR {
  id: string;
  title: string;
  type: 'objective' | 'key_result';
  parent_id?: string;
  owner: string;
  quarter: string;
  progress: number;
  status: 'not_started' | 'on_track' | 'at_risk' | 'behind' | 'completed';
  description?: string;
  target_value?: number;
  current_value?: number;
  due_date?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const useOKRs = (filters?: { quarter?: string; owner?: string; type?: string }) => {
  return useQuery({
    queryKey: ['okrs', filters],
    queryFn: async () => {
      let query = supabase
        .from('okrs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.quarter) {
        query = query.eq('quarter', filters.quarter);
      }
      if (filters?.owner) {
        query = query.eq('owner', filters.owner);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as OKR[];
    },
  });
};

export const useCreateOKR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (okr: Omit<OKR, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('okrs')
        .insert(okr)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
    },
  });
};

export const useUpdateOKR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OKR> & { id: string }) => {
      const { data, error } = await supabase
        .from('okrs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
    },
  });
};

export const useDeleteOKR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('okrs')
        .delete()
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
    },
  });
};
