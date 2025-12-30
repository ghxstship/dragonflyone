"use client";

import { ReactNode, useMemo, useCallback } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
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
  Link,
  CommandPalette,
  MobileBottomNav,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  Grid,
  Card,
  PageTransition,
Box} from "@ghxstship/ui";
import type { ContextLevel, SidebarNavSection, BreadcrumbContextItem, ContextOptions, Box} from "@ghxstship/ui";
import {
  CreatorNavigationPublic,
} from "./navigation";
import { 
  atlvsSidebarNavigation, 
  atlvsProductionNavigation,
  atlvsQuickActions,
  atlvsDemoProductions,
  atlvsDemoTeams,
  atlvsDemoWorkspaces,
  atlvsDemoOrganizations,
  atlvsBottomNavigation,
} from "../data/atlvs";
import {
  useCommandPalette,
  buildNavigationCommands,
  buildActionCommands,
  useAuth,
  useFavorites,
  useKeyboardShortcuts,
  useRecentPages,
} from "@ghxstship/config/hooks";
import { Plus, Search, FileText, Users } from "lucide-react";


// =============================================================================
// ATLVS APP LAYOUT WRAPPERS
// Bold Contemporary Pop Art Adventure Design System - Dark Theme (B2B)
// ClickUp-style sidebar navigation for enterprise dashboard
// =============================================================================

interface AppLayoutProps {
  children: ReactNode;
  /** Navigation variant */
  variant?: "public" | "authenticated" | "portal" | "consumer-auth";
  /** Context breadcrumbs for authenticated navigation */
  contextLevels?: ContextLevel[];
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
 * AtlvsAppLayout - Unified layout wrapper for all ATLVS pages
 * Uses ClickUp-style sidebar for authenticated pages
 * Uses traditional header/footer for public pages
 */
export function AtlvsAppLayout({
  children,
  variant = "authenticated",
  contextLevels = [],
  userMenu,
  showFooter,
  background = "black",
  className,
  rawContent = false,
}: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  // Get user roles from auth context
  const { user } = useAuth();
  const userRoles = useMemo(() => {
    // In production, this would come from the user's profile/roles
    // For now, return empty array which shows all navigation items
    return user?.roles || [];
  }, [user]);

  // Track recent pages using shared hook
  const recentPages = useRecentPages("atlvs", pathname, atlvsSidebarNavigation);

  // Manage favorites
  const { favorites } = useFavorites({
    storageKey: 'atlvs',
    maxFavorites: 10,
  });

  // Handle navigation with context levels and user menu
  const handleContextNavigation = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  // Keyboard shortcuts for top 5 navigation items (Cmd+1 through Cmd+5)
  const topNavItems = useMemo(() => {
    const items: { href: string; label: string }[] = [];
    for (const section of atlvsSidebarNavigation) {
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
    enabled: variant === 'authenticated',
  });

  // Use context levels for breadcrumb if provided (convert ContextLevel to BreadcrumbContextItem)
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

  // Determine if we're in production context (moved up for contextual commands)
  const productionId = params?.productionId as string | undefined;
  const isProductionContext = Boolean(productionId);

  // Build command palette navigation and action items
  const navigationCommands = useMemo(() => 
    buildNavigationCommands(atlvsSidebarNavigation as Parameters<typeof buildNavigationCommands>[0]),
    []
  );

  const actionCommands = useMemo(() => 
    buildActionCommands([
      { label: "New Deal", href: "/deals/new", icon: <Plus size={16} />, shortcut: "D" },
      { label: "New Project", href: "/projects/new", icon: <Plus size={16} />, shortcut: "P" },
      { label: "New Contact", href: "/contacts/new", icon: <Users size={16} />, shortcut: "C" },
      { label: "New Invoice", href: "/invoices/new", icon: <FileText size={16} />, shortcut: "I" },
      { label: "Search", href: "/search", icon: <Search size={16} />, shortcut: "/" },
    ]),
    []
  );

  // Contextual commands based on current route
  const contextualCommands = useMemo(() => [
    // Deal-related commands
    { id: 'ctx-new-deal', label: 'Create New Deal', href: '/deals/new', contextPaths: ['/deals*', '/pipeline*'] },
    { id: 'ctx-export-deals', label: 'Export Deals', href: '/deals/export', contextPaths: ['/deals*'] },
    // Contact-related commands
    { id: 'ctx-new-contact', label: 'Add New Contact', href: '/contacts/new', contextPaths: ['/contacts*'] },
    { id: 'ctx-import-contacts', label: 'Import Contacts', href: '/contacts/import', contextPaths: ['/contacts*'] },
    // Invoice-related commands
    { id: 'ctx-new-invoice', label: 'Create Invoice', href: '/invoices/new', contextPaths: ['/invoices*', '/finance*'] },
    // Project-related commands
    { id: 'ctx-new-project', label: 'Create Project', href: '/projects/new', contextPaths: ['/projects*'] },
    // Production-related commands
    { id: 'ctx-production-overview', label: 'Production Overview', href: `/p/${productionId}/overview`, contextPaths: ['/p/*'] },
  ], [productionId]);

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
    currentPath: pathname,
    enableFrecency: true,
    onNavigate: (href) => router.push(href),
  });

  // Transform bottom navigation for MobileBottomNav component
  const mobileNavItems = useMemo(() => 
    atlvsBottomNavigation.map((item, index) => ({
      id: `nav-${index}`,
      ...item,
    })),
    []
  );

  // Find current production
  const currentProduction = isProductionContext
    ? atlvsDemoProductions.find((p) => p.id === productionId)
    : undefined;

  // Get appropriate navigation based on context
  const navigation = isProductionContext
    ? atlvsProductionNavigation
    : atlvsSidebarNavigation;

  // Prefix hrefs with production context if needed
  const getContextualNavigation = () => {
    if (!isProductionContext || !productionId) {
      return navigation as SidebarNavSection[];
    }
    
    // Add /p/[productionId] prefix to all hrefs in production navigation
    return (navigation as SidebarNavSection[]).map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        href: item.href ? `/p/${productionId}${item.href}` : item.href,
      })),
      subsections: section.subsections?.map((subsection) => ({
        ...subsection,
        items: subsection.items.map((item) => ({
          ...item,
          href: item.href ? `/p/${productionId}${item.href}` : item.href,
        })),
      })),
    }));
  };

  // Demo notifications for header
  const demoNotifications = [
    { id: "1", title: "New project created", message: "Project 'Summer Campaign' was created", time: "2 min ago", read: false },
    { id: "2", title: "Budget approved", message: "Q4 budget has been approved by finance", time: "1 hour ago", read: false },
    { id: "3", title: "Team member added", message: "Sarah joined the Marketing team", time: "3 hours ago", read: true },
  ];

  // Handle sign out
  const handleSignOut = () => {
    router.push("/auth/signin");
  };

  // Handle context switch at any level
  const handleContextSwitch = (type: BreadcrumbContextItem["type"], id: string) => {
    switch (type) {
      case "organization":
        // Switch organization - reload dashboard
        router.push("/dashboard");
        break;
      case "project":
        // Switch to project context
        router.push(`/p/${id}/overview`);
        break;
      case "team":
        // Switch team within current context
        router.push(isProductionContext ? `/p/${productionId}/team/${id}` : `/teams/${id}`);
        break;
      case "workspace":
        // Switch workspace within current context
        router.push(isProductionContext ? `/p/${productionId}/workspace/${id}` : `/workspaces/${id}`);
        break;
    }
  };

  // Build breadcrumb context based on current state
  const buildBreadcrumbContext = (): BreadcrumbContextItem[] => {
    const context: BreadcrumbContextItem[] = [];
    
    // Always show organization
    const currentOrg = atlvsDemoOrganizations.find(o => o.current);
    if (currentOrg) {
      context.push({
        id: currentOrg.id,
        name: currentOrg.name,
        type: "organization",
        href: "/dashboard",
      });
    }
    
    // Show project if in production context
    if (isProductionContext && currentProduction) {
      context.push({
        id: currentProduction.id,
        name: currentProduction.name,
        type: "project",
        href: `/p/${currentProduction.id}/overview`,
      });
      
      // Show team (default to first team)
      const currentTeam = atlvsDemoTeams.find(t => t.current);
      if (currentTeam) {
        context.push({
          id: currentTeam.id,
          name: currentTeam.name,
          type: "team",
          href: `/p/${currentProduction.id}/team/${currentTeam.id}`,
        });
      }
      
      // Show workspace (default to first workspace)
      const currentWorkspace = atlvsDemoWorkspaces.find(w => w.current);
      if (currentWorkspace) {
        context.push({
          id: currentWorkspace.id,
          name: currentWorkspace.name,
          type: "workspace",
          href: `/p/${currentProduction.id}/workspace/${currentWorkspace.id}`,
        });
      }
    }
    
    return context;
  };

  // Build context options for dropdowns
  const contextOptions: ContextOptions = {
    organizations: atlvsDemoOrganizations,
    projects: atlvsDemoProductions.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      current: p.id === currentProduction?.id,
    })),
    teams: atlvsDemoTeams,
    workspaces: atlvsDemoWorkspaces,
  };

  // For portal pages, use minimal branded layout without sidebar
  if (variant === "portal") {
    const isDark = background === "black";
    return (
      <PageLayout
        background={background}
        header={
          <Container className="py-4">
            <Link href="/" className="font-display text-h5-md uppercase text-white transition-colors hover:text-on-dark-secondary">
              ATLVS
            </Link>
          </Container>
        }
      >
        <FullBleedSection
          background={isDark ? "ink" : "white"}
          pattern="grid"
          patternOpacity={isDark ? 0.03 : 0.04}
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

  // For authenticated pages, use the new sidebar shell
  if (variant === "authenticated" || variant === "consumer-auth") {
    // Merge context breadcrumbs if provided via props
    const finalBreadcrumbs = contextBreadcrumbs.length > 0 
      ? contextBreadcrumbs 
      : buildBreadcrumbContext();

    return (
      <>
        <AuthenticatedShell
          navigation={getContextualNavigation()}
          currentPath={pathname}
          logo={
            <Link href="/dashboard" className="font-display text-h5-md uppercase text-white transition-colors hover:text-on-dark-secondary">
              ATLVS
            </Link>
          }
          breadcrumbContext={finalBreadcrumbs}
          contextOptions={contextOptions}
          onContextSwitch={handleContextSwitch}
          user={user ? {
            name: user.name || "User",
            email: user.email,
            avatar: user.avatar,
          } : {
            name: "Demo User",
            email: "demo@ghxstship.com",
          }}
          quickActions={atlvsQuickActions.slice(0, 3)}
          favorites={favorites}
          recentPages={recentPages}
          userRoles={userRoles}
          storageKey="atlvs-sidebar"
          inverted={background === "black"}
          onNavigate={handleContextNavigation}
          settingsPath={isProductionContext ? `/p/${productionId}/settings` : "/settings"}
          notifications={demoNotifications}
          onSignOut={handleSignOut}
          className={className}
          headerActions={userMenu}
        >
          <Box className="p-6 lg:p-8 pb-20 md:pb-8">
            <PageTransition type="fade" duration={200}>
              {children}
            </PageTransition>
          </Box>
        </AuthenticatedShell>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          items={mobileNavItems}
          currentPath={pathname}
          onNavigate={handleContextNavigation}
          inverted={background === "black"}
        />
        
        {/* Command Palette - Cmd/Ctrl+K to open */}
        <CommandPalette
          open={commandPaletteOpen}
          onClose={closeCommandPalette}
          categories={commandCategories}
          recentItems={recentItems}
          onSelect={handleCommandSelect}
          onNavigate={(href) => router.push(href)}
          placeholder="Search commands, pages, or actions..."
          inverted={background === "black"}
        />
      </>
    );
  }

  // For public pages, use the traditional layout with header/footer
  const isDark = background === "black";
  const shouldShowFooter = showFooter ?? true;

  return (
    <PageLayout
      background={background}
      header={<CreatorNavigationPublic />}
      footer={
        shouldShowFooter ? (
          <Footer
            logo={<Display size="md">ATLVS</Display>}
            copyright={`© ${new Date().getFullYear()} GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED.`}
          >
            <FooterColumn title="Product">
              <FooterLink href="/features">Features</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/integrations">Integrations</FooterLink>
              <FooterLink href="/security">Security</FooterLink>
              <FooterLink href="/changelog">What&apos;s New</FooterLink>
            </FooterColumn>
            <FooterColumn title="Resources">
              <FooterLink href="/help">Help Center</FooterLink>
              <FooterLink href="/docs/api">API Docs</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/guides">Guides</FooterLink>
              <FooterLink href="/case-studies">Case Studies</FooterLink>
              <FooterLink href="/templates">Templates</FooterLink>
            </FooterColumn>
            <FooterColumn title="Company">
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
              <FooterLink href="/press">Press</FooterLink>
              <FooterLink href="/partners">Partners</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
            </FooterColumn>
            <FooterColumn title="Legal">
              <FooterLink href="/legal/privacy">Privacy</FooterLink>
              <FooterLink href="/legal/terms">Terms</FooterLink>
              <FooterLink href="/legal/cookies">Cookies</FooterLink>
              <FooterLink href="/legal/accessibility">Accessibility</FooterLink>
              <FooterLink href="/status">Status</FooterLink>
            </FooterColumn>
          </Footer>
        ) : undefined
      }
    >
      {rawContent ? (
        children
      ) : (
        <FullBleedSection
          background={isDark ? "ink" : "white"}
          pattern="grid"
          patternOpacity={isDark ? 0.03 : 0.04}
          className={`min-h-screen ${className || ""}`}
        >
          <Container className="py-8 sm:py-12 md:py-16">
            <PageTransition type="fade" duration={200}>
              {children}
            </PageTransition>
          </Container>
        </FullBleedSection>
      )}
    </PageLayout>
  );
}

/**
 * AtlvsLoadingLayout - Loading state wrapper
 */
export function AtlvsLoadingLayout({
  text = "Loading...",
  variant = "authenticated",
}: {
  text?: string;
  variant?: AppLayoutProps["variant"];
}) {
  return (
    <AtlvsAppLayout variant={variant}>
      <Stack className="flex min-h-[60vh] items-center justify-center">
        <Spinner variant="grey" size="lg" text={text} />
      </Stack>
    </AtlvsAppLayout>
  );
}

/**
 * AtlvsEmptyLayout - Empty state wrapper
 */
export function AtlvsEmptyLayout({
  title,
  description,
  action,
  variant = "authenticated",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: AppLayoutProps["variant"];
}) {
  return (
    <AtlvsAppLayout variant={variant}>
      <Stack gap={6} className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Display size="md" className="text-white">{title}</Display>
        {description && <Label size="sm" className="text-on-dark-muted max-w-md">{description}</Label>}
        {action}
      </Stack>
    </AtlvsAppLayout>
  );
}

/**
 * AtlvsSkeletonLayout - Skeleton loading state for dashboard/list pages
 */
export function AtlvsSkeletonLayout({
  variant = "authenticated",
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
    <AtlvsAppLayout variant={variant}>
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

        {/* Table skeleton */}
        {showTable && <SkeletonTable rows={5} />}

        {/* Content cards skeleton */}
        {showCards && (
          <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            {Array.from({ length: cardCount }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </Grid>
        )}
      </Stack>
    </AtlvsAppLayout>
  );
}
