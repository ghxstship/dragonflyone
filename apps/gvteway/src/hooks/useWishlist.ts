'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface WishlistItem {
  id: string;
  user_id: string;
  event_id: string;
  event_name: string;
  date: string;
  location: string;
  price: number;
  available: boolean;
  tickets_left: number;
  notify_price_drop: boolean;
  added_at: string;
}

const DEMO_WISHLIST: WishlistItem[] = [
  { id: 'demo-1', user_id: 'demo-user', event_id: 'event-001', event_name: 'Summer Music Festival 2024', date: new Date(Date.now() + 30 * 86400000).toISOString(), location: 'Central Park, New York', price: 149, available: true, tickets_left: 250, notify_price_drop: true, added_at: new Date().toISOString() },
  { id: 'demo-2', user_id: 'demo-user', event_id: 'event-002', event_name: 'Jazz Night Under the Stars', date: new Date(Date.now() + 45 * 86400000).toISOString(), location: 'Hollywood Bowl, Los Angeles', price: 85, available: true, tickets_left: 45, notify_price_drop: true, added_at: new Date(Date.now() - 86400000).toISOString() },
];

export const wishlistKeys = {
  all: ['wishlist'] as const,
  list: (userId?: string) => [...wishlistKeys.all, 'list', userId] as const,
};

export function useWishlistItems(userId?: string) {
  return useQuery({
    queryKey: wishlistKeys.list(userId),
    queryFn: async () => {
      const response = await fetch(`/api/wishlist?user_id=${userId}`);
      if (response.status === 401) {
        return DEMO_WISHLIST;
      }
      if (!response.ok) {
        return DEMO_WISHLIST;
      }
      const data = await response.json();
      return data.items || DEMO_WISHLIST;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
  });
}

export function useWishlistData(userId?: string) {
  const wishlistQuery = useWishlistItems(userId);
  const removeMutation = useRemoveFromWishlist();

  return {
    wishlist: wishlistQuery.data || [],
    isLoading: wishlistQuery.isLoading,
    error: wishlistQuery.error,
    refetch: wishlistQuery.refetch,
    removeItem: removeMutation.mutateAsync,
  };
}
