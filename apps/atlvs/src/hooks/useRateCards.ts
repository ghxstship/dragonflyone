'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface RateCardItem {
  id: string;
  description: string;
  unit: string;
  daily_rate: number;
  weekly_rate?: number;
  monthly_rate?: number;
}

export interface RateCard {
  id: string;
  vendor_id: string;
  vendor_name?: string;
  category: string;
  effective_date: string;
  expiration_date: string;
  status: 'active' | 'pending' | 'expired';
  notes?: string;
  items: RateCardItem[];
  created_at: string;
  updated_at: string;
}

interface RateCardFilters {
  vendor_id?: string;
  category?: string;
  status?: string;
}

export function useRateCards(filters?: RateCardFilters) {
  return useQuery({
    queryKey: ['rate-cards', filters],
    queryFn: async () => {
      let query = supabase
        .from('vendor_rate_cards')
        .select(`
          *,
          vendors(name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.vendor_id) {
        query = query.eq('vendor_id', filters.vendor_id);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((rc: Record<string, unknown>) => ({
        ...rc,
        vendor_name: (rc.vendors as { name: string } | null)?.name || 'Unknown Vendor',
        items: rc.items || [],
      })) as RateCard[];
    },
  });
}

export function useRateCard(id: string) {
  return useQuery({
    queryKey: ['rate-cards', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_rate_cards')
        .select(`
          *,
          vendors(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        ...data,
        vendor_name: data.vendors?.name || 'Unknown Vendor',
        items: data.items || [],
      } as RateCard;
    },
    enabled: !!id,
  });
}

export function useCreateRateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rateCard: Omit<RateCard, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('vendor_rate_cards')
        .insert(rateCard)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-cards'] });
    },
  });
}

export function useUpdateRateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RateCard> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendor_rate_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-cards'] });
    },
  });
}

export function useDeleteRateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendor_rate_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-cards'] });
    },
  });
}
