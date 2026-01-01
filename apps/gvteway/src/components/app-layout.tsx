"use client";

import { ReactNode, useMemo, useCallback } from "react";
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
  Skeleton,
  SkeletonCard,
  Grid,
  Card,
  PageTransition,
Box} from "@ghxstship/ui";
import type { SidebarNavSection } from "@ghxstship/ui";
import {
  ConsumerNavigationPublic,
  ConsumerNavigationAuthenticated,
  MembershipNavigationPublic,
  CreatorNavigationPublic,
  CreatorNavigationAuthenticated,
} from "./navigation";
import type { ContextLevel, BreadcrumbContextItem, ContextOptions, HeaderNotification, HeaderQuickAction } from "@ghxstship/ui";
import { gvtewaySidebarNavigation, gvtewayEventNavigation, gvtewayQuickActions, gvtewayBottomNavigation, gvtewayDemoOrganizations } from "../data/gvteway";
import { useEvents } from "@/hooks/useEvents";
import {
  useCommandPalette,
  buildNavigationCommands,
  buildActionCommands,
  useAuth,
  useFavorites,
  useKeyboardShortcuts,
  useRecentPages,
} from "@ghxstship/config/hooks";
import { Search, Ticket, Calendar, MapPin, Plus } from "lucide-react";


// =============================================================================
// GVTEWAY APP LAYOUT WRAPPERS
// Bold Contemporary Pop Art Adventure Design System - Dark Theme
// =============================================================================

interface AppLayoutProps {
  children: ReactNode;
  /** Navigation variant */
  variant?: "consumer-public" | "consumer-auth" | "consumer-shell" | "event-shell" | "membership" | "creator-public" | "creator-auth" | "portal" | "consumer";
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
  /** Whether user is authenticated (for consumer variant) */
  isAuthenticated?: boolean;
  /** User object (for consumer variant) */
  user?: unknown;
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

  // Fetch events for navigation context
  const { data: eventsData } = useEvents({ status: 'published' });
  const events = eventsData || [];

  // Get user roles from auth context
  const { user } = useAuth();
  const userRoles = useMemo(() => {
    return user?.roles || [];
  }, [user]);

  // Track recent pages using shared hook
  const recentPages = useRecentPages("gvteway", currentPath || "/", gvtewaySidebarNavigation);

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
  const currentEvent = eventId ? events.find(e => e.id === eventId) : undefined;

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
    projects: events.map(e => ({
      id: e.id,
      name: e.name,
      status: e.status,
      current: e.id === currentEvent?.id,
    })),
  };

  // Demo notifications for header (enhanced format)
  const demoNotifications: HeaderNotification[] = [
    { 
      id: "1", 
      title: "New event published", 
      message: "Summer Music Festival is now live", 
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      read: false,
      type: "success",
      priority: "normal",
      category: "updates",
      source: "Events",
      actionLabel: "View event",
      actionUrl: "/events/summer-music-festival",
    },
    { 
      id: "2", 
      title: "Ticket sales milestone", 
      message: "500 tickets sold for Jazz Night", 
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      read: false,
      type: "info",
      priority: "normal",
      category: "updates",
      source: "Sales",
    },
    { 
      id: "3", 
      title: "Venue capacity alert", 
      message: "Main Stage is 90% sold", 
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true,
      type: "warning",
      priority: "high",
      category: "alerts",
      source: "Venues",
    },
  ];

  // Header quick actions (contextual based on current page)
  const headerQuickActions: HeaderQuickAction[] = [
    {
      id: "find-events",
      label: "Find Events",
      icon: <Calendar size={14} />,
      href: "/events",
      shortcut: "E",
      contextPaths: ["/events*", "/discover*", "/"],
    },
    {
      id: "buy-tickets",
      label: "Buy Tickets",
      icon: <Ticket size={14} />,
      href: "/tickets",
      shortcut: "T",
      contextPaths: ["/e/*", "/tickets*"],
    },
    {
      id: "find-venues",
      label: "Find Venues",
      icon: <MapPin size={14} />,
      href: "/venues",
      shortcut: "V",
      contextPaths: ["/venues*"],
    },
    {
      id: "new-event",
      label: "Create Event",
      icon: <Plus size={14} />,
      href: "/events/new",
      shortcut: "N",
      contextPaths: ["/dashboard*", "/account*"],
    },
  ];

  // Portal variant - minimal branded layout for external access
  if (variant === "portal") {
    return (
      <PageLayout
        background="black"
        header={
          <Container className="py-4">
            <Display size="md">GVTEWAY</Display>
          </Container>
        }
      >
        <FullBleedSection
          background="ink"
          pattern="grid"
          patternOpacity={0.03}
          className={`min-h-screen ${className || ""}`}
        >
          <Container className="py-8 sm:py-12 md:py-16">
            <PageTransition type="fade" duration={200}>
              {children}
            </PageTransition>
          </Container>
        </FullBleedSection>
      </PageLayout>
    );
  }

  // Consumer variant - public browsing with optional auth features
  if (variant === "consumer") {
    return (
      <PageLayout
        background="black"
        header={<ConsumerNavigationPublic />}
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
              <FooterColumn title="Shop">
                <FooterLink href="/merch">Merchandise</FooterLink>
                <FooterLink href="/gift-cards">Gift Cards</FooterLink>
                <FooterLink href="/cart">Cart</FooterLink>
              </FooterColumn>
              <FooterColumn title="Support">
                <FooterLink href="/help">Help Center</FooterLink>
                <FooterLink href="/help#contact">Contact</FooterLink>
              </FooterColumn>
              <FooterColumn title="Legal">
                <FooterLink href="/legal/privacy">Privacy</FooterLink>
                <FooterLink href="/legal/terms">Terms</FooterLink>
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
            <PageTransition type="fade" duration={200}>
              {children}
            </PageTransition>
          </Container>
        </FullBleedSection>
      </PageLayout>
    );
  }

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
            status: "online",
            role: user.roles?.[0] || "Member",
          } : {
            name: "Guest User",
            email: "guest@gvteway.com",
            status: "online",
            role: "Guest",
          }}
          quickActions={gvtewayQuickActions}
          headerQuickActions={headerQuickActions}
          favorites={favorites}
          recentPages={recentPages}
          userRoles={userRoles}
          storageKey="gvteway-sidebar"
          inverted
          onNavigate={handleContextNavigation}
          onSearchOpen={() => {
            // Command palette is already handled by useCommandPalette hook
          }}
          settingsPath="/account/settings"
          helpPath="/help"
          notifications={demoNotifications}
          onNotificationClick={(notification) => {
            if (notification.actionUrl) {
              router.push(notification.actionUrl);
            }
          }}
          onNotificationMarkRead={() => {
            // Notification mark read handled by notification system
          }}
          onNotificationMarkAllRead={() => {
            // Mark all notifications read handled by notification system
          }}
          onNotificationSettings={() => {
            router.push("/account/settings/notifications");
          }}
          onKeyboardShortcuts={() => {
            // Keyboard shortcuts modal handled by shell
          }}
          className={className}
          headerActions={userMenu}
          useEnhancedHeader={true}
        >
          <Box className="p-6 pb-20 md:pb-6">
            <PageTransition type="fade" duration={200}>
              {children}
            </PageTransition>
          </Box>
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
          <PageTransition type="fade" duration={200}>
            {children}
          </PageTransition>
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

/**
 * GvtewaySkeletonLayout - Skeleton loading state for dashboard pages
 */
export function GvtewaySkeletonLayout({
  variant = "consumer-public",
  showStats = true,
  showCards = true,
  cardCount = 4,
}: {
  variant?: AppLayoutProps["variant"];
  showStats?: boolean;
  showCards?: boolean;
  cardCount?: number;
}) {
  return (
    <GvtewayAppLayout variant={variant}>
      <Stack gap={8}>
        {/* Header skeleton */}
        <Stack gap={2}>
          <Skeleton width="120px" height="1rem" />
          <Skeleton width="280px" height="2.5rem" />
          <Skeleton width="200px" height="1rem" />
        </Stack>

        {/* Stats grid skeleton */}
        {showStats && (
          <Grid cols={4} gap={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} inverted className="p-6">
                <Stack gap={2}>
                  <Skeleton width="60%" height="1rem" />
                  <Skeleton width="40%" height="2rem" />
                  <Skeleton width="30%" height="0.75rem" />
                </Stack>
              </Card>
            ))}
          </Grid>
        )}

        {/* Content cards skeleton */}
        {showCards && (
          <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            {Array.from({ length: cardCount }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </Grid>
        )}
      </Stack>
    </GvtewayAppLayout>
  );
}
