'use client';

import { useQuery, useMutation } from '@tanstack/react-query';

export interface ProjectDetail {
  id: string;
  name: string;
  client_name?: string;
  client?: { name: string };
  status: string;
  budget: number;
  actual_cost?: number;
  health?: string;
  project_manager?: { full_name: string };
  start_date: string;
  end_date: string;
  progress?: number;
  description?: string;
  venue?: string;
  expected_attendees?: number;
}

const DEMO_PROJECT: ProjectDetail = {
  id: 'demo-1',
  name: 'Summer Music Festival 2025',
  client_name: 'Festival Productions Inc.',
  status: 'active',
  budget: 500000,
  actual_cost: 320000,
  health: 'on_track',
  project_manager: { full_name: 'Sarah Johnson' },
  start_date: '2025-06-01',
  end_date: '2025-08-31',
  progress: 65,
  description: 'Annual summer music festival featuring top artists',
  venue: 'Central Park Amphitheater',
  expected_attendees: 50000,
};

export const projectDetailKeys = {
  all: ['project-detail'] as const,
  detail: (id: string) => [...projectDetailKeys.all, id] as const,
};

export function useProjectDetail(id: string) {
  return useQuery({
    queryKey: projectDetailKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/projects/${id}`);
      if (response.status === 401) {
        return DEMO_PROJECT;
      }
      if (response.status === 404) {
        throw new Error('Project not found');
      }
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const data = await response.json();
      return data.project || data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGenerateProjectReport(id: string) {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/projects/${id}/report`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      return response.blob();
    },
  });
}

export function useProjectDetailData(id: string) {
  const projectQuery = useProjectDetail(id);
  const reportMutation = useGenerateProjectReport(id);

  return {
    project: projectQuery.data || null,
    isLoading: projectQuery.isLoading,
    error: projectQuery.error,
    isNotFound: projectQuery.error?.message === 'Project not found',
    generateReport: reportMutation.mutateAsync,
    isGeneratingReport: reportMutation.isPending,
    refetch: projectQuery.refetch,
  };
}
