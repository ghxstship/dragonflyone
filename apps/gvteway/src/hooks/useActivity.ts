'use client';

import { useQuery } from '@tanstack/react-query';

export interface ActivityItem {
  id: string;
  type: 'ticket_purchase' | 'review' | 'follow' | 'favorite' | 'check_in' | 'share';
  user_id: string;
  user_name: string;
  user_avatar?: string;
  event_id?: string;
  event_title?: string;
  event_image?: string;
  artist_id?: string;
  artist_name?: string;
  venue_id?: string;
  venue_name?: string;
  content?: string;
  created_at: string;
}

const DEMO_ACTIVITIES: ActivityItem[] = [
  { id: '1', type: 'ticket_purchase', user_id: 'u1', user_name: 'Alex Johnson', event_id: 'e1', event_title: 'Summer Festival 2024', created_at: new Date().toISOString() },
  { id: '2', type: 'review', user_id: 'u2', user_name: 'Sarah Chen', event_id: 'e2', event_title: 'Jazz Night', content: 'Amazing show!', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', type: 'follow', user_id: 'u3', user_name: 'Mike Brown', artist_id: 'a1', artist_name: 'The Band', created_at: new Date(Date.now() - 7200000).toISOString() },
];

export const activityKeys = {
  all: ['activity'] as const,
  feed: (filters?: { type?: string }) => [...activityKeys.all, 'feed', filters] as const,
};

export function useActivityFeed(filters?: { type?: string }) {
  return useQuery({
    queryKey: activityKeys.feed(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      const response = await fetch(`/api/activity/feed?${params.toString()}`);
      if (response.status === 401) {
        return DEMO_ACTIVITIES;
      }
      if (!response.ok) {
        return DEMO_ACTIVITIES;
      }
      const data = await response.json();
      return data.activities || DEMO_ACTIVITIES;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useActivityData(filters?: { type?: string }) {
  const activityQuery = useActivityFeed(filters);

  return {
    activities: activityQuery.data || [],
    isLoading: activityQuery.isLoading,
    error: activityQuery.error,
    refetch: activityQuery.refetch,
  };
}
