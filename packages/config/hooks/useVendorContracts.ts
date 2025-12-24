import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface VendorContract {
  id: string;
  vendor_id: string;
  contract_type: 'master_service' | 'purchase' | 'rental' | 'nda' | 'sow' | 'other';
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  renewal_notice_days: number;
  value?: number;
  payment_terms?: string;
  document_url?: string;
  key_terms?: Record<string, unknown>;
  contacts?: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  days_until_expiry?: number;
  needs_renewal_notice?: boolean;
  is_expired?: boolean;
  created_at: string;
  updated_at: string;
  vendor?: {
    id: string;
    name: string;
    contact_email?: string;
    phone?: string;
  };
}

export interface VendorContractSummary {
  expiring_in_30_days: number;
  expiring_in_60_days: number;
  expired: number;
}

export interface VendorContractsResponse {
  contracts: VendorContract[];
  total: number;
  summary: VendorContractSummary;
  limit: number;
  offset: number;
}

const API_BASE = '/api/vendor-contracts';

async function fetchVendorContracts(params?: {
  vendor_id?: string;
  status?: string;
  expiring_within_days?: number;
  limit?: number;
  offset?: number;
}): Promise<VendorContractsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.vendor_id) searchParams.set('vendor_id', params.vendor_id);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.expiring_within_days) searchParams.set('expiring_within_days', params.expiring_within_days.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch vendor contracts');
  }

  return response.json();
}

async function fetchVendorContract(id: string): Promise<VendorContract> {
  const response = await fetch(`${API_BASE}?contract_id=${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch vendor contract');
  }

  const { contract } = await response.json();
  return contract;
}

async function createVendorContract(data: Omit<VendorContract, 'id' | 'created_at' | 'updated_at' | 'status' | 'days_until_expiry' | 'needs_renewal_notice' | 'is_expired'>): Promise<VendorContract> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, action: 'create' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create vendor contract');
  }

  const { contract } = await response.json();
  return contract;
}

async function updateVendorContract(id: string, data: Partial<VendorContract>): Promise<VendorContract> {
  const response = await fetch(`${API_BASE}?contract_id=${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update vendor contract');
  }

  const { contract } = await response.json();
  return contract;
}

async function renewVendorContract(contractId: string, newEndDate: string, newValue?: number, notes?: string): Promise<VendorContract> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'renew',
      contract_id: contractId,
      new_end_date: newEndDate,
      new_value: newValue,
      notes,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to renew vendor contract');
  }

  const { contract } = await response.json();
  return contract;
}

async function terminateVendorContract(id: string, reason?: string): Promise<void> {
  const response = await fetch(`${API_BASE}?contract_id=${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to terminate vendor contract');
  }
}

export function useVendorContractsQuery(params?: {
  vendor_id?: string;
  status?: string;
  expiring_within_days?: number;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['vendor-contracts', params],
    queryFn: () => fetchVendorContracts(params),
    staleTime: 60000,
  });
}

export function useVendorContractQuery(id: string) {
  return useQuery({
    queryKey: ['vendor-contracts', id],
    queryFn: () => fetchVendorContract(id),
    enabled: !!id,
  });
}

export function useCreateVendorContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVendorContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contracts'] });
    },
  });
}

export function useUpdateVendorContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: Partial<VendorContract> & { id: string }) =>
      updateVendorContract(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contracts'] });
    },
  });
}

export function useRenewVendorContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, newEndDate, newValue, notes }: {
      contractId: string;
      newEndDate: string;
      newValue?: number;
      notes?: string;
    }) => renewVendorContract(contractId, newEndDate, newValue, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contracts'] });
    },
  });
}

export function useTerminateVendorContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      terminateVendorContract(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-contracts'] });
    },
  });
}

export function useVendorContracts(params?: {
  vendor_id?: string;
  status?: string;
  expiring_within_days?: number;
}) {
  const contractsQuery = useVendorContractsQuery(params);
  const createMutation = useCreateVendorContract();
  const updateMutation = useUpdateVendorContract();
  const renewMutation = useRenewVendorContract();
  const terminateMutation = useTerminateVendorContract();

  return {
    contracts: contractsQuery.data?.contracts || [],
    total: contractsQuery.data?.total || 0,
    summary: contractsQuery.data?.summary || null,
    isLoading: contractsQuery.isLoading,
    error: contractsQuery.error,
    refetch: contractsQuery.refetch,
    createContract: createMutation.mutate,
    createContractAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateContract: updateMutation.mutate,
    updateContractAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    renewContract: renewMutation.mutate,
    renewContractAsync: renewMutation.mutateAsync,
    isRenewing: renewMutation.isPending,
    terminateContract: terminateMutation.mutate,
    terminateContractAsync: terminateMutation.mutateAsync,
    isTerminating: terminateMutation.isPending,
  };
}
