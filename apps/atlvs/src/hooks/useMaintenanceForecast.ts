import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface MaintenancePrediction {
  id: string;
  asset_id: string;
  asset_name: string;
  predicted_issue: string;
  issue_category: 'wear' | 'damage' | 'calibration' | 'replacement' | 'inspection';
  probability: number;
  confidence_level: number;
  recommended_action: string;
  estimated_cost: number;
  due_date: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  factors: Array<{
    factor: string;
    contribution: number;
  }>;
  status: 'predicted' | 'scheduled' | 'completed' | 'dismissed';
  created_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  asset_id: string;
  asset_name: string;
  maintenance_type: 'preventive' | 'corrective' | 'predictive';
  description: string;
  scheduled_date: string;
  estimated_duration_hours: number;
  estimated_cost: number;
  assigned_to?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface MaintenanceForecastSummary {
  total_predictions: number;
  predictions_by_urgency: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  estimated_total_cost: number;
  next_30_days: MaintenancePrediction[];
  next_90_days: MaintenancePrediction[];
  cost_by_category: Array<{
    category: string;
    count: number;
    total_cost: number;
  }>;
}

async function fetchMaintenanceForecast(): Promise<MaintenanceForecastSummary> {
  const response = await fetch('/api/assets/maintenance-forecast');
  if (!response.ok) {
    throw new Error('Failed to fetch maintenance forecast');
  }
  return response.json();
}

async function fetchAssetMaintenanceHistory(assetId: string): Promise<{
  predictions: MaintenancePrediction[];
  schedules: MaintenanceSchedule[];
  total_maintenance_cost: number;
}> {
  const response = await fetch(`/api/assets/${assetId}/maintenance`);
  if (!response.ok) {
    throw new Error('Failed to fetch asset maintenance history');
  }
  return response.json();
}

async function scheduleMaintenance(input: {
  assetId: string;
  predictionId?: string;
  maintenanceType: MaintenanceSchedule['maintenance_type'];
  description: string;
  scheduledDate: string;
  estimatedDurationHours: number;
  estimatedCost: number;
  assignedTo?: string;
  notes?: string;
}): Promise<MaintenanceSchedule> {
  const response = await fetch('/api/maintenance-schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to schedule maintenance');
  }
  return response.json();
}

async function completeMaintenance(input: {
  scheduleId: string;
  actualCost: number;
  notes?: string;
}): Promise<MaintenanceSchedule> {
  const response = await fetch(`/api/maintenance-schedules/${input.scheduleId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to complete maintenance');
  }
  return response.json();
}

async function dismissPrediction(predictionId: string): Promise<MaintenancePrediction> {
  const response = await fetch(`/api/maintenance-predictions/${predictionId}/dismiss`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to dismiss prediction');
  }
  return response.json();
}

export function useMaintenanceForecast() {
  return useQuery({
    queryKey: ['maintenance-forecast'],
    queryFn: fetchMaintenanceForecast,
  });
}

export function useAssetMaintenanceHistory(assetId: string) {
  return useQuery({
    queryKey: ['asset-maintenance', assetId],
    queryFn: () => fetchAssetMaintenanceHistory(assetId),
    enabled: !!assetId,
  });
}

export function useScheduleMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheduleMaintenance,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-forecast'] });
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance', data.asset_id] });
    },
  });
}

export function useCompleteMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-forecast'] });
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance'] });
    },
  });
}

export function useDismissPrediction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dismissPrediction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-forecast'] });
    },
  });
}
