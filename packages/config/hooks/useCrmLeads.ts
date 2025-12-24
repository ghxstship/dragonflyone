import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CrmLead {
  id: string;
  name: string;
  email: string;
  company: string;
  source: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  engagementScore: number;
  fitScore: number;
  behaviorScore: number;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Converted' | 'Lost' | 'Negotiation' | 'Won';
  estimatedValue?: number;
  assignedTo?: string;
  lastActivity: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/leads';

async function fetchLeads(params?: { grade?: string; status?: string; source?: string }): Promise<CrmLead[]> {
  const searchParams = new URLSearchParams();
  if (params?.grade) searchParams.set('grade', params.grade);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.source) searchParams.set('source', params.source);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch leads');
  }

  const { data } = await response.json();
  return data || [];
}

async function createLead(data: Partial<CrmLead>): Promise<CrmLead> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create lead');
  }

  const result = await response.json();
  return result.data;
}

async function updateLead(id: string, data: Partial<CrmLead>): Promise<CrmLead> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update lead');
  }

  const result = await response.json();
  return result.data;
}

async function deleteLeads(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete leads');
  }
}

async function qualifyLeads(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk-qualify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to qualify leads');
  }
}

export function useCrmLeadsQuery(params?: { grade?: string; status?: string; source?: string }) {
  return useQuery({
    queryKey: ['crm-leads', params],
    queryFn: () => fetchLeads(params),
    staleTime: 60000,
  });
}

export function useCreateCrmLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-leads'] }),
  });
}

export function useUpdateCrmLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CrmLead> }) => updateLead(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-leads'] }),
  });
}

export function useDeleteCrmLeads() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLeads,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-leads'] }),
  });
}

export function useQualifyCrmLeads() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: qualifyLeads,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-leads'] }),
  });
}

export function useCrmLeads(params?: { grade?: string; status?: string; source?: string }) {
  const query = useCrmLeadsQuery(params);
  const createMutation = useCreateCrmLead();
  const updateMutation = useUpdateCrmLead();
  const deleteMutation = useDeleteCrmLeads();
  const qualifyMutation = useQualifyCrmLeads();

  const leads = query.data || [];

  return {
    leads,
    summary: {
      total: leads.length,
      hotLeads: leads.filter(l => l.score >= 80).length,
      avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0,
      totalPipeline: leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createLead: createMutation.mutate,
    createLeadAsync: createMutation.mutateAsync,
    updateLead: updateMutation.mutate,
    updateLeadAsync: updateMutation.mutateAsync,
    deleteLeads: deleteMutation.mutate,
    deleteLeadsAsync: deleteMutation.mutateAsync,
    qualifyLeads: qualifyMutation.mutate,
    qualifyLeadsAsync: qualifyMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isQualifying: qualifyMutation.isPending,
  };
}
