'use client';

import { useQuery } from '@tanstack/react-query';

export interface Permit {
  id: string;
  type: string;
  issuingAuthority: string;
  permitNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'approved' | 'pending' | 'expired' | 'rejected';
  notes?: string;
}

const DEMO_PERMITS: Permit[] = [
  { id: '1', type: 'Special Event Permit', issuingAuthority: 'City of Los Angeles', permitNumber: 'SEP-2024-4521', issueDate: '2024-10-15', expiryDate: '2024-12-31', status: 'approved' },
  { id: '2', type: 'Fire Safety Permit', issuingAuthority: 'LA Fire Department', permitNumber: 'FSP-2024-892', issueDate: '2024-10-20', expiryDate: '2024-12-31', status: 'approved' },
  { id: '3', type: 'Noise Variance', issuingAuthority: 'City of Los Angeles', permitNumber: 'NV-2024-156', issueDate: '2024-10-25', expiryDate: '2024-12-31', status: 'pending', notes: 'Awaiting final approval' },
  { id: '4', type: 'Temporary Structure', issuingAuthority: 'Building & Safety', permitNumber: 'TS-2024-3341', issueDate: '2024-11-01', expiryDate: '2024-12-31', status: 'approved' },
];

export const productionPermitsKeys = {
  all: ['production-permits'] as const,
  list: (productionId: string) => [...productionPermitsKeys.all, 'list', productionId] as const,
};

export function useProductionPermitsList(productionId?: string) {
  return useQuery({
    queryKey: productionPermitsKeys.list(productionId || ''),
    queryFn: async () => {
      if (!productionId) return DEMO_PERMITS;
      const response = await fetch(`/api/productions/${productionId}/permits`);
      if (response.status === 401) {
        return DEMO_PERMITS;
      }
      if (!response.ok) {
        return DEMO_PERMITS;
      }
      const data = await response.json();
      return data.permits?.length > 0 ? data.permits : DEMO_PERMITS;
    },
    enabled: !!productionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductionPermitsData(productionId?: string) {
  const permitsQuery = useProductionPermitsList(productionId);
  const permits = permitsQuery.data || DEMO_PERMITS;

  const approvedCount = permits.filter((p: Permit) => p.status === 'approved').length;
  const pendingCount = permits.filter((p: Permit) => p.status === 'pending').length;

  return {
    permits,
    approvedCount,
    pendingCount,
    isLoading: permitsQuery.isLoading,
    error: permitsQuery.error,
    refetch: permitsQuery.refetch,
  };
}
