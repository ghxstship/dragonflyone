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
} from "@ghxstship/ui";
import {
  CreatorNavigationPublic,
} from "./navigation";
import { 
  compvssSidebarNavigation, 
  compvssProductionNavigation,
  compvssQuickActions,
  compvssDemoProductions,
  compvssDemoOrganizations,
  compvssDemoTeams,
  compvssDemoWorkspaces,
  compvssBottomNavigation,
} from "../data/compvss";
import type { ContextLevel, SidebarNavSection, BreadcrumbContextItem, ContextOptions } from "@ghxstship/ui";
import {
  useCommandPalette,
  buildNavigationCommands,
  buildActionCommands,
  useAuth,
  useFavorites,
  useKeyboardShortcuts,
  useRecentPages,
} from "@ghxstship/config/hooks";
import { Search, Users, Calendar, Wrench } from "lucide-react";


// =============================================================================
// COMPVSS APP LAYOUT WRAPPERS
// Bold Contemporary Pop Art Adventure Design System - Light/Dark Theme
// ClickUp-style sidebar navigation for production management
// =============================================================================

interface AppLayoutProps {
  children: ReactNode;
  /** Navigation variant */
  variant?: "public" | "authenticated" | "portal";
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
}

/**
 * CompvssAppLayout - Unified layout wrapper for all COMPVSS pages
 * Uses ClickUp-style sidebar for authenticated pages
 * Uses traditional header/footer for public pages
 */
export function CompvssAppLayout({
  children,
  variant = "authenticated",
  contextLevels = [],
  userMenu,
  showFooter,
  background = "white",
  className,
}: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  // Get user roles from auth context
  const { user } = useAuth();
  const userRoles = useMemo(() => {
    return user?.roles || [];
  }, [user]);

  // Track recent pages using shared hook
  const recentPages = useRecentPages("compvss", pathname, compvssSidebarNavigation);

  // Manage favorites
  const { favorites } = useFavorites({
    storageKey: 'compvss',
    maxFavorites: 10,
  });

  // Handle navigation
  const handleContextNavigation = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  // Keyboard shortcuts for top 5 navigation items (Cmd+1 through Cmd+5)
  const topNavItems = useMemo(() => {
    const items: { href: string; label: string }[] = [];
    for (const section of compvssSidebarNavigation) {
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
    compvssBottomNavigation.map((item, index) => ({
      id: `nav-${index}`,
      ...item,
    })),
    []
  );

  // Determine if we're in production context (moved up for contextual commands)
  const productionId = params?.productionId as string | undefined;
  const isProductionContext = Boolean(productionId);

  // Build command palette navigation and action items
  const navigationCommands = useMemo(() => 
    buildNavigationCommands(compvssSidebarNavigation as Parameters<typeof buildNavigationCommands>[0]),
    []
  );

  const actionCommands = useMemo(() => 
    buildActionCommands([
      { label: "New Crew Member", href: "/crew/new", icon: <Users size={16} />, shortcut: "C" },
      { label: "New Schedule", href: "/schedule/new", icon: <Calendar size={16} />, shortcut: "S" },
      { label: "New Equipment", href: "/equipment/new", icon: <Wrench size={16} />, shortcut: "E" },
      { label: "Search", href: "/search", icon: <Search size={16} />, shortcut: "/" },
    ]),
    []
  );

  // Contextual commands based on current route
  const contextualCommands = useMemo(() => [
    // Crew-related commands
    { id: 'ctx-assign-crew', label: 'Assign Crew', href: '/crew/assign', contextPaths: ['/crew*', '/p/*/crew*'] },
    { id: 'ctx-new-crew', label: 'Add Crew Member', href: '/crew/new', contextPaths: ['/crew*'] },
    // Schedule-related commands
    { id: 'ctx-new-schedule', label: 'Create Schedule', href: '/schedule/new', contextPaths: ['/schedule*', '/run-of-show*'] },
    // Advancing-related commands
    { id: 'ctx-new-advance', label: 'New Advance Request', href: '/advancing/new', contextPaths: ['/advancing*'] },
    // Safety-related commands
    { id: 'ctx-report-incident', label: 'Report Incident', href: '/incidents/new', contextPaths: ['/safety*', '/incidents*'] },
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
  
  // Find current production
  const currentProduction = isProductionContext
    ? compvssDemoProductions.find((p) => p.id === productionId)
    : undefined;

  // Get appropriate navigation based on context
  const navigation = isProductionContext
    ? compvssProductionNavigation
    : compvssSidebarNavigation;

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

  // Handle context switch at any level (matching ATLVS pattern)
  const handleContextSwitch = (type: BreadcrumbContextItem["type"], id: string) => {
    switch (type) {
      case "organization":
        router.push("/dashboard");
        break;
      case "project":
        router.push(`/p/${id}/overview`);
        break;
      case "team":
        router.push(isProductionContext ? `/p/${productionId}/team/${id}` : `/teams/${id}`);
        break;
      case "workspace":
        router.push(isProductionContext ? `/p/${productionId}/workspace/${id}` : `/workspaces/${id}`);
        break;
    }
  };

  // Build breadcrumb context based on current state (matching ATLVS pattern)
  const buildBreadcrumbContext = (): BreadcrumbContextItem[] => {
    const context: BreadcrumbContextItem[] = [];
    
    // Always show organization
    const currentOrg = compvssDemoOrganizations.find(o => o.current);
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
      const currentTeam = compvssDemoTeams.find(t => t.current);
      if (currentTeam) {
        context.push({
          id: currentTeam.id,
          name: currentTeam.name,
          type: "team",
          href: `/p/${currentProduction.id}/team/${currentTeam.id}`,
        });
      }
      
      // Show workspace (default to first workspace)
      const currentWorkspace = compvssDemoWorkspaces.find(w => w.current);
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
    organizations: compvssDemoOrganizations,
    projects: compvssDemoProductions.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      current: p.id === currentProduction?.id,
    })),
    teams: compvssDemoTeams,
    workspaces: compvssDemoWorkspaces,
  };

  // For portal pages, use minimal branded layout without sidebar
  if (variant === "portal") {
    const isDark = background === "black";
    return (
      <PageLayout
        background={background}
        header={
          <Container className="py-4">
            <Link href="/" className={`font-display text-h5-md uppercase ${isDark ? "text-white hover:text-grey-200" : "text-black hover:text-grey-700"} transition-colors`}>
              COMPVSS
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
  if (variant === "authenticated") {
    // COMPVSS uses light theme by default (production crews prefer light mode)
    const inverted = background === "black";
    
    // Use context breadcrumbs if provided, otherwise build from current state
    const finalBreadcrumbs = contextBreadcrumbs.length > 0 
      ? contextBreadcrumbs 
      : buildBreadcrumbContext();
    
    return (
      <>
        <AuthenticatedShell
          navigation={getContextualNavigation()}
          currentPath={pathname}
          logo={
            <Link href="/dashboard" className={`font-display text-h5-md uppercase ${inverted ? "text-white hover:text-grey-200" : "text-black hover:text-grey-700"} transition-colors`}>
              COMPVSS
            </Link>
          }
          workspaceName={currentProduction?.name || "PRODUCTION"}
          breadcrumbContext={finalBreadcrumbs}
          contextOptions={contextOptions}
          onContextSwitch={handleContextSwitch}
          user={user ? {
            name: user.name || user.full_name || "User",
            email: user.email,
            avatar: user.avatar,
          } : {
            name: "Crew Lead",
            email: "crew@ghxstship.com",
          }}
          quickActions={compvssQuickActions.slice(0, 3)}
          favorites={favorites}
          recentPages={recentPages}
          userRoles={userRoles}
          storageKey="compvss-sidebar"
          inverted={inverted}
          onNavigate={handleContextNavigation}
          settingsPath={isProductionContext ? `/p/${productionId}/settings` : "/settings"}
          className={className}
          headerActions={userMenu}
        >
          <div className="p-6 lg:p-8 pb-20 md:pb-8">
            <PageTransition type="fade" duration={200}>
              {children}
            </PageTransition>
          </div>
        </AuthenticatedShell>
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          items={mobileNavItems}
          currentPath={pathname}
          onNavigate={handleContextNavigation}
          inverted={inverted}
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
          inverted={inverted}
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
            logo={<Display size="md">COMPVSS</Display>}
            copyright={`© ${new Date().getFullYear()} GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED.`}
          >
            <FooterColumn title="Operations">
              <FooterLink href="/dashboard">Dashboard</FooterLink>
              <FooterLink href="/projects">Projects</FooterLink>
              <FooterLink href="/crew">Crew</FooterLink>
            </FooterColumn>
            <FooterColumn title="Resources">
              <FooterLink href="/equipment">Equipment</FooterLink>
              <FooterLink href="/schedule">Schedule</FooterLink>
              <FooterLink href="/directory">Directory</FooterLink>
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

/**
 * CompvssLoadingLayout - Loading state wrapper
 */
export function CompvssLoadingLayout({
  text = "Loading...",
  variant = "authenticated",
}: {
  text?: string;
  variant?: AppLayoutProps["variant"];
}) {
  return (
    <CompvssAppLayout variant={variant}>
      <Stack className="flex min-h-[60vh] items-center justify-center">
        <Spinner variant="grey" size="lg" text={text} />
      </Stack>
    </CompvssAppLayout>
  );
}

/**
 * CompvssEmptyLayout - Empty state wrapper
 */
export function CompvssEmptyLayout({
  title,
  description,
  action,
  variant = "authenticated",
  background = "white",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: AppLayoutProps["variant"];
  background?: "black" | "white";
}) {
  const isDark = background === "black";
  
  return (
    <CompvssAppLayout variant={variant} background={background}>
      <Stack gap={6} className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Display size="md" className={isDark ? "text-white" : "text-black"}>{title}</Display>
        {description && <Label size="sm" className={`max-w-[28rem] ${isDark ? "text-on-dark-muted" : "text-muted"}`}>{description}</Label>}
        {action}
      </Stack>
    </CompvssAppLayout>
  );
}

/**
 * CompvssSkeletonLayout - Skeleton loading state for dashboard/list pages
 */
export function CompvssSkeletonLayout({
  variant = "authenticated",
  background = "white",
  showStats = true,
  showTable = false,
  showCards = true,
  cardCount = 4,
}: {
  variant?: AppLayoutProps["variant"];
  background?: "black" | "white";
  showStats?: boolean;
  showTable?: boolean;
  showCards?: boolean;
  cardCount?: number;
}) {
  const isDark = background === "black";
  
  return (
    <CompvssAppLayout variant={variant} background={background}>
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
              <Card key={i} inverted={isDark} className="p-6">
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
    </CompvssAppLayout>
  );
}
