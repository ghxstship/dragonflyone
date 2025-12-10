'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface LostFoundItem {
  id: string;
  type: 'lost' | 'found';
  category: string;
  description: string;
  event_id?: string;
  event_title?: string;
  venue_name?: string;
  location_details?: string;
  date_lost_found: string;
  status: 'open' | 'matched' | 'claimed' | 'closed';
  photos?: string[];
  contact_email?: string;
  created_at: string;
}

const DEMO_ITEMS: LostFoundItem[] = [
  { id: 'demo-1', type: 'lost', category: 'Phone/Electronics', description: 'Black iPhone 15 Pro with blue case', event_title: 'Summer Festival 2024', date_lost_found: new Date().toISOString(), status: 'open', created_at: new Date().toISOString() },
  { id: 'demo-2', type: 'found', category: 'Keys', description: 'Set of car keys with BMW fob', event_title: 'Jazz Night', date_lost_found: new Date(Date.now() - 86400000).toISOString(), status: 'open', created_at: new Date(Date.now() - 86400000).toISOString() },
];

export const lostFoundKeys = {
  all: ['lost-found'] as const,
  list: () => [...lostFoundKeys.all, 'list'] as const,
};

export function useLostFoundItems() {
  return useQuery({
    queryKey: lostFoundKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/lost-found');
      if (response.status === 401) {
        return DEMO_ITEMS;
      }
      if (!response.ok) {
        return DEMO_ITEMS;
      }
      const data = await response.json();
      return data.items || DEMO_ITEMS;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useReportLostFound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: { type: 'lost' | 'found'; category: string; description: string; event_id?: string; location_details?: string; date_lost_found: string; contact_email?: string }) => {
      const response = await fetch('/api/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      if (!response.ok) {
        throw new Error('Failed to submit report');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.all });
    },
  });
}

export function useLostFoundData() {
  const itemsQuery = useLostFoundItems();
  const reportMutation = useReportLostFound();

  return {
    items: itemsQuery.data || [],
    isLoading: itemsQuery.isLoading,
    error: itemsQuery.error,
    refetch: itemsQuery.refetch,
    reportItem: reportMutation.mutateAsync,
    isSubmitting: reportMutation.isPending,
  };
}
