import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  description?: string;
  is_default: boolean;
  is_active: boolean;
  applies_to: 'all' | 'services' | 'products' | 'venue' | 'catering';
  jurisdiction?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaxRateInput {
  name: string;
  rate: number;
  description?: string;
  is_default?: boolean;
  is_active?: boolean;
  applies_to?: TaxRate['applies_to'];
  jurisdiction?: string;
}

export interface UpdateTaxRateInput extends Partial<CreateTaxRateInput> {
  id: string;
}

async function fetchTaxRates(filters?: { active_only?: boolean }): Promise<{ tax_rates: TaxRate[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.active_only) {
    params.set('active_only', 'true');
  }

  const response = await fetch(`/api/tax-rates?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tax rates');
  }
  return response.json();
}

async function fetchTaxRate(id: string): Promise<TaxRate> {
  const response = await fetch(`/api/tax-rates/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tax rate');
  }
  return response.json();
}

async function createTaxRate(input: CreateTaxRateInput): Promise<TaxRate> {
  const response = await fetch('/api/tax-rates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create tax rate');
  }
  return response.json();
}

async function updateTaxRate({ id, ...input }: UpdateTaxRateInput): Promise<TaxRate> {
  const response = await fetch(`/api/tax-rates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update tax rate');
  }
  return response.json();
}

async function deleteTaxRate(id: string): Promise<void> {
  const response = await fetch(`/api/tax-rates/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete tax rate');
  }
}

export function useTaxRates(filters?: { active_only?: boolean }) {
  return useQuery({
    queryKey: ['tax-rates', filters],
    queryFn: () => fetchTaxRates(filters),
  });
}

export function useTaxRate(id: string) {
  return useQuery({
    queryKey: ['tax-rate', id],
    queryFn: () => fetchTaxRate(id),
    enabled: !!id,
  });
}

export function useCreateTaxRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTaxRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-rates'] });
    },
  });
}

export function useUpdateTaxRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTaxRate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tax-rates'] });
      queryClient.invalidateQueries({ queryKey: ['tax-rate', data.id] });
    },
  });
}

export function useDeleteTaxRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTaxRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-rates'] });
    },
  });
}
