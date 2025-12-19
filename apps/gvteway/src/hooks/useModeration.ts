'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DEMO_FLAGGED_CONTENT } from '@/lib/demo-data';

export interface FlaggedContent {
  id: string;
  type: 'Comment' | 'Review' | 'Post' | 'Photo';
  content: string;
  author: string;
  reason: string;
  reportedBy: string;
  status: 'Pending' | 'Approved' | 'Removed' | 'Escalated';
  timestamp: string;
}

export const moderationKeys = {
  all: ['moderation'] as const,
  list: (filters?: { status?: string; type?: string }) => [...moderationKeys.all, 'list', filters] as const,
};

export function useFlaggedContent(filters?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: moderationKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      const response = await fetch(`/api/admin/moderation?${params.toString()}`);
      if (!response.ok) return DEMO_FLAGGED_CONTENT;
      const data = await response.json();
      return data.content || DEMO_FLAGGED_CONTENT;
    },
    staleTime: 30 * 1000,
  });
}

export function useModerateContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ contentId, status }: { contentId: string; status: FlaggedContent['status'] }) => {
      const response = await fetch(`/api/admin/moderation/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to moderate content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moderationKeys.all });
    },
  });
}

export function useModerationData(filters?: { status?: string; type?: string }) {
  const contentQuery = useFlaggedContent(filters);
  const moderateMutation = useModerateContent();

  return {
    flaggedContent: (contentQuery.data || []) as FlaggedContent[],
    isLoading: contentQuery.isLoading,
    error: contentQuery.error,
    refetch: contentQuery.refetch,
    moderateContent: moderateMutation.mutateAsync,
    isModeratingContent: moderateMutation.isPending,
  };
}
