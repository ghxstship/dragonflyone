'use client';

import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Shared authentication hook for all GHXSTSHIP apps.
 * Provides user state, loading state, and auth methods.
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('auth-token='));
    if (token) {
      setUser({ id: '1', email: 'user@example.com' });
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    document.cookie = 'auth-token=dummy-token; path=/';
    setUser({ id: '1', email });
  }, []);

  const signOut = useCallback(async () => {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setUser(null);
  }, []);

  return { user, loading, signIn, signOut };
}
