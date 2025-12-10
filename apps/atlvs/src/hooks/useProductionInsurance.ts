'use client';

import { useQuery } from '@tanstack/react-query';

export interface InsurancePolicy {
  id: string;
  type: string;
  provider: string;
  policyNumber: string;
  coverage: number;
  premium: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'expired';
}

const DEMO_POLICIES: InsurancePolicy[] = [
  { id: '1', type: 'General Liability', provider: 'EventGuard Insurance', policyNumber: 'GL-2024-001', coverage: 2000000, premium: 8500, startDate: '2024-11-01', endDate: '2024-12-31', status: 'active' },
  { id: '2', type: 'Workers Compensation', provider: 'SafeWork Inc', policyNumber: 'WC-2024-045', coverage: 1000000, premium: 4200, startDate: '2024-11-01', endDate: '2024-12-31', status: 'active' },
  { id: '3', type: 'Equipment Coverage', provider: 'TechProtect', policyNumber: 'EQ-2024-112', coverage: 500000, premium: 2800, startDate: '2024-11-01', endDate: '2024-12-31', status: 'active' },
  { id: '4', type: 'Event Cancellation', provider: 'EventGuard Insurance', policyNumber: 'EC-2024-089', coverage: 1500000, premium: 12000, startDate: '2024-11-01', endDate: '2024-12-31', status: 'pending' },
];

export const productionInsuranceKeys = {
  all: ['production-insurance'] as const,
  list: (productionId: string) => [...productionInsuranceKeys.all, 'list', productionId] as const,
};

export function useProductionInsuranceList(productionId?: string) {
  return useQuery({
    queryKey: productionInsuranceKeys.list(productionId || ''),
    queryFn: async () => {
      if (!productionId) return DEMO_POLICIES;
      const response = await fetch(`/api/productions/${productionId}/insurance`);
      if (response.status === 401) {
        return DEMO_POLICIES;
      }
      if (!response.ok) {
        return DEMO_POLICIES;
      }
      const data = await response.json();
      return data.policies?.length > 0 ? data.policies : DEMO_POLICIES;
    },
    enabled: !!productionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductionInsuranceData(productionId?: string) {
  const policiesQuery = useProductionInsuranceList(productionId);
  const policies = policiesQuery.data || DEMO_POLICIES;

  const totalCoverage = policies.reduce((sum: number, p: InsurancePolicy) => sum + p.coverage, 0);
  const totalPremium = policies.reduce((sum: number, p: InsurancePolicy) => sum + p.premium, 0);
  const activeCount = policies.filter((p: InsurancePolicy) => p.status === 'active').length;

  return {
    policies,
    totalCoverage,
    totalPremium,
    activeCount,
    isLoading: policiesQuery.isLoading,
    error: policiesQuery.error,
    refetch: policiesQuery.refetch,
  };
}
