'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Template {
  id: string;
  organization_id: string;
  category_id?: string;
  name: string;
  description?: string;
  template_type: 'document' | 'email' | 'task' | 'workflow' | 'proposal' | 'event' | 'notification';
  content?: Record<string, unknown>;
  is_active: boolean;
  is_public: boolean;
  tags?: string[];
  created_at: string;
  updated_at?: string;
  category?: {
    id: string;
    name: string;
  };
}

interface TemplateFilters {
  organization_id?: string;
  template_type?: string;
  category_id?: string;
  is_active?: boolean;
  search?: string;
}

interface TemplatesResponse {
  templates: Template[];
  summary: {
    total: number;
    active: number;
    by_type: Record<string, number>;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function useTemplates(filters?: TemplateFilters) {
  return useQuery({
    queryKey: ['templates', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);
      if (filters?.template_type) params.append('template_type', filters.template_type);
      if (filters?.category_id) params.append('category_id', filters.category_id);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/templates?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json() as Promise<TemplatesResponse>;
    },
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: async () => {
      const response = await fetch(`/api/templates/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      const data = await response.json();
      return data.template as Template;
    },
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'category'>) => {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (!response.ok) {
        throw new Error('Failed to create template');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Template> & { id: string }) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update template');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['templates', variables.id] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete template');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}
