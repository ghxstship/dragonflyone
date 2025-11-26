'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Membership {
  id: string;
  user_id: string;
  tier: 'free' | 'bronze' | 'silver' | 'gold' | 'platinum';
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date?: string;
  benefits: string[];
  points: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const useMembership = (userId?: string) => {
  return useQuery({
    queryKey: ['membership', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as Membership | null;
    },
    enabled: !!userId,
  });
};

export const useUpgradeMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, tier }: { userId: string; tier: string }) => {
      const { data, error } = await supabase
        .from('memberships')
        .upsert({
          user_id: userId,
          tier,
          status: 'active',
          start_date: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership'] });
    },
  });
};

export const useCancelMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from('memberships')
        .update({
          status: 'cancelled',
          end_date: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership'] });
    },
  });
};
