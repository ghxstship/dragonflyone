'use client';

import { useQuery } from '@tanstack/react-query';

export interface ForumThread {
  id: string;
  title: string;
  category: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  reply_count: number;
  view_count: number;
  last_reply_at: string;
  last_reply_by?: string;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
}

export interface ForumSummary {
  total_threads: number;
  total_posts: number;
  active_users: number;
  new_today: number;
}

const DEMO_THREADS: ForumThread[] = [
  { id: 'demo-1', title: 'Best festivals to attend this summer?', category: 'general', author_id: 'user-001', author_name: 'MusicFan23', reply_count: 45, view_count: 1234, last_reply_at: new Date(Date.now() - 3600000).toISOString(), last_reply_by: 'FestivalLover', is_pinned: true, is_locked: false, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'demo-2', title: 'Tips for first-time concert goers', category: 'general', author_id: 'user-002', author_name: 'ConcertPro', reply_count: 28, view_count: 892, last_reply_at: new Date(Date.now() - 7200000).toISOString(), is_pinned: false, is_locked: false, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
];

const DEMO_SUMMARY: ForumSummary = {
  total_threads: 156,
  total_posts: 2340,
  active_users: 89,
  new_today: 12,
};

export const forumsKeys = {
  all: ['forums'] as const,
  threads: (filters?: { category?: string; search?: string }) => [...forumsKeys.all, 'threads', filters] as const,
  summary: () => [...forumsKeys.all, 'summary'] as const,
};

export function useForumThreads(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: forumsKeys.threads(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      const response = await fetch(`/api/forums/threads?${params.toString()}`);
      if (response.status === 401) {
        return DEMO_THREADS;
      }
      if (!response.ok) {
        return DEMO_THREADS;
      }
      const data = await response.json();
      return data.threads || DEMO_THREADS;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useForumSummary() {
  return useQuery({
    queryKey: forumsKeys.summary(),
    queryFn: async () => {
      const response = await fetch('/api/forums/summary');
      if (response.status === 401) {
        return DEMO_SUMMARY;
      }
      if (!response.ok) {
        return DEMO_SUMMARY;
      }
      const data = await response.json();
      return data.summary || DEMO_SUMMARY;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useForumsData(filters?: { category?: string; search?: string }) {
  const threadsQuery = useForumThreads(filters);
  const summaryQuery = useForumSummary();

  return {
    threads: threadsQuery.data || [],
    summary: summaryQuery.data || DEMO_SUMMARY,
    isLoading: threadsQuery.isLoading || summaryQuery.isLoading,
    error: threadsQuery.error || summaryQuery.error,
    refetch: () => {
      threadsQuery.refetch();
      summaryQuery.refetch();
    },
  };
}
