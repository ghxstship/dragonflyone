import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface OrderApproval {
  id: string;
  order_id: string;
  order_number: string;
  vendor_name: string;
  order_total: number;
  requested_by: string;
  requested_at: string;
  approval_level: number;
  required_level: number;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  approver_id?: string;
  approver_name?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  notes?: string;
}

export interface ApprovalAction {
  order_id: string;
  action: 'approve' | 'reject' | 'escalate';
  notes?: string;
  rejection_reason?: string;
}

export interface ApprovalStats {
  pending_count: number;
  pending_total: number;
  approved_today: number;
  rejected_today: number;
  average_approval_time_hours: number;
}

async function fetchPendingApprovals(): Promise<{
  approvals: OrderApproval[];
  stats: ApprovalStats;
}> {
  const response = await fetch('/api/vendor-orders/approvals/pending');
  if (!response.ok) {
    throw new Error('Failed to fetch pending approvals');
  }
  return response.json();
}

async function fetchApprovalHistory(filters?: { startDate?: string; endDate?: string }): Promise<{
  approvals: OrderApproval[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (filters?.startDate) params.set('start_date', filters.startDate);
  if (filters?.endDate) params.set('end_date', filters.endDate);

  const response = await fetch(`/api/vendor-orders/approvals/history?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch approval history');
  }
  return response.json();
}

async function processApproval(input: ApprovalAction): Promise<OrderApproval> {
  const response = await fetch(`/api/vendor-orders/${input.order_id}/approval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process approval');
  }
  return response.json();
}

async function bulkApprove(orderIds: string[]): Promise<{ approved: number; failed: number }> {
  const response = await fetch('/api/vendor-orders/approvals/bulk-approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_ids: orderIds }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to bulk approve');
  }
  return response.json();
}

export function usePendingApprovals() {
  return useQuery({
    queryKey: ['order-approvals', 'pending'],
    queryFn: fetchPendingApprovals,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useApprovalHistory(filters?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['order-approvals', 'history', filters],
    queryFn: () => fetchApprovalHistory(filters),
  });
}

export function useProcessApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: processApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
    },
  });
}

export function useBulkApprove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkApprove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
    },
  });
}
