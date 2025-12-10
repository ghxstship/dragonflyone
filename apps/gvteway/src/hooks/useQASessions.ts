'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface QASession {
  id: string;
  artist_id: string;
  artist_name: string;
  artist_image?: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'upcoming' | 'live' | 'ended' | 'archived';
  questions_count: number;
  attendees_count: number;
  is_member_only: boolean;
}

export interface Question {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string;
  content: string;
  upvotes: number;
  is_answered: boolean;
  answer?: string;
  answered_at?: string;
  created_at: string;
}

const DEMO_SESSIONS: QASession[] = [
  { id: '1', artist_id: 'a1', artist_name: 'The Midnight', title: 'Ask Me Anything', description: 'Live Q&A session', scheduled_at: new Date(Date.now() + 86400000).toISOString(), duration_minutes: 60, status: 'upcoming', questions_count: 45, attendees_count: 230, is_member_only: false },
  { id: '2', artist_id: 'a2', artist_name: 'Aurora Rising', title: 'Fan Questions', description: 'Answering your questions', scheduled_at: new Date().toISOString(), duration_minutes: 45, status: 'live', questions_count: 78, attendees_count: 450, is_member_only: true },
];

export const qaSessionsKeys = {
  all: ['qa-sessions'] as const,
  list: (filter?: string) => [...qaSessionsKeys.all, 'list', filter] as const,
  questions: (sessionId: string) => [...qaSessionsKeys.all, 'questions', sessionId] as const,
};

export function useQASessionsList(filter?: string) {
  return useQuery({
    queryKey: qaSessionsKeys.list(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter && filter !== 'all') {
        params.append('status', filter);
      }
      const response = await fetch(`/api/qa-sessions?${params.toString()}`);
      if (!response.ok) {
        return DEMO_SESSIONS;
      }
      const data = await response.json();
      return data.sessions || DEMO_SESSIONS;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useSessionQuestions(sessionId: string) {
  return useQuery({
    queryKey: qaSessionsKeys.questions(sessionId),
    queryFn: async () => {
      const response = await fetch(`/api/qa-sessions/${sessionId}/questions`);
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.questions || [];
    },
    enabled: !!sessionId,
    staleTime: 30 * 1000,
  });
}

export function useAskQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, content }: { sessionId: string; content: string }) => {
      const response = await fetch(`/api/qa-sessions/${sessionId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit question');
      }
      return response.json();
    },
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: qaSessionsKeys.questions(sessionId) });
    },
  });
}

export function useUpvoteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: string) => {
      const response = await fetch(`/api/qa-sessions/questions/${questionId}/upvote`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to upvote');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qaSessionsKeys.all });
    },
  });
}

export function useQASessionsData(filter?: string) {
  const sessionsQuery = useQASessionsList(filter);
  const askMutation = useAskQuestion();
  const upvoteMutation = useUpvoteQuestion();

  return {
    sessions: sessionsQuery.data || [],
    isLoading: sessionsQuery.isLoading,
    error: sessionsQuery.error,
    refetch: sessionsQuery.refetch,
    askQuestion: askMutation.mutateAsync,
    isAsking: askMutation.isPending,
    upvoteQuestion: upvoteMutation.mutateAsync,
  };
}
