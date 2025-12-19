'use client';

import { useQuery } from '@tanstack/react-query';

export interface Subcontractor {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  specialty: string;
  location: string;
  rating: number;
  total_projects: number;
  active_projects: number;
  insurance_status: string;
  insurance_expiry?: string;
  contract_status: string;
  hourly_rate?: number;
  day_rate?: number;
  notes?: string;
}

export interface SubcontractorSummary {
  total_subcontractors: number;
  active_engagements: number;
  pending_contracts: number;
  expiring_insurance: number;
  total_spend_ytd: number;
  average_rating: number;
}

const DEFAULT_SUMMARY: SubcontractorSummary = {
  total_subcontractors: 0,
  active_engagements: 0,
  pending_contracts: 0,
  expiring_insurance: 0,
  total_spend_ytd: 0,
  average_rating: 0,
};

export const subcontractorKeys = {
  all: ['subcontractors'] as const,
  list: () => [...subcontractorKeys.all, 'list'] as const,
};

export function useSubcontractorsList() {
  return useQuery({
    queryKey: subcontractorKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/subcontractors');
      if (!response.ok) {
        throw new Error('Failed to fetch subcontractors');
      }
      const data = await response.json();
      return {
        subcontractors: data.subcontractors || [],
        summary: data.summary || DEFAULT_SUMMARY,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubcontractorsData() {
  const subcontractorsQuery = useSubcontractorsList();

  const data = subcontractorsQuery.data || { subcontractors: [], summary: DEFAULT_SUMMARY };

  return {
    subcontractors: data.subcontractors,
    summary: data.summary,
    isLoading: subcontractorsQuery.isLoading,
    error: subcontractorsQuery.error,
    refetch: subcontractorsQuery.refetch,
  };
}
