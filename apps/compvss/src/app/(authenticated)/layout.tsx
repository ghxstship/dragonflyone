"use client";

import { CompvssAppLayout } from "../../components/app-layout";
import { createAuthenticatedLayout } from "@ghxstship/config/layouts";

/**
 * Authenticated Route Group Layout
 * Wraps all authenticated pages with the COMPVSS navigation shell
 * 
 * This layout applies to all pages under the (authenticated) route group,
 * ensuring consistent navigation, role-based filtering, favorites, 
 * recent pages, and all enhanced navigation features.
 * 
 * RBAC Enforcement:
 * - Redirects unauthenticated users to /auth/signin
 * - Verifies COMPVSS platform access before rendering
 */
export default createAuthenticatedLayout({
  platform: "compvss",
  loginPath: "/auth/signin",
  unauthorizedPath: "/auth/unauthorized",
  backgroundClass: "bg-surface-inverse",
  LayoutComponent: CompvssAppLayout,
  layoutVariant: "authenticated",
});
