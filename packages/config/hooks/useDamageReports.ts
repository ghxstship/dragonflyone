import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface DamageReport {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  description: string;
  severity: 'Critical' | 'Major' | 'Moderate' | 'Minor';
  status: 'Reported' | 'Under Review' | 'Repair Scheduled' | 'In Repair' | 'Resolved' | 'Write-Off';
  reportedBy: string;
  reportedDate: string;
  location: string;
  estimatedCost?: number;
  actualCost?: number;
  repairVendor?: string;
  resolvedDate?: string;
  notes?: string;
  images?: string[];
}

export interface CreateDamageReportParams {
  asset_id: string;
  description: string;
  severity: string;
  location: string;
  reported_by?: string;
  estimated_cost?: number;
  notes?: string;
}

const API_BASE = '/api/damage-reports';

async function fetchDamageReports(params?: {
  status?: string;
  severity?: string;
  asset_id?: string;
}): Promise<DamageReport[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.severity) searchParams.set('severity', params.severity);
  if (params?.asset_id) searchParams.set('asset_id', params.asset_id);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch damage reports');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    assetId: item.asset_id as string,
    assetName: ((item.asset as Record<string, unknown>)?.name || 'Unknown') as string,
    category: ((item.asset as Record<string, unknown>)?.category || 'General') as string,
    description: item.description as string,
    severity: item.severity as DamageReport['severity'],
    status: item.status as DamageReport['status'],
    reportedBy: item.reported_by as string || 'Unknown',
    reportedDate: item.reported_date as string || item.created_at as string,
    location: item.location as string || 'Unknown',
    estimatedCost: item.estimated_cost as number | undefined,
    actualCost: item.actual_cost as number | undefined,
    repairVendor: item.repair_vendor as string | undefined,
    resolvedDate: item.resolved_date as string | undefined,
    notes: item.notes as string | undefined,
    images: item.images as string[] | undefined,
  }));
}

async function createDamageReport(params: CreateDamageReportParams): Promise<DamageReport> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create damage report');
  }

  const { data } = await response.json();
  return data;
}

async function updateDamageReport(id: string, updates: Partial<CreateDamageReportParams & { status: string }>): Promise<DamageReport> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update damage report');
  }

  const { data } = await response.json();
  return data;
}

async function deleteDamageReports(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete damage reports');
  }
}

async function resolveDamageReports(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk-resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to resolve damage reports');
  }
}

export function useDamageReportsQuery(params?: {
  status?: string;
  severity?: string;
  asset_id?: string;
}) {
  return useQuery({
    queryKey: ['damage-reports', params],
    queryFn: () => fetchDamageReports(params),
    staleTime: 60000,
  });
}

export function useCreateDamageReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDamageReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damage-reports'] });
    },
  });
}

export function useUpdateDamageReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateDamageReportParams & { status: string }> }) =>
      updateDamageReport(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damage-reports'] });
    },
  });
}

export function useDeleteDamageReports() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDamageReports,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damage-reports'] });
    },
  });
}

export function useResolveDamageReports() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resolveDamageReports,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['damage-reports'] });
    },
  });
}

export function useDamageReports() {
  const reportsQuery = useDamageReportsQuery();
  const createMutation = useCreateDamageReport();
  const updateMutation = useUpdateDamageReport();
  const deleteMutation = useDeleteDamageReports();
  const resolveMutation = useResolveDamageReports();

  return {
    reports: reportsQuery.data || [],
    isLoading: reportsQuery.isLoading,
    error: reportsQuery.error,
    refetch: reportsQuery.refetch,
    createReport: createMutation.mutate,
    createReportAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateReport: updateMutation.mutate,
    updateReportAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteReports: deleteMutation.mutate,
    deleteReportsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    resolveReports: resolveMutation.mutate,
    resolveReportsAsync: resolveMutation.mutateAsync,
    isResolving: resolveMutation.isPending,
  };
}
