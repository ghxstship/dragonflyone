'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface OKR {
  id: string;
  title: string;
  type: 'objective' | 'key_result';
  parent_id?: string;
  owner: string;
  quarter: string;
  progress: number;
  status: 'not_started' | 'on_track' | 'at_risk' | 'behind' | 'completed';
  description?: string;
  target_value?: number;
  current_value?: number;
  due_date?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export const useOKRs = (filters?: { quarter?: string; owner?: string; type?: string }) => {
  return useQuery({
    queryKey: ['okrs', filters],
    queryFn: async () => {
      let query = supabase
        .from('kpi_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.quarter) {
        query = query.eq('quarter', filters.quarter);
      }
      if (filters?.owner) {
        query = query.eq('owner', filters.owner);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as OKR[];
    },
  });
};

export const useCreateOKR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (okr: Omit<OKR, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('kpi_reports')
        .insert(okr)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
    },
  });
};

export const useUpdateOKR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OKR> & { id: string }) => {
      const { data, error } = await supabase
        .from('kpi_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
    },
  });
};

export const useDeleteOKR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('kpi_reports')
        .delete()
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['okrs'] });
    },
  });
};

// =============================================================================
// QUOTES PAGE HOOKS (API-based)
// =============================================================================

export interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client?: { id: string; name: string; email: string };
  opportunity_name: string;
  title: string;
  total_amount: number;
  status: string;
  valid_until: string;
  line_items_count?: number;
  created_at: string;
  [key: string]: unknown;
}

const DEMO_QUOTES: Quote[] = [
  { id: '1', quote_number: 'QT-2025-001', client_name: 'Acme Corp', opportunity_name: 'Summer Festival', title: 'Event Production', total_amount: 150000, status: 'sent', valid_until: '2025-02-15', created_at: '2025-01-15' },
  { id: '2', quote_number: 'QT-2025-002', client_name: 'TechStart Inc', opportunity_name: 'Product Launch', title: 'Launch Event', total_amount: 75000, status: 'draft', valid_until: '2025-02-28', created_at: '2025-01-20' },
];

export function useQuotesList() {
  return useQuery({
    queryKey: ['quotes-list'],
    queryFn: async () => {
      const response = await fetch('/api/quotes?include_line_items=false');
      if (response.status === 401) {
        return DEMO_QUOTES;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      const data = await response.json();
      return data.quotes || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useQuotesData() {
  const quotesQuery = useQuotesList();

  const quotes = quotesQuery.data || [];
  const totalValue = quotes.reduce((sum: number, q: Quote) => sum + (q.total_amount || 0), 0);
  const pendingCount = quotes.filter((q: Quote) => q.status === 'sent' || q.status === 'viewed').length;

  return {
    quotes,
    totalValue,
    pendingCount,
    isLoading: quotesQuery.isLoading,
    error: quotesQuery.error,
    refetch: quotesQuery.refetch,
  };
}
