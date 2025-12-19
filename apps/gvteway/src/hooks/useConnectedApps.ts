'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ConnectedApp {
  id: string;
  app_name: string;
  app_id: string;
  provider: string;
  scopes: string[];
  last_used_at?: string;
  connected_at: string;
}

const PROVIDER_INFO: Record<string, { name: string; description: string }> = {
  google: { name: 'Google', description: 'Access Google services' },
  facebook: { name: 'Facebook', description: 'Share events and connect with friends' },
  spotify: { name: 'Spotify', description: 'Music integration and playlists' },
  apple: { name: 'Apple', description: 'Apple ID and Apple Music' },
  twitter: { name: 'Twitter/X', description: 'Share events and updates' },
  instagram: { name: 'Instagram', description: 'Photo sharing and stories' },
  stripe: { name: 'Stripe', description: 'Payment processing' },
  paypal: { name: 'PayPal', description: 'Payment processing' },
};

export function getProviderInfo(provider: string): { name: string; description: string } {
  return PROVIDER_INFO[provider.toLowerCase()] || { name: provider, description: 'Third-party integration' };
}

async function fetchConnectedApps(): Promise<ConnectedApp[]> {
  const response = await fetch('/api/settings/connected-apps');
  if (!response.ok) {
    throw new Error('Failed to fetch connected apps');
  }
  const data = await response.json();
  return data.apps || [];
}

async function disconnectApp(id: string): Promise<void> {
  const response = await fetch(`/api/settings/connected-apps?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to disconnect app');
  }
}

export function useConnectedAppsData() {
  const queryClient = useQueryClient();

  const appsQuery = useQuery({
    queryKey: ['connected-apps'],
    queryFn: fetchConnectedApps,
    staleTime: 30000,
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-apps'] });
    },
  });

  return {
    apps: appsQuery.data || [],
    isLoading: appsQuery.isLoading,
    error: appsQuery.error,
    refetch: appsQuery.refetch,
    disconnectApp: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
  };
}
