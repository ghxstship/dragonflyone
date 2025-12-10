'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  event_count: number;
  image_url?: string;
  is_private: boolean;
  is_member: boolean;
  created_at: string;
  admin_name: string;
}

export interface GroupSummary {
  total_groups: number;
  my_groups: number;
  trending_count: number;
  new_this_week: number;
}

const DEMO_GROUPS: Group[] = [
  { id: 'demo-1', name: 'Festival Fans United', description: 'Connect with fellow festival enthusiasts', category: 'festivals', member_count: 3500, event_count: 12, is_private: false, is_member: false, created_at: new Date().toISOString(), admin_name: 'FestivalLover' },
  { id: 'demo-2', name: 'Local Music Scene', description: 'Discover and support local artists', category: 'music', member_count: 1200, event_count: 8, is_private: false, is_member: false, created_at: new Date().toISOString(), admin_name: 'MusicScout' },
];

const DEMO_GROUP_SUMMARY: GroupSummary = {
  total_groups: 156,
  my_groups: 0,
  trending_count: 12,
  new_this_week: 8,
};

export const groupsKeys = {
  all: ['groups'] as const,
  list: (filters?: { category?: string; search?: string }) => [...groupsKeys.all, 'list', filters] as const,
  summary: () => [...groupsKeys.all, 'summary'] as const,
};

export function useGroupsList(filters?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: groupsKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      const response = await fetch(`/api/groups?${params.toString()}`);
      if (response.status === 401) {
        return DEMO_GROUPS;
      }
      if (!response.ok) {
        return DEMO_GROUPS;
      }
      const data = await response.json();
      return data.groups || DEMO_GROUPS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGroupsSummary() {
  return useQuery({
    queryKey: groupsKeys.summary(),
    queryFn: async () => {
      const response = await fetch('/api/groups/summary');
      if (response.status === 401) {
        return DEMO_GROUP_SUMMARY;
      }
      if (!response.ok) {
        return DEMO_GROUP_SUMMARY;
      }
      const data = await response.json();
      return data.summary || DEMO_GROUP_SUMMARY;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to join group');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupsKeys.all });
    },
  });
}

export function useGroupsData(filters?: { category?: string; search?: string }) {
  const groupsQuery = useGroupsList(filters);
  const summaryQuery = useGroupsSummary();
  const joinMutation = useJoinGroup();

  return {
    groups: groupsQuery.data || [],
    summary: summaryQuery.data || DEMO_GROUP_SUMMARY,
    isLoading: groupsQuery.isLoading || summaryQuery.isLoading,
    error: groupsQuery.error || summaryQuery.error,
    refetch: () => {
      groupsQuery.refetch();
      summaryQuery.refetch();
    },
    joinGroup: joinMutation.mutateAsync,
  };
}
