// ============================================================================
// USE CATALOG CATEGORIES HOOK
// Fetches categories from the catalog_categories table
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import type { IndustryVertical } from '../types/advancing';

export interface CatalogCategoryRecord {
  id: string;
  category_code: string;
  category_name: string;
  parent_category_id: string | null;
  description: string | null;
  icon_name: string | null;
  color_hex: string | null;
  industry_verticals: IndustryVertical[];
  display_order: number;
  enabled: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  children?: CatalogCategoryRecord[];
  item_count?: number;
}

export interface UseCatalogCategoriesOptions {
  parentCode?: string;
  industry?: IndustryVertical;
  enabled?: boolean;
}

async function fetchCatalogCategories(
  options: UseCatalogCategoriesOptions = {}
): Promise<{ categories: CatalogCategoryRecord[]; tree: CatalogCategoryRecord[] }> {
  const params = new URLSearchParams();
  
  if (options.parentCode) {
    params.set('parent_code', options.parentCode);
  }
  if (options.industry) {
    params.set('industry', options.industry);
  }
  if (options.enabled !== undefined) {
    params.set('enabled', String(options.enabled));
  }

  const response = await fetch(`/api/advancing/catalog/categories?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch catalog categories');
  }

  const result = await response.json();
  
  // Handle different response formats
  if (result.data) {
    // API returns { data: [...] } format with category/subcategories structure
    const categories: CatalogCategoryRecord[] = [];
    const categoryMap = new Map<string, CatalogCategoryRecord>();
    
    for (const item of result.data) {
      // Create or get parent category
      if (!categoryMap.has(item.category)) {
        const parentCat: CatalogCategoryRecord = {
          id: item.category,
          category_code: item.category,
          category_name: item.category,
          parent_category_id: null,
          description: null,
          icon_name: null,
          color_hex: null,
          industry_verticals: ['universal'],
          display_order: 0,
          enabled: true,
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          children: [],
        };
        categoryMap.set(item.category, parentCat);
        categories.push(parentCat);
      }
      
      const parent = categoryMap.get(item.category)!;
      
      // Add subcategories
      for (const sub of item.subcategories || []) {
        const subCat: CatalogCategoryRecord = {
          id: `${item.category}-${sub}`,
          category_code: sub,
          category_name: sub,
          parent_category_id: parent.id,
          description: null,
          icon_name: null,
          color_hex: null,
          industry_verticals: ['universal'],
          display_order: 0,
          enabled: true,
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        parent.children?.push(subCat);
      }
    }
    
    return { categories, tree: categories };
  }
  
  return result;
}

/**
 * Hook to fetch catalog categories from the database
 * Named useGlobalCatalogCategories to avoid conflict with useAdvancingCatalog's useCatalogCategories
 */
export function useGlobalCatalogCategories(options: UseCatalogCategoriesOptions = {}) {
  return useQuery({
    queryKey: ['catalog-categories', options],
    queryFn: () => fetchCatalogCategories(options),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}

/**
 * Get category options for select dropdowns
 */
export function useGlobalCategoryOptions(options: UseCatalogCategoriesOptions = {}) {
  const { data, isLoading, error } = useGlobalCatalogCategories(options);
  
  const categoryOptions = data?.categories?.flatMap((cat: CatalogCategoryRecord) => {
    const parentOption = { value: cat.category_code, label: cat.category_name };
    const childOptions = cat.children?.map((child: CatalogCategoryRecord) => ({
      value: child.category_code,
      label: `${cat.category_name} > ${child.category_name}`,
    })) || [];
    return [parentOption, ...childOptions];
  }) || [];
  
  return { options: categoryOptions, isLoading, error };
}
