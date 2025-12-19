import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface BEOTemplate {
  id: string;
  name: string;
  description?: string;
  event_type: string;
  sections: {
    timeline: Array<{
      time: string;
      description: string;
      department?: string;
    }>;
    room_setup: {
      layout: string;
      notes?: string;
    };
    catering: {
      menu_items: Array<{
        name: string;
        quantity: number;
        dietary_notes?: string;
      }>;
      dietary_requirements?: string[];
    };
    av_requirements: Array<{
      item: string;
      quantity: number;
      notes?: string;
    }>;
    notes?: string;
  };
  is_default: boolean;
  usage_count: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBEOTemplateInput {
  name: string;
  description?: string;
  event_type: string;
  sections?: BEOTemplate['sections'];
  is_default?: boolean;
}

export interface UpdateBEOTemplateInput extends Partial<CreateBEOTemplateInput> {
  id: string;
}

async function fetchBEOTemplates(filters?: { event_type?: string }): Promise<{ templates: BEOTemplate[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.event_type) {
    params.set('event_type', filters.event_type);
  }

  const response = await fetch(`/api/beo-templates?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch BEO templates');
  }
  return response.json();
}

async function fetchBEOTemplate(id: string): Promise<BEOTemplate> {
  const response = await fetch(`/api/beo-templates/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch BEO template');
  }
  return response.json();
}

async function createBEOTemplate(input: CreateBEOTemplateInput): Promise<BEOTemplate> {
  const response = await fetch('/api/beo-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create BEO template');
  }
  return response.json();
}

async function updateBEOTemplate({ id, ...input }: UpdateBEOTemplateInput): Promise<BEOTemplate> {
  const response = await fetch(`/api/beo-templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update BEO template');
  }
  return response.json();
}

async function deleteBEOTemplate(id: string): Promise<void> {
  const response = await fetch(`/api/beo-templates/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete BEO template');
  }
}

export function useBEOTemplates(filters?: { event_type?: string }) {
  return useQuery({
    queryKey: ['beo-templates', filters],
    queryFn: () => fetchBEOTemplates(filters),
  });
}

export function useBEOTemplate(id: string) {
  return useQuery({
    queryKey: ['beo-template', id],
    queryFn: () => fetchBEOTemplate(id),
    enabled: !!id,
  });
}

export function useCreateBEOTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBEOTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beo-templates'] });
    },
  });
}

export function useUpdateBEOTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBEOTemplate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['beo-templates'] });
      queryClient.invalidateQueries({ queryKey: ['beo-template', data.id] });
    },
  });
}

export function useDeleteBEOTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBEOTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beo-templates'] });
    },
  });
}
