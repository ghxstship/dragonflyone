'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ABTest {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ABTestVariant[];
  traffic_allocation: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  is_control: boolean;
}

export interface ABTestAssignment {
  test_id: string;
  variant_id: string;
  user_id: string;
  assigned_at: string;
}

export function useABTests() {
  return useQuery({
    queryKey: ['ab-tests'],
    queryFn: async () => {
      const response = await fetch('/api/ab-testing');
      if (!response.ok) throw new Error('Failed to fetch A/B tests');
      return response.json();
    },
  });
}

export function useABTest(testId?: string) {
  return useQuery({
    queryKey: ['ab-test', testId],
    queryFn: async () => {
      const response = await fetch(`/api/ab-testing?test_id=${testId}`);
      if (!response.ok) throw new Error('Failed to fetch A/B test');
      return response.json();
    },
    enabled: !!testId,
  });
}

export function useABTestAssignment(testId?: string, userId?: string) {
  return useQuery({
    queryKey: ['ab-test-assignment', testId, userId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (testId) params.append('test_id', testId);
      if (userId) params.append('user_id', userId);
      
      const response = await fetch(`/api/ab-testing?${params}&type=assignment`);
      if (!response.ok) throw new Error('Failed to fetch A/B test assignment');
      return response.json();
    },
    enabled: !!testId && !!userId,
  });
}

export function useCreateABTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      variants: { name: string; weight: number; is_control: boolean }[];
      traffic_allocation?: number;
    }) => {
      const response = await fetch('/api/ab-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create A/B test');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    },
  });
}

export function useUpdateABTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ testId, ...data }: { testId: string; status?: string; traffic_allocation?: number }) => {
      const response = await fetch('/api/ab-testing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_id: testId, ...data }),
      });
      if (!response.ok) throw new Error('Failed to update A/B test');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      queryClient.invalidateQueries({ queryKey: ['ab-test', variables.testId] });
    },
  });
}

export function useRecordABTestConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      test_id: string;
      variant_id: string;
      user_id: string;
      conversion_type: string;
      value?: number;
    }) => {
      const response = await fetch('/api/ab-testing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, action: 'conversion' }),
      });
      if (!response.ok) throw new Error('Failed to record conversion');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ab-test', variables.test_id] });
    },
  });
}
