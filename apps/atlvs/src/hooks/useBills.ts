'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Bill {
  id: string;
  bill_number: string;
  vendor_id: string;
  vendor?: { id: string; name: string; vendor_code?: string };
  project_id?: string;
  project?: { id: string; name: string; project_code?: string };
  description: string;
  amount: number;
  amount_paid: number;
  currency: string;
  issue_date: string;
  due_date: string;
  status: 'pending' | 'approved' | 'partial' | 'paid' | 'cancelled';
  category?: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface BillFilters {
  vendor_id?: string;
  project_id?: string;
  status?: string;
  overdue?: boolean;
}

interface BillSummary {
  total: number;
  by_status: Record<string, number>;
  total_billed: number;
  total_paid: number;
  total_outstanding: number;
  overdue_amount: number;
}

// Query keys
export const billKeys = {
  all: ['bills'] as const,
  list: (filters?: BillFilters) => [...billKeys.all, 'list', filters] as const,
  detail: (id: string) => [...billKeys.all, 'detail', id] as const,
};

// Fetch bills list
export function useBills(filters?: BillFilters) {
  return useQuery({
    queryKey: billKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.vendor_id) params.append('vendor_id', filters.vendor_id);
      if (filters?.project_id) params.append('project_id', filters.project_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.overdue) params.append('overdue', 'true');

      const response = await fetch(`/api/bills?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }
      const data = await response.json();
      return {
        bills: (data.bills || []) as Bill[],
        summary: data.summary as BillSummary,
        pagination: data.pagination,
      };
    },
  });
}

// Fetch single bill
export function useBill(id: string) {
  return useQuery({
    queryKey: billKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/bills/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bill');
      }
      return response.json() as Promise<Bill>;
    },
    enabled: !!id,
  });
}

// Create bill
export function useCreateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Bill, 'id' | 'bill_number' | 'amount_paid' | 'status' | 'created_at' | 'updated_at' | 'vendor' | 'project'>) => {
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create bill');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.all });
    },
  });
}

// Update bill
export function useUpdateBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Bill> & { id: string }) => {
      const response = await fetch(`/api/bills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update bill');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billKeys.all });
      queryClient.invalidateQueries({ queryKey: billKeys.detail(variables.id) });
    },
  });
}

// Record payment
export function useRecordBillPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ billId, payment }: { 
      billId: string; 
      payment: { 
        amount: number; 
        payment_date: string; 
        payment_method: string;
        reference_number?: string;
        notes?: string;
      } 
    }) => {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'record_payment', payment }),
      });
      if (!response.ok) {
        throw new Error('Failed to record payment');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billKeys.all });
      queryClient.invalidateQueries({ queryKey: billKeys.detail(variables.billId) });
    },
  });
}

// Approve bill
export function useApproveBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billId: string) => {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (!response.ok) {
        throw new Error('Failed to approve bill');
      }
      return response.json();
    },
    onSuccess: (_, billId) => {
      queryClient.invalidateQueries({ queryKey: billKeys.all });
      queryClient.invalidateQueries({ queryKey: billKeys.detail(billId) });
    },
  });
}

// Cancel bill
export function useCancelBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ billId, reason }: { billId: string; reason?: string }) => {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', reason }),
      });
      if (!response.ok) {
        throw new Error('Failed to cancel bill');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billKeys.all });
      queryClient.invalidateQueries({ queryKey: billKeys.detail(variables.billId) });
    },
  });
}

// Delete bill
export function useDeleteBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billId: string) => {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete bill');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billKeys.all });
    },
  });
}

// Combined hook for page usage
export function useBillsData(filters?: BillFilters) {
  const billsQuery = useBills(filters);
  const createMutation = useCreateBill();
  const updateMutation = useUpdateBill();
  const recordPaymentMutation = useRecordBillPayment();
  const approveMutation = useApproveBill();
  const cancelMutation = useCancelBill();
  const deleteMutation = useDeleteBill();

  return {
    // Data
    bills: billsQuery.data?.bills || [],
    summary: billsQuery.data?.summary,
    pagination: billsQuery.data?.pagination,

    // Loading states
    isLoading: billsQuery.isLoading,
    error: billsQuery.error,

    // Mutations
    createBill: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateBill: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    recordPayment: recordPaymentMutation.mutateAsync,
    isRecordingPayment: recordPaymentMutation.isPending,

    approveBill: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,

    cancelBill: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,

    deleteBill: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    // Refetch
    refetch: billsQuery.refetch,
  };
}
