import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal' | 'apple_pay' | 'google_pay';
  is_default: boolean;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
  };
  bank_account?: {
    bank_name: string;
    account_type: 'checking' | 'savings';
    last4: string;
    routing_number_last4: string;
  };
  billing_address?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
}

export interface SetupIntent {
  client_secret: string;
  status: string;
}

async function fetchPaymentMethods(): Promise<{ payment_methods: PaymentMethod[] }> {
  const response = await fetch('/api/user/payment-methods');
  if (!response.ok) {
    throw new Error('Failed to fetch payment methods');
  }
  return response.json();
}

async function createSetupIntent(): Promise<SetupIntent> {
  const response = await fetch('/api/user/payment-methods/setup-intent', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to create setup intent');
  }
  return response.json();
}

async function addPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
  const response = await fetch('/api/user/payment-methods', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payment_method_id: paymentMethodId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add payment method');
  }
  return response.json();
}

async function setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
  const response = await fetch(`/api/user/payment-methods/${id}/default`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to set default');
  }
  return response.json();
}

async function deletePaymentMethod(id: string): Promise<void> {
  const response = await fetch(`/api/user/payment-methods/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete payment method');
  }
}

async function updateBillingAddress(input: { paymentMethodId: string; address: PaymentMethod['billing_address'] }): Promise<PaymentMethod> {
  const response = await fetch(`/api/user/payment-methods/${input.paymentMethodId}/billing-address`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input.address),
  });
  if (!response.ok) {
    throw new Error('Failed to update billing address');
  }
  return response.json();
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: fetchPaymentMethods,
  });
}

export function useCreateSetupIntent() {
  return useMutation({
    mutationFn: createSetupIntent,
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPaymentMethod,
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

export function useUpdateBillingAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBillingAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
  });
}
