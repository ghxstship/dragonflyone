'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface FavoriteEvent {
  id: string;
  event_id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  category: string;
  price_min: number;
  image?: string;
  tickets_available: boolean;
  added_at: string;
}

const DEMO_FAVORITES: FavoriteEvent[] = [
  { id: '1', event_id: 'e1', title: 'Summer Festival 2024', date: '2025-07-15', venue: 'Central Park', city: 'New York', category: 'Festival', price_min: 75, tickets_available: true, added_at: new Date().toISOString() },
  { id: '2', event_id: 'e2', title: 'Jazz Night', date: '2025-03-20', venue: 'Blue Note', city: 'New York', category: 'Concert', price_min: 45, tickets_available: true, added_at: new Date(Date.now() - 86400000).toISOString() },
];

export const favoriteKeys = {
  all: ['favorites'] as const,
  list: () => [...favoriteKeys.all, 'list'] as const,
};

export function useFavoritesList() {
  return useQuery({
    queryKey: favoriteKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/user/favorites');
      if (response.status === 401) {
        return DEMO_FAVORITES;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      const data = await response.json();
      return data.favorites || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (favoriteId: string) => {
      const response = await fetch(`/api/user/favorites/${favoriteId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }
      return favoriteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}

export function useFavoritesData() {
  const favoritesQuery = useFavoritesList();
  const removeFavoriteMutation = useRemoveFavorite();

  return {
    favorites: favoritesQuery.data || [],
    isLoading: favoritesQuery.isLoading,
    error: favoritesQuery.error,
    refetch: favoritesQuery.refetch,
    removeFavorite: removeFavoriteMutation.mutateAsync,
    isRemoving: removeFavoriteMutation.isPending,
  };
}
