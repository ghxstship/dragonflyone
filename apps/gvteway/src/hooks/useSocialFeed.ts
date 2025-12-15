'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SocialPost {
  id: string;
  user: { id: string; name: string; avatar: string };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  liked?: boolean;
}

export interface TrendingTag {
  tag: string;
  count: number;
}

export interface SuggestedGroup {
  id: string;
  name: string;
  members: number;
  image: string;
}

const DEMO_POSTS: SocialPost[] = [
  { id: 'post-1', user: { id: 'u1', name: 'Alex Rivera', avatar: '' }, content: 'Just got my tickets for Summer Festival 2024! 🎉 Who else is going?', likes: 24, comments: 8, shares: 3, timestamp: '2h ago' },
  { id: 'post-2', user: { id: 'u2', name: 'Jordan Lee', avatar: '' }, content: 'The opening act was incredible! Best concert experience ever.', image: '/placeholder-concert.jpg', likes: 156, comments: 42, shares: 18, timestamp: '4h ago' },
  { id: 'post-3', user: { id: 'u3', name: 'Sam Chen', avatar: '' }, content: 'Looking for someone to trade VIP passes. DM me!', likes: 12, comments: 5, shares: 2, timestamp: '6h ago' },
];

const DEMO_TRENDING: TrendingTag[] = [
  { tag: '#SummerFest2024', count: 1250 },
  { tag: '#LiveMusic', count: 890 },
  { tag: '#ConcertVibes', count: 650 },
  { tag: '#Festival', count: 420 },
];

const DEMO_GROUPS: SuggestedGroup[] = [
  { id: 'g1', name: 'Festival Enthusiasts', members: 12500, image: '' },
  { id: 'g2', name: 'Concert Photography', members: 8200, image: '' },
  { id: 'g3', name: 'Music Discovery', members: 5600, image: '' },
];

export const socialKeys = {
  all: ['social'] as const,
  feed: () => [...socialKeys.all, 'feed'] as const,
  trending: () => [...socialKeys.all, 'trending'] as const,
  groups: () => [...socialKeys.all, 'groups'] as const,
};

export function useSocialFeed() {
  return useQuery({
    queryKey: socialKeys.feed(),
    queryFn: async () => {
      const response = await fetch('/api/social/feed');
      if (response.status === 401) {
        return DEMO_POSTS;
      }
      if (!response.ok) {
        return DEMO_POSTS;
      }
      const data = await response.json();
      return data.posts?.length ? data.posts : DEMO_POSTS;
    },
    staleTime: 30 * 1000,
  });
}

export function useTrendingTags() {
  return useQuery({
    queryKey: socialKeys.trending(),
    queryFn: async () => {
      const response = await fetch('/api/social/trending');
      if (!response.ok) {
        return DEMO_TRENDING;
      }
      const data = await response.json();
      return data.tags?.length ? data.tags : DEMO_TRENDING;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSuggestedGroups() {
  return useQuery({
    queryKey: socialKeys.groups(),
    queryFn: async () => {
      const response = await fetch('/api/social/groups/suggested');
      if (!response.ok) {
        return DEMO_GROUPS;
      }
      const data = await response.json();
      return data.groups?.length ? data.groups : DEMO_GROUPS;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to like post');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.feed() });
    },
  });
}

export function useSharePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await fetch(`/api/social/posts/${postId}/share`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to share post');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.feed() });
    },
  });
}

export function useSocialData() {
  const feedQuery = useSocialFeed();
  const trendingQuery = useTrendingTags();
  const groupsQuery = useSuggestedGroups();
  const likeMutation = useLikePost();
  const shareMutation = useSharePost();

  return {
    posts: feedQuery.data || DEMO_POSTS,
    trending: trendingQuery.data || DEMO_TRENDING,
    suggestedGroups: groupsQuery.data || DEMO_GROUPS,
    isLoading: feedQuery.isLoading,
    error: feedQuery.error,
    refetch: feedQuery.refetch,
    likePost: likeMutation.mutateAsync,
    sharePost: shareMutation.mutateAsync,
    isLiking: likeMutation.isPending,
    isSharing: shareMutation.isPending,
  };
}
