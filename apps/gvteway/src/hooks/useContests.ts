'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Contest {
  id: string;
  name: string;
  type: 'Giveaway' | 'Photo Contest' | 'Video Contest' | 'Hashtag Challenge' | 'Sweepstakes';
  eventId?: string;
  eventName?: string;
  prize: string;
  prizeValue: number;
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Active' | 'Ended' | 'Selecting Winner';
  entries: number;
  platforms: string[];
  rules?: string;
  winnerId?: string;
  winnerName?: string;
  [key: string]: unknown;
}

const DEMO_CONTESTS: Contest[] = [
  { id: 'CNT-001', name: 'Summer Fest VIP Giveaway', type: 'Giveaway', eventId: 'EVT-001', eventName: 'Summer Fest 2024', prize: '2 VIP Tickets + Meet & Greet', prizeValue: 500, startDate: '2024-11-01', endDate: '2024-11-20', status: 'Ended', entries: 2450, platforms: ['Instagram', 'Twitter'], winnerId: 'USR-123', winnerName: 'Sarah M.' },
  { id: 'CNT-002', name: 'Best Concert Photo', type: 'Photo Contest', eventId: 'EVT-001', eventName: 'Summer Fest 2024', prize: 'Free tickets to next 3 events', prizeValue: 300, startDate: '2024-11-15', endDate: '2024-12-01', status: 'Active', entries: 156, platforms: ['Instagram'] },
];

export const contestsKeys = {
  all: ['contests'] as const,
  list: () => [...contestsKeys.all, 'list'] as const,
};

export function useContestsList() {
  return useQuery({
    queryKey: contestsKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/admin/contests');
      if (!response.ok) return DEMO_CONTESTS;
      const data = await response.json();
      return data.contests || DEMO_CONTESTS;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useSelectWinner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contestId, winnerId }: { contestId: string; winnerId: string }) => {
      const response = await fetch(`/api/admin/contests/${contestId}/winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner_id: winnerId }),
      });
      if (!response.ok) throw new Error('Failed to select winner');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contestsKeys.all });
    },
  });
}

export function useContestsData() {
  const contestsQuery = useContestsList();
  const selectWinnerMutation = useSelectWinner();

  return {
    contests: contestsQuery.data || [],
    isLoading: contestsQuery.isLoading,
    error: contestsQuery.error,
    refetch: contestsQuery.refetch,
    selectWinner: selectWinnerMutation.mutateAsync,
    isSelectingWinner: selectWinnerMutation.isPending,
  };
}
