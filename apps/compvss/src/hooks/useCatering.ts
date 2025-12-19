'use client';

import { useQuery } from '@tanstack/react-query';

export interface MealService {
  id: string;
  project_id: string;
  project_name: string;
  service_date: string;
  meal_type: string;
  headcount: number;
  vendor_id?: string;
  vendor_name?: string;
  location: string;
  dietary_notes?: string;
  cost_per_head: number;
  total_cost: number;
  status: string;
}

export interface DietaryRequirement {
  type: string;
  count: number;
}

export interface CateringSummary {
  total_services: number;
  upcoming_meals: number;
  total_headcount: number;
  total_cost: number;
  average_cost_per_head: number;
  dietary_requirements: DietaryRequirement[];
}

const DEFAULT_SUMMARY: CateringSummary = {
  total_services: 0,
  upcoming_meals: 0,
  total_headcount: 0,
  total_cost: 0,
  average_cost_per_head: 0,
  dietary_requirements: [],
};

export const cateringKeys = {
  all: ['catering'] as const,
  list: (filters?: { projectId?: string; mealType?: string }) => [...cateringKeys.all, 'list', filters] as const,
};

export function useCateringServices(filters?: { projectId?: string; mealType?: string }) {
  return useQuery({
    queryKey: cateringKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.projectId && filters.projectId !== 'all') params.append('project_id', filters.projectId);
      if (filters?.mealType && filters.mealType !== 'all') params.append('meal_type', filters.mealType);
      
      const response = await fetch(`/api/catering?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch catering data');
      }
      const data = await response.json();
      return {
        services: data.services || [],
        summary: data.summary || DEFAULT_SUMMARY,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCateringData(filters?: { projectId?: string; mealType?: string }) {
  const cateringQuery = useCateringServices(filters);

  const data = cateringQuery.data || { services: [], summary: DEFAULT_SUMMARY };

  return {
    services: data.services,
    summary: data.summary,
    isLoading: cateringQuery.isLoading,
    error: cateringQuery.error,
    refetch: cateringQuery.refetch,
  };
}
