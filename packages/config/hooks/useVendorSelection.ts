import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface VendorBid {
  id?: string;
  vendorName?: string;
  name?: string;
  bidAmount?: number;
  price?: number;
  technicalScore?: number;
  priceScore?: number;
  overallScore?: number;
  score?: number;
  rank?: number;
  recommendation?: 'Recommended' | 'Acceptable' | 'Not Recommended';
  notes?: string;
  status?: string;
}

export interface EvaluationCriteria {
  name: string;
  weight: number;
  description: string;
}

export interface Approver {
  id: string;
  name: string;
  role: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedAt?: string;
  comments?: string;
}

export interface VendorSelection {
  id: string;
  rfpId: string;
  rfpTitle: string;
  status: 'Evaluating' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Awarded';
  vendors: VendorBid[];
  evaluationCriteria: EvaluationCriteria[];
  approvers: Approver[];
  dueDate: string;
  createdAt: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/procurement/vendor-selections';

async function fetchVendorSelections(): Promise<VendorSelection[]> {
  const response = await fetch(API_BASE);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch vendor selections');
  }

  const { data } = await response.json();
  return data || [];
}

async function createVendorSelection(data: Partial<VendorSelection>): Promise<VendorSelection> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create vendor selection');
  }

  return response.json();
}

async function updateVendorSelection(id: string, data: Partial<VendorSelection>): Promise<VendorSelection> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update vendor selection');
  }

  return response.json();
}

async function approveVendorSelection(id: string, approverId: string, comments?: string): Promise<VendorSelection> {
  const response = await fetch(`${API_BASE}/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approverId, comments }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to approve vendor selection');
  }

  return response.json();
}

async function rejectVendorSelection(id: string, approverId: string, comments: string): Promise<VendorSelection> {
  const response = await fetch(`${API_BASE}/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approverId, comments }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reject vendor selection');
  }

  return response.json();
}

export function useVendorSelectionsQuery() {
  return useQuery({
    queryKey: ['vendor-selections'],
    queryFn: fetchVendorSelections,
    staleTime: 60000,
  });
}

export function useCreateVendorSelection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVendorSelection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-selections'] });
    },
  });
}

export function useUpdateVendorSelection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VendorSelection> }) => updateVendorSelection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-selections'] });
    },
  });
}

export function useApproveVendorSelection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approverId, comments }: { id: string; approverId: string; comments?: string }) => approveVendorSelection(id, approverId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-selections'] });
    },
  });
}

export function useRejectVendorSelection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approverId, comments }: { id: string; approverId: string; comments: string }) => rejectVendorSelection(id, approverId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-selections'] });
    },
  });
}

export function useVendorSelection() {
  const queryClient = useQueryClient();
  const query = useVendorSelectionsQuery();
  const createMutation = useCreateVendorSelection();
  const updateMutation = useUpdateVendorSelection();
  const approveMutation = useApproveVendorSelection();
  const rejectMutation = useRejectVendorSelection();

  const selections = query.data || [];
  const pendingApprovals = selections.filter(s => s.status === 'Pending Approval').length;
  const evaluating = selections.filter(s => s.status === 'Evaluating').length;
  const awarded = selections.filter(s => s.status === 'Awarded').length;

  return {
    selections,
    summary: {
      totalSelections: selections.length,
      pendingApprovals,
      evaluating,
      awarded,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    approve: approveMutation.mutateAsync,
    reject: rejectMutation.mutateAsync,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['vendor-selections'] }),
  };
}
