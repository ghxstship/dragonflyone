'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface FanClub {
  id: string;
  artist_id: string;
  name: string;
  description?: string;
  membership_tiers: FanClubTier[];
  member_count: number;
  is_active: boolean;
  created_at: string;
}

export interface FanClubTier {
  id: string;
  name: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  benefits: string[];
  early_access_hours: number;
}

export interface FanClubMembership {
  id: string;
  user_id: string;
  fan_club_id: string;
  tier_id: string;
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expires_at?: string;
}

export function useFanClubs(artistId?: string) {
  return useQuery({
    queryKey: ['fan-clubs', artistId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (artistId) params.append('artist_id', artistId);
      
      const response = await fetch(`/api/fan-club-access?${params}`);
      if (!response.ok) throw new Error('Failed to fetch fan clubs');
      return response.json();
    },
  });
}

export function useUserFanClubMemberships(userId?: string) {
  return useQuery({
    queryKey: ['fan-club-memberships', userId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      params.append('type', 'memberships');
      
      const response = await fetch(`/api/fan-club-access?${params}`);
      if (!response.ok) throw new Error('Failed to fetch fan club memberships');
      return response.json();
    },
    enabled: !!userId,
  });
}

export function useJoinFanClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      fan_club_id: string;
      tier_id: string;
      payment_method_id: string;
    }) => {
      const response = await fetch('/api/fan-club-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, action: 'join' }),
      });
      if (!response.ok) throw new Error('Failed to join fan club');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fan-club-memberships', variables.user_id] });
    },
  });
}

export function useCancelFanClubMembership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ membershipId }: { membershipId: string; userId: string }) => {
      const response = await fetch(`/api/fan-club-access?membership_id=${membershipId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to cancel membership');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fan-club-memberships', variables.userId] });
    },
  });
}

export function useCheckFanClubAccess(userId?: string, eventId?: string) {
  return useQuery({
    queryKey: ['fan-club-access-check', userId, eventId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      if (eventId) params.append('event_id', eventId);
      params.append('type', 'access_check');
      
      const response = await fetch(`/api/fan-club-access?${params}`);
      if (!response.ok) throw new Error('Failed to check fan club access');
      return response.json();
    },
    enabled: !!userId && !!eventId,
  });
}
