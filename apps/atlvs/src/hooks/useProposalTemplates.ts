import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ProposalTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  introduction?: string;
  terms?: string;
  pricing_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  is_default: boolean;
  usage_count: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProposalTemplateInput {
  name: string;
  description?: string;
  content?: string;
  introduction?: string;
  terms?: string;
  pricing_items?: ProposalTemplate['pricing_items'];
  is_default?: boolean;
}

export interface UpdateProposalTemplateInput extends Partial<CreateProposalTemplateInput> {
  id: string;
}

async function fetchProposalTemplates(): Promise<{ templates: ProposalTemplate[]; total: number }> {
  const response = await fetch('/api/proposal-templates');
  if (!response.ok) {
    throw new Error('Failed to fetch proposal templates');
  }
  return response.json();
}

async function fetchProposalTemplate(id: string): Promise<ProposalTemplate> {
  const response = await fetch(`/api/proposal-templates/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch proposal template');
  }
  return response.json();
}

async function createProposalTemplate(input: CreateProposalTemplateInput): Promise<ProposalTemplate> {
  const response = await fetch('/api/proposal-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create proposal template');
  }
  return response.json();
}

async function updateProposalTemplate({ id, ...input }: UpdateProposalTemplateInput): Promise<ProposalTemplate> {
  const response = await fetch(`/api/proposal-templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update proposal template');
  }
  return response.json();
}

async function deleteProposalTemplate(id: string): Promise<void> {
  const response = await fetch(`/api/proposal-templates/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete proposal template');
  }
}

export function useProposalTemplates() {
  return useQuery({
    queryKey: ['proposal-templates'],
    queryFn: fetchProposalTemplates,
  });
}

export function useProposalTemplate(id: string) {
  return useQuery({
    queryKey: ['proposal-template', id],
    queryFn: () => fetchProposalTemplate(id),
    enabled: !!id,
  });
}

export function useCreateProposalTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProposalTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates'] });
    },
  });
}

export function useUpdateProposalTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProposalTemplate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates'] });
      queryClient.invalidateQueries({ queryKey: ['proposal-template', data.id] });
    },
  });
}

export function useDeleteProposalTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProposalTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-templates'] });
    },
  });
}
