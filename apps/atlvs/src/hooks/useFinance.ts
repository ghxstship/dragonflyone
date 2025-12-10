'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  amount: number;
  date: string;
  description?: string;
  account_id?: string;
  vendor_id?: string;
  project_id?: string;
  status: 'pending' | 'completed' | 'cancelled';
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialAccount {
  id: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  currency: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export const useTransactions = (filters?: { 
  type?: string; 
  category?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Transaction[];
    },
  });
};

export const useAccounts = () => {
  return useQuery({
    queryKey: ['financial-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_accounts')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as unknown as FinancialAccount[];
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-accounts'] });
    },
  });
};

// Ledger entries for finance page
export interface LedgerTransaction {
  id: string;
  type: string;
  entity: string;
  amount: number;
  status: string;
  date: string;
}

const DEMO_LEDGER: LedgerTransaction[] = [
  { id: 'TXN-001', type: 'Invoice', entity: 'Acme Corp', amount: 15000, status: 'Paid', date: '2025-01-15' },
  { id: 'TXN-002', type: 'Expense', entity: 'Equipment Rental', amount: -5000, status: 'Approved', date: '2025-01-14' },
  { id: 'TXN-003', type: 'Invoice', entity: 'TechStart Inc', amount: 8500, status: 'Pending', date: '2025-01-13' },
];

export const useLedgerEntries = () => {
  return useQuery({
    queryKey: ['ledger-entries'],
    queryFn: async () => {
      const { data: ledger, error } = await supabase
        .from('ledger_entries')
        .select(`id, amount, side, entry_date, memo, ledger_accounts(name, account_type)`)
        .order('entry_date', { ascending: false })
        .limit(50);

      if (error) {
        // Return demo data on error
        return DEMO_LEDGER;
      }

      interface LedgerEntry { 
        id: string; 
        side: string; 
        memo?: string; 
        ledger_accounts?: { name?: string }; 
        amount: string | number; 
        entry_date: string;
      }

      return ledger?.map((entry: LedgerEntry) => ({
        id: entry.id.substring(0, 8).toUpperCase(),
        type: entry.side === 'credit' ? 'Invoice' : 'Expense',
        entity: entry.memo || entry.ledger_accounts?.name || 'N/A',
        amount: entry.side === 'credit' ? parseFloat(String(entry.amount)) : -parseFloat(String(entry.amount)),
        status: entry.side === 'credit' ? 'Paid' : 'Approved',
        date: entry.entry_date,
      })) || DEMO_LEDGER;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export function useLedgerData() {
  const ledgerQuery = useLedgerEntries();

  const transactions = ledgerQuery.data || [];
  const totalRevenue = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const netProfit = totalRevenue - totalExpenses;

  return {
    transactions,
    totalRevenue,
    totalExpenses,
    netProfit,
    isLoading: ledgerQuery.isLoading,
    error: ledgerQuery.error,
    refetch: ledgerQuery.refetch,
  };
}
