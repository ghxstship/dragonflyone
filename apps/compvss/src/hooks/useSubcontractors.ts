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

const DEMO_SUBCONTRACTORS: Subcontractor[] = [
  { id: 'demo-1', company_name: 'SoundWave Audio', contact_name: 'Mike Johnson', email: 'mike@soundwave.com', phone: '(555) 123-4567', specialty: 'Audio', location: 'Los Angeles, CA', rating: 4.8, total_projects: 24, active_projects: 3, insurance_status: 'valid', insurance_expiry: new Date(Date.now() + 180 * 86400000).toISOString(), contract_status: 'active', hourly_rate: 75, day_rate: 600 },
  { id: 'demo-2', company_name: 'Bright Lights Co', contact_name: 'Sarah Lee', email: 'sarah@brightlights.com', phone: '(555) 987-6543', specialty: 'Lighting', location: 'New York, NY', rating: 4.6, total_projects: 18, active_projects: 2, insurance_status: 'valid', contract_status: 'active', hourly_rate: 85, day_rate: 680 },
];

const DEMO_SUMMARY: SubcontractorSummary = {
  total_subcontractors: 45,
  active_engagements: 12,
  pending_contracts: 3,
  expiring_insurance: 2,
  total_spend_ytd: 285000,
  average_rating: 4.5,
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
      if (response.status === 401) {
        return { subcontractors: DEMO_SUBCONTRACTORS, summary: DEMO_SUMMARY };
      }
      if (!response.ok) {
        throw new Error('Failed to fetch subcontractors');
      }
      const data = await response.json();
      return {
        subcontractors: data.subcontractors || [],
        summary: data.summary || DEMO_SUMMARY,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubcontractorsData() {
  const subcontractorsQuery = useSubcontractorsList();

  const data = subcontractorsQuery.data || { subcontractors: [], summary: DEMO_SUMMARY };

  return {
    subcontractors: data.subcontractors,
    summary: data.summary,
    isLoading: subcontractorsQuery.isLoading,
    error: subcontractorsQuery.error,
    refetch: subcontractorsQuery.refetch,
  };
}
