'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    category?: string;
    location?: string;
    priceMin?: number;
    priceMax?: number;
    dateFrom?: string;
    dateTo?: string;
  };
  alerts_enabled: boolean;
  alert_frequency: 'instant' | 'daily' | 'weekly';
  last_run?: string;
  new_results_count: number;
  created_at: string;
}

const DEMO_SEARCHES: SavedSearch[] = [
  { id: '1', name: 'Rock Concerts NYC', query: 'rock concerts', filters: { category: 'music', location: 'New York' }, alerts_enabled: true, alert_frequency: 'daily', new_results_count: 5, created_at: new Date().toISOString() },
  { id: '2', name: 'Jazz Events', query: 'jazz', filters: { category: 'music' }, alerts_enabled: false, alert_frequency: 'weekly', new_results_count: 0, created_at: new Date(Date.now() - 86400000).toISOString() },
];

export const savedSearchesKeys = {
  all: ['saved-searches'] as const,
  list: () => [...savedSearchesKeys.all, 'list'] as const,
};

export function useSavedSearchesList() {
  return useQuery({
    queryKey: savedSearchesKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/saved-searches');
      if (!response.ok) {
        return DEMO_SEARCHES;
      }
      const data = await response.json();
      return data.searches || DEMO_SEARCHES;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (search: Partial<SavedSearch>) => {
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(search),
      });
      if (!response.ok) {
        throw new Error('Failed to create saved search');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedSearchesKeys.all });
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (searchId: string) => {
      const response = await fetch(`/api/saved-searches/${searchId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete saved search');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedSearchesKeys.all });
    },
  });
}

export function useToggleSearchAlerts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ searchId, enabled }: { searchId: string; enabled: boolean }) => {
      const response = await fetch(`/api/saved-searches/${searchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alerts_enabled: enabled }),
      });
      if (!response.ok) {
        throw new Error('Failed to update search');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedSearchesKeys.all });
    },
  });
}

export function useSavedSearchesData() {
  const searchesQuery = useSavedSearchesList();
  const createMutation = useCreateSavedSearch();
  const deleteMutation = useDeleteSavedSearch();
  const toggleMutation = useToggleSearchAlerts();

  return {
    searches: searchesQuery.data || [],
    isLoading: searchesQuery.isLoading,
    error: searchesQuery.error,
    refetch: searchesQuery.refetch,
    createSearch: createMutation.mutateAsync,
    deleteSearch: deleteMutation.mutateAsync,
    toggleAlerts: toggleMutation.mutateAsync,
  };
}
