import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ABTestVariant {
  name: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
}

export interface ABTest {
  id: string;
  name: string;
  type: 'Landing Page' | 'Pricing' | 'Email' | 'CTA Button' | 'Checkout';
  status: 'Running' | 'Completed' | 'Draft' | 'Paused';
  variants: ABTestVariant[];
  startDate: string;
  endDate?: string;
  confidence?: number;
  winner?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/marketing/ab-tests';

async function fetchABTests(): Promise<ABTest[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch A/B tests');
  }
  const { data } = await response.json();
  return data || [];
}

async function createABTest(data: Partial<ABTest>): Promise<ABTest> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create A/B test');
  }
  return response.json();
}

async function updateABTest(id: string, data: Partial<ABTest>): Promise<ABTest> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update A/B test');
  }
  return response.json();
}

export function useABTestsQuery() {
  return useQuery({
    queryKey: ['ab-tests'],
    queryFn: fetchABTests,
    staleTime: 30000,
  });
}

export function useCreateABTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createABTest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    },
  });
}

export function useUpdateABTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ABTest> }) => updateABTest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    },
  });
}

export function useABTesting() {
  const queryClient = useQueryClient();
  const query = useABTestsQuery();
  const createMutation = useCreateABTest();
  const updateMutation = useUpdateABTest();

  const tests = query.data || [];
  const runningTests = tests.filter(t => t.status === 'Running').length;
  const completedTests = tests.filter(t => t.status === 'Completed').length;

  return {
    tests,
    summary: {
      runningTests,
      completedTests,
      totalTests: tests.length,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['ab-tests'] }),
  };
}
