'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

// Types
export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  project_id?: string;
  project_name?: string;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  issue_date: string;
  due_date: string;
  status: string;
  notes?: string;
}

// Demo data
const DEMO_INVOICES: Invoice[] = [
  {
    id: '1',
    invoice_number: 'INV-2025-001',
    client_id: '1',
    client_name: 'Acme Corp',
    project_id: '1',
    project_name: 'Summer Festival 2025',
    total_amount: 50000,
    amount_paid: 25000,
    amount_due: 25000,
    issue_date: '2025-01-15',
    due_date: '2025-02-15',
    status: 'partial',
  },
  {
    id: '2',
    invoice_number: 'INV-2025-002',
    client_id: '2',
    client_name: 'TechStart Inc',
    project_id: '2',
    project_name: 'Product Launch Event',
    total_amount: 15000,
    amount_paid: 15000,
    amount_due: 0,
    issue_date: '2025-01-10',
    due_date: '2025-02-10',
    status: 'paid',
  },
];

// Query keys
export const invoiceKeys = {
  all: ['invoices'] as const,
  list: () => [...invoiceKeys.all, 'list'] as const,
  detail: (id: string) => [...invoiceKeys.all, 'detail', id] as const,
};

// Fetch functions
async function fetchInvoices(): Promise<Invoice[]> {
  const response = await fetch('/api/invoices');
  if (response.status === 401) {
    return DEMO_INVOICES;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }
  const data = await response.json();
  return data.invoices || [];
}

// Mutation functions
async function createInvoice(data: Record<string, unknown>): Promise<Invoice> {
  const response = await fetch('/api/invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create invoice');
  }
  return response.json();
}

async function sendInvoice(invoiceId: string): Promise<void> {
  const response = await fetch(`/api/invoices/${invoiceId}/send`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to send invoice');
  }
}

async function deleteInvoice(invoiceId: string): Promise<void> {
  const response = await fetch(`/api/invoices/${invoiceId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete invoice');
  }
}

async function sendReminder(invoiceId: string): Promise<void> {
  const response = await fetch(`/api/invoices/${invoiceId}/remind`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to send reminder');
  }
}

// Hooks
export function useInvoices() {
  return useQuery({
    queryKey: invoiceKeys.list(),
    queryFn: fetchInvoices,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
    onError: (error) => {
      log.error('Failed to create invoice:', error);
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
    onError: (error) => {
      log.error('Failed to send invoice:', error);
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
    onError: (error) => {
      log.error('Failed to delete invoice:', error);
    },
  });
}

export function useSendReminder() {
  return useMutation({
    mutationFn: sendReminder,
    onError: (error) => {
      log.error('Failed to send reminder:', error);
    },
  });
}

// Combined hook
export function useInvoicesData() {
  const invoicesQuery = useInvoices();
  const createInvoiceMutation = useCreateInvoice();
  const sendInvoiceMutation = useSendInvoice();
  const deleteInvoiceMutation = useDeleteInvoice();
  const sendReminderMutation = useSendReminder();

  return {
    // Data
    invoices: invoicesQuery.data || [],

    // Loading states
    isLoading: invoicesQuery.isLoading,
    error: invoicesQuery.error,

    // Mutations
    createInvoice: createInvoiceMutation.mutateAsync,
    isCreating: createInvoiceMutation.isPending,

    sendInvoice: sendInvoiceMutation.mutateAsync,
    isSending: sendInvoiceMutation.isPending,

    deleteInvoice: deleteInvoiceMutation.mutateAsync,
    isDeleting: deleteInvoiceMutation.isPending,

    sendReminder: sendReminderMutation.mutateAsync,
    isSendingReminder: sendReminderMutation.isPending,

    // Refetch
    refetch: invoicesQuery.refetch,
  };
}
