'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DEMO_SCALPING_ALERTS,
  DEMO_PROTECTION_RULES,
  DEMO_BLOCKED_ENTITIES,
  type DemoScalpingAlert,
  type DemoProtectionRule,
  type DemoBlockedEntity,
} from '@/lib/demo-data';

export type ScalpingAlert = DemoScalpingAlert;
export type ProtectionRule = DemoProtectionRule;
export type BlockedEntity = DemoBlockedEntity;

export const antiScalpingKeys = {
  all: ['anti-scalping'] as const,
  alerts: () => [...antiScalpingKeys.all, 'alerts'] as const,
  rules: () => [...antiScalpingKeys.all, 'rules'] as const,
  blocked: () => [...antiScalpingKeys.all, 'blocked'] as const,
};

// Fetch scalping alerts
export function useScalpingAlerts(filters?: { severity?: string; status?: string }) {
  return useQuery({
    queryKey: [...antiScalpingKeys.alerts(), filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.status) params.append('status', filters.status);

      const response = await fetch(`/api/admin/anti-scalping/alerts?${params.toString()}`);
      if (response.status === 401) {
        return DEMO_SCALPING_ALERTS;
      }
      if (!response.ok) {
        // Fallback to demo data on error
        return DEMO_SCALPING_ALERTS;
      }
      const data = await response.json();
      return data.alerts?.length ? data.alerts : DEMO_SCALPING_ALERTS;
    },
    staleTime: 30 * 1000, // 30 seconds for real-time monitoring
  });
}

// Fetch protection rules
export function useProtectionRules() {
  return useQuery({
    queryKey: antiScalpingKeys.rules(),
    queryFn: async () => {
      const response = await fetch('/api/admin/anti-scalping/rules');
      if (response.status === 401) {
        return DEMO_PROTECTION_RULES;
      }
      if (!response.ok) {
        return DEMO_PROTECTION_RULES;
      }
      const data = await response.json();
      return data.rules?.length ? data.rules : DEMO_PROTECTION_RULES;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch blocked entities
export function useBlockedEntities() {
  return useQuery({
    queryKey: antiScalpingKeys.blocked(),
    queryFn: async () => {
      const response = await fetch('/api/admin/anti-scalping/blocked');
      if (response.status === 401) {
        return DEMO_BLOCKED_ENTITIES;
      }
      if (!response.ok) {
        return DEMO_BLOCKED_ENTITIES;
      }
      const data = await response.json();
      return data.blocked?.length ? data.blocked : DEMO_BLOCKED_ENTITIES;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Update alert status mutation
export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, status }: { alertId: string; status: string }) => {
      const response = await fetch(`/api/admin/anti-scalping/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update alert status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: antiScalpingKeys.alerts() });
    },
  });
}

// Toggle protection rule mutation
export function useToggleProtectionRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ruleId, enabled }: { ruleId: string; enabled: boolean }) => {
      const response = await fetch(`/api/admin/anti-scalping/rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) {
        throw new Error('Failed to toggle rule');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: antiScalpingKeys.rules() });
    },
  });
}

// Add blocked entity mutation
export function useAddBlockedEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entity: { type: string; value: string; reason: string }) => {
      const response = await fetch('/api/admin/anti-scalping/blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entity),
      });
      if (!response.ok) {
        throw new Error('Failed to block entity');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: antiScalpingKeys.blocked() });
    },
  });
}

// Remove blocked entity mutation
export function useRemoveBlockedEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockId: string) => {
      const response = await fetch(`/api/admin/anti-scalping/blocked/${blockId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to remove block');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: antiScalpingKeys.blocked() });
    },
  });
}

// Combined hook for the anti-scalping page
export function useAntiScalpingData(filters?: { severity?: string; status?: string }) {
  const alertsQuery = useScalpingAlerts(filters);
  const rulesQuery = useProtectionRules();
  const blockedQuery = useBlockedEntities();
  const updateAlertMutation = useUpdateAlertStatus();
  const toggleRuleMutation = useToggleProtectionRule();
  const addBlockedMutation = useAddBlockedEntity();
  const removeBlockedMutation = useRemoveBlockedEntity();

  const alerts = alertsQuery.data || DEMO_SCALPING_ALERTS;
  const rules = rulesQuery.data || DEMO_PROTECTION_RULES;
  const blocked = blockedQuery.data || DEMO_BLOCKED_ENTITIES;

  return {
    // Data
    alerts,
    rules,
    blocked,
    // Loading states
    isLoading: alertsQuery.isLoading || rulesQuery.isLoading || blockedQuery.isLoading,
    isAlertsLoading: alertsQuery.isLoading,
    isRulesLoading: rulesQuery.isLoading,
    isBlockedLoading: blockedQuery.isLoading,
    // Error states
    error: alertsQuery.error || rulesQuery.error || blockedQuery.error,
    // Refetch functions
    refetchAlerts: alertsQuery.refetch,
    refetchRules: rulesQuery.refetch,
    refetchBlocked: blockedQuery.refetch,
    // Mutations
    updateAlertStatus: updateAlertMutation.mutateAsync,
    toggleRule: toggleRuleMutation.mutateAsync,
    addBlocked: addBlockedMutation.mutateAsync,
    removeBlocked: removeBlockedMutation.mutateAsync,
    // Mutation states
    isUpdating: updateAlertMutation.isPending || toggleRuleMutation.isPending || addBlockedMutation.isPending || removeBlockedMutation.isPending,
  };
}
