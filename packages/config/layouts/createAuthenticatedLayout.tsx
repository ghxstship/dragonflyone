/* eslint-disable react/forbid-elements -- Config package cannot import from UI to avoid circular dependency */
"use client";

import { ReactNode, useEffect, ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../auth-context";

/**
 * Configuration for creating an authenticated layout.
 * Generic over the variant type to support app-specific variant unions.
 */
export interface AuthenticatedLayoutConfig<V extends string = string> {
  /** Platform identifier for access control */
  platform: "atlvs" | "compvss" | "gvteway";
  /** Path to redirect unauthenticated users */
  loginPath: string;
  /** Path to redirect unauthorized users */
  unauthorizedPath: string;
  /** Background color class for loading states */
  backgroundClass: string;
  /** The app-specific layout component */
  LayoutComponent: ComponentType<{ children: ReactNode; variant?: V }>;
  /** The variant to pass to the layout component */
  layoutVariant: V;
  /** Optional loading component - if not provided, uses a simple div-based spinner */
  LoadingComponent?: ComponentType<{ text: string; backgroundClass: string }>;
  /** Optional route loading component for page transitions */
  RouteLoadingComponent?: ComponentType;
}

/**
 * Props for the generated authenticated layout component
 */
interface AuthenticatedLayoutProps {
  children: ReactNode;
}

/**
 * Default loading component when no custom one is provided.
 * Uses basic HTML elements to avoid circular dependency with @ghxstship/ui.
 */
function DefaultLoadingState({ text, backgroundClass }: { text: string; backgroundClass: string }) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${backgroundClass}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-avatar h-8 w-8 border-b-2 border-border" />
        <span className="text-text-disabled">{text}</span>
      </div>
    </div>
  );
}

/**
 * Default route loading component for page transitions.
 * Provides a skeleton loading state while routes are loading.
 */
function DefaultRouteLoadingState() {
  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {/* Header skeleton */}
          <div className="flex flex-col gap-2">
            <div className="h-8 w-64 animate-pulse rounded-card bg-muted" />
            <div className="h-4 w-96 animate-pulse rounded-card bg-muted" />
          </div>

          {/* Content skeleton */}
          <div className="border-2 border-border bg-surface-inverse p-6 rounded-card">
            <div className="flex flex-col gap-4">
              <div className="h-6 w-48 animate-pulse rounded-card bg-muted" />
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 w-full animate-pulse rounded-card bg-muted" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Factory function to create authenticated layout components for each app.
 * Reduces code duplication by centralizing auth checks, redirects, and loading states.
 * 
 * @param config - Configuration for the authenticated layout
 * @returns A React component that wraps children with authentication
 * 
 * @example
 * ```tsx
 * // In apps/atlvs/src/app/(authenticated)/layout.tsx
 * import { createAuthenticatedLayout } from "@ghxstship/config/layouts";
 * import { AtlvsAppLayout } from "../../components/app-layout";
 * 
 * export default createAuthenticatedLayout({
 *   platform: "atlvs",
 *   loginPath: "/auth/signin",
 *   unauthorizedPath: "/auth/unauthorized",
 *   backgroundClass: "bg-surface-inverse",
 *   LayoutComponent: AtlvsAppLayout,
 *   layoutVariant: "authenticated",
 * });
 * ```
 */
export function createAuthenticatedLayout<V extends string>(
  config: AuthenticatedLayoutConfig<V>
) {
  const {
    platform,
    loginPath,
    unauthorizedPath,
    backgroundClass,
    LayoutComponent,
    layoutVariant,
    LoadingComponent = DefaultLoadingState,
    RouteLoadingComponent = DefaultRouteLoadingState,
  } = config;

  return function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading, canAccessPlatform } = useAuth();

    // Redirect unauthenticated users to login
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        const redirectPath = typeof window !== "undefined" 
          ? encodeURIComponent(window.location.pathname)
          : "";
        router.replace(`${loginPath}?redirect=${redirectPath}`);
      }
    }, [isLoading, isAuthenticated, router]);

    // Redirect unauthorized users (authenticated but no platform access)
    useEffect(() => {
      if (!isLoading && isAuthenticated && !canAccessPlatform(platform)) {
        router.replace(`${unauthorizedPath}?platform=${platform}`);
      }
    }, [isLoading, isAuthenticated, canAccessPlatform, router]);

    // Loading state while checking authentication
    if (isLoading) {
      return <LoadingComponent text="Verifying access..." backgroundClass={backgroundClass} />;
    }

    // Loading state while redirecting to login
    if (!isAuthenticated) {
      return <LoadingComponent text="Redirecting to sign in..." backgroundClass={backgroundClass} />;
    }

    // Loading state while checking platform access
    if (!canAccessPlatform(platform)) {
      return <LoadingComponent text="Checking platform access..." backgroundClass={backgroundClass} />;
    }

    // Render the authenticated layout with children
    return (
      <LayoutComponent variant={layoutVariant}>
        {children}
      </LayoutComponent>
    );
  };
}
