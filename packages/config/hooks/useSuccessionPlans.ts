import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Successor {
  id: string;
  name: string;
  currentRole: string;
  readiness: 'Ready Now' | '1-2 Years' | '3-5 Years';
  readinessScore: number;
  developmentAreas: string[];
}

export interface SuccessionPlan {
  id: string;
  position: string;
  department: string;
  currentHolder: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  lastReviewed: string;
  successors: Successor[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/succession-plans';

async function fetchPlans(params?: { riskLevel?: string; department?: string }): Promise<SuccessionPlan[]> {
  const searchParams = new URLSearchParams();
  if (params?.riskLevel) searchParams.set('riskLevel', params.riskLevel);
  if (params?.department) searchParams.set('department', params.department);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch succession plans');
  }

  const { data } = await response.json();
  return data || [];
}

async function createPlan(data: Partial<SuccessionPlan>): Promise<SuccessionPlan> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create succession plan');
  }

  const result = await response.json();
  return result.data;
}

async function updatePlan(id: string, data: Partial<SuccessionPlan>): Promise<SuccessionPlan> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update succession plan');
  }

  const result = await response.json();
  return result.data;
}

async function deletePlans(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete succession plans');
  }
}

export function useSuccessionPlansQuery(params?: { riskLevel?: string; department?: string }) {
  return useQuery({
    queryKey: ['succession-plans', params],
    queryFn: () => fetchPlans(params),
    staleTime: 60000,
  });
}

export function useCreateSuccessionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['succession-plans'] }),
  });
}

export function useUpdateSuccessionPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SuccessionPlan> }) => updatePlan(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['succession-plans'] }),
  });
}

export function useDeleteSuccessionPlans() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlans,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['succession-plans'] }),
  });
}

export function useSuccessionPlans(params?: { riskLevel?: string; department?: string }) {
  const query = useSuccessionPlansQuery(params);
  const createMutation = useCreateSuccessionPlan();
  const updateMutation = useUpdateSuccessionPlan();
  const deleteMutation = useDeleteSuccessionPlans();

  const plans = query.data || [];
  const allSuccessors = plans.flatMap(p => p.successors);

  return {
    plans,
    summary: {
      total: plans.length,
      highRisk: plans.filter(p => p.riskLevel === 'High' || p.riskLevel === 'Critical').length,
      readyNow: allSuccessors.filter(s => s.readiness === 'Ready Now').length,
      totalSuccessors: allSuccessors.length,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createPlan: createMutation.mutate,
    createPlanAsync: createMutation.mutateAsync,
    updatePlan: updateMutation.mutate,
    updatePlanAsync: updateMutation.mutateAsync,
    deletePlans: deleteMutation.mutate,
    deletePlansAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
