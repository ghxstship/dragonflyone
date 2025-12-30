'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// MY INVOICES HOOKS
// Manage vendor/crew invoices
// =============================================================================

export interface Invoice {
  id: string;
  production: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'paid' | 'overdue';
  items: { description: string; quantity: number; rate: number }[];
}

// Fetch my invoices
export function useMyInvoices() {
  return useQuery({
    queryKey: ['my-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('docs_profile_invoice')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(i => ({
        id: i.id,
        production: i.notes || `Invoice ${i.invoice_number || i.id?.substring(0, 8)}`,
        amount: i.total_amount || 0,
        date: i.issue_date || i.created_at?.split('T')[0] || '',
        dueDate: i.due_date || '',
        status: (i.status || 'draft') as Invoice['status'],
        items: [],
      })) as Invoice[];
    },
  });
}
