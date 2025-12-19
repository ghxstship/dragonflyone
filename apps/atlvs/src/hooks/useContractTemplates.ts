import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ContractTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  clause_ids: string[];
  variables: Array<{
    key: string;
    label: string;
    type: 'text' | 'date' | 'number' | 'currency' | 'select';
    options?: string[];
    default_value?: string;
    required: boolean;
  }>;
  is_default: boolean;
  usage_count: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContractTemplateInput {
  name: string;
  description?: string;
  content: string;
  clause_ids?: string[];
  variables?: ContractTemplate['variables'];
  is_default?: boolean;
}

export interface UpdateContractTemplateInput extends Partial<CreateContractTemplateInput> {
  id: string;
}

async function fetchContractTemplates(): Promise<{ templates: ContractTemplate[]; total: number }> {
  const response = await fetch('/api/contract-templates');
  if (!response.ok) {
    throw new Error('Failed to fetch contract templates');
  }
  return response.json();
}

async function fetchContractTemplate(id: string): Promise<ContractTemplate> {
  const response = await fetch(`/api/contract-templates/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch contract template');
  }
  return response.json();
}

async function createContractTemplate(input: CreateContractTemplateInput): Promise<ContractTemplate> {
  const response = await fetch('/api/contract-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create contract template');
  }
  return response.json();
}

async function updateContractTemplate({ id, ...input }: UpdateContractTemplateInput): Promise<ContractTemplate> {
  const response = await fetch(`/api/contract-templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update contract template');
  }
  return response.json();
}

async function deleteContractTemplate(id: string): Promise<void> {
  const response = await fetch(`/api/contract-templates/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete contract template');
  }
}

export function useContractTemplates() {
  return useQuery({
    queryKey: ['contract-templates'],
    queryFn: fetchContractTemplates,
  });
}

export function useContractTemplate(id: string) {
  return useQuery({
    queryKey: ['contract-template', id],
    queryFn: () => fetchContractTemplate(id),
    enabled: !!id,
  });
}

export function useCreateContractTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContractTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
    },
  });
}

export function useUpdateContractTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateContractTemplate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      queryClient.invalidateQueries({ queryKey: ['contract-template', data.id] });
    },
  });
}

export function useDeleteContractTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContractTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
    },
  });
}
