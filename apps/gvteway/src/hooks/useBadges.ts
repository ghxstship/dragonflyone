'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UserBadge {
  id: string;
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  earned_at: string;
  is_featured: boolean;
}

export interface AvailableBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  requirement: string;
  progress: number;
  total: number;
  is_earned: boolean;
}

export interface FanTier {
  id: string;
  name: string;
  level: number;
  icon: string;
  perks: string[];
  points_required: number;
  is_current: boolean;
}

const DEMO_EARNED: UserBadge[] = [
  { id: '1', badge_id: 'b1', name: 'First Event', description: 'Attended your first event', icon: '🎫', tier: 'bronze', earned_at: new Date().toISOString(), is_featured: true },
];

const DEMO_AVAILABLE: AvailableBadge[] = [
  { id: '1', name: 'Super Fan', description: 'Attend 10 events', icon: '⭐', tier: 'gold', requirement: 'Attend 10 events', progress: 3, total: 10, is_earned: false },
];

const DEMO_TIERS: FanTier[] = [
  { id: '1', name: 'Bronze Fan', level: 1, icon: '🥉', perks: ['Early access'], points_required: 0, is_current: true },
  { id: '2', name: 'Silver Fan', level: 2, icon: '🥈', perks: ['Early access', 'Discounts'], points_required: 500, is_current: false },
];

export const badgesKeys = {
  all: ['badges'] as const,
  user: () => [...badgesKeys.all, 'user'] as const,
};

export function useUserBadges() {
  return useQuery({
    queryKey: badgesKeys.user(),
    queryFn: async () => {
      const response = await fetch('/api/user/badges');
      if (!response.ok) {
        return { earned_badges: DEMO_EARNED, available_badges: DEMO_AVAILABLE, fan_tiers: DEMO_TIERS, current_points: 250 };
      }
      const data = await response.json();
      return {
        earned_badges: data.earned_badges || DEMO_EARNED,
        available_badges: data.available_badges || DEMO_AVAILABLE,
        fan_tiers: data.fan_tiers || DEMO_TIERS,
        current_points: data.current_points || 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeatureBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ badgeId, featured }: { badgeId: string; featured: boolean }) => {
      const response = await fetch(`/api/user/badges/${badgeId}/feature`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: featured }),
      });
      if (!response.ok) throw new Error('Failed to update badge');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: badgesKeys.all });
    },
  });
}

export function useBadgesData() {
  const badgesQuery = useUserBadges();
  const featureMutation = useFeatureBadge();

  return {
    earnedBadges: badgesQuery.data?.earned_badges || [],
    availableBadges: badgesQuery.data?.available_badges || [],
    fanTiers: badgesQuery.data?.fan_tiers || [],
    currentPoints: badgesQuery.data?.current_points || 0,
    isLoading: badgesQuery.isLoading,
    error: badgesQuery.error,
    refetch: badgesQuery.refetch,
    featureBadge: featureMutation.mutateAsync,
  };
}
