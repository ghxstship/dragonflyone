'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UserSession {
  id: string;
  user_id: string;
  device_name?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  ip_address?: string;
  location?: string;
  is_current: boolean;
  last_active_at: string;
  expires_at: string;
  created_at: string;
}

async function fetchSessions(): Promise<UserSession[]> {
  const response = await fetch('/api/settings/sessions');
  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }
  const data = await response.json();
  return data.sessions || [];
}

async function revokeSession(id: string): Promise<void> {
  const response = await fetch(`/api/settings/sessions?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to revoke session');
  }
}

async function revokeAllSessions(): Promise<void> {
  const response = await fetch('/api/settings/sessions?all=true', {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to revoke sessions');
  }
}

export function useSessionsData() {
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
    staleTime: 30000,
  });

  const revokeMutation = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  return {
    sessions: sessionsQuery.data || [],
    isLoading: sessionsQuery.isLoading,
    error: sessionsQuery.error,
    refetch: sessionsQuery.refetch,
    revokeSession: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,
    revokeAllSessions: revokeAllMutation.mutateAsync,
    isRevokingAll: revokeAllMutation.isPending,
  };
}
