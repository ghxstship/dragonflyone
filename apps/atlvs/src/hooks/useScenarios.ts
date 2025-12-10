'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  category: string;
  scenario_type: string;
  revenue_forecast: number;
  cost_forecast: number;
  probability: number;
  impact_level: string;
  assumptions: string[];
  status: string;
  created_at: string;
}

export interface ScenarioSummary {
  total: number;
  best_case_revenue: number;
  base_case_revenue: number;
  worst_case_revenue: number;
}

const DEMO_SCENARIOS: Scenario[] = [
  { id: '1', name: 'Best Case Q1', description: 'Optimistic revenue scenario', category: 'financial', scenario_type: 'best_case', revenue_forecast: 2500000, cost_forecast: 1800000, probability: 25, impact_level: 'high', assumptions: ['Strong ticket sales', 'Sponsorship secured'], status: 'active', created_at: '2025-01-10' },
  { id: '2', name: 'Base Case Q1', description: 'Expected revenue scenario', category: 'financial', scenario_type: 'base_case', revenue_forecast: 2000000, cost_forecast: 1600000, probability: 50, impact_level: 'medium', assumptions: ['Normal operations'], status: 'active', created_at: '2025-01-10' },
];

const DEMO_SUMMARY: ScenarioSummary = {
  total: 2,
  best_case_revenue: 2500000,
  base_case_revenue: 2000000,
  worst_case_revenue: 1500000,
};

export const scenarioKeys = {
  all: ['scenarios'] as const,
  list: () => [...scenarioKeys.all, 'list'] as const,
};

export function useScenariosList() {
  return useQuery({
    queryKey: scenarioKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/scenarios');
      if (response.status === 401) {
        return { scenarios: DEMO_SCENARIOS, summary: DEMO_SUMMARY };
      }
      if (!response.ok) {
        throw new Error('Failed to fetch scenarios');
      }
      const data = await response.json();
      return {
        scenarios: data.scenarios || [],
        summary: data.summary || DEMO_SUMMARY,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateScenario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create scenario');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scenarioKeys.all });
    },
  });
}

export function useScenariosData() {
  const scenariosQuery = useScenariosList();
  const createMutation = useCreateScenario();

  const data = scenariosQuery.data || { scenarios: [], summary: DEMO_SUMMARY };

  return {
    scenarios: data.scenarios,
    summary: data.summary,
    isLoading: scenariosQuery.isLoading,
    error: scenariosQuery.error,
    createScenario: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    refetch: scenariosQuery.refetch,
  };
}
