"use client";

import { useEffect } from "react";
import { protectedRouteVariants } from "./ProtectedRoute.variants.js";
import type { ProtectedRouteProps } from "./ProtectedRoute.types.js";
import { Stack } from "../../foundations/layout.js";
import { Spinner } from "../../atoms/Spinner/index.js";

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
      <Stack className={protectedRouteVariants({ loadingState: true })}>
        <Spinner variant="grey" size="lg" text={loadingText} />
      </Stack>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
