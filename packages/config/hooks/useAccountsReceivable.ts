import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ARInvoice {
  id: string;
  invoiceNumber: string;
  client: string;
  clientEmail: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Paid' | 'Overdue' | 'Partial';
  paidAmount: number;
  project?: string;
  daysPastDue?: number;
}

const API_BASE = '/api/finance/accounts-receivable';

async function fetchInvoices(params?: {
  status?: string;
}): Promise<ARInvoice[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch invoices');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    invoiceNumber: item.invoice_number as string || item.invoiceNumber as string,
    client: item.client as string || ((item.client_data as Record<string, unknown>)?.name as string) || 'Unknown',
    clientEmail: item.client_email as string || ((item.client_data as Record<string, unknown>)?.email as string) || '',
    amount: item.amount as number || 0,
    dueDate: item.due_date as string || item.dueDate as string || '',
    issueDate: item.issue_date as string || item.issueDate as string || '',
    status: item.status as ARInvoice['status'] || 'Draft',
    paidAmount: item.paid_amount as number || 0,
    project: item.project as string || ((item.project_data as Record<string, unknown>)?.name as string),
    daysPastDue: item.days_past_due as number,
  }));
}

async function updateInvoiceStatus(id: string, status: string, paidAmount?: number): Promise<ARInvoice> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, paid_amount: paidAmount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update invoice');
  }

  const { data } = await response.json();
  return data;
}

async function deleteInvoices(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete invoices');
  }
}

async function sendReminders(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk-reminder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send reminders');
  }
}

export function useARInvoicesQuery(params?: { status?: string }) {
  return useQuery({
    queryKey: ['ar-invoices', params],
    queryFn: () => fetchInvoices(params),
    staleTime: 60000,
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, paidAmount }: { id: string; status: string; paidAmount?: number }) =>
      updateInvoiceStatus(id, status, paidAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ar-invoices'] });
    },
  });
}

export function useDeleteInvoices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ar-invoices'] });
    },
  });
}

export function useSendReminders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendReminders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ar-invoices'] });
    },
  });
}

export function useAccountsReceivable() {
  const invoicesQuery = useARInvoicesQuery();
  const updateStatusMutation = useUpdateInvoiceStatus();
  const deleteMutation = useDeleteInvoices();
  const remindersMutation = useSendReminders();

  return {
    invoices: invoicesQuery.data || [],
    isLoading: invoicesQuery.isLoading,
    error: invoicesQuery.error,
    refetch: invoicesQuery.refetch,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
    deleteInvoices: deleteMutation.mutate,
    deleteInvoicesAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    sendReminders: remindersMutation.mutate,
    sendRemindersAsync: remindersMutation.mutateAsync,
    isSendingReminders: remindersMutation.isPending,
  };
}
