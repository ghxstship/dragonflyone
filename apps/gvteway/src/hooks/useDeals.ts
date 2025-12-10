'use client';

import { useQuery } from '@tanstack/react-query';

export interface Deal {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_venue: string;
  event_image?: string;
  original_price: number;
  deal_price: number;
  discount_percent: number;
  deal_type: 'flash_sale' | 'last_minute' | 'early_bird' | 'group' | 'member';
  expires_at?: string;
  quantity_available?: number;
  promo_code?: string;
}

const DEMO_DEALS: Deal[] = [
  { id: '1', event_id: 'e1', event_title: 'Summer Festival 2024', event_date: '2025-07-15', event_venue: 'Central Park', original_price: 150, deal_price: 99, discount_percent: 34, deal_type: 'early_bird', expires_at: new Date(Date.now() + 86400000).toISOString() },
  { id: '2', event_id: 'e2', event_title: 'Jazz Night', event_date: '2025-03-20', event_venue: 'Blue Note', original_price: 75, deal_price: 45, discount_percent: 40, deal_type: 'flash_sale', expires_at: new Date(Date.now() + 3600000).toISOString() },
];

export const dealsKeys = {
  all: ['deals'] as const,
  list: (filters?: { type?: string; sort?: string }) => [...dealsKeys.all, 'list', filters] as const,
};

export function useDealsList(filters?: { type?: string; sort?: string }) {
  return useQuery({
    queryKey: dealsKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters?.sort) {
        params.append('sort', filters.sort);
      }
      const response = await fetch(`/api/deals?${params.toString()}`);
      if (response.status === 401) {
        return DEMO_DEALS;
      }
      if (!response.ok) {
        return DEMO_DEALS;
      }
      const data = await response.json();
      return data.deals || DEMO_DEALS;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useDealsData(filters?: { type?: string; sort?: string }) {
  const dealsQuery = useDealsList(filters);

  return {
    deals: dealsQuery.data || [],
    isLoading: dealsQuery.isLoading,
    error: dealsQuery.error,
    refetch: dealsQuery.refetch,
  };
}
