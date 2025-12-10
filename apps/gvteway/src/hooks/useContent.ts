'use client';

import { useQuery } from '@tanstack/react-query';

export interface ExclusiveContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'photo_gallery' | 'document' | 'behind_the_scenes';
  event_id: string;
  event_name: string;
  thumbnail_url?: string;
  duration?: string;
  file_count?: number;
  access_level: 'all' | 'attendees' | 'vip' | 'members';
  release_date: string;
  views: number;
  likes: number;
  is_new: boolean;
}

export interface ContentCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const DEMO_CONTENT: ExclusiveContent[] = [
  { id: '1', title: 'Behind the Scenes', description: 'Exclusive backstage footage', type: 'behind_the_scenes', event_id: 'e1', event_name: 'Summer Festival', access_level: 'vip', release_date: new Date().toISOString(), views: 1234, likes: 456, is_new: true },
];

const DEMO_CATEGORIES: ContentCategory[] = [
  { id: '1', name: 'Videos', icon: 'video', count: 45 },
  { id: '2', name: 'Photos', icon: 'camera', count: 120 },
];

export const contentKeys = {
  all: ['content'] as const,
  list: (filter?: { type?: string; event_id?: string; access_level?: string }) => [...contentKeys.all, 'list', filter] as const,
  categories: () => [...contentKeys.all, 'categories'] as const,
};

export function useContentList(filter?: { type?: string; event_id?: string; access_level?: string }) {
  return useQuery({
    queryKey: contentKeys.list(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter?.type) params.append('type', filter.type);
      if (filter?.event_id) params.append('event_id', filter.event_id);
      if (filter?.access_level) params.append('access_level', filter.access_level);
      const response = await fetch(`/api/content/exclusive?${params.toString()}`);
      if (!response.ok) return DEMO_CONTENT;
      const data = await response.json();
      return data.content || DEMO_CONTENT;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useContentCategories() {
  return useQuery({
    queryKey: contentKeys.categories(),
    queryFn: async () => {
      const response = await fetch('/api/content/categories');
      if (!response.ok) return DEMO_CATEGORIES;
      const data = await response.json();
      return data.categories || DEMO_CATEGORIES;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useContentData(filter?: { type?: string; event_id?: string; access_level?: string }) {
  const contentQuery = useContentList(filter);
  const categoriesQuery = useContentCategories();

  return {
    content: contentQuery.data || [],
    categories: categoriesQuery.data || [],
    isLoading: contentQuery.isLoading || categoriesQuery.isLoading,
    error: contentQuery.error || categoriesQuery.error,
    refetch: () => {
      contentQuery.refetch();
      categoriesQuery.refetch();
    },
  };
}
