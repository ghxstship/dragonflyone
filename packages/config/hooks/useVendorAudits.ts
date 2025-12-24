import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface VendorAudit {
  id: string;
  vendorName: string;
  vendorId?: string;
  category: string;
  auditType: 'Quality' | 'Financial' | 'Compliance' | 'Performance';
  scheduledDate: string;
  completedDate?: string;
  auditor: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  score?: number;
  findings?: string[];
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/procurement/vendor-audits';

async function fetchVendorAudits(): Promise<VendorAudit[]> {
  const response = await fetch(API_BASE);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch vendor audits');
  }

  const { data } = await response.json();
  return data || [];
}

async function createVendorAudit(data: Partial<VendorAudit>): Promise<VendorAudit> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create vendor audit');
  }

  return response.json();
}

async function updateVendorAudit(id: string, data: Partial<VendorAudit>): Promise<VendorAudit> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update vendor audit');
  }

  return response.json();
}

async function completeVendorAudit(id: string, score: number, findings: string[]): Promise<VendorAudit> {
  const response = await fetch(`${API_BASE}/${id}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score, findings }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to complete vendor audit');
  }

  return response.json();
}

export function useVendorAuditsQuery() {
  return useQuery({
    queryKey: ['vendor-audits'],
    queryFn: fetchVendorAudits,
    staleTime: 60000,
  });
}

export function useCreateVendorAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendorAudit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-audits'] });
    },
  });
}

export function useUpdateVendorAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VendorAudit> }) => updateVendorAudit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-audits'] });
    },
  });
}

export function useCompleteVendorAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, score, findings }: { id: string; score: number; findings: string[] }) => completeVendorAudit(id, score, findings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-audits'] });
    },
  });
}

export function useVendorAudits() {
  const queryClient = useQueryClient();
  const query = useVendorAuditsQuery();
  const createMutation = useCreateVendorAudit();
  const updateMutation = useUpdateVendorAudit();
  const completeMutation = useCompleteVendorAudit();

  const audits = query.data || [];
  const upcomingAudits = audits.filter(a => a.status === 'Scheduled' || a.status === 'In Progress');
  const overdueCount = audits.filter(a => a.status === 'Overdue').length;
  const completedCount = audits.filter(a => a.status === 'Completed').length;
  const avgScore = completedCount > 0 
    ? audits.filter(a => a.score).reduce((sum, a) => sum + (a.score || 0), 0) / completedCount 
    : 0;

  return {
    audits,
    summary: {
      upcomingCount: upcomingAudits.length,
      overdueCount,
      completedCount,
      avgScore,
      totalAudits: audits.length,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    complete: completeMutation.mutateAsync,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['vendor-audits'] }),
  };
}
