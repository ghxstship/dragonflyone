'use client';

import { useQuery } from '@tanstack/react-query';

export interface ReputationStats {
  total_karma: number;
  level: number;
  level_name: string;
  next_level_karma: number;
  rank_percentile: number;
  helpful_votes: number;
  reviews_count: number;
  answers_count: number;
  events_attended: number;
}

export interface KarmaTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  karma_reward: number;
  earned_at?: string;
  progress?: number;
  total?: number;
}

const DEMO_STATS: ReputationStats = {
  total_karma: 750,
  level: 3,
  level_name: 'Contributor',
  next_level_karma: 1500,
  rank_percentile: 25,
  helpful_votes: 45,
  reviews_count: 12,
  answers_count: 8,
  events_attended: 15,
};

const DEMO_TRANSACTIONS: KarmaTransaction[] = [
  { id: '1', amount: 50, type: 'review', description: 'Posted a helpful review', created_at: new Date().toISOString() },
  { id: '2', amount: 25, type: 'attendance', description: 'Attended an event', created_at: new Date(Date.now() - 86400000).toISOString() },
];

const DEMO_ACHIEVEMENTS: Achievement[] = [
  { id: '1', name: 'First Review', description: 'Write your first review', icon: '✍️', karma_reward: 50, earned_at: new Date().toISOString() },
  { id: '2', name: 'Super Fan', description: 'Attend 10 events', icon: '⭐', karma_reward: 100, progress: 5, total: 10 },
];

export const reputationKeys = {
  all: ['reputation'] as const,
  user: () => [...reputationKeys.all, 'user'] as const,
};

export function useUserReputation() {
  return useQuery({
    queryKey: reputationKeys.user(),
    queryFn: async () => {
      const response = await fetch('/api/user/reputation');
      if (!response.ok) {
        return { stats: DEMO_STATS, transactions: DEMO_TRANSACTIONS, achievements: DEMO_ACHIEVEMENTS };
      }
      const data = await response.json();
      return {
        stats: data.stats || DEMO_STATS,
        transactions: data.transactions || DEMO_TRANSACTIONS,
        achievements: data.achievements || DEMO_ACHIEVEMENTS,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useReputationData() {
  const reputationQuery = useUserReputation();

  return {
    stats: reputationQuery.data?.stats || null,
    transactions: reputationQuery.data?.transactions || [],
    achievements: reputationQuery.data?.achievements || [],
    isLoading: reputationQuery.isLoading,
    error: reputationQuery.error,
    refetch: reputationQuery.refetch,
  };
}
