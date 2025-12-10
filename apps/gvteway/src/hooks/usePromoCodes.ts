'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

// Types
export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string;
  event_id: string | null;
  event_title?: string;
  status: 'active' | 'expired' | 'disabled';
  min_purchase?: number;
  created_at: string;
}

// Demo data
const DEMO_PROMO_CODES: PromoCode[] = [
  {
    id: '1',
    code: 'SUMMER2025',
    discount_type: 'percentage',
    discount_value: 20,
    max_uses: 100,
    current_uses: 45,
    valid_from: '2025-06-01',
    valid_until: '2025-08-31',
    event_id: null,
    status: 'active',
    min_purchase: 50,
    created_at: '2025-05-15',
  },
  {
    id: '2',
    code: 'EARLYBIRD',
    discount_type: 'fixed',
    discount_value: 10,
    max_uses: 50,
    current_uses: 50,
    valid_from: '2025-01-01',
    valid_until: '2025-03-31',
    event_id: '1',
    event_title: 'Summer Festival 2025',
    status: 'expired',
    created_at: '2025-01-01',
  },
];

// Query keys
export const promoCodeKeys = {
  all: ['promo-codes'] as const,
  list: () => [...promoCodeKeys.all, 'list'] as const,
  detail: (id: string) => [...promoCodeKeys.all, 'detail', id] as const,
};

// Fetch functions
async function fetchPromoCodes(): Promise<PromoCode[]> {
  const response = await fetch('/api/admin/promo-codes');
  if (response.status === 401) {
    return DEMO_PROMO_CODES;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch promo codes');
  }
  const data = await response.json();
  return data.promo_codes || [];
}

// Mutation functions
interface CreatePromoCodeData {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: string;
  valid_until: string;
  max_uses?: number | null;
  min_purchase?: number | null;
}

async function createPromoCode(data: CreatePromoCodeData): Promise<PromoCode> {
  const response = await fetch('/api/admin/promo-codes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Failed to create promo code');
  }
  return response.json();
}

interface UpdatePromoCodeData {
  id: string;
  status?: 'active' | 'disabled';
}

async function updatePromoCode({ id, ...data }: UpdatePromoCodeData): Promise<void> {
  const response = await fetch(`/api/admin/promo-codes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update promo code');
  }
}

async function deletePromoCode(id: string): Promise<void> {
  const response = await fetch(`/api/admin/promo-codes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete promo code');
  }
}

// Hooks
export function usePromoCodes() {
  return useQuery({
    queryKey: promoCodeKeys.list(),
    queryFn: fetchPromoCodes,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promoCodeKeys.all });
    },
    onError: (error) => {
      log.error('Failed to create promo code:', error);
    },
  });
}

export function useUpdatePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promoCodeKeys.all });
    },
    onError: (error) => {
      log.error('Failed to update promo code:', error);
    },
  });
}

export function useDeletePromoCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promoCodeKeys.all });
    },
    onError: (error) => {
      log.error('Failed to delete promo code:', error);
    },
  });
}

// Combined hook
export function usePromoCodesData() {
  const promoCodesQuery = usePromoCodes();
  const createMutation = useCreatePromoCode();
  const updateMutation = useUpdatePromoCode();
  const deleteMutation = useDeletePromoCode();

  return {
    // Data
    promoCodes: promoCodesQuery.data || [],

    // Loading states
    isLoading: promoCodesQuery.isLoading,
    error: promoCodesQuery.error,

    // Mutations
    createPromoCode: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updatePromoCode: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deletePromoCode: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    // Refetch
    refetch: promoCodesQuery.refetch,
  };
}
