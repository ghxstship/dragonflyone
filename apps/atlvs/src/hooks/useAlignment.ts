'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { log } from '@ghxstship/config';

// Types
export interface StrategicGoal {
  id: string;
  name: string;
  description: string;
  category: string;
  target_date: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
  progress: number;
  owner: string;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  budget: number;
  aligned_goals: string[];
  alignment_score: number;
}

export interface AlignmentMetric {
  goal_id: string;
  goal_name: string;
  aligned_projects: number;
  total_budget_aligned: number;
  average_progress: number;
}

// Demo data
const DEMO_GOALS: StrategicGoal[] = [
  {
    id: '1',
    name: 'Increase Revenue 20%',
    description: 'Grow annual revenue by 20% through new events',
    category: 'Financial',
    target_date: '2025-12-31',
    status: 'on_track',
    progress: 65,
    owner: 'Sarah Chen',
  },
  {
    id: '2',
    name: 'Expand Market Presence',
    description: 'Launch in 3 new markets',
    category: 'Growth',
    target_date: '2025-09-30',
    status: 'at_risk',
    progress: 40,
    owner: 'Mike Johnson',
  },
];

const DEMO_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Summer Festival 2025',
    status: 'active',
    budget: 500000,
    aligned_goals: ['1'],
    alignment_score: 85,
  },
  {
    id: '2',
    name: 'New Venue Launch',
    status: 'planning',
    budget: 250000,
    aligned_goals: ['2'],
    alignment_score: 70,
  },
];

const DEMO_METRICS: AlignmentMetric[] = [
  {
    goal_id: '1',
    goal_name: 'Increase Revenue 20%',
    aligned_projects: 3,
    total_budget_aligned: 750000,
    average_progress: 65,
  },
];

// Query keys
export const alignmentKeys = {
  all: ['alignment'] as const,
  goals: () => [...alignmentKeys.all, 'goals'] as const,
  projects: () => [...alignmentKeys.all, 'projects'] as const,
  metrics: () => [...alignmentKeys.all, 'metrics'] as const,
};

// Fetch functions
async function fetchGoals(): Promise<StrategicGoal[]> {
  const response = await fetch('/api/strategic-goals');
  if (response.status === 401) {
    return DEMO_GOALS;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch goals');
  }
  const data = await response.json();
  return data.goals || [];
}

async function fetchProjects(): Promise<Project[]> {
  const response = await fetch('/api/projects?include_alignment=true');
  if (response.status === 401) {
    return DEMO_PROJECTS;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  const data = await response.json();
  return data.projects || [];
}

async function fetchMetrics(): Promise<AlignmentMetric[]> {
  const response = await fetch('/api/alignment/metrics');
  if (response.status === 401) {
    return DEMO_METRICS;
  }
  if (!response.ok) {
    throw new Error('Failed to fetch metrics');
  }
  const data = await response.json();
  return data.metrics || [];
}

// Mutation functions
interface AlignProjectParams {
  project_id: string;
  goal_ids: string[];
}

async function alignProject(params: AlignProjectParams): Promise<void> {
  const response = await fetch('/api/alignment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to update alignment');
  }
}

// Hooks
export function useStrategicGoals() {
  return useQuery({
    queryKey: alignmentKeys.goals(),
    queryFn: fetchGoals,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAlignedProjects() {
  return useQuery({
    queryKey: alignmentKeys.projects(),
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAlignmentMetrics() {
  return useQuery({
    queryKey: alignmentKeys.metrics(),
    queryFn: fetchMetrics,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAlignProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: alignProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alignmentKeys.all });
    },
    onError: (error) => {
      log.error('Failed to align project:', error);
    },
  });
}

// Combined hook
export function useAlignmentData() {
  const goalsQuery = useStrategicGoals();
  const projectsQuery = useAlignedProjects();
  const metricsQuery = useAlignmentMetrics();
  const alignProjectMutation = useAlignProject();

  return {
    // Data
    goals: goalsQuery.data || [],
    projects: projectsQuery.data || [],
    metrics: metricsQuery.data || [],

    // Loading states
    isLoading: goalsQuery.isLoading || projectsQuery.isLoading || metricsQuery.isLoading,

    // Error states
    error: goalsQuery.error || projectsQuery.error || metricsQuery.error,

    // Mutations
    alignProject: alignProjectMutation.mutateAsync,
    isAligningProject: alignProjectMutation.isPending,

    // Refetch
    refetch: () => {
      goalsQuery.refetch();
      projectsQuery.refetch();
      metricsQuery.refetch();
    },
  };
}
