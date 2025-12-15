import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  type: 'Preventive' | 'Corrective' | 'Emergency' | 'Inspection';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  scheduledDate: string;
  completedDate?: string;
  technician?: string;
  vendor?: string;
  cost?: number;
  description: string;
  notes?: string;
  laborHours?: number;
  nextDue?: string;
}

export interface CreateMaintenanceParams {
  asset_id: string;
  maintenance_type: string;
  priority: string;
  scheduled_date: string;
  description: string;
  technician_id?: string;
  estimated_cost?: number;
  notes?: string;
}

const API_BASE = '/api/maintenance';

async function fetchMaintenanceRecords(params?: {
  status?: string;
  type?: string;
  priority?: string;
  asset_id?: string;
}): Promise<MaintenanceRecord[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.type) searchParams.set('type', params.type);
  if (params?.priority) searchParams.set('priority', params.priority);
  if (params?.asset_id) searchParams.set('asset_id', params.asset_id);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch maintenance records');
  }

  const { data } = await response.json();

  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    assetId: item.asset_id as string,
    assetName: ((item.asset as Record<string, unknown>)?.name || 'Unknown') as string,
    category: ((item.asset as Record<string, unknown>)?.category || 'General') as string,
    type: (item.maintenance_type || item.type) as MaintenanceRecord['type'],
    status: item.status as MaintenanceRecord['status'],
    priority: item.priority as MaintenanceRecord['priority'],
    scheduledDate: item.scheduled_date as string,
    completedDate: item.completed_date as string | undefined,
    technician: item.technician_name as string | undefined,
    vendor: item.vendor_name as string | undefined,
    cost: item.actual_cost as number | undefined,
    description: item.description as string,
    notes: item.notes as string | undefined,
    laborHours: item.labor_hours as number | undefined,
    nextDue: item.next_due_date as string | undefined,
  }));
}

async function createMaintenanceRecord(params: CreateMaintenanceParams): Promise<MaintenanceRecord> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create maintenance record');
  }

  const { data } = await response.json();
  return data;
}

async function updateMaintenanceRecord(id: string, updates: Partial<CreateMaintenanceParams & { status: string }>): Promise<MaintenanceRecord> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update maintenance record');
  }

  const { data } = await response.json();
  return data;
}

async function deleteMaintenanceRecords(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete maintenance records');
  }
}

export function useMaintenanceRecords(params?: {
  status?: string;
  type?: string;
  priority?: string;
  asset_id?: string;
}) {
  return useQuery({
    queryKey: ['maintenance-records', params],
    queryFn: () => fetchMaintenanceRecords(params),
    staleTime: 60000,
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMaintenanceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
    },
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateMaintenanceParams & { status: string }> }) =>
      updateMaintenanceRecord(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
    },
  });
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMaintenanceRecords,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
    },
  });
}

export function useMaintenance() {
  const recordsQuery = useMaintenanceRecords();
  const createMutation = useCreateMaintenance();
  const updateMutation = useUpdateMaintenance();
  const deleteMutation = useDeleteMaintenance();

  return {
    records: recordsQuery.data || [],
    isLoading: recordsQuery.isLoading,
    error: recordsQuery.error,
    refetch: recordsQuery.refetch,
    createRecord: createMutation.mutate,
    createRecordAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateRecord: updateMutation.mutate,
    updateRecordAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteRecords: deleteMutation.mutate,
    deleteRecordsAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
