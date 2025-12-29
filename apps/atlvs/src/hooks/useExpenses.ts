'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// EXPENSES HOOKS
// Manage expenses, reimbursements, and budget tracking for productions
// Event-level roles: Production Manager, Finance Director, Department Heads
// =============================================================================

export interface ExpenseCategory {
  id: string;
  production_id: string;
  name: string;
  description?: string;
  budget_amount?: number;
  parent_category_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  production_id: string;
  category_id?: string;
  submitted_by: string;
  vendor_name?: string;
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  receipt_url?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'reimbursed';
  approved_by?: string;
  approved_at?: string;
  paid_at?: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  category?: ExpenseCategory;
  submitter?: { id: string; first_name: string; last_name: string };
  approver?: { id: string; first_name: string; last_name: string };
}

interface ExpenseFilters {
  productionId?: string;
  categoryId?: string;
  status?: string;
  submittedBy?: string;
  startDate?: string;
  endDate?: string;
}

// Fetch expenses
export function useExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(id, name),
          submitter:contacts!submitted_by(id, first_name, last_name),
          approver:contacts!approved_by(id, first_name, last_name)
        `)
        .order('expense_date', { ascending: false });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.submittedBy) {
        query = query.eq('submitted_by', filters.submittedBy);
      }
      if (filters?.startDate) {
        query = query.gte('expense_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('expense_date', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Expense[];
    },
  });
}

// Fetch single expense
export function useExpense(id: string) {
  return useQuery({
    queryKey: ['expenses', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          category:expense_categories(*),
          submitter:contacts!submitted_by(id, first_name, last_name, email),
          approver:contacts!approved_by(id, first_name, last_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Expense;
    },
    enabled: !!id,
  });
}

// Fetch expense categories
export function useExpenseCategories(productionId?: string) {
  return useQuery({
    queryKey: ['expense_categories', productionId],
    queryFn: async () => {
      let query = supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as ExpenseCategory[];
    },
  });
}

// Create expense
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'category' | 'submitter' | 'approver'>) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

// Update expense
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.id] });
    },
  });
}

// Submit expense for approval
export function useSubmitExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({ status: 'submitted' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses', id] });
    },
  });
}

// Approve expense
export function useApproveExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approverId }: { id: string; approverId: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          status: 'approved',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.id] });
    },
  });
}

// Reject expense
export function useRejectExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          status: 'rejected',
          notes: reason,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.id] });
    },
  });
}

// Mark expense as paid
export function useMarkExpensePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, paymentMethod, paymentReference }: { id: string; paymentMethod?: string; paymentReference?: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method: paymentMethod,
          payment_reference: paymentReference,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses', variables.id] });
    },
  });
}

// Create expense category
export function useCreateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<ExpenseCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('expense_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_categories'] });
    },
  });
}

// Update expense category
export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExpenseCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('expense_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense_categories'] });
    },
  });
}

// Delete expense
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

// Get expense statistics
export function useExpenseStats(productionId?: string) {
  return useQuery({
    queryKey: ['expenses', 'stats', productionId],
    queryFn: async () => {
      let query = supabase.from('expenses').select('status, amount, category_id');
      
      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const expenses = data || [];
      return {
        total: expenses.length,
        totalAmount: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
        pending: expenses.filter(e => e.status === 'submitted').length,
        pendingAmount: expenses.filter(e => e.status === 'submitted').reduce((sum, e) => sum + (e.amount || 0), 0),
        approved: expenses.filter(e => e.status === 'approved').length,
        approvedAmount: expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.amount || 0), 0),
        paid: expenses.filter(e => e.status === 'paid' || e.status === 'reimbursed').length,
        paidAmount: expenses.filter(e => e.status === 'paid' || e.status === 'reimbursed').reduce((sum, e) => sum + (e.amount || 0), 0),
        rejected: expenses.filter(e => e.status === 'rejected').length,
      };
    },
  });
}
