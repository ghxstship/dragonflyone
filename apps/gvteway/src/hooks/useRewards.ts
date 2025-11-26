'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Reward {
  id: string;
  user_id: string;
  points: number;
  tier: string;
  rewards_earned: number;
  created_at?: string;
  updated_at?: string;
}

export interface RewardTransaction {
  id: string;
  user_id: string;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  created_at?: string;
}

export const useRewards = (userId?: string) => {
  return useQuery({
    queryKey: ['rewards', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as Reward | null;
    },
    enabled: !!userId,
  });
};

export const useRewardTransactions = (userId?: string) => {
  return useQuery({
    queryKey: ['reward-transactions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('reward_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as RewardTransaction[];
    },
    enabled: !!userId,
  });
};

export const useEarnPoints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, points, description }: { userId: string; points: number; description: string }) => {
      const { data, error } = await supabase.rpc('earn_reward_points', {
        p_user_id: userId,
        p_points: points,
        p_description: description,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['reward-transactions'] });
    },
  });
};
