import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CompensationPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  currentSalary: number;
  proposedSalary: number;
  effectiveDate: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
  equityGrant?: number;
  bonus?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/compensation';

async function fetchPlans(params?: { status?: string; department?: string }): Promise<CompensationPlan[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.department) searchParams.set('department', params.department);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch compensation plans');
  }

  const { data } = await response.json();
  return data || [];
}

async function createPlan(data: Partial<CompensationPlan>): Promise<CompensationPlan> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create compensation plan');
  }

  const result = await response.json();
  return result.data;
}

async function updatePlan(id: string, data: Partial<CompensationPlan>): Promise<CompensationPlan> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update compensation plan');
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
    throw new Error(error.error || 'Failed to delete compensation plans');
  }
}

async function approvePlans(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk-approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to approve compensation plans');
  }
}

export function useCompensationQuery(params?: { status?: string; department?: string }) {
  return useQuery({
    queryKey: ['compensation', params],
    queryFn: () => fetchPlans(params),
    staleTime: 60000,
  });
}

export function useCreateCompensationPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compensation'] }),
  });
}

export function useUpdateCompensationPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CompensationPlan> }) => updatePlan(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compensation'] }),
  });
}

export function useDeleteCompensationPlans() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePlans,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compensation'] }),
  });
}

export function useApproveCompensationPlans() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approvePlans,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compensation'] }),
  });
}

export function useCompensation(params?: { status?: string; department?: string }) {
  const query = useCompensationQuery(params);
  const createMutation = useCreateCompensationPlan();
  const updateMutation = useUpdateCompensationPlan();
  const deleteMutation = useDeleteCompensationPlans();
  const approveMutation = useApproveCompensationPlans();

  const plans = query.data || [];
  const totalBudget = plans.reduce((sum, p) => sum + (p.proposedSalary - p.currentSalary), 0);

  return {
    plans,
    summary: {
      total: plans.length,
      pending: plans.filter(p => p.status === 'Pending Approval').length,
      approved: plans.filter(p => p.status === 'Approved').length,
      totalBudget,
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
    approvePlans: approveMutation.mutate,
    approvePlansAsync: approveMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isApproving: approveMutation.isPending,
  };
}
