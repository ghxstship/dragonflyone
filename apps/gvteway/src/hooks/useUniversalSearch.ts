'use client';

import { useQuery } from '@tanstack/react-query';

export interface SearchResult {
  id: string;
  type: 'event' | 'artist' | 'venue' | 'genre';
  title: string;
  subtitle?: string;
  image?: string;
  metadata?: string;
  tags?: string[];
}

export const universalSearchKeys = {
  all: ['universal-search'] as const,
  results: (query: string, type?: string) => [...universalSearchKeys.all, 'results', query, type] as const,
};

export function useSearchResults(query: string, type?: string) {
  return useQuery<SearchResult[]>({
    queryKey: universalSearchKeys.results(query, type),
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query.trim()) return [];
      const params = new URLSearchParams({ q: query });
      if (type && type !== 'all') params.append('type', type);
      const response = await fetch(`/api/search/universal?${params.toString()}`);
      if (!response.ok) return [];
      const data = await response.json();
      return (data.results || []) as SearchResult[];
    },
    enabled: !!query.trim(),
    staleTime: 60 * 1000,
  });
}

export function useUniversalSearchData(query: string, type?: string) {
  const resultsQuery = useSearchResults(query, type);

  return {
    results: resultsQuery.data || [],
    isLoading: resultsQuery.isLoading,
    error: resultsQuery.error,
    refetch: resultsQuery.refetch,
  };
}
