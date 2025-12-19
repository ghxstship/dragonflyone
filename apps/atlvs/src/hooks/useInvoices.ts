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

// Query keys
export const invoiceKeys = {
  all: ['invoices'] as const,
  list: () => [...invoiceKeys.all, 'list'] as const,
  detail: (id: string) => [...invoiceKeys.all, 'detail', id] as const,
};

// Fetch functions
async function fetchInvoices(): Promise<Invoice[]> {
  const response = await fetch('/api/invoices');
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch invoices' }));
    throw new Error(error.error || 'Failed to fetch invoices');
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

async function fetchInvoice(id: string): Promise<Invoice> {
  const response = await fetch(`/api/invoices/${id}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch invoice' }));
    throw new Error(error.error || 'Failed to fetch invoice');
  }
  const data = await response.json();
  return data.invoice || data;
}

interface RecordPaymentInput {
  invoice_id: string;
  amount: number;
  payment_method: string;
  reference?: string;
}

async function recordPayment(input: RecordPaymentInput): Promise<void> {
  const response = await fetch(`/api/invoices/${input.invoice_id}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Failed to record payment');
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

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => fetchInvoice(id),
    enabled: !!id,
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

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordPayment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(variables.invoice_id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
    },
    onError: (error) => {
      log.error('Failed to record payment:', error);
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
