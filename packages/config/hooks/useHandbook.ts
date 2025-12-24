import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface HandbookSection {
  id: string;
  title: string;
  category: string;
  description: string;
  version: string;
  lastUpdated: string;
  requiresAck: boolean;
  content?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PolicyAcknowledgment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  policyId: string;
  policyTitle: string;
  dueDate: string;
  acknowledgedDate?: string;
  status: 'Acknowledged' | 'Pending' | 'Overdue';
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/handbook';

async function fetchSections(params?: { category?: string }): Promise<HandbookSection[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);

  const url = `${API_BASE}/sections${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch handbook sections');
  }

  const { data } = await response.json();
  return data || [];
}

async function fetchAcknowledgments(params?: { status?: string }): Promise<PolicyAcknowledgment[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}/acknowledgments${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch policy acknowledgments');
  }

  const { data } = await response.json();
  return data || [];
}

export function useHandbookSectionsQuery(params?: { category?: string }) {
  return useQuery({
    queryKey: ['handbook-sections', params],
    queryFn: () => fetchSections(params),
    staleTime: 60000,
  });
}

export function usePolicyAcknowledgmentsQuery(params?: { status?: string }) {
  return useQuery({
    queryKey: ['policy-acknowledgments', params],
    queryFn: () => fetchAcknowledgments(params),
    staleTime: 60000,
  });
}

export function useHandbook(params?: { category?: string; status?: string }) {
  const queryClient = useQueryClient();
  const sectionsQuery = useHandbookSectionsQuery({ category: params?.category });
  const acknowledgmentsQuery = usePolicyAcknowledgmentsQuery({ status: params?.status });

  const sections = sectionsQuery.data || [];
  const acknowledgments = acknowledgmentsQuery.data || [];

  const requiresAckCount = sections.filter(s => s.requiresAck).length;
  const acknowledgedCount = acknowledgments.filter(a => a.status === 'Acknowledged').length;
  const pendingCount = acknowledgments.filter(a => a.status === 'Pending').length;
  const overdueCount = acknowledgments.filter(a => a.status === 'Overdue').length;
  const complianceRate = acknowledgments.length > 0 ? Math.round((acknowledgedCount / acknowledgments.length) * 100) : 0;

  return {
    sections,
    acknowledgments,
    summary: {
      totalSections: sections.length,
      requiresAck: requiresAckCount,
      acknowledged: acknowledgedCount,
      pending: pendingCount,
      overdue: overdueCount,
      complianceRate,
    },
    isLoading: sectionsQuery.isLoading || acknowledgmentsQuery.isLoading,
    error: sectionsQuery.error || acknowledgmentsQuery.error,
    refetch: () => {
      sectionsQuery.refetch();
      acknowledgmentsQuery.refetch();
    },
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: ['handbook-sections'] });
      queryClient.invalidateQueries({ queryKey: ['policy-acknowledgments'] });
    },
  };
}
