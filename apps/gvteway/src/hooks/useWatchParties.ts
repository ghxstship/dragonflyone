'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface WatchParty {
  id: string;
  title: string;
  description: string;
  host_id: string;
  host_name: string;
  host_avatar?: string;
  event_id?: string;
  event_name?: string;
  content_type: 'livestream' | 'recording' | 'premiere' | 'rewatch';
  content_url?: string;
  thumbnail_url?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'upcoming' | 'live' | 'ended';
  attendees_count: number;
  max_attendees?: number;
  is_private: boolean;
  chat_enabled: boolean;
  video_enabled: boolean;
}

const DEMO_PARTIES: WatchParty[] = [
  { id: '1', title: 'Festival Rewatch Party', description: 'Relive the best moments!', host_id: 'h1', host_name: 'MusicFan', content_type: 'rewatch', scheduled_at: new Date(Date.now() + 86400000).toISOString(), duration_minutes: 120, status: 'upcoming', attendees_count: 45, is_private: false, chat_enabled: true, video_enabled: false },
  { id: '2', title: 'Live Concert Stream', description: 'Watch together!', host_id: 'h2', host_name: 'ConcertLover', content_type: 'livestream', scheduled_at: new Date().toISOString(), duration_minutes: 180, status: 'live', attendees_count: 128, is_private: false, chat_enabled: true, video_enabled: true },
];

export const watchPartiesKeys = {
  all: ['watch-parties'] as const,
  list: (filter?: string) => [...watchPartiesKeys.all, 'list', filter] as const,
};

export function useWatchPartiesList(filter?: string) {
  return useQuery({
    queryKey: watchPartiesKeys.list(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter && filter !== 'all') {
        params.append('status', filter);
      }
      const response = await fetch(`/api/watch-parties?${params.toString()}`);
      if (!response.ok) {
        return DEMO_PARTIES;
      }
      const data = await response.json();
      return data.parties || DEMO_PARTIES;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateWatchParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (party: Partial<WatchParty>) => {
      const response = await fetch('/api/watch-parties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(party),
      });
      if (!response.ok) {
        throw new Error('Failed to create watch party');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchPartiesKeys.all });
    },
  });
}

export function useWatchPartiesData(filter?: string) {
  const partiesQuery = useWatchPartiesList(filter);
  const createMutation = useCreateWatchParty();

  return {
    parties: partiesQuery.data || [],
    isLoading: partiesQuery.isLoading,
    error: partiesQuery.error,
    refetch: partiesQuery.refetch,
    createParty: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
