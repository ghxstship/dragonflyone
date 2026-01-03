/* eslint-disable react/forbid-elements -- Config package cannot import from UI to avoid circular dependency */
"use client";

import { ReactNode, ComponentType } from "react";

/**
 * Configuration for creating a marketing layout.
 * Generic over the variant type to support app-specific variant unions.
 */
export interface MarketingLayoutConfig<V extends string = string> {
  /** Platform identifier */
  platform: "atlvs" | "compvss" | "gvteway";
  /** Background color class */
  backgroundClass: string;
  /** The app-specific layout component */
  LayoutComponent: ComponentType<{ children: ReactNode; variant?: V; background?: "black" | "white" }>;
  /** The variant to pass to the layout component */
  layoutVariant: V;
  /** Background style to pass to layout */
  background?: "black" | "white";
}

/**
 * Props for the generated marketing layout component
 */
interface MarketingLayoutProps {
  children: ReactNode;
}

/**
 * Factory function to create marketing layout components for each app.
 * Marketing layouts are public-facing pages that don't require authentication.
 * 
 * @param config - Configuration for the marketing layout
 * @returns A React component that wraps children with marketing layout
 * 
 * @example
 * ```tsx
 * // In apps/atlvs/src/app/(marketing)/layout.tsx
 * import { createMarketingLayout } from "@ghxstship/config/layouts";
 * import { AtlvsAppLayout } from "../../components/app-layout";
 * 
 * export default createMarketingLayout({
 *   platform: "atlvs",
 *   backgroundClass: "bg-surface-inverse",
 *   LayoutComponent: AtlvsAppLayout,
 *   layoutVariant: "public",
 *   background: "black",
 * });
 * ```
 */
export function createMarketingLayout<V extends string>(
  config: MarketingLayoutConfig<V>
) {
  const {
    LayoutComponent,
    layoutVariant,
    background = "black" as const,
  } = config;

  return function MarketingLayout({ children }: MarketingLayoutProps) {
    return (
      <LayoutComponent variant={layoutVariant} background={background as "black" | "white"}>
        {children}
      </LayoutComponent>
    );
  };
}
