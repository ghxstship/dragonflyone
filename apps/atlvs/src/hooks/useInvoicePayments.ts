import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  payment_id: string;
  amount: number;
  applied_at: string;
  payment?: {
    id: string;
    amount: number;
    payment_method: string;
    status: string;
    payment_date: string;
  };
}

export interface ApplyPaymentInput {
  invoice_id: string;
  amount: number;
  payment_method: 'card' | 'bank' | 'cash' | 'check' | 'wire';
  reference_number?: string;
  notes?: string;
}

async function fetchInvoicePayments(invoiceId: string): Promise<{ payments: InvoicePayment[]; total_applied: number }> {
  const response = await fetch(`/api/invoices/${invoiceId}/payments`);
  if (!response.ok) {
    throw new Error('Failed to fetch invoice payments');
  }
  return response.json();
}

async function applyPaymentToInvoice(input: ApplyPaymentInput): Promise<InvoicePayment> {
  const response = await fetch(`/api/invoices/${input.invoice_id}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to apply payment');
  }
  return response.json();
}

async function removePaymentFromInvoice({ invoiceId, paymentId }: { invoiceId: string; paymentId: string }): Promise<void> {
  const response = await fetch(`/api/invoices/${invoiceId}/payments/${paymentId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove payment');
  }
}

export function useInvoicePayments(invoiceId: string) {
  return useQuery({
    queryKey: ['invoice-payments', invoiceId],
    queryFn: () => fetchInvoicePayments(invoiceId),
    enabled: !!invoiceId,
  });
}

export function useApplyPaymentToInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyPaymentToInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoice-payments', data.invoice_id] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.invoice_id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

export function useRemovePaymentFromInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removePaymentFromInvoice,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice-payments', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
}
