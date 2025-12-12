'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;
  points_per_dollar: number;
  tiers: LoyaltyTier[];
  is_active: boolean;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  min_points: number;
  benefits: string[];
  multiplier: number;
}

export interface UserLoyalty {
  user_id: string;
  program_id: string;
  points_balance: number;
  lifetime_points: number;
  current_tier: string;
  tier_progress: number;
  next_tier?: string;
  points_to_next_tier?: number;
}

export function useLoyaltyProgram(programId?: string) {
  return useQuery({
    queryKey: ['loyalty-program', programId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (programId) params.append('program_id', programId);
      
      const response = await fetch(`/api/loyalty-rewards?${params}`);
      if (!response.ok) throw new Error('Failed to fetch loyalty program');
      return response.json();
    },
    enabled: !!programId,
  });
}

export function useUserLoyalty(userId?: string) {
  return useQuery({
    queryKey: ['user-loyalty', userId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      
      const response = await fetch(`/api/loyalty-rewards?${params}`);
      if (!response.ok) throw new Error('Failed to fetch user loyalty');
      return response.json();
    },
    enabled: !!userId,
  });
}

export function useEarnLoyaltyPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      points: number;
      source: string;
      reference_id?: string;
      description?: string;
    }) => {
      const response = await fetch('/api/loyalty-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, action: 'earn' }),
      });
      if (!response.ok) throw new Error('Failed to earn loyalty points');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-loyalty', variables.user_id] });
    },
  });
}

export function useRedeemLoyaltyPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      points: number;
      reward_id: string;
    }) => {
      const response = await fetch('/api/loyalty-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, action: 'redeem' }),
      });
      if (!response.ok) throw new Error('Failed to redeem loyalty points');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-loyalty', variables.user_id] });
    },
  });
}

export function useLoyaltyTransactions(userId?: string, limit = 20) {
  return useQuery({
    queryKey: ['loyalty-transactions', userId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      params.append('limit', String(limit));
      params.append('type', 'transactions');
      
      const response = await fetch(`/api/loyalty-rewards?${params}`);
      if (!response.ok) throw new Error('Failed to fetch loyalty transactions');
      return response.json();
    },
    enabled: !!userId,
  });
}
