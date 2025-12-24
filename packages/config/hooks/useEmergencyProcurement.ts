import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface EmergencyProcurement {
  id: string;
  description: string;
  requestor: string;
  department: string;
  amount: number;
  urgency: 'Critical' | 'High' | 'Medium';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  requestDate: string;
  reason: string;
  vendor?: string;
  approver?: string;
  approvedDate?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/procurement/emergency';

async function fetchEmergencyProcurements(): Promise<EmergencyProcurement[]> {
  const response = await fetch(API_BASE);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch emergency procurements');
  }

  const { data } = await response.json();
  return data || [];
}

async function createEmergencyProcurement(data: Partial<EmergencyProcurement>): Promise<EmergencyProcurement> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create emergency procurement');
  }

  return response.json();
}

async function approveEmergencyProcurement(id: string, approver: string): Promise<EmergencyProcurement> {
  const response = await fetch(`${API_BASE}/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approver }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to approve emergency procurement');
  }

  return response.json();
}

async function rejectEmergencyProcurement(id: string, reason: string): Promise<EmergencyProcurement> {
  const response = await fetch(`${API_BASE}/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reject emergency procurement');
  }

  return response.json();
}

export function useEmergencyProcurementsQuery() {
  return useQuery({
    queryKey: ['emergency-procurements'],
    queryFn: fetchEmergencyProcurements,
    staleTime: 30000,
  });
}

export function useCreateEmergencyProcurement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmergencyProcurement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-procurements'] });
    },
  });
}

export function useApproveEmergencyProcurement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approver }: { id: string; approver: string }) => approveEmergencyProcurement(id, approver),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-procurements'] });
    },
  });
}

export function useRejectEmergencyProcurement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectEmergencyProcurement(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-procurements'] });
    },
  });
}

export function useEmergencyProcurement() {
  const queryClient = useQueryClient();
  const query = useEmergencyProcurementsQuery();
  const createMutation = useCreateEmergencyProcurement();
  const approveMutation = useApproveEmergencyProcurement();
  const rejectMutation = useRejectEmergencyProcurement();

  const requests = query.data || [];
  const pendingCount = requests.filter(e => e.status === 'Pending').length;
  const criticalCount = requests.filter(e => e.urgency === 'Critical' && e.status === 'Pending').length;
  const totalAmount = requests.reduce((sum, e) => sum + e.amount, 0);

  return {
    requests,
    summary: {
      pendingCount,
      criticalCount,
      totalAmount,
      totalRequests: requests.length,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutateAsync,
    approve: approveMutation.mutateAsync,
    reject: rejectMutation.mutateAsync,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['emergency-procurements'] }),
  };
}
