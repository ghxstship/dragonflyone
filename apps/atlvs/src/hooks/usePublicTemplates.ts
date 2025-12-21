'use client';

import { useQuery } from '@tanstack/react-query';

export interface PublicTemplate {
  id: string;
  name: string;
  description?: string;
  template_type: 'document' | 'email' | 'task' | 'workflow' | 'proposal' | 'event' | 'notification';
  tags?: string[];
  created_at: string;
  category?: {
    id: string;
    name: string;
  };
}

interface PublicTemplateFilters {
  template_type?: string;
  category_id?: string;
  search?: string;
}

interface PublicTemplatesResponse {
  templates: PublicTemplate[];
  summary: {
    total: number;
    by_type: Record<string, number>;
    by_category: Record<string, number>;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function usePublicTemplates(filters?: PublicTemplateFilters) {
  return useQuery({
    queryKey: ['public-templates', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.template_type) params.append('template_type', filters.template_type);
      if (filters?.category_id) params.append('category_id', filters.category_id);
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/public/templates?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch public templates');
      }
      return response.json() as Promise<PublicTemplatesResponse>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicTemplate(id: string) {
  return useQuery({
    queryKey: ['public-templates', id],
    queryFn: async () => {
      const response = await fetch(`/api/public/templates/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      const data = await response.json();
      return data.template as PublicTemplate;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
