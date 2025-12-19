import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PromoCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_item';
  discount_value: number;
  currency?: string;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  applicable_to: 'all' | 'specific_events' | 'specific_ticket_types' | 'specific_categories';
  applicable_ids?: string[];
  usage_limit?: number;
  usage_count: number;
  per_customer_limit?: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive' | 'expired' | 'depleted';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PromoCodeValidation {
  valid: boolean;
  promo_code?: PromoCode;
  error_code?: 'invalid' | 'expired' | 'depleted' | 'min_not_met' | 'not_applicable' | 'limit_reached';
  error_message?: string;
  discount_amount?: number;
  final_price?: number;
}

export interface CreatePromoCodeInput {
  code: string;
  name: string;
  description?: string;
  discount_type: PromoCode['discount_type'];
  discount_value: number;
  currency?: string;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  applicable_to: PromoCode['applicable_to'];
  applicable_ids?: string[];
  usage_limit?: number;
  per_customer_limit?: number;
  start_date: string;
  end_date: string;
}

async function fetchPromoCodes(filters?: { status?: PromoCode['status']; eventId?: string }): Promise<{
  promo_codes: PromoCode[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.eventId) params.set('event_id', filters.eventId);

  const response = await fetch(`/api/promo-codes?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch promo codes');
  }
  return response.json();
}

async function validatePromoCode(input: {
  code: string;
  eventId?: string;
  ticketTypeId?: string;
  amount: number;
  customerId?: string;
}): Promise<PromoCodeValidation> {
  const response = await fetch('/api/promo-codes/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Failed to validate promo code');
  }
  return response.json();
}

async function createPromoCode(input: CreatePromoCodeInput): Promise<PromoCode> {
  const response = await fetch('/api/promo-codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create promo code');
  }
  return response.json();
}

async function updatePromoCode(input: { id: string } & Partial<CreatePromoCodeInput>): Promise<PromoCode> {
  const { id, ...data } = input;
  const response = await fetch(`/api/promo-codes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update promo code');
  }
  return response.json();
}

async function deletePromoCode(id: string): Promise<void> {
  const response = await fetch(`/api/promo-codes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete promo code');
  }
}

export function usePromoCodes(filters?: { status?: PromoCode['status']; eventId?: string }) {
  return useQuery({
    queryKey: ['promo-codes', filters],
    queryFn: () => fetchPromoCodes(filters),
  });
}

export function useValidatePromoCode() {
  return useMutation({
    mutationFn: validatePromoCode,
  });
}

export function useCreatePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });
}

export function useUpdatePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });
}

export function useDeletePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });
}
