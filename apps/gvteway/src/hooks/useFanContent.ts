'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface FanContent {
  id: string;
  title: string;
  description: string;
  type: 'photo' | 'video' | 'artwork' | 'story' | 'review';
  creator_name: string;
  creator_avatar?: string;
  thumbnail_url?: string;
  content_url?: string;
  event_id?: string;
  event_name?: string;
  submitted_at: string;
  status: 'pending' | 'approved' | 'featured' | 'rejected';
  likes: number;
  comments: number;
  shares: number;
  is_featured: boolean;
}

export interface FanContentCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const DEMO_FAN_CONTENT: FanContent[] = [
  {
    id: '1',
    title: 'Amazing Concert Experience',
    description: 'My first time at Summer Festival and it was incredible!',
    type: 'photo',
    creator_name: 'Sarah M.',
    submitted_at: new Date().toISOString(),
    status: 'featured',
    likes: 234,
    comments: 45,
    shares: 12,
    is_featured: true,
  },
];

const DEMO_CATEGORIES: FanContentCategory[] = [
  { id: '1', name: 'Photos', icon: 'camera', count: 156 },
  { id: '2', name: 'Videos', icon: 'video', count: 43 },
  { id: '3', name: 'Artwork', icon: 'palette', count: 28 },
  { id: '4', name: 'Stories', icon: 'book', count: 67 },
];

export const fanContentKeys = {
  all: ['fan-content'] as const,
  list: (filter?: { type?: string; status?: string; event_id?: string }) => [...fanContentKeys.all, 'list', filter] as const,
  detail: (id: string) => [...fanContentKeys.all, 'detail', id] as const,
  categories: () => [...fanContentKeys.all, 'categories'] as const,
  featured: () => [...fanContentKeys.all, 'featured'] as const,
};

export function useFanContentList(filter?: { type?: string; status?: string; event_id?: string }) {
  return useQuery({
    queryKey: fanContentKeys.list(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter?.type) params.append('type', filter.type);
      if (filter?.status) params.append('status', filter.status);
      if (filter?.event_id) params.append('event_id', filter.event_id);
      const response = await fetch(`/api/community/fan-content?${params.toString()}`);
      if (!response.ok) return DEMO_FAN_CONTENT;
      const data = await response.json();
      return data.content || DEMO_FAN_CONTENT;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFanContentDetail(id: string) {
  return useQuery({
    queryKey: fanContentKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/community/fan-content/${id}`);
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json();
    },
    enabled: !!id,
  });
}

export function useFanContentCategories() {
  return useQuery({
    queryKey: fanContentKeys.categories(),
    queryFn: async () => {
      const response = await fetch('/api/community/fan-content/categories');
      if (!response.ok) return DEMO_CATEGORIES;
      const data = await response.json();
      return data.categories || DEMO_CATEGORIES;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useFeaturedFanContent() {
  return useQuery({
    queryKey: fanContentKeys.featured(),
    queryFn: async () => {
      const response = await fetch('/api/community/fan-content?status=featured');
      if (!response.ok) return DEMO_FAN_CONTENT.filter(c => c.is_featured);
      const data = await response.json();
      return data.content || DEMO_FAN_CONTENT.filter(c => c.is_featured);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubmitFanContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: Omit<FanContent, 'id' | 'submitted_at' | 'status' | 'likes' | 'comments' | 'shares' | 'is_featured'>) => {
      const response = await fetch('/api/community/fan-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (!response.ok) throw new Error('Failed to submit content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fanContentKeys.all });
    },
  });
}

export function useLikeFanContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      const response = await fetch(`/api/community/fan-content/${contentId}/like`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to like content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fanContentKeys.all });
    },
  });
}

export function useShareFanContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      const response = await fetch(`/api/community/fan-content/${contentId}/share`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to share content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fanContentKeys.all });
    },
  });
}

export function useFanContentData(filter?: { type?: string; status?: string; event_id?: string }) {
  const contentQuery = useFanContentList(filter);
  const categoriesQuery = useFanContentCategories();
  const featuredQuery = useFeaturedFanContent();
  const submitMutation = useSubmitFanContent();
  const likeMutation = useLikeFanContent();
  const shareMutation = useShareFanContent();

  return {
    content: contentQuery.data || [],
    categories: categoriesQuery.data || [],
    featuredContent: featuredQuery.data || [],
    isLoading: contentQuery.isLoading || categoriesQuery.isLoading,
    error: contentQuery.error || categoriesQuery.error,
    refetch: () => {
      contentQuery.refetch();
      categoriesQuery.refetch();
      featuredQuery.refetch();
    },
    submitContent: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    likeContent: likeMutation.mutateAsync,
    shareContent: shareMutation.mutateAsync,
  };
}
