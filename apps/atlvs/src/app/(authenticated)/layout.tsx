"use client";

import { AtlvsAppLayout } from "../../components/app-layout";
import { createAuthenticatedLayout } from "@ghxstship/config/layouts";

/**
 * Shared Loading Component for ATLVS Authenticated Routes
 * Eliminates the need for individual loading.tsx files in route directories
 */
function AtlvsRouteLoadingComponent() {
  return (
    <AtlvsAppLayout variant="authenticated">
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
    </AtlvsAppLayout>
  );
}

/**
 * Authenticated Route Group Layout
 * Wraps all authenticated pages with the ATLVS navigation shell
 * 
 * This layout applies to all pages under the (authenticated) route group,
 * ensuring consistent navigation, role-based filtering, favorites, 
 * recent pages, and all enhanced navigation features.
 * 
 * RBAC Enforcement:
 * - Redirects unauthenticated users to /auth/signin
 * - Verifies ATLVS platform access before rendering
 */
export default createAuthenticatedLayout({
  platform: "atlvs",
  loginPath: "/auth/signin",
  unauthorizedPath: "/auth/unauthorized",
  backgroundClass: "bg-surface-inverse",
  LayoutComponent: AtlvsAppLayout,
  layoutVariant: "authenticated",
  RouteLoadingComponent: AtlvsRouteLoadingComponent,
});
