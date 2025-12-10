'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PriceAlert {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_venue: string;
  target_price: number;
  current_price: number;
  ticket_type?: string;
  is_active: boolean;
  triggered: boolean;
  triggered_at?: string;
  created_at: string;
}

const DEMO_ALERTS: PriceAlert[] = [
  { id: '1', event_id: 'e1', event_title: 'Summer Festival 2024', event_date: new Date(Date.now() + 30 * 86400000).toISOString(), event_venue: 'Central Park', target_price: 100, current_price: 125, is_active: true, triggered: false, created_at: new Date().toISOString() },
  { id: '2', event_id: 'e2', event_title: 'Jazz Night', event_date: new Date(Date.now() + 45 * 86400000).toISOString(), event_venue: 'Blue Note', target_price: 50, current_price: 45, is_active: true, triggered: true, triggered_at: new Date(Date.now() - 86400000).toISOString(), created_at: new Date(Date.now() - 172800000).toISOString() },
];

export const priceAlertsKeys = {
  all: ['price-alerts'] as const,
  list: () => [...priceAlertsKeys.all, 'list'] as const,
};

export function usePriceAlertsList() {
  return useQuery({
    queryKey: priceAlertsKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/price-alerts');
      if (response.status === 401) {
        return DEMO_ALERTS;
      }
      if (!response.ok) {
        return DEMO_ALERTS;
      }
      const data = await response.json();
      return data.alerts || DEMO_ALERTS;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useTogglePriceAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, isActive }: { alertId: string; isActive: boolean }) => {
      const response = await fetch(`/api/price-alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      });
      if (!response.ok) {
        throw new Error('Failed to update alert');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceAlertsKeys.all });
    },
  });
}

export function useDeletePriceAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/price-alerts/${alertId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete alert');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: priceAlertsKeys.all });
    },
  });
}

export function usePriceAlertsData() {
  const alertsQuery = usePriceAlertsList();
  const toggleMutation = useTogglePriceAlert();
  const deleteMutation = useDeletePriceAlert();

  return {
    alerts: alertsQuery.data || [],
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    refetch: alertsQuery.refetch,
    toggleAlert: toggleMutation.mutateAsync,
    deleteAlert: deleteMutation.mutateAsync,
  };
}
