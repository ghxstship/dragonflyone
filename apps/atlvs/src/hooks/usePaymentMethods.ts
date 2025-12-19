import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  brand?: string;
  last4: string;
  exp_month?: number;
  exp_year?: number;
  bank_name?: string;
  is_default: boolean;
  billing_details: {
    name?: string;
    email?: string;
    address?: {
      line1?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
  created_at: string;
}

async function fetchPaymentMethods(): Promise<{ methods: PaymentMethod[]; total: number }> {
  const response = await fetch('/api/payments/methods');
  if (!response.ok) {
    throw new Error('Failed to fetch payment methods');
  }
  return response.json();
}

async function fetchPaymentMethod(id: string): Promise<PaymentMethod> {
  const response = await fetch(`/api/payments/methods/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch payment method');
  }
  return response.json();
}

async function createPaymentMethod(input: {
  type: 'card' | 'bank_account';
  token: string;
  is_default?: boolean;
}): Promise<PaymentMethod> {
  const response = await fetch('/api/payments/methods', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payment method');
  }
  return response.json();
}

async function setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
  const response = await fetch(`/api/payments/methods/${id}/default`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to set default payment method');
  }
  return response.json();
}

async function deletePaymentMethod(id: string): Promise<void> {
  const response = await fetch(`/api/payments/methods/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete payment method');
  }
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: fetchPaymentMethods,
  });
}

export function usePaymentMethod(id: string) {
  return useQuery({
    queryKey: ['payment-method', id],
    queryFn: () => fetchPaymentMethod(id),
    enabled: !!id,
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setDefaultPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
}
