'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Comment {
  id: string;
  organization_id: string;
  resource_type: string;
  resource_id: string;
  parent_comment_id?: string;
  author_id?: string;
  author_name?: string;
  content: string;
  mentions?: string[];
  attachments?: Record<string, unknown>[];
  is_edited: boolean;
  is_pinned: boolean;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name?: string;
    email: string;
  };
  reactions?: {
    id: string;
    reaction_type: string;
    user_id: string;
  }[];
}

interface CommentFilters {
  resource_type: string;
  resource_id: string;
  organization_id?: string;
}

interface CommentsResponse {
  comments: Comment[];
  summary: {
    total: number;
    pinned: number;
    resolved: number;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function useComments(filters: CommentFilters) {
  return useQuery({
    queryKey: ['comments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('resource_type', filters.resource_type);
      params.append('resource_id', filters.resource_id);
      if (filters.organization_id) params.append('organization_id', filters.organization_id);

      const response = await fetch(`/api/comments?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      return response.json() as Promise<CommentsResponse>;
    },
    enabled: !!filters.resource_type && !!filters.resource_id,
  });
}

export function useComment(id: string) {
  return useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const response = await fetch(`/api/comments/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comment');
      }
      const data = await response.json();
      return data.comment as Comment;
    },
    enabled: !!id,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'is_edited' | 'is_pinned' | 'is_resolved' | 'author' | 'reactions'>) => {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment),
      });
      if (!response.ok) {
        throw new Error('Failed to create comment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Comment> & { id: string }) => {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update comment');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['comments', variables.id] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function usePinComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_pinned }: { id: string; is_pinned: boolean }) => {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned }),
      });
      if (!response.ok) {
        throw new Error('Failed to pin comment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useResolveComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_resolved }: { id: string; is_resolved: boolean }) => {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_resolved }),
      });
      if (!response.ok) {
        throw new Error('Failed to resolve comment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}
