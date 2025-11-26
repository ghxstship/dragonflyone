'use client';

import { useEffect } from 'react';
import { Stack } from '../foundations/layout.js';
import { LoadingSpinner } from '../molecules/loading-spinner.js';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Custom hook that returns user and loading state */
  useAuth: () => { user: unknown | null; loading: boolean };
  /** Path to redirect to when not authenticated */
  redirectPath?: string;
  /** Custom loading text */
  loadingText?: string;
  /** Router push function for navigation */
  onUnauthenticated?: (path: string) => void;
}

/**
 * Shared protected route wrapper for all GHXSTSHIP apps.
 * Redirects unauthenticated users to sign-in page.
 */
export function ProtectedRoute({ 
  children, 
  useAuth,
  redirectPath = '/auth/signin',
  loadingText = 'Loading...',
  onUnauthenticated
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      if (onUnauthenticated) {
        onUnauthenticated(redirectPath);
      } else {
        // Fallback to window.location for environments without router
        window.location.href = redirectPath;
      }
    }
  }, [user, loading, redirectPath, onUnauthenticated]);

  if (loading) {
    return (
      <Stack className="flex min-h-screen items-center justify-center bg-black text-white">
        <LoadingSpinner size="lg" text={loadingText} />
      </Stack>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
