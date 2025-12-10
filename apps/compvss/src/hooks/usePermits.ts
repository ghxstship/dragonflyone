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

const DEMO_PERMITS: Permit[] = [
  { id: 'demo-1', permit_number: 'SP-2024-0123', permit_type: 'Special Event', project_id: 'proj-001', project_name: 'Summer Festival 2024', venue_name: 'Central Park', jurisdiction: 'NYC Parks Dept', issuing_authority: 'NYC Special Events', application_date: new Date(Date.now() - 30 * 86400000).toISOString(), approval_date: new Date(Date.now() - 15 * 86400000).toISOString(), expiration_date: new Date(Date.now() + 60 * 86400000).toISOString(), fee_amount: 2500, status: 'approved' },
  { id: 'demo-2', permit_number: 'NS-2024-0456', permit_type: 'Noise/Sound', project_id: 'proj-001', project_name: 'Summer Festival 2024', venue_name: 'Central Park', jurisdiction: 'NYC DEP', issuing_authority: 'NYC Environmental', application_date: new Date(Date.now() - 20 * 86400000).toISOString(), fee_amount: 500, status: 'pending' },
];

const DEMO_SUMMARY: PermitSummary = {
  total_permits: 2,
  pending_applications: 1,
  approved_permits: 1,
  expiring_soon: 0,
  total_fees: 3000,
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
      if (response.status === 401) {
        return { permits: DEMO_PERMITS, summary: DEMO_SUMMARY };
      }
      if (!response.ok) {
        throw new Error('Failed to fetch permits');
      }
      const data = await response.json();
      return {
        permits: data.permits || [],
        summary: data.summary || DEMO_SUMMARY,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePermitsData() {
  const permitsQuery = usePermitsList();

  const data = permitsQuery.data || { permits: [], summary: DEMO_SUMMARY };

  return {
    permits: data.permits,
    summary: data.summary,
    isLoading: permitsQuery.isLoading,
    error: permitsQuery.error,
    refetch: permitsQuery.refetch,
  };
}
