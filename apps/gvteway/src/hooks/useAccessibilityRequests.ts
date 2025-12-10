'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AccessibilityRequest {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  request_type: string;
  status: 'pending' | 'approved' | 'denied' | 'completed';
  notes?: string;
  created_at: string;
}

const DEMO_REQUESTS: AccessibilityRequest[] = [
  { id: 'ar1', event_id: 'e1', event_title: 'Summer Festival 2024', event_date: new Date(Date.now() + 7 * 86400000).toISOString(), request_type: 'wheelchair', status: 'approved', created_at: new Date().toISOString() },
];

export const accessibilityKeys = {
  all: ['accessibility'] as const,
  requests: () => [...accessibilityKeys.all, 'requests'] as const,
};

export function useAccessibilityRequestsList() {
  return useQuery({
    queryKey: accessibilityKeys.requests(),
    queryFn: async () => {
      const response = await fetch('/api/accessibility/requests');
      if (!response.ok) return DEMO_REQUESTS;
      const data = await response.json();
      return data.requests || DEMO_REQUESTS;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubmitAccessibilityRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      event_id?: string;
      order_id?: string;
      services: string[];
      notes: string;
      contact_phone: string;
      emergency_contact: string;
      save_preferences: boolean;
    }) => {
      const response = await fetch('/api/accessibility/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit request');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessibilityKeys.requests() });
    },
  });
}

export function useAccessibilityRequestsData() {
  const requestsQuery = useAccessibilityRequestsList();
  const submitMutation = useSubmitAccessibilityRequest();

  return {
    requests: requestsQuery.data || [],
    isLoading: requestsQuery.isLoading,
    error: requestsQuery.error,
    refetch: requestsQuery.refetch,
    submitRequest: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  };
}
