"use client";

import { ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  Spinner,
  AuthenticatedShell,
  CommandPalette,
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
import {
  useCommandPalette,
  buildNavigationCommands,
  buildActionCommands,
} from "@ghxstship/config/hooks";
import { Search, Ticket, Calendar, MapPin } from "lucide-react";

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
  const router = useRouter();

  // Build command palette navigation and action items
  const navigationCommands = useMemo(() => 
    buildNavigationCommands(gvtewaySidebarNavigation.map(s => ({ ...s, subsections: [] })) as Parameters<typeof buildNavigationCommands>[0]),
    []
  );

  const actionCommands = useMemo(() => 
    buildActionCommands([
      { label: "Find Events", href: "/events", icon: <Calendar size={16} />, shortcut: "E" },
      { label: "Buy Tickets", href: "/tickets", icon: <Ticket size={16} />, shortcut: "T" },
      { label: "Find Venues", href: "/venues", icon: <MapPin size={16} />, shortcut: "V" },
      { label: "Search", href: "/search", icon: <Search size={16} />, shortcut: "/" },
    ]),
    []
  );

  // Command palette hook
  const {
    isOpen: commandPaletteOpen,
    close: closeCommandPalette,
    categories: commandCategories,
    recentItems,
    handleSelect: handleCommandSelect,
  } = useCommandPalette({
    navigationItems: navigationCommands,
    actionItems: actionCommands,
    onNavigate: (href) => router.push(href),
  });

  // Transform navigation data to SidebarNavSection format
  const transformNavigation = (navData: typeof gvtewaySidebarNavigation, basePath = ""): SidebarNavSection[] => {
    return navData.map((section) => ({
      section: section.section,
      icon: section.icon,
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
      // Event navigation doesn't have subsections, add empty arrays
      const eventNavWithSubsections = gvtewayEventNavigation.map(s => ({ ...s, subsections: [] }));
      return transformNavigation(eventNavWithSubsections as typeof gvtewaySidebarNavigation, `/e/${eventId}`);
    }
    return transformNavigation(gvtewaySidebarNavigation);
  };

  // Shell variants use AuthenticatedShell with sidebar
  if (variant === "consumer-shell" || variant === "event-shell") {
    return (
      <>
        <AuthenticatedShell
          navigation={getSidebarNavigation()}
          currentPath={currentPath}
          logo={<Display size="md">GVTEWAY</Display>}
          workspaceName="GVTEWAY"
          user={{
            name: "Guest User",
            email: "guest@gvteway.com",
          }}
          quickActions={gvtewayQuickActions}
          inverted
          onNavigate={(href) => router.push(href)}
          className={className}
        >
          <div className="p-6">
            {children}
          </div>
        </AuthenticatedShell>
        
        {/* Command Palette - Cmd/Ctrl+K to open */}
        <CommandPalette
          open={commandPaletteOpen}
          onClose={closeCommandPalette}
          categories={commandCategories}
          recentItems={recentItems}
          onSelect={handleCommandSelect}
          onNavigate={(href) => router.push(href)}
          placeholder="Search events, venues, or actions..."
          inverted
        />
      </>
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
        <Spinner variant="grey" size="lg" text={text} />
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
