import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface ProcurementCategory {
  id: string;
  name: string;
  parentCategory?: string;
  spend: number;
  vendors: number;
  strategy: 'Strategic' | 'Leverage' | 'Bottleneck' | 'Non-Critical';
  owner: string;
  lastReview: string;
  created_at?: string;
  updated_at?: string;
}

export interface SourcingStrategy {
  id: string;
  categoryId: string;
  categoryName: string;
  objective: string;
  approach: string;
  targetSavings: number;
  status: 'Draft' | 'Active' | 'Under Review';
  initiatives: string[];
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/procurement';

async function fetchCategories(): Promise<ProcurementCategory[]> {
  const response = await fetch(`${API_BASE}/categories`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch procurement categories');
  }

  const { data } = await response.json();
  return data || [];
}

async function fetchStrategies(): Promise<SourcingStrategy[]> {
  const response = await fetch(`${API_BASE}/strategies`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch sourcing strategies');
  }

  const { data } = await response.json();
  return data || [];
}

export function useProcurementCategoriesQuery() {
  return useQuery({
    queryKey: ['procurement-categories'],
    queryFn: fetchCategories,
    staleTime: 60000,
  });
}

export function useSourcingStrategiesQuery() {
  return useQuery({
    queryKey: ['sourcing-strategies'],
    queryFn: fetchStrategies,
    staleTime: 60000,
  });
}

export function useProcurementCategories() {
  const queryClient = useQueryClient();
  const categoriesQuery = useProcurementCategoriesQuery();
  const strategiesQuery = useSourcingStrategiesQuery();

  const categories = categoriesQuery.data || [];
  const strategies = strategiesQuery.data || [];

  const totalSpend = categories.reduce((sum, c) => sum + c.spend, 0);
  const strategicSpend = categories.filter(c => c.strategy === 'Strategic').reduce((sum, c) => sum + c.spend, 0);

  return {
    categories,
    strategies,
    summary: {
      totalCategories: categories.length,
      totalSpend,
      strategicSpend,
      totalStrategies: strategies.length,
      activeStrategies: strategies.filter(s => s.status === 'Active').length,
    },
    isLoading: categoriesQuery.isLoading || strategiesQuery.isLoading,
    error: categoriesQuery.error || strategiesQuery.error,
    refetch: () => {
      categoriesQuery.refetch();
      strategiesQuery.refetch();
    },
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement-categories'] });
      queryClient.invalidateQueries({ queryKey: ['sourcing-strategies'] });
    },
  };
}
