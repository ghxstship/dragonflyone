import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface MerchItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes?: string[];
  colors?: string[];
  stock: number;
  images: string[];
  event_id?: string;
  status: 'active' | 'inactive' | 'sold_out';
  created_at?: string;
  updated_at?: string;
}

export const useMerch = (filters?: { category?: string; eventId?: string }) => {
  return useQuery({
    queryKey: ['merch', filters],
    queryFn: async () => {
      let query = supabase
        .from('merch_items')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.eventId) {
        query = query.eq('event_id', filters.eventId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MerchItem[];
    },
  });
};

export const useCreateMerchItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<MerchItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('merch_items')
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merch'] });
    },
  });
};

export const useUpdateMerchItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MerchItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('merch_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merch'] });
    },
  });
};

export const useDeleteMerchItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('merch_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merch'] });
    },
  });
};
