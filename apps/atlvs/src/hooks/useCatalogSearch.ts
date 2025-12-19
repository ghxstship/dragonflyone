import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';

export interface CatalogSearchResult {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category_id: string;
  category_name: string;
  category_path: string[];
  base_price: number;
  currency: string;
  unit: string;
  image_url?: string;
  tags: string[];
  availability: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  relevance_score: number;
}

export interface CatalogSearchFilters {
  query?: string;
  category_ids?: string[];
  price_min?: number;
  price_max?: number;
  availability?: CatalogSearchResult['availability'][];
  tags?: string[];
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'name' | 'newest';
}

export interface CatalogSearchResponse {
  results: CatalogSearchResult[];
  total: number;
  page: number;
  page_size: number;
  facets: {
    categories: Array<{ id: string; name: string; count: number }>;
    price_ranges: Array<{ min: number; max: number; count: number }>;
    tags: Array<{ tag: string; count: number }>;
    availability: Array<{ status: string; count: number }>;
  };
  suggestions: string[];
}

async function searchCatalog(
  filters: CatalogSearchFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<CatalogSearchResponse> {
  const params = new URLSearchParams();
  
  if (filters.query) params.set('q', filters.query);
  if (filters.category_ids?.length) params.set('categories', filters.category_ids.join(','));
  if (filters.price_min !== undefined) params.set('price_min', filters.price_min.toString());
  if (filters.price_max !== undefined) params.set('price_max', filters.price_max.toString());
  if (filters.availability?.length) params.set('availability', filters.availability.join(','));
  if (filters.tags?.length) params.set('tags', filters.tags.join(','));
  if (filters.sort_by) params.set('sort', filters.sort_by);
  params.set('page', page.toString());
  params.set('page_size', pageSize.toString());

  const response = await fetch(`/api/catalog/search?${params}`);
  if (!response.ok) {
    throw new Error('Failed to search catalog');
  }
  return response.json();
}

async function fetchCatalogSuggestions(query: string): Promise<{ suggestions: string[] }> {
  const response = await fetch(`/api/catalog/suggestions?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch suggestions');
  }
  return response.json();
}

async function fetchPopularItems(): Promise<{ items: CatalogSearchResult[] }> {
  const response = await fetch('/api/catalog/popular');
  if (!response.ok) {
    throw new Error('Failed to fetch popular items');
  }
  return response.json();
}

async function fetchRecentlyViewed(): Promise<{ items: CatalogSearchResult[] }> {
  const response = await fetch('/api/catalog/recently-viewed');
  if (!response.ok) {
    throw new Error('Failed to fetch recently viewed');
  }
  return response.json();
}

export function useCatalogSearch(
  filters: CatalogSearchFilters,
  page: number = 1,
  pageSize: number = 20
) {
  const debouncedQuery = useDebounce(filters.query || '', 300);
  
  return useQuery({
    queryKey: ['catalog-search', { ...filters, query: debouncedQuery }, page, pageSize],
    queryFn: () => searchCatalog({ ...filters, query: debouncedQuery }, page, pageSize),
    enabled: true,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
}

export function useCatalogSuggestions(query: string) {
  const debouncedQuery = useDebounce(query, 200);
  
  return useQuery({
    queryKey: ['catalog-suggestions', debouncedQuery],
    queryFn: () => fetchCatalogSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });
}

export function usePopularCatalogItems() {
  return useQuery({
    queryKey: ['catalog-popular'],
    queryFn: fetchPopularItems,
  });
}

export function useRecentlyViewedCatalogItems() {
  return useQuery({
    queryKey: ['catalog-recently-viewed'],
    queryFn: fetchRecentlyViewed,
  });
}
