'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  AdvanceTemplate,
  AdvanceTemplateWithItems,
  AdvanceTemplateListItem,
  CreateAdvanceTemplatePayload,
  UpdateAdvanceTemplatePayload,
  TemplateFilters,
} from '../types/catalog';

// ============================================================================
// ADVANCE TEMPLATES HOOKS
// ============================================================================

interface TemplatesResponse {
  data: AdvanceTemplateListItem[];
  count: number;
}

export function useAdvanceTemplates(filters?: TemplateFilters) {
  return useQuery({
    queryKey: ['advance-templates', filters],
    queryFn: async (): Promise<TemplatesResponse> => {
      const params = new URLSearchParams();
      if (filters?.category) params.set('category', filters.category);
      if (filters?.template_type) params.set('template_type', filters.template_type);
      if (filters?.is_global !== undefined) params.set('is_global', String(filters.is_global));
      if (filters?.search) params.set('search', filters.search);
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));

      const response = await fetch(`/api/advancing/templates?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch advance templates');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdvanceTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: ['advance-template', templateId],
    queryFn: async (): Promise<AdvanceTemplateWithItems> => {
      const response = await fetch(`/api/advancing/templates/${templateId}`);
      if (!response.ok) throw new Error('Failed to fetch advance template');
      const data = await response.json();
      return data.template;
    },
    enabled: !!templateId,
  });
}

export function useUserTemplates(category?: string, includeGlobal: boolean = true) {
  return useQuery({
    queryKey: ['user-templates', category, includeGlobal],
    queryFn: async (): Promise<TemplatesResponse> => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      params.set('include_global', String(includeGlobal));

      const response = await fetch(`/api/advancing/templates/user?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch user templates');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAdvanceTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAdvanceTemplatePayload): Promise<AdvanceTemplate> => {
      const response = await fetch('/api/advancing/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create advance template');
      }
      const data = await response.json();
      return data.template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance-templates'] });
      queryClient.invalidateQueries({ queryKey: ['user-templates'] });
    },
  });
}

export function useCreateTemplateFromAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      advanceId: string;
      name: string;
      description?: string;
      category?: string;
      isGlobal?: boolean;
    }): Promise<AdvanceTemplate> => {
      const response = await fetch('/api/advancing/templates/from-advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advance_id: params.advanceId,
          name: params.name,
          description: params.description,
          category: params.category,
          is_global: params.isGlobal,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create template from advance');
      }
      const data = await response.json();
      return data.template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance-templates'] });
      queryClient.invalidateQueries({ queryKey: ['user-templates'] });
    },
  });
}

export function useCreateAdvanceFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      templateId: string;
      projectId?: string;
      teamWorkspace?: string;
      activationName?: string;
    }): Promise<{ advanceId: string }> => {
      const response = await fetch('/api/advancing/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: params.templateId,
          project_id: params.projectId,
          team_workspace: params.teamWorkspace,
          activation_name: params.activationName,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create advance from template');
      }
      const data = await response.json();
      return { advanceId: data.advance_id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advancing-requests'] });
      queryClient.invalidateQueries({ queryKey: ['advance-templates'] });
    },
  });
}

export function useUpdateAdvanceTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      templateId: string;
      payload: UpdateAdvanceTemplatePayload;
    }): Promise<AdvanceTemplate> => {
      const response = await fetch(`/api/advancing/templates/${params.templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update advance template');
      }
      const data = await response.json();
      return data.template;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advance-templates'] });
      queryClient.invalidateQueries({ queryKey: ['advance-template', variables.templateId] });
      queryClient.invalidateQueries({ queryKey: ['user-templates'] });
    },
  });
}

export function useDeleteAdvanceTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string): Promise<void> => {
      const response = await fetch(`/api/advancing/templates/${templateId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete advance template');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance-templates'] });
      queryClient.invalidateQueries({ queryKey: ['user-templates'] });
    },
  });
}

export function useToggleTemplateFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      templateId: string;
      isFavorite: boolean;
    }): Promise<void> => {
      const response = await fetch(`/api/advancing/templates/${params.templateId}/favorite`, {
        method: params.isFavorite ? 'POST' : 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update template favorite');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advance-templates'] });
      queryClient.invalidateQueries({ queryKey: ['advance-template', variables.templateId] });
      queryClient.invalidateQueries({ queryKey: ['user-templates'] });
    },
  });
}

// ============================================================================
// TEMPLATE ITEMS HOOKS
// ============================================================================

export function useAddTemplateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      templateId: string;
      item: {
        catalog_item_id?: string;
        org_catalog_item_id?: string;
        item_name: string;
        description?: string;
        category?: string;
        subcategory?: string;
        default_quantity: number;
        unit: string;
        estimated_unit_cost?: number;
        is_required?: boolean;
        notes?: string;
      };
    }): Promise<void> => {
      const response = await fetch(`/api/advancing/templates/${params.templateId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.item),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add template item');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advance-template', variables.templateId] });
    },
  });
}

export function useUpdateTemplateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      templateId: string;
      itemId: string;
      updates: {
        item_name?: string;
        description?: string;
        default_quantity?: number;
        unit?: string;
        estimated_unit_cost?: number;
        is_required?: boolean;
        notes?: string;
        display_order?: number;
      };
    }): Promise<void> => {
      const response = await fetch(
        `/api/advancing/templates/${params.templateId}/items/${params.itemId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params.updates),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update template item');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advance-template', variables.templateId] });
    },
  });
}

export function useRemoveTemplateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { templateId: string; itemId: string }): Promise<void> => {
      const response = await fetch(
        `/api/advancing/templates/${params.templateId}/items/${params.itemId}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove template item');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advance-template', variables.templateId] });
    },
  });
}
