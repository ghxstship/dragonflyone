"use client";

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { atlvsDemoProductions, type ProductionContext } from "../data/atlvs";

// =============================================================================
// TYPES
// =============================================================================

export type NavigationContextLevel = "platform" | "production";

export interface NavigationContextValue {
  /** Current context level */
  contextLevel: NavigationContextLevel;
  /** Current production (if in production context) */
  currentProduction: ProductionContext | null;
  /** Available productions */
  productions: ProductionContext[];
  /** Navigate to a production context */
  selectProduction: (production: ProductionContext) => void;
  /** Return to platform level */
  exitProduction: () => void;
  /** Create new production */
  createProduction: () => void;
  /** Get the correct href for a route based on context */
  getContextualHref: (href: string) => string;
  /** Check if a path is active */
  isPathActive: (href: string) => boolean;
}

// =============================================================================
// CONTEXT
// =============================================================================

const NavigationContext = createContext<NavigationContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

export interface NavigationProviderProps {
  children: ReactNode;
  /** Initial productions list (can be fetched from API) */
  initialProductions?: ProductionContext[];
}

export function NavigationProvider({
  children,
  initialProductions = atlvsDemoProductions,
}: NavigationProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  // Determine context from URL
  const productionId = params?.productionId as string | undefined;
  
  // Find current production from URL
  const currentProduction = useMemo(() => {
    if (!productionId) return null;
    return initialProductions.find((p) => p.id === productionId) || null;
  }, [productionId, initialProductions]);

  // Determine context level
  const contextLevel: NavigationContextLevel = productionId ? "production" : "platform";

  // Navigate to production
  const selectProduction = useCallback(
    (production: ProductionContext) => {
      router.push(`/p/${production.id}/overview`);
    },
    [router]
  );

  // Return to platform
  const exitProduction = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  // Create new production
  const createProduction = useCallback(() => {
    router.push("/projects/new");
  }, [router]);

  // Get contextual href
  const getContextualHref = useCallback(
    (href: string) => {
      if (contextLevel === "production" && productionId) {
        // If already has /p/ prefix, return as-is
        if (href.startsWith("/p/")) return href;
        // Add production prefix
        return `/p/${productionId}${href}`;
      }
      return href;
    },
    [contextLevel, productionId]
  );

  // Check if path is active
  const isPathActive = useCallback(
    (href: string) => {
      const contextualHref = getContextualHref(href);
      // Exact match
      if (pathname === contextualHref) return true;
      // Prefix match (for nested routes)
      if (contextualHref !== "/" && pathname.startsWith(contextualHref + "/")) {
        return true;
      }
      return false;
    },
    [pathname, getContextualHref]
  );

  const value = useMemo<NavigationContextValue>(
    () => ({
      contextLevel,
      currentProduction,
      productions: initialProductions,
      selectProduction,
      exitProduction,
      createProduction,
      getContextualHref,
      isPathActive,
    }),
    [
      contextLevel,
      currentProduction,
      initialProductions,
      selectProduction,
      exitProduction,
      createProduction,
      getContextualHref,
      isPathActive,
    ]
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useNavigationContext(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      "useNavigationContext must be used within a NavigationProvider"
    );
  }
  return context;
}

// =============================================================================
// UTILITY HOOK - For components that may be outside provider
// =============================================================================

export function useOptionalNavigationContext(): NavigationContextValue | null {
  return useContext(NavigationContext);
}
