import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ContractClause {
  id: string;
  name: string;
  category: 'general' | 'liability' | 'payment' | 'cancellation' | 'force_majeure' | 'confidentiality' | 'indemnification' | 'custom';
  content: string;
  description?: string;
  variables?: string[];
  is_default: boolean;
  is_required: boolean;
  order_index: number;
  organization_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClauseInput {
  name: string;
  category: ContractClause['category'];
  content: string;
  description?: string;
  variables?: string[];
  is_default?: boolean;
  is_required?: boolean;
  order_index?: number;
}

export interface UpdateClauseInput extends Partial<CreateClauseInput> {
  id: string;
}

async function fetchClauses(category?: string): Promise<{ clauses: ContractClause[]; grouped: Record<string, ContractClause[]>; total: number }> {
  const url = category ? `/api/contract-clauses?category=${category}` : '/api/contract-clauses';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch clauses');
  }
  return response.json();
}

async function fetchClause(id: string): Promise<ContractClause> {
  const response = await fetch(`/api/contract-clauses/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch clause');
  }
  return response.json();
}

async function createClause(input: CreateClauseInput): Promise<ContractClause> {
  const response = await fetch('/api/contract-clauses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create clause');
  }
  return response.json();
}

async function updateClause({ id, ...input }: UpdateClauseInput): Promise<ContractClause> {
  const response = await fetch(`/api/contract-clauses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update clause');
  }
  return response.json();
}

async function deleteClause(id: string): Promise<void> {
  const response = await fetch(`/api/contract-clauses/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete clause');
  }
}

export function useContractClauses(category?: string) {
  return useQuery({
    queryKey: ['contract-clauses', category],
    queryFn: () => fetchClauses(category),
  });
}

export function useContractClause(id: string) {
  return useQuery({
    queryKey: ['contract-clause', id],
    queryFn: () => fetchClause(id),
    enabled: !!id,
  });
}

export function useCreateContractClause() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClause,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-clauses'] });
    },
  });
}

export function useUpdateContractClause() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClause,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contract-clauses'] });
      queryClient.invalidateQueries({ queryKey: ['contract-clause', data.id] });
    },
  });
}

export function useDeleteContractClause() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClause,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-clauses'] });
    },
  });
}
