"use client";

import { ReactNode } from "react";
import {
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  FullBleedSection,
  Container,
  Stack,
  Label,
  LoadingSpinner,
  AuthenticatedShell,
} from "@ghxstship/ui";
import type { SidebarNavSection } from "@ghxstship/ui";
import {
  ConsumerNavigationPublic,
  ConsumerNavigationAuthenticated,
  MembershipNavigationPublic,
  CreatorNavigationPublic,
  CreatorNavigationAuthenticated,
} from "./navigation";
import type { ContextLevel } from "@ghxstship/ui";
import { gvtewaySidebarNavigation, gvtewayEventNavigation, gvtewayQuickActions } from "../data/gvteway";

// =============================================================================
// GVTEWAY APP LAYOUT WRAPPERS
// Bold Contemporary Pop Art Adventure Design System - Dark Theme
// =============================================================================

interface AppLayoutProps {
  children: ReactNode;
  /** Navigation variant */
  variant?: "consumer-public" | "consumer-auth" | "consumer-shell" | "event-shell" | "membership" | "creator-public" | "creator-auth";
  /** Context breadcrumbs for authenticated navigation */
  contextLevels?: ContextLevel[];
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
}

/**
 * GvtewayAppLayout - Unified layout wrapper for all GVTEWAY pages
 * Provides consistent header, footer, and styling across the app
 */
export function GvtewayAppLayout({
  children,
  variant = "consumer-public",
  contextLevels = [],
  userMenu,
  showFooter = true,
  className,
  currentPath = "/",
  eventId,
}: AppLayoutProps) {
  // Transform navigation data to SidebarNavSection format
  const transformNavigation = (navData: typeof gvtewaySidebarNavigation, basePath = ""): SidebarNavSection[] => {
    return navData.map((section) => ({
      title: section.section,
      items: section.items.map((item) => ({
        label: item.label,
        href: basePath + item.href,
        icon: item.icon,
      })),
    }));
  };

  // Get sidebar navigation based on context
  const getSidebarNavigation = (): SidebarNavSection[] => {
    if (variant === "event-shell" && eventId) {
      return transformNavigation(gvtewayEventNavigation, `/e/${eventId}`);
    }
    return transformNavigation(gvtewaySidebarNavigation);
  };

  // Shell variants use AuthenticatedShell with sidebar
  if (variant === "consumer-shell" || variant === "event-shell") {
    return (
      <AuthenticatedShell
        navigation={getSidebarNavigation()}
        currentPath={currentPath}
        logo={<Display size="sm">GVTEWAY</Display>}
        workspaceName="GVTEWAY"
        user={{
          name: "Guest User",
          email: "guest@gvteway.com",
        }}
        quickActions={gvtewayQuickActions}
        inverted
        onNavigate={(href) => {
          if (typeof window !== "undefined") {
            window.location.href = href;
          }
        }}
        className={className}
      >
        <div className="p-6">
          {children}
        </div>
      </AuthenticatedShell>
    );
  }

  // Standard page layout for non-shell variants
  const getNavigation = () => {
    switch (variant) {
      case "consumer-public":
        return <ConsumerNavigationPublic />;
      case "consumer-auth":
        return <ConsumerNavigationAuthenticated contextLevels={contextLevels} userMenu={userMenu} />;
      case "membership":
        return <MembershipNavigationPublic />;
      case "creator-public":
        return <CreatorNavigationPublic />;
      case "creator-auth":
        return <CreatorNavigationAuthenticated contextLevels={contextLevels} userMenu={userMenu} />;
      default:
        return <ConsumerNavigationPublic />;
    }
  };

  return (
    <PageLayout
      background="black"
      header={getNavigation()}
      footer={
        showFooter ? (
          <Footer
            logo={<Display size="md">GVTEWAY</Display>}
            copyright={`© ${new Date().getFullYear()} GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED.`}
          >
            <FooterColumn title="Discover">
              <FooterLink href="/events">Browse Events</FooterLink>
              <FooterLink href="/venues">Find Venues</FooterLink>
              <FooterLink href="/artists">Artists</FooterLink>
            </FooterColumn>
            <FooterColumn title="Membership">
              <FooterLink href="/membership">Join</FooterLink>
              <FooterLink href="/experiences">Experiences</FooterLink>
              <FooterLink href="/community">Community</FooterLink>
            </FooterColumn>
            <FooterColumn title="Support">
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/help#contact">Contact</FooterLink>
              <FooterLink href="/help#faq">FAQ</FooterLink>
            </FooterColumn>
            <FooterColumn title="Legal">
              <FooterLink href="/legal/privacy">Privacy</FooterLink>
              <FooterLink href="/legal/terms">Terms</FooterLink>
              <FooterLink href="/accessibility">Accessibility</FooterLink>
            </FooterColumn>
          </Footer>
        ) : undefined
      }
    >
      <FullBleedSection
        background="ink"
        pattern="halftone"
        patternOpacity={0.03}
        className={`min-h-screen ${className || ""}`}
      >
        <Container className="py-8 sm:py-12 md:py-16">
          {children}
        </Container>
      </FullBleedSection>
    </PageLayout>
  );
}

/**
 * GvtewayLoadingLayout - Loading state wrapper
 */
export function GvtewayLoadingLayout({
  text = "Loading...",
  variant = "consumer-public",
}: {
  text?: string;
  variant?: AppLayoutProps["variant"];
}) {
  return (
    <GvtewayAppLayout variant={variant}>
      <Stack className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" text={text} />
      </Stack>
    </GvtewayAppLayout>
  );
}

/**
 * GvtewayEmptyLayout - Empty state wrapper
 */
export function GvtewayEmptyLayout({
  title,
  description,
  action,
  variant = "consumer-public",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: AppLayoutProps["variant"];
}) {
  return (
    <GvtewayAppLayout variant={variant}>
      <Stack gap={6} className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Display size="md" className="text-white">{title}</Display>
        {description && <Label size="sm" className="text-on-dark-muted max-w-md">{description}</Label>}
        {action}
      </Stack>
    </GvtewayAppLayout>
  );
}
