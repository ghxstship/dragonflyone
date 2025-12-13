'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Tag {
  id: string;
  tag_name: string;
  tag_type: 'general' | 'industry' | 'compliance' | 'feature' | 'category' | 'priority';
  description?: string;
  color_hex?: string;
  created_at: string;
}

interface TagFilters {
  tag_type?: string;
  search?: string;
}

interface TagsResponse {
  tags: Tag[];
  summary: {
    total: number;
    by_type: Record<string, number>;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function useTags(filters?: TagFilters) {
  return useQuery({
    queryKey: ['tags', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.tag_type) params.append('tag_type', filters.tag_type);
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/tags?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      return response.json() as Promise<TagsResponse>;
    },
  });
}

export function useTag(id: string) {
  return useQuery({
    queryKey: ['tags', id],
    queryFn: async () => {
      const response = await fetch(`/api/tags/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tag');
      }
      const data = await response.json();
      return data.tag as Tag;
    },
    enabled: !!id,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: Omit<Tag, 'id' | 'created_at'>) => {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tag),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create tag');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tag> & { id: string }) => {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update tag');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tags', variables.id] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete tag');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
