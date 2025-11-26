'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Asset {
  id: string;
  name: string;
  category: string;
  value: number;
  purchase_date: string;
  status: 'active' | 'maintenance' | 'retired' | 'sold';
  location?: string;
  assigned_to?: string;
  depreciation_rate?: number;
  current_value?: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const useAssets = (filters?: { status?: string; category?: string }) => {
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: async () => {
      let query = supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Asset[];
    },
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('assets')
        .insert(asset)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Asset> & { id: string }) => {
      const { data, error } = await supabase
        .from('assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
};
