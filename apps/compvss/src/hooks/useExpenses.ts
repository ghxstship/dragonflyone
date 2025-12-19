'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Expense {
  id: string;
  expense_number: string;
  project_id: string;
  project_name: string;
  crew_member_id: string;
  crew_member_name: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  receipt_url?: string;
  expense_date: string;
  submitted_date: string;
  status: string;
  approved_by?: string;
  approved_date?: string;
  notes?: string;
}

export interface ExpenseSummary {
  total_expenses: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  total_amount: number;
  pending_amount: number;
  approved_amount: number;
}

const DEFAULT_SUMMARY: ExpenseSummary = {
  total_expenses: 0,
  pending_count: 0,
  approved_count: 0,
  rejected_count: 0,
  total_amount: 0,
  pending_amount: 0,
  approved_amount: 0,
};

export const expenseKeys = {
  all: ['expenses'] as const,
  list: () => [...expenseKeys.all, 'list'] as const,
};

export function useExpensesList() {
  return useQuery({
    queryKey: expenseKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/expenses');
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      const data = await response.json();
      return {
        expenses: data.expenses || [],
        summary: data.summary || DEFAULT_SUMMARY,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create expense');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useUpdateExpenseStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update expense');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useExpensesData() {
  const expensesQuery = useExpensesList();
  const createMutation = useCreateExpense();
  const updateStatusMutation = useUpdateExpenseStatus();

  const data = expensesQuery.data || { expenses: [], summary: DEFAULT_SUMMARY };

  return {
    expenses: data.expenses,
    summary: data.summary,
    isLoading: expensesQuery.isLoading,
    error: expensesQuery.error,
    createExpense: createMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    refetch: expensesQuery.refetch,
  };
}
