'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface FanClub {
  id: string;
  name: string;
  artist_id: string;
  artist_name: string;
  artist_image?: string;
  description: string;
  member_count: number;
  tier: string;
  benefits: string[];
  monthly_price?: number;
  annual_price?: number;
  is_member: boolean;
  membership_tier?: string;
  exclusive_events: number;
  presale_access: boolean;
}

export interface FanClubSummary {
  total_clubs: number;
  my_memberships: number;
  exclusive_events: number;
  presales_available: number;
}

const DEMO_FAN_CLUBS: FanClub[] = [
  { id: 'demo-1', name: 'Official Fan Club', artist_id: 'artist-001', artist_name: 'The Midnight', description: 'Get exclusive access to presales and behind-the-scenes content', member_count: 12500, tier: 'standard', benefits: ['Presale Access', 'Exclusive Merch'], monthly_price: 9.99, annual_price: 99, is_member: false, exclusive_events: 8, presale_access: true },
  { id: 'demo-2', name: 'VIP Fan Club', artist_id: 'artist-002', artist_name: 'Aurora Rising', description: 'The ultimate fan experience with premium perks', member_count: 8200, tier: 'premium', benefits: ['VIP Presale Access', 'Meet & Greet Priority'], monthly_price: 19.99, annual_price: 199, is_member: false, exclusive_events: 12, presale_access: true },
];

const DEMO_SUMMARY: FanClubSummary = {
  total_clubs: 45,
  my_memberships: 0,
  exclusive_events: 24,
  presales_available: 8,
};

export const fanClubsKeys = {
  all: ['fan-clubs'] as const,
  list: (filters?: { search?: string }) => [...fanClubsKeys.all, 'list', filters] as const,
  summary: () => [...fanClubsKeys.all, 'summary'] as const,
};

export function useFanClubsList(filters?: { search?: string }) {
  return useQuery({
    queryKey: fanClubsKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) {
        params.append('search', filters.search);
      }
      const response = await fetch(`/api/fan-clubs?${params.toString()}`);
      if (response.status === 401) {
        return DEMO_FAN_CLUBS;
      }
      if (!response.ok) {
        return DEMO_FAN_CLUBS;
      }
      const data = await response.json();
      return data.clubs || DEMO_FAN_CLUBS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFanClubsSummary() {
  return useQuery({
    queryKey: fanClubsKeys.summary(),
    queryFn: async () => {
      const response = await fetch('/api/fan-clubs/summary');
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

export function useJoinFanClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clubId, tier }: { clubId: string; tier: string }) => {
      const response = await fetch(`/api/fan-clubs/${clubId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      if (!response.ok) {
        throw new Error('Failed to join fan club');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fanClubsKeys.all });
    },
  });
}

export function useFanClubsData(filters?: { search?: string }) {
  const clubsQuery = useFanClubsList(filters);
  const summaryQuery = useFanClubsSummary();
  const joinMutation = useJoinFanClub();

  return {
    clubs: clubsQuery.data || [],
    summary: summaryQuery.data || DEMO_SUMMARY,
    isLoading: clubsQuery.isLoading || summaryQuery.isLoading,
    error: clubsQuery.error || summaryQuery.error,
    refetch: () => {
      clubsQuery.refetch();
      summaryQuery.refetch();
    },
    joinClub: joinMutation.mutateAsync,
  };
}
