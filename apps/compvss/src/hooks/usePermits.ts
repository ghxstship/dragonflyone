'use client';

import { useQuery } from '@tanstack/react-query';

export interface Permit {
  id: string;
  permit_number?: string;
  permit_type: string;
  project_id: string;
  project_name: string;
  venue_name: string;
  jurisdiction: string;
  issuing_authority: string;
  application_date: string;
  approval_date?: string;
  expiration_date?: string;
  fee_amount: number;
  status: string;
  requirements?: string[];
  documents?: string[];
  notes?: string;
}

export interface PermitSummary {
  total_permits: number;
  pending_applications: number;
  approved_permits: number;
  expiring_soon: number;
  total_fees: number;
}

const DEFAULT_SUMMARY: PermitSummary = {
  total_permits: 0,
  pending_applications: 0,
  approved_permits: 0,
  expiring_soon: 0,
  total_fees: 0,
};

export const permitKeys = {
  all: ['permits'] as const,
  list: () => [...permitKeys.all, 'list'] as const,
};

export function usePermitsList() {
  return useQuery({
    queryKey: permitKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/permits');
      if (!response.ok) {
        throw new Error('Failed to fetch permits');
      }
      const data = await response.json();
      return {
        permits: data.permits || [],
        summary: data.summary || DEFAULT_SUMMARY,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePermitsData() {
  const permitsQuery = usePermitsList();

  const data = permitsQuery.data || { permits: [], summary: DEFAULT_SUMMARY };

  return {
    permits: data.permits,
    summary: data.summary,
    isLoading: permitsQuery.isLoading,
    error: permitsQuery.error,
    refetch: permitsQuery.refetch,
  };
}
