'use client';

import { useMutation } from '@tanstack/react-query';

export interface RevenueSyncPayload {
  orgSlug: string;
  projectCode: string;
  eventCode: string;
  ticketCount: number;
  grossAmount: number;
  currency: string;
}

export interface SyncResult {
  success: boolean;
  message?: string;
  ingestionId?: string;
  data?: Record<string, unknown>;
}

export const integrationsKeys = {
  all: ['integrations'] as const,
};

export function useSyncRevenue() {
  return useMutation({
    mutationFn: async (payload: RevenueSyncPayload) => {
      const response = await fetch('/api/integrations/ticket-revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to sync revenue');
      return data as SyncResult;
    },
  });
}

export function useIntegrationsData() {
  const syncMutation = useSyncRevenue();

  return {
    syncRevenue: syncMutation.mutateAsync,
    isSyncing: syncMutation.isPending,
    result: syncMutation.data,
    error: syncMutation.error,
  };
}
