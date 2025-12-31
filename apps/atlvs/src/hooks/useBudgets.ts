'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Json } from '@ghxstship/config/supabase-types';

export interface Budget {
  id: string;
  organization_id: string;
  name: string;
  project_id?: string | null;
  department_id?: string | null;
  fiscal_year?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  total_amount: number;
  currency?: string | null;
  status?: 'draft' | 'active' | 'closed' | null;
  notes?: string | null;
  metadata?: Json;
  created_at: string;
  updated_at: string;
}

interface BudgetFilters {
  fiscal_year?: number;
  status?: string;
  project_id?: string;
  department_id?: string;
}

// Fetch all budgets
export function useBudgets(filters?: BudgetFilters) {
  return useQuery({
    queryKey: ['budgets', filters],
    queryFn: async () => {
      let query = supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.fiscal_year) {
        query = query.eq('fiscal_year', filters.fiscal_year);
      }
      if (filters?.department_id) {
        query = query.eq('department_id', filters.department_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Budget[];
    },
  });
}

// Fetch single budget
export function useBudget(id: string) {
  return useQuery({
    queryKey: ['budgets', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Budget;
    },
    enabled: !!id,
  });
}

// Create budget
export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('budgets')
        .insert(budget)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

// Update budget
export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Budget> & { id: string }) => {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

// Delete budget
export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
