'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  commission_rate: number;
  commission_type: 'percentage' | 'fixed';
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  total_sales: number;
  total_revenue: number;
  total_commission: number;
  clicks: number;
  conversions: number;
  conversion_rate: number;
  payout_method?: 'paypal' | 'bank_transfer' | 'check';
  payout_email?: string;
  last_payout_date?: string;
  pending_payout: number;
  created_at: string;
  updated_at: string;
}

const DEMO_AFFILIATES: Affiliate[] = [
  {
    id: 'AFF-001',
    name: 'Sarah Music Blog',
    email: 'sarah@musicblog.com',
    code: 'SARAH10',
    commission_rate: 10,
    commission_type: 'percentage',
    status: 'active',
    total_sales: 156,
    total_revenue: 23400,
    total_commission: 2340,
    clicks: 4520,
    conversions: 156,
    conversion_rate: 3.45,
    payout_method: 'paypal',
    payout_email: 'sarah@musicblog.com',
    last_payout_date: '2024-11-01',
    pending_payout: 840,
    created_at: '2024-06-15T10:00:00Z',
    updated_at: '2024-11-22T10:00:00Z',
  },
  {
    id: 'AFF-002',
    name: 'Festival Life YouTube',
    email: 'contact@festlife.com',
    code: 'FESTLIFE',
    commission_rate: 15,
    commission_type: 'percentage',
    status: 'active',
    total_sales: 289,
    total_revenue: 43350,
    total_commission: 6502,
    clicks: 12400,
    conversions: 289,
    conversion_rate: 2.33,
    payout_method: 'bank_transfer',
    last_payout_date: '2024-11-15',
    pending_payout: 1502,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-11-20T10:00:00Z',
  },
  {
    id: 'AFF-003',
    name: 'EDM Weekly',
    email: 'partner@edmweekly.com',
    code: 'EDM20',
    commission_rate: 20,
    commission_type: 'fixed',
    status: 'active',
    total_sales: 78,
    total_revenue: 11700,
    total_commission: 1560,
    clicks: 2100,
    conversions: 78,
    conversion_rate: 3.71,
    payout_method: 'paypal',
    payout_email: 'payments@edmweekly.com',
    pending_payout: 560,
    created_at: '2024-08-20T10:00:00Z',
    updated_at: '2024-11-18T10:00:00Z',
  },
  {
    id: 'AFF-004',
    name: 'Concert Deals',
    email: 'info@concertdeals.com',
    code: 'DEALS15',
    commission_rate: 15,
    commission_type: 'percentage',
    status: 'pending',
    total_sales: 0,
    total_revenue: 0,
    total_commission: 0,
    clicks: 0,
    conversions: 0,
    conversion_rate: 0,
    pending_payout: 0,
    created_at: '2024-11-20T10:00:00Z',
    updated_at: '2024-11-20T10:00:00Z',
  },
];

export const affiliateKeys = {
  all: ['affiliates'] as const,
  list: (filters?: Record<string, string>) => [...affiliateKeys.all, 'list', filters] as const,
  detail: (id: string) => [...affiliateKeys.all, 'detail', id] as const,
};

interface FetchAffiliatesParams {
  status?: string;
  page?: number;
  limit?: number;
}

async function fetchAffiliates(params?: FetchAffiliatesParams): Promise<{ data: Affiliate[]; pagination: { total: number; page: number; limit: number } }> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`/api/marketing/affiliates?${searchParams.toString()}`);
  
  if (response.status === 401 || response.status === 404) {
    let filtered = DEMO_AFFILIATES;
    if (params?.status) {
      filtered = DEMO_AFFILIATES.filter(a => a.status === params.status);
    }
    return { data: filtered, pagination: { total: filtered.length, page: 1, limit: 20 } };
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch affiliates');
  }
  
  return response.json();
}

interface CreateAffiliateData {
  name: string;
  email: string;
  code: string;
  commission_rate: number;
  commission_type: 'percentage' | 'fixed';
}

async function createAffiliate(data: CreateAffiliateData): Promise<Affiliate> {
  const response = await fetch('/api/marketing/affiliates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'Failed to create affiliate');
  }
  
  const result = await response.json();
  return result.data;
}

async function updateAffiliate({ id, ...data }: Partial<Affiliate> & { id: string }): Promise<void> {
  const response = await fetch(`/api/marketing/affiliates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update affiliate');
  }
}

async function deleteAffiliate(id: string): Promise<void> {
  const response = await fetch(`/api/marketing/affiliates/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete affiliate');
  }
}

export function useAffiliates(params?: FetchAffiliatesParams) {
  return useQuery({
    queryKey: affiliateKeys.list(params as Record<string, string>),
    queryFn: () => fetchAffiliates(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAffiliate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAffiliate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateKeys.all });
    },
    onError: (error) => {
      log.error('Failed to create affiliate:', error);
    },
  });
}

export function useUpdateAffiliate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAffiliate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateKeys.all });
    },
    onError: (error) => {
      log.error('Failed to update affiliate:', error);
    },
  });
}

export function useDeleteAffiliate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAffiliate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateKeys.all });
    },
    onError: (error) => {
      log.error('Failed to delete affiliate:', error);
    },
  });
}

export function useAffiliatesData(params?: FetchAffiliatesParams) {
  const affiliatesQuery = useAffiliates(params);
  const createMutation = useCreateAffiliate();
  const updateMutation = useUpdateAffiliate();
  const deleteMutation = useDeleteAffiliate();

  return {
    affiliates: affiliatesQuery.data?.data || [],
    pagination: affiliatesQuery.data?.pagination,
    isLoading: affiliatesQuery.isLoading,
    error: affiliatesQuery.error,
    
    createAffiliate: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    
    updateAffiliate: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    
    deleteAffiliate: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    
    refetch: affiliatesQuery.refetch,
  };
}
