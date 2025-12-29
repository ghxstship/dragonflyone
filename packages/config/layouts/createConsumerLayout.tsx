/* eslint-disable react/forbid-elements -- Config package cannot import from UI to avoid circular dependency */
"use client";

import { ReactNode, ComponentType } from "react";
import { useAuth } from "../auth-context";

/**
 * Configuration for creating a consumer layout.
 * Consumer layouts are for public browsing with optional authentication
 * (e.g., GVTEWAY's event discovery, shopping, etc.)
 */
export interface ConsumerLayoutConfig<V extends string = string> {
  /** Platform identifier */
  platform: "atlvs" | "compvss" | "gvteway";
  /** Background color class */
  backgroundClass: string;
  /** The app-specific layout component */
  LayoutComponent: ComponentType<{ 
    children: ReactNode; 
    variant?: V;
    isAuthenticated?: boolean;
    user?: unknown;
  }>;
  /** The variant to pass to the layout component */
  layoutVariant: V;
  /** Whether to show auth-enhanced features when logged in */
  showAuthFeatures?: boolean;
}

/**
 * Props for the generated consumer layout component
 */
interface ConsumerLayoutProps {
  children: ReactNode;
}

/**
 * Factory function to create consumer layout components.
 * Consumer layouts support public browsing with optional authentication
 * that enhances the experience (cart persistence, wishlists, etc.)
 * 
 * This is primarily used by GVTEWAY for:
 * - Event browsing and discovery
 * - Shopping and merchandise
 * - Cart and checkout (with optional account)
 * - Reviews and community features
 * 
 * @param config - Configuration for the consumer layout
 * @returns A React component that wraps children with consumer layout
 * 
 * @example
 * ```tsx
 * // In apps/gvteway/src/app/(consumer)/layout.tsx
 * import { createConsumerLayout } from "@ghxstship/config/layouts";
 * import { GvtewayAppLayout } from "../../components/app-layout";
 * 
 * export default createConsumerLayout({
 *   platform: "gvteway",
 *   backgroundClass: "bg-white",
 *   LayoutComponent: GvtewayAppLayout,
 *   layoutVariant: "consumer",
 *   showAuthFeatures: true,
 * });
 * ```
 */
export function createConsumerLayout<V extends string>(
  config: ConsumerLayoutConfig<V>
) {
  const {
    LayoutComponent,
    layoutVariant,
    showAuthFeatures = true,
  } = config;

  return function ConsumerLayout({ children }: ConsumerLayoutProps) {
    const { isAuthenticated, user } = useAuth();

    // Pass auth state to layout for conditional rendering
    // (e.g., show cart count, wishlist icon, account menu)
    return (
      <LayoutComponent 
        variant={layoutVariant}
        isAuthenticated={showAuthFeatures ? isAuthenticated : false}
        user={showAuthFeatures ? user : undefined}
      >
        {children}
      </LayoutComponent>
    );
  };
}
