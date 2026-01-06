import { ReactNode } from "react";
import { AuthenticatedShell, Link } from "@ghxstship/ui";
import type { UserProfile } from "@ghxstship/ui";
import {
  gvtewaySidebarNavigation,
} from "../data/gvteway";
import { memo } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  /** Navigation variant */
  variant?: "consumer-public" | "consumer-auth" | "consumer-shell" | "event-shell" | "membership" | "creator-public" | "creator-auth" | "portal" | "consumer";
  /** Context breadcrumbs for authenticated navigation */
  contextLevels?: unknown[];
  /** Custom user menu for authenticated navigation */
  userMenu?: ReactNode;
  /** Show footer (default: true) */
  showFooter?: boolean;
  /** Additional className for the main section */
  className?: string;
  /** Current path for sidebar navigation */
  currentPath?: string;
  /** Event ID for event-context navigation */
  eventId?: string;
  /** Whether user is authenticated (for consumer variant) */
  isAuthenticated?: boolean;
  /** User object (for consumer variant) */
  user?: UserProfile;
}

/**
 * GVTEWAY App Layout Configuration
 * Centralized configuration for shared layout components
 */
const gvtewayLayoutConfig = {
  appName: "GVTEWAY",
  logo: (
    <Link href="/" className="font-display text-h5-md uppercase tracking-display text-text-primary">
      GVTEWAY
    </Link>
  ),
  sidebarNavigation: gvtewaySidebarNavigation,
  inverted: true,
};

/**
 * GvtewayAppLayout - Unified layout wrapper for all GVTEWAY pages
 * Uses the shared AuthenticatedShell component to eliminate code duplication
 */
export const GvtewayAppLayout = memo(function GvtewayAppLayout(props: AppLayoutProps) {
  return (
    <AuthenticatedShell
      {...props}
      sections={gvtewaySidebarNavigation}
      logo={gvtewayLayoutConfig.logo}
      inverted={true}
    />
  );
});

export const GvtewayLoadingLayout = memo(function GvtewayLoadingLayout({
  _text = "Loading...",
}: {
  _text?: string;
}) {
  return null; // Placeholder - implement when AppLoadingLayout is available
});

export const GvtewayEmptyLayout = memo(function GvtewayEmptyLayout({
  _title,
  _description,
  _action,
}: {
  _title: string;
  _description?: string;
  _action?: ReactNode;
}) {
  return null; // Placeholder - implement when AppEmptyLayout is available
});

export const GvtewaySkeletonLayout = memo(function GvtewaySkeletonLayout({
  _showStats = true,
  _showCards = true,
  _cardCount = 4,
}: {
  _showStats?: boolean;
  _showCards?: boolean;
  _cardCount?: number;
}) {
  return null; // Placeholder - implement when AppSkeletonLayout is available
});
