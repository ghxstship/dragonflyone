import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CalibrationRecord {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  calibrationType: string;
  lastCalibration: string;
  nextDue: string;
  frequency: string;
  status: 'Current' | 'Due Soon' | 'Overdue' | 'Scheduled';
  certifiedBy?: string;
  notes?: string;
}

export interface CreateCalibrationParams {
  asset_id?: string;
  component_id?: string;
  calibration_type: string;
  frequency_days: number;
  next_calibration_date: string;
  last_calibration_date?: string;
  priority?: 'critical' | 'high' | 'normal' | 'low';
  notes?: string;
}

const API_BASE = '/api/calibration-schedules';

function getStatusFromDate(nextDue: string): CalibrationRecord['status'] {
  const now = new Date();
  const dueDate = new Date(nextDue);
  const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 0) return 'Overdue';
  if (daysUntilDue <= 30) return 'Due Soon';
  return 'Current';
}

function frequencyDaysToLabel(days: number): string {
  if (days === 30) return 'Monthly';
  if (days === 90) return 'Quarterly';
  if (days === 180) return 'Semi-Annual';
  if (days === 365) return 'Annual';
  return `Every ${days} days`;
}

async function fetchCalibrationSchedules(params?: {
  status?: string;
  priority?: string;
  overdue_only?: boolean;
}): Promise<CalibrationRecord[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.priority) searchParams.set('priority', params.priority);
  if (params?.overdue_only) searchParams.set('overdue_only', 'true');

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch calibration schedules');
  }
  
  const { data } = await response.json();
  
  // Transform API response to CalibrationRecord format
  return (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    assetId: (item.asset_id || item.component_id || '') as string,
    assetName: ((item.asset as Record<string, unknown>)?.name || (item.component as Record<string, unknown>)?.serial_number || 'Unknown') as string,
    category: ((item.asset as Record<string, unknown>)?.category || (item.component as Record<string, unknown>)?.component_type || 'General') as string,
    calibrationType: item.calibration_type as string,
    lastCalibration: item.last_calibration_date as string || 'N/A',
    nextDue: item.next_calibration_date as string,
    frequency: frequencyDaysToLabel(item.frequency_days as number),
    status: item.status as CalibrationRecord['status'] || getStatusFromDate(item.next_calibration_date as string),
    certifiedBy: item.certified_technician_required ? 'Certified Tech Required' : undefined,
    notes: item.notes as string,
  }));
}

async function createCalibrationSchedule(params: CreateCalibrationParams): Promise<CalibrationRecord> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create calibration schedule');
  }

  const { data } = await response.json();
  return data;
}

async function deleteCalibrationSchedules(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete calibration schedules');
  }
}

export function useCalibrationSchedules(params?: {
  status?: string;
  priority?: string;
  overdue_only?: boolean;
}) {
  return useQuery({
    queryKey: ['calibration-schedules', params],
    queryFn: () => fetchCalibrationSchedules(params),
    staleTime: 60000, // 1 minute
  });
}

export function useCreateCalibration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCalibrationSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calibration-schedules'] });
    },
  });
}

export function useDeleteCalibrations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCalibrationSchedules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calibration-schedules'] });
    },
  });
}

export function useCalibration() {
  const schedulesQuery = useCalibrationSchedules();
  const createMutation = useCreateCalibration();
  const deleteMutation = useDeleteCalibrations();

  return {
    schedules: schedulesQuery.data || [],
    isLoading: schedulesQuery.isLoading,
    error: schedulesQuery.error,
    refetch: schedulesQuery.refetch,
    createSchedule: createMutation.mutate,
    createScheduleAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteSchedules: deleteMutation.mutate,
    deleteSchedulesAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
