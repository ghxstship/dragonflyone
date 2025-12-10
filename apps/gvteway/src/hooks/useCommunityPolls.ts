'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  total_votes: number;
  status: 'active' | 'closed' | 'upcoming';
  ends_at?: string;
  created_at: string;
  event_id?: string;
  event_title?: string;
  user_voted?: string;
  category: string;
}

const DEMO_POLLS: Poll[] = [
  {
    id: '1',
    question: 'Which artist should headline next year?',
    options: [
      { id: 'o1', text: 'Artist A', votes: 150, percentage: 45 },
      { id: 'o2', text: 'Artist B', votes: 120, percentage: 36 },
      { id: 'o3', text: 'Artist C', votes: 63, percentage: 19 },
    ],
    total_votes: 333,
    status: 'active',
    created_at: new Date().toISOString(),
    category: 'music',
  },
];

export const communityPollsKeys = {
  all: ['community-polls'] as const,
  list: (filter?: { status?: string; category?: string }) => [...communityPollsKeys.all, 'list', filter] as const,
};

export function usePollsList(filter?: { status?: string; category?: string }) {
  return useQuery({
    queryKey: communityPollsKeys.list(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter?.status) params.append('status', filter.status);
      if (filter?.category && filter.category !== 'all') params.append('category', filter.category);
      const response = await fetch(`/api/community/polls?${params.toString()}`);
      if (!response.ok) return DEMO_POLLS;
      const data = await response.json();
      return data.polls || DEMO_POLLS;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useVotePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      const response = await fetch(`/api/community/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_id: optionId }),
      });
      if (!response.ok) throw new Error('Failed to vote');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityPollsKeys.all });
    },
  });
}

export function useCommunityPollsData(filter?: { status?: string; category?: string }) {
  const pollsQuery = usePollsList(filter);
  const voteMutation = useVotePoll();

  return {
    polls: pollsQuery.data || [],
    isLoading: pollsQuery.isLoading,
    error: pollsQuery.error,
    refetch: pollsQuery.refetch,
    vote: voteMutation.mutateAsync,
    isVoting: voteMutation.isPending,
  };
}
