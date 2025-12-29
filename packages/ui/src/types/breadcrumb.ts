import type { ReactNode } from "react";

/**
 * Canonical BreadcrumbItem type
 * Used across all navigation, page headers, and templates
 */
export interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string;
  /** Navigation href - if omitted, item is not clickable */
  href?: string;
  /** Optional icon to display before label */
  icon?: ReactNode;
  /** Whether this is the current/active item */
  current?: boolean;
}

/**
 * BreadcrumbContextItem - Extended type for context-aware breadcrumbs
 * Used in AuthenticatedShell for organization/project/team context
 */
export interface BreadcrumbContextItem {
  id: string;
  name: string;
  type: "organization" | "project" | "team" | "workspace" | "production" | "event";
  href?: string;
  icon?: ReactNode;
}
