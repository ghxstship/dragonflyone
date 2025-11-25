// apps/compvss/src/hooks/useAdvancingCatalog.ts
import { useQuery } from '@tanstack/react-query';
import type { ProductionCatalogItem, CatalogFilters } from '@ghxstship/config/types/advancing';

interface CatalogResponse {
  items: ProductionCatalogItem[];
  total: number;
  categories: string[];
  limit: number;
  offset: number;
}

/**
 * Hook for fetching advancing catalog items with universal multi-industry filters
 * Supports filtering by category, subcategory, industry vertical, procurement type,
 * price range, featured status, and full-text search
 */
export function useAdvancingCatalog(filters?: CatalogFilters) {
  return useQuery({
    queryKey: ['advancing-catalog', filters],
    queryFn: async (): Promise<CatalogResponse> => {
      const params = new URLSearchParams();
      
      // Category filters
      if (filters?.category) params.append('category', filters.category);
      if (filters?.subcategory) params.append('subcategory', filters.subcategory);
      
      // Universal catalog filters
      if (filters?.industry_vertical) params.append('industry_vertical', filters.industry_vertical);
      if (filters?.procurement_type) params.append('procurement_type', filters.procurement_type);
      if (filters?.featured) params.append('featured', 'true');
      
      // Price range filters
      if (filters?.price_min !== undefined) params.append('price_min', filters.price_min.toString());
      if (filters?.price_max !== undefined) params.append('price_max', filters.price_max.toString());
      
      // Search and pagination
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/advancing/catalog?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch catalog');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - catalog doesn't change often
  });
}
