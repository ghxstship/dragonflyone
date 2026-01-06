"use client";

import { ReactNode } from "react";
import { Box, Stack, Body, H2, Grid, Link, AuthenticatedShell, AppLoadingLayout, AppEmptyLayout, AppSkeletonLayout } from "@ghxstship/ui";
import {
  atlvsSidebarNavigation,
} from "../data/atlvs";

interface AppLayoutProps {
  children: ReactNode;
  /** Navigation variant */
  variant?: "public" | "authenticated" | "portal" | "consumer-auth";
  /** Context breadcrumbs for authenticated navigation */
  contextLevels?: Array<{
    current?: { id: string; name: string; slug?: string };
    label?: string;
  }>;
  /** Custom user menu for authenticated navigation */
  userMenu?: ReactNode;
  /** Show footer (default: true for public, false for authenticated) */
  showFooter?: boolean;
  /** Background color */
  background?: "black" | "white";
  /** Additional className for the main section */
  className?: string;
  /** If true, children are rendered directly without wrapper (for landing pages with custom sections) */
  rawContent?: boolean;
  /** Whether user is authenticated (for consumer variant) */
  isAuthenticated?: boolean;
  /** User object (for consumer variant) */
  user?: unknown;
}

/**
 * ATLVS App Layout Configuration
 * Centralized configuration for shared layout components
 */
const atlvsLayoutConfig = {
  appName: "ATLVS",
  logo: (
    <Link href="/" className="font-display text-h5-md uppercase text-text-primary transition-colors hover:text-text-secondary">
      ATLVS
    </Link>
  ),
  sidebarNavigation: atlvsSidebarNavigation.map((section: any) => ({
    id: section.section,
    title: section.section,
    icon: section.icon,
    items: section.items,
    subsections: section.subsections,
    allowedRoles: section.allowedRoles,
  })),
  inverted: true,
};

/**
 * AtlvsAppLayout - Unified layout wrapper for all ATLVS pages
 * NOTE: SharedAppLayout component was deleted, using simple wrapper instead
 */
export function AtlvsAppLayout(props: AppLayoutProps) {
  // Simple pass-through since SharedAppLayout was deleted
  return <>{props.children}</>;
  return (
    <AuthenticatedShell
      {...props}
      sections={atlvsSidebarNavigation}
      logo={atlvsLayoutConfig.logo}
      inverted={true}
    />
  );
}

export function AtlvsLoadingLayout({
  text = "Loading...",
  variant: _variant = "authenticated",
}: {
  text?: string;
  variant?: AppLayoutProps["variant"];
}) {
  return <AppLoadingLayout text={text} config={atlvsLayoutConfig} />;
}

export function AtlvsEmptyLayout({
  title,
  description,
  action,
  variant: _variant = "authenticated",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: AppLayoutProps["variant"];
}) {
  return <AppEmptyLayout title={title} description={description} action={action} config={atlvsLayoutConfig} />;
}

export function AtlvsSkeletonLayout({
  variant: _variant = "authenticated",
  showStats = true,
  showTable = false,
  showCards = true,
  cardCount = 4,
}: {
  variant?: AppLayoutProps["variant"];
  showStats?: boolean;
  showTable?: boolean;
  showCards?: boolean;
  cardCount?: number;
}) {
  return (
    <AppSkeletonLayout
      config={atlvsLayoutConfig}
      showStats={showStats}
      showTable={showTable}
      showCards={showCards}
      cardCount={cardCount}
    />
  );
}
