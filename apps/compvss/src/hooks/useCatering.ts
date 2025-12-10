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

const DEMO_SERVICES: MealService[] = [
  { id: 'demo-1', project_id: 'proj-001', project_name: 'Summer Festival 2024', service_date: new Date().toISOString(), meal_type: 'breakfast', headcount: 45, vendor_name: 'Gourmet Catering Co', location: 'Backstage Area A', cost_per_head: 18, total_cost: 810, status: 'confirmed' },
  { id: 'demo-2', project_id: 'proj-001', project_name: 'Summer Festival 2024', service_date: new Date().toISOString(), meal_type: 'lunch', headcount: 60, vendor_name: 'Gourmet Catering Co', location: 'Main Stage', cost_per_head: 22, total_cost: 1320, status: 'pending' },
];

const DEMO_SUMMARY: CateringSummary = {
  total_services: 2,
  upcoming_meals: 2,
  total_headcount: 105,
  total_cost: 2130,
  average_cost_per_head: 20.29,
  dietary_requirements: [{ type: 'vegetarian', count: 12 }, { type: 'vegan', count: 5 }],
};

export const cateringKeys = {
  all: ['catering'] as const,
  list: () => [...cateringKeys.all, 'list'] as const,
};

export function useCateringServices() {
  return useQuery({
    queryKey: cateringKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/catering');
      if (response.status === 401) {
        return { services: DEMO_SERVICES, summary: DEMO_SUMMARY };
      }
      if (!response.ok) {
        throw new Error('Failed to fetch catering data');
      }
      const data = await response.json();
      return {
        services: data.services || [],
        summary: data.summary || DEMO_SUMMARY,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCateringData() {
  const cateringQuery = useCateringServices();

  const data = cateringQuery.data || { services: [], summary: DEMO_SUMMARY };

  return {
    services: data.services,
    summary: data.summary,
    isLoading: cateringQuery.isLoading,
    error: cateringQuery.error,
    refetch: cateringQuery.refetch,
  };
}
