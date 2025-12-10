'use client';

import { useQuery } from '@tanstack/react-query';

export interface Subsidiary {
  id: string;
  name: string;
  legal_name: string;
  entity_type: string;
  jurisdiction: string;
  incorporation_date: string;
  tax_id: string;
  parent_entity_id?: string;
  ownership_percentage: number;
  status: string;
  registered_agent?: string;
  primary_contact?: string;
  address?: string;
  annual_revenue?: number;
  employee_count?: number;
  [key: string]: unknown;
}

const DEMO_SUBSIDIARIES: Subsidiary[] = [
  { id: '1', name: 'GHXSTSHIP West', legal_name: 'GHXSTSHIP West LLC', entity_type: 'LLC', jurisdiction: 'California', incorporation_date: '2023-01-15', tax_id: '12-3456789', ownership_percentage: 100, status: 'active', annual_revenue: 2500000 },
  { id: '2', name: 'GHXSTSHIP Media', legal_name: 'GHXSTSHIP Media Inc', entity_type: 'C-Corp', jurisdiction: 'Delaware', incorporation_date: '2023-06-01', tax_id: '98-7654321', ownership_percentage: 80, status: 'active', annual_revenue: 1200000 },
];

export const subsidiaryKeys = {
  all: ['subsidiaries'] as const,
  list: () => [...subsidiaryKeys.all, 'list'] as const,
};

export function useSubsidiariesList() {
  return useQuery({
    queryKey: subsidiaryKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/subsidiaries');
      if (response.status === 401) {
        return DEMO_SUBSIDIARIES;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch subsidiaries');
      }
      const data = await response.json();
      return data.subsidiaries || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubsidiariesData() {
  const subsidiariesQuery = useSubsidiariesList();

  const subsidiaries = subsidiariesQuery.data || [];
  const totalRevenue = subsidiaries.reduce((sum: number, s: Subsidiary) => sum + (s.annual_revenue || 0), 0);
  const totalEmployees = subsidiaries.reduce((sum: number, s: Subsidiary) => sum + (s.employee_count || 0), 0);

  return {
    subsidiaries,
    totalRevenue,
    totalEmployees,
    isLoading: subsidiariesQuery.isLoading,
    error: subsidiariesQuery.error,
    refetch: subsidiariesQuery.refetch,
  };
}
