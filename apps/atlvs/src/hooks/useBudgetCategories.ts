'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface BudgetCategory {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description?: string;
  budget_count: number;
  total_budgeted: number;
  total_actual: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface BudgetCategoryFilters {
  organization_id?: string;
}

export function useBudgetCategories(filters?: BudgetCategoryFilters) {
  return useQuery({
    queryKey: ['budget-categories', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);

      const response = await fetch(`/api/budgets/categories?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch budget categories');
      }
      const data = await response.json();
      return data.categories || [];
    },
  });
}

export function useBudgetCategory(id: string) {
  return useQuery({
    queryKey: ['budget-categories', id],
    queryFn: async () => {
      const response = await fetch(`/api/budgets/categories/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch budget category');
      }
      const data = await response.json();
      return data.category;
    },
    enabled: !!id,
  });
}

interface CreateBudgetCategoryInput {
  organization_id: string;
  code: string;
  name: string;
  description?: string;
}

export function useCreateBudgetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBudgetCategoryInput) => {
      const response = await fetch('/api/budgets/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create budget category');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
    },
  });
}

export function useUpdateBudgetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BudgetCategory> & { id: string }) => {
      const response = await fetch(`/api/budgets/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update budget category');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
      queryClient.invalidateQueries({ queryKey: ['budget-categories', variables.id] });
    },
  });
}

export function useDeleteBudgetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/budgets/categories/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete budget category');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
    },
  });
}
