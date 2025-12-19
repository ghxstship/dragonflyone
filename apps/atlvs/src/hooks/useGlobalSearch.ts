import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SearchResult {
  id: string;
  type: 'contact' | 'booking' | 'invoice' | 'lead' | 'proposal' | 'contract' | 'vendor' | 'space' | 'document';
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  icon?: string;
  status?: string;
  date?: string;
  metadata?: Record<string, unknown>;
  highlight?: string;
  score: number;
}

export interface SearchFilters {
  types?: SearchResult['type'][];
  date_from?: string;
  date_to?: string;
  status?: string;
  assigned_to?: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  filters?: SearchFilters;
  result_count: number;
  searched_at: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  notification_enabled: boolean;
  created_at: string;
}

async function globalSearch(query: string, filters?: SearchFilters, limit: number = 20): Promise<{
  results: SearchResult[];
  total: number;
  by_type: Record<string, number>;
  query_time_ms: number;
}> {
  const params = new URLSearchParams();
  params.set('q', query);
  if (filters?.types?.length) params.set('types', filters.types.join(','));
  if (filters?.date_from) params.set('from', filters.date_from);
  if (filters?.date_to) params.set('to', filters.date_to);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.assigned_to) params.set('assigned_to', filters.assigned_to);
  params.set('limit', limit.toString());

  const response = await fetch(`/api/search?${params}`);
  if (!response.ok) {
    throw new Error('Failed to search');
  }
  return response.json();
}

async function quickSearch(query: string): Promise<{
  results: SearchResult[];
  suggestions: string[];
}> {
  const response = await fetch(`/api/search/quick?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to quick search');
  }
  return response.json();
}

async function fetchRecentSearches(): Promise<{ searches: RecentSearch[] }> {
  const response = await fetch('/api/search/recent');
  if (!response.ok) {
    throw new Error('Failed to fetch recent searches');
  }
  return response.json();
}

async function fetchSavedSearches(): Promise<{ searches: SavedSearch[] }> {
  const response = await fetch('/api/search/saved');
  if (!response.ok) {
    throw new Error('Failed to fetch saved searches');
  }
  return response.json();
}

async function saveSearch(input: { name: string; query: string; filters?: SearchFilters; notificationEnabled?: boolean }): Promise<SavedSearch> {
  const response = await fetch('/api/search/saved', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save search');
  }
  return response.json();
}

async function deleteSavedSearch(id: string): Promise<void> {
  const response = await fetch(`/api/search/saved/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete saved search');
  }
}

async function clearRecentSearches(): Promise<void> {
  const response = await fetch('/api/search/recent', {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to clear recent searches');
  }
}

export function useGlobalSearch(query: string, filters?: SearchFilters, limit: number = 20) {
  return useQuery({
    queryKey: ['global-search', query, filters, limit],
    queryFn: () => globalSearch(query, filters, limit),
    enabled: query.length >= 2,
  });
}

export function useQuickSearch(query: string) {
  return useQuery({
    queryKey: ['quick-search', query],
    queryFn: () => quickSearch(query),
    enabled: query.length >= 2,
  });
}

export function useRecentSearches() {
  return useQuery({
    queryKey: ['recent-searches'],
    queryFn: fetchRecentSearches,
  });
}

export function useSavedSearches() {
  return useQuery({
    queryKey: ['saved-searches'],
    queryFn: fetchSavedSearches,
  });
}

export function useSaveSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSavedSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
}

export function useClearRecentSearches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearRecentSearches,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-searches'] });
    },
  });
}
