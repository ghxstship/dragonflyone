'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UGCPost {
  id: string;
  platform: 'instagram' | 'twitter' | 'tiktok' | 'facebook' | 'youtube';
  content_type: 'image' | 'video' | 'text' | 'story' | 'reel';
  content_url: string;
  thumbnail_url?: string;
  caption?: string;
  author_name: string;
  author_handle: string;
  author_avatar?: string;
  hashtags: string[];
  event_id?: string;
  event_name?: string;
  likes: number;
  comments: number;
  shares: number;
  is_featured: boolean;
  created_at: string;
}

export interface Hashtag {
  tag: string;
  post_count: number;
  engagement: number;
  trending: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  hashtag: string;
  event_id?: string;
  event_name?: string;
  start_date: string;
  end_date?: string;
  post_count: number;
  total_engagement: number;
  status: 'active' | 'ended' | 'scheduled';
}

const DEMO_POSTS: UGCPost[] = [
  { id: '1', platform: 'instagram', content_type: 'image', content_url: '/demo.jpg', author_name: 'Fan User', author_handle: '@fanuser', hashtags: ['#festival'], likes: 234, comments: 12, shares: 5, is_featured: true, created_at: new Date().toISOString() },
];

const DEMO_HASHTAGS: Hashtag[] = [
  { tag: '#festival2024', post_count: 1234, engagement: 45000, trending: true },
  { tag: '#livemusic', post_count: 890, engagement: 23000, trending: false },
];

const DEMO_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Summer Festival Campaign', hashtag: '#summerfest2024', start_date: new Date().toISOString(), post_count: 456, total_engagement: 89000, status: 'active' },
];

export const ugcKeys = {
  all: ['ugc'] as const,
  posts: (filter?: string) => [...ugcKeys.all, 'posts', filter] as const,
  hashtags: () => [...ugcKeys.all, 'hashtags'] as const,
  campaigns: () => [...ugcKeys.all, 'campaigns'] as const,
};

export function useUGCPosts(filter?: string) {
  return useQuery({
    queryKey: ugcKeys.posts(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter) params.append('filter', filter);
      const response = await fetch(`/api/ugc/posts?${params.toString()}`);
      if (!response.ok) return DEMO_POSTS;
      const data = await response.json();
      return data.posts || DEMO_POSTS;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useUGCHashtags() {
  return useQuery({
    queryKey: ugcKeys.hashtags(),
    queryFn: async () => {
      const response = await fetch('/api/ugc/hashtags');
      if (!response.ok) return DEMO_HASHTAGS;
      const data = await response.json();
      return data.hashtags || DEMO_HASHTAGS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUGCCampaigns() {
  return useQuery({
    queryKey: ugcKeys.campaigns(),
    queryFn: async () => {
      const response = await fetch('/api/ugc/campaigns');
      if (!response.ok) return DEMO_CAMPAIGNS;
      const data = await response.json();
      return data.campaigns || DEMO_CAMPAIGNS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, featured }: { postId: string; featured: boolean }) => {
      const response = await fetch(`/api/ugc/posts/${postId}/feature`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: featured }),
      });
      if (!response.ok) throw new Error('Failed to update post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ugcKeys.all });
    },
  });
}

export function useUGCData(filter?: string) {
  const postsQuery = useUGCPosts(filter);
  const hashtagsQuery = useUGCHashtags();
  const campaignsQuery = useUGCCampaigns();
  const featureMutation = useFeaturePost();

  return {
    posts: postsQuery.data || [],
    hashtags: hashtagsQuery.data || [],
    campaigns: campaignsQuery.data || [],
    isLoading: postsQuery.isLoading || hashtagsQuery.isLoading || campaignsQuery.isLoading,
    error: postsQuery.error || hashtagsQuery.error || campaignsQuery.error,
    refetch: () => {
      postsQuery.refetch();
      hashtagsQuery.refetch();
      campaignsQuery.refetch();
    },
    featurePost: featureMutation.mutateAsync,
  };
}
