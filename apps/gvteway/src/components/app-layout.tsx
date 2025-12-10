"use client";

import { ReactNode, useMemo, useState, useEffect, useCallback } from "react";
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
  MobileBottomNav,
} from "@ghxstship/ui";
import type { SidebarNavSection, SidebarNavItem } from "@ghxstship/ui";
import {
  ConsumerNavigationPublic,
  ConsumerNavigationAuthenticated,
  MembershipNavigationPublic,
  CreatorNavigationPublic,
  CreatorNavigationAuthenticated,
} from "./navigation";
import type { ContextLevel, BreadcrumbContextItem, ContextOptions } from "@ghxstship/ui";
import { gvtewaySidebarNavigation, gvtewayEventNavigation, gvtewayQuickActions, gvtewayBottomNavigation, gvtewayDemoOrganizations, gvtewayDemoEvents } from "../data/gvteway";
import {
  useCommandPalette,
  buildNavigationCommands,
  buildActionCommands,
  useAuth,
  useFavorites,
  useKeyboardShortcuts,
} from "@ghxstship/config/hooks";
import { Search, Ticket, Calendar, MapPin } from "lucide-react";

// =============================================================================
// RECENT PAGES TRACKING
// =============================================================================

const RECENT_PAGES_KEY = "gvteway-recent-pages";
const MAX_RECENT_PAGES = 5;

function useRecentPages(currentPath: string) {
  const [recentPages, setRecentPages] = useState<SidebarNavItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(RECENT_PAGES_KEY);
      if (stored) {
        try {
          setRecentPages(JSON.parse(stored));
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !currentPath || currentPath === "/") return;
    if (currentPath.startsWith("/auth")) return;

    const findPageLabel = (path: string): string | null => {
      for (const section of gvtewaySidebarNavigation) {
        for (const item of section.items) {
          if (item.href === path) return item.label;
        }
      }
      const segments = path.split("/").filter(Boolean);
      const lastSegment = segments[segments.length - 1] || "Page";
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");
    };

    const label = findPageLabel(currentPath);
    if (!label) return;

    setRecentPages((prev) => {
      const filtered = prev.filter((p) => p.href !== currentPath);
      const updated = [{ label, href: currentPath, icon: "Clock" }, ...filtered].slice(0, MAX_RECENT_PAGES);
      localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [currentPath]);

  return recentPages;
}

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

  // Get user roles from auth context
  const { user } = useAuth();
  const userRoles = useMemo(() => {
    return user?.roles || [];
  }, [user]);

  // Track recent pages
  const recentPages = useRecentPages(currentPath);

  // Manage favorites
  const { favorites } = useFavorites({
    storageKey: 'gvteway',
    maxFavorites: 10,
  });

  // Handle navigation
  const handleContextNavigation = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  // Keyboard shortcuts for top 5 navigation items (Cmd+1 through Cmd+5)
  const topNavItems = useMemo(() => {
    const items: { href: string; label: string }[] = [];
    for (const section of gvtewaySidebarNavigation) {
      for (const item of section.items) {
        if (item.primary && items.length < 5) {
          items.push({ href: item.href, label: item.label });
        }
      }
    }
    return items;
  }, []);

  useKeyboardShortcuts({
    shortcuts: topNavItems.map((item, index) => ({
      keys: `cmd+${index + 1}`,
      action: () => router.push(item.href),
      description: `Go to ${item.label}`,
    })),
    enabled: variant === 'consumer-shell' || variant === 'event-shell',
  });

  // Convert context levels to breadcrumb items
  const contextBreadcrumbs = useMemo(() => {
    if (contextLevels.length > 0) {
      return contextLevels
        .filter(level => level.current !== null)
        .map(level => ({
          id: level.current?.id || level.label,
          name: level.current?.name || level.label,
          type: "workspace" as const,
          href: level.current?.slug ? `/${level.current.slug}` : undefined,
        }));
    }
    return [];
  }, [contextLevels]);

  // Transform bottom navigation for MobileBottomNav component
  const mobileNavItems = useMemo(() => 
    gvtewayBottomNavigation.map((item, index) => ({
      id: `nav-${index}`,
      ...item,
    })),
    []
  );

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

  // Contextual commands based on current route
  const contextualCommands = useMemo(() => [
    // Event-related commands
    { id: 'ctx-find-events', label: 'Find Events', href: '/events', contextPaths: ['/events*', '/discover*'] },
    { id: 'ctx-buy-tickets', label: 'Buy Tickets', href: `/e/${eventId}/tickets`, contextPaths: ['/e/*'] },
    // Venue-related commands
    { id: 'ctx-find-venues', label: 'Find Venues', href: '/venues', contextPaths: ['/venues*'] },
    // Account-related commands
    { id: 'ctx-my-tickets', label: 'My Tickets', href: '/account/tickets', contextPaths: ['/account*'] },
    { id: 'ctx-my-orders', label: 'My Orders', href: '/account/orders', contextPaths: ['/account*'] },
    // Event context commands
    { id: 'ctx-event-overview', label: 'Event Overview', href: `/e/${eventId}`, contextPaths: ['/e/*'] },
  ], [eventId]);

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
    contextualCommands,
    currentPath: currentPath,
    enableFrecency: true,
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

  // Find current event if in event context
  const currentEvent = eventId ? gvtewayDemoEvents.find(e => e.id === eventId) : undefined;

  // Handle context switch at any level
  const handleContextSwitch = (type: BreadcrumbContextItem["type"], id: string) => {
    switch (type) {
      case "organization":
        router.push("/events");
        break;
      case "project":
        // In GVTEWAY, "project" is an event
        router.push(`/e/${id}`);
        break;
    }
  };

  // Build breadcrumb context based on current state
  const buildBreadcrumbContext = (): BreadcrumbContextItem[] => {
    const context: BreadcrumbContextItem[] = [];
    
    // Always show organization
    const currentOrg = gvtewayDemoOrganizations.find(o => o.current);
    if (currentOrg) {
      context.push({
        id: currentOrg.id,
        name: currentOrg.name,
        type: "organization",
        href: "/events",
      });
    }
    
    // Show event if in event context
    if (variant === "event-shell" && currentEvent) {
      context.push({
        id: currentEvent.id,
        name: currentEvent.name,
        type: "project",
        href: `/e/${currentEvent.id}`,
      });
    }
    
    return context;
  };

  // Build context options for dropdowns
  const contextOptions: ContextOptions = {
    organizations: gvtewayDemoOrganizations,
    projects: gvtewayDemoEvents.map(e => ({
      id: e.id,
      name: e.name,
      status: e.status,
      current: e.id === currentEvent?.id,
    })),
  };

  // Shell variants use AuthenticatedShell with sidebar
  if (variant === "consumer-shell" || variant === "event-shell") {
    // Use context breadcrumbs if provided, otherwise build from current state
    const finalBreadcrumbs = contextBreadcrumbs.length > 0 
      ? contextBreadcrumbs 
      : buildBreadcrumbContext();
    
    return (
      <>
        <AuthenticatedShell
          navigation={getSidebarNavigation()}
          currentPath={currentPath}
          logo={<Display size="md">GVTEWAY</Display>}
          workspaceName={currentEvent?.name || "GVTEWAY"}
          breadcrumbContext={finalBreadcrumbs}
          contextOptions={contextOptions}
          onContextSwitch={handleContextSwitch}
          user={user ? {
            name: user.name || user.full_name || "User",
            email: user.email,
            avatar: user.avatar,
          } : {
            name: "Guest User",
            email: "guest@gvteway.com",
          }}
          quickActions={gvtewayQuickActions}
          favorites={favorites}
          recentPages={recentPages}
          userRoles={userRoles}
          storageKey="gvteway-sidebar"
          inverted
          onNavigate={handleContextNavigation}
          className={className}
          headerActions={userMenu}
        >
          <div className="p-6 pb-20 md:pb-6">
            {children}
          </div>
        </AuthenticatedShell>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          items={mobileNavItems}
          currentPath={currentPath}
          onNavigate={handleContextNavigation}
          inverted
        />
        
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
