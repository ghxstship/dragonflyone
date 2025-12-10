'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ResaleListing {
  id: string;
  ticket_id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  ticket_type: string;
  section?: string;
  row?: string;
  seat?: string;
  original_price: number;
  asking_price: number;
  seller_id: string;
  seller_name: string;
  status: string;
  listed_at: string;
  expires_at?: string;
  [key: string]: unknown;
}

const DEMO_LISTINGS: ResaleListing[] = [
  { id: '1', ticket_id: 't1', event_id: 'e1', event_name: 'Summer Festival 2024', event_date: '2025-07-15', venue_name: 'Central Park', ticket_type: 'VIP', section: 'A', row: '1', seat: '5', original_price: 150, asking_price: 175, seller_id: 's1', seller_name: 'John D.', status: 'active', listed_at: new Date().toISOString() },
  { id: '2', ticket_id: 't2', event_id: 'e2', event_name: 'Jazz Night', event_date: '2025-03-20', venue_name: 'Blue Note', ticket_type: 'GA', original_price: 45, asking_price: 55, seller_id: 's2', seller_name: 'Sarah M.', status: 'active', listed_at: new Date(Date.now() - 86400000).toISOString() },
];

export const resaleKeys = {
  all: ['resale'] as const,
  list: () => [...resaleKeys.all, 'list'] as const,
};

export function useResaleListings() {
  return useQuery({
    queryKey: resaleKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/resale');
      if (response.status === 401) {
        return DEMO_LISTINGS;
      }
      if (!response.ok) {
        return DEMO_LISTINGS;
      }
      const data = await response.json();
      return data.listings || DEMO_LISTINGS;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function usePurchaseResaleListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      const response = await fetch(`/api/resale/${listingId}/purchase`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to purchase listing');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resaleKeys.all });
    },
  });
}

export function useResaleData() {
  const listingsQuery = useResaleListings();
  const purchaseMutation = usePurchaseResaleListing();

  return {
    listings: listingsQuery.data || [],
    isLoading: listingsQuery.isLoading,
    error: listingsQuery.error,
    refetch: listingsQuery.refetch,
    purchaseListing: purchaseMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
  };
}
