import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface UnionLocal {
  id: string;
  name: string;
  code: string;
  jurisdiction: string;
  memberCount: number;
  contactName: string;
  contactPhone: string;
  agreementExpiry: string;
  status: 'Active' | 'Expiring' | 'Expired';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UnionComplianceRule {
  id: string;
  localId: string;
  category: string;
  rule: string;
  requirement: string;
  penalty?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/union-compliance';

async function fetchLocals(): Promise<UnionLocal[]> {
  const response = await fetch(`${API_BASE}/locals`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch union locals');
  }

  const { data } = await response.json();
  return data || [];
}

async function fetchComplianceRules(): Promise<UnionComplianceRule[]> {
  const response = await fetch(`${API_BASE}/rules`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch compliance rules');
  }

  const { data } = await response.json();
  return data || [];
}

export function useUnionLocalsQuery() {
  return useQuery({
    queryKey: ['union-locals'],
    queryFn: fetchLocals,
    staleTime: 60000,
  });
}

export function useUnionComplianceRulesQuery() {
  return useQuery({
    queryKey: ['union-compliance-rules'],
    queryFn: fetchComplianceRules,
    staleTime: 60000,
  });
}

export function useUnionCompliance() {
  const queryClient = useQueryClient();
  const localsQuery = useUnionLocalsQuery();
  const rulesQuery = useUnionComplianceRulesQuery();

  const locals = localsQuery.data || [];
  const rules = rulesQuery.data || [];

  const expiringCount = locals.filter(l => l.status === 'Expiring').length;
  const totalMembers = locals.reduce((s, l) => s + l.memberCount, 0);

  return {
    locals,
    rules,
    summary: {
      totalLocals: locals.length,
      totalMembers,
      totalRules: rules.length,
      expiring: expiringCount,
    },
    isLoading: localsQuery.isLoading || rulesQuery.isLoading,
    error: localsQuery.error || rulesQuery.error,
    refetch: () => {
      localsQuery.refetch();
      rulesQuery.refetch();
    },
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: ['union-locals'] });
      queryClient.invalidateQueries({ queryKey: ['union-compliance-rules'] });
    },
  };
}
