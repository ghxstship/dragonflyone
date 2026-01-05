import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface UserSession {
  id: string;
  device_type: string;
  device_name: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string;
  city: string | null;
  region: string | null;
  country: string | null;
  is_current: boolean;
  status: 'active' | 'expired' | 'revoked';
  created_at: string;
  last_active_at: string;
  expires_at: string;
}

export interface SessionsResponse {
  sessions: UserSession[];
  meta: {
    active_count: number;
    total_count: number;
  };
}

export interface CreateSessionParams {
  session_token: string;
  refresh_token?: string;
  expires_in_days?: number;
}

export interface RevokeSessionParams {
  sessionId: string;
  reason?: string;
}

export interface RevokeAllSessionsParams {
  current_session_id: string;
}

// Query keys
export const sessionKeys = {
  all: ['sessions'] as const,
  list: () => [...sessionKeys.all, 'list'] as const,
  detail: (id: string) => [...sessionKeys.all, 'detail', id] as const,
};

// API functions
async function fetchSessions(): Promise<SessionsResponse> {
  const response = await fetch('/api/auth/sessions', {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch sessions');
  }

  return response.json();
}

async function createSession(params: CreateSessionParams): Promise<{ session: UserSession }> {
  const response = await fetch('/api/auth/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create session');
  }

  return response.json();
}

async function revokeSession({ sessionId, reason }: RevokeSessionParams): Promise<{ message: string; session: UserSession }> {
  const response = await fetch(`/api/auth/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to revoke session');
  }

  return response.json();
}

async function revokeAllOtherSessions(params: RevokeAllSessionsParams): Promise<{ message: string; revoked_count: number }> {
  const response = await fetch('/api/auth/sessions', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to revoke sessions');
  }

  return response.json();
}

async function touchSession(sessionId: string): Promise<{ session: UserSession }> {
  const response = await fetch(`/api/auth/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update session');
  }

  return response.json();
}

/**
 * Hook for managing user sessions
 * Provides functionality to list, create, revoke, and manage sessions
 */
export function useSessions() {
  const queryClient = useQueryClient();

  // Query for fetching all sessions
  const sessionsQuery = useQuery({
    queryKey: sessionKeys.list(),
    queryFn: fetchSessions,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  // Mutation for creating a new session
  const createSessionMutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });

  // Mutation for revoking a single session
  const revokeSessionMutation = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });

  // Mutation for revoking all other sessions
  const revokeAllOtherSessionsMutation = useMutation({
    mutationFn: revokeAllOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });

  // Mutation for touching/updating session activity
  const touchSessionMutation = useMutation({
    mutationFn: touchSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });

  return {
    // Data
    sessions: sessionsQuery.data?.sessions ?? [],
    activeSessions: sessionsQuery.data?.sessions.filter(s => s.status === 'active') ?? [],
    currentSession: sessionsQuery.data?.sessions.find(s => s.is_current),
    activeCount: sessionsQuery.data?.meta.active_count ?? 0,
    totalCount: sessionsQuery.data?.meta.total_count ?? 0,

    // Query state
    isLoading: sessionsQuery.isLoading,
    isError: sessionsQuery.isError,
    error: sessionsQuery.error,
    refetch: sessionsQuery.refetch,

    // Mutations
    createSession: createSessionMutation.mutate,
    createSessionAsync: createSessionMutation.mutateAsync,
    isCreating: createSessionMutation.isPending,

    revokeSession: revokeSessionMutation.mutate,
    revokeSessionAsync: revokeSessionMutation.mutateAsync,
    isRevoking: revokeSessionMutation.isPending,

    revokeAllOtherSessions: revokeAllOtherSessionsMutation.mutate,
    revokeAllOtherSessionsAsync: revokeAllOtherSessionsMutation.mutateAsync,
    isRevokingAll: revokeAllOtherSessionsMutation.isPending,

    touchSession: touchSessionMutation.mutate,
    touchSessionAsync: touchSessionMutation.mutateAsync,
  };
}

/**
 * Hook for fetching a single session by ID
 */
export function useSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId ?? ''),
    queryFn: async () => {
      if (!sessionId) throw new Error('Session ID required');
      
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch session');
      }

      return response.json();
    },
    enabled: !!sessionId,
  });
}

// Helper function to format device info
export function formatDeviceInfo(session: UserSession): string {
  const parts: string[] = [];
  
  if (session.device_name) {
    parts.push(session.device_name);
  } else {
    if (session.browser) parts.push(session.browser);
    if (session.os) parts.push(`on ${session.os}`);
  }

  return parts.join(' ') || 'Unknown device';
}

// Helper function to format location
export function formatLocation(session: UserSession): string {
  const parts: string[] = [];
  
  if (session.city) parts.push(session.city);
  if (session.region) parts.push(session.region);
  if (session.country) parts.push(session.country);

  return parts.join(', ') || 'Unknown location';
}

// Helper function to get device icon name
export function getDeviceIcon(deviceType: string): 'Monitor' | 'Smartphone' | 'Tablet' | 'HelpCircle' {
  switch (deviceType.toLowerCase()) {
    case 'desktop':
      return 'Monitor';
    case 'mobile':
      return 'Smartphone';
    case 'tablet':
      return 'Tablet';
    default:
      return 'HelpCircle';
  }
}
