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
        .from('loyalty_transactions')
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

// =============================================================================
// REWARDS PAGE HOOKS (API-based with demo fallback)
// =============================================================================

export interface UserRewards {
  user_id: string;
  points: number;
  tier: string;
  lifetime_points: number;
  rewards: { id: string; name: string; points: number; type: string; available: boolean }[];
  activities: { action: string; points: number; date: string }[];
}

const DEMO_USER_REWARDS: UserRewards = {
  user_id: 'demo-user',
  points: 1250,
  tier: 'Silver',
  lifetime_points: 3500,
  rewards: [
    { id: 'r1', name: 'Free Ticket Upgrade', points: 500, type: 'upgrade', available: true },
    { id: 'r2', name: 'VIP Lounge Access', points: 1000, type: 'access', available: true },
    { id: 'r3', name: 'Meet & Greet Pass', points: 2500, type: 'experience', available: false },
  ],
  activities: [
    { action: 'Ticket Purchase', points: 100, date: new Date().toISOString() },
    { action: 'Social Share', points: 25, date: new Date(Date.now() - 86400000).toISOString() },
  ],
};

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rewardId: string) => {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo-user-123',
          reward_id: rewardId,
          action: 'redeem',
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to redeem reward');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards-page'] });
    },
  });
}

export function useRewardsPageData() {
  const rewardsQuery = useQuery({
    queryKey: ['rewards-page'],
    queryFn: async () => {
      const response = await fetch('/api/rewards?user_id=demo-user-123');
      if (response.status === 401) {
        return DEMO_USER_REWARDS;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch rewards');
      }
      const data = await response.json();
      return data.rewards || DEMO_USER_REWARDS;
    },
    staleTime: 5 * 60 * 1000,
  });

  const redeemMutation = useRedeemReward();

  return {
    userRewards: rewardsQuery.data || null,
    isLoading: rewardsQuery.isLoading,
    error: rewardsQuery.error,
    refetch: rewardsQuery.refetch,
    redeemReward: redeemMutation.mutateAsync,
    isRedeeming: redeemMutation.isPending,
  };
}
