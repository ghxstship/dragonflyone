'use client';

import { useQuery } from '@tanstack/react-query';

export interface RFP {
  id: string;
  title: string;
  description: string;
  project_type: string;
  budget_min: number;
  budget_max: number;
  status: string;
  deadline: string;
  submission_deadline: string;
  responses?: { count: number }[];
  created_by_user?: { id: string; full_name: string; email: string };
  created_at: string;
  [key: string]: unknown;
}

const DEMO_RFPS: RFP[] = [
  { id: '1', title: 'Summer Festival Production', description: 'Full production services for annual summer festival', project_type: 'festival', budget_min: 100000, budget_max: 250000, status: 'open', deadline: '2025-02-15', submission_deadline: '2025-02-15', created_at: '2025-01-10' },
  { id: '2', title: 'Corporate Event AV', description: 'Audio-visual services for corporate conference', project_type: 'corporate', budget_min: 25000, budget_max: 50000, status: 'evaluation', deadline: '2025-01-30', submission_deadline: '2025-01-30', responses: [{ count: 5 }], created_at: '2025-01-05' },
];

export const rfpKeys = {
  all: ['rfp'] as const,
  list: () => [...rfpKeys.all, 'list'] as const,
};

export function useRFPList() {
  return useQuery({
    queryKey: rfpKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/rfp');
      if (response.status === 401) {
        return DEMO_RFPS;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch RFPs');
      }
      const data = await response.json();
      return data.rfps || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRFPData() {
  const rfpQuery = useRFPList();

  const rfps = rfpQuery.data || [];
  const openCount = rfps.filter((r: RFP) => r.status === 'open').length;
  const totalResponses = rfps.reduce((sum: number, r: RFP) => sum + (r.responses?.[0]?.count || 0), 0);

  return {
    rfps,
    openCount,
    totalResponses,
    isLoading: rfpQuery.isLoading,
    error: rfpQuery.error,
    refetch: rfpQuery.refetch,
  };
}
