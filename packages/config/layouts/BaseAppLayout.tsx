"use client";

import { ReactNode, useMemo, useCallback, ComponentType } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useAuth } from "../auth-context";
import { useFavorites, useKeyboardShortcuts } from "../hooks/useFavorites";
import { useRecentPages } from "../hooks/useRecentPages";
import { useCommandPalette, buildNavigationCommands, buildActionCommands } from "../hooks/useCommandPalette";
import type { SidebarNavSection, ContextLevel, BreadcrumbContextItem, ContextOptions } from "@ghxstship/ui";

// =============================================================================
// TYPES
// =============================================================================

export interface DemoOrganization {
  id: string;
  name: string;
  current?: boolean;
}

export interface DemoProduction {
  id: string;
  name: string;
  status?: string;
  current?: boolean;
}

export interface DemoTeam {
  id: string;
  name: string;
  current?: boolean;
}

export interface DemoWorkspace {
  id: string;
  name: string;
  current?: boolean;
}

export interface QuickAction {
  id?: string;
  label: string;
  href: string;
  icon?: string;
  shortcut?: string;
}

export interface ActionCommand {
  label: string;
  href: string;
  icon?: ReactNode;
  shortcut?: string;
}

export interface ContextualCommand {
  id: string;
  label: string;
  href: string;
  contextPaths: string[];
}

export interface BottomNavItem {
  label: string;
  href: string;
  icon: string;
}

export interface FooterColumnConfig {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

/**
 * Configuration for creating an app-specific layout.
 */
export interface BaseAppLayoutConfig {
  /** App identifier */
  appId: "atlvs" | "compvss" | "gvteway";
  /** App display name for logo */
  appName: string;
  /** Default background color */
  defaultBackground: "black" | "white";
  /** Sidebar navigation sections */
  sidebarNavigation: SidebarNavSection[];
  /** Production-context navigation (optional) */
  productionNavigation?: SidebarNavSection[];
  /** Quick actions for sidebar */
  quickActions: QuickAction[];
  /** Bottom navigation for mobile */
  bottomNavigation: BottomNavItem[];
  /** Demo organizations for context switcher */
  demoOrganizations: DemoOrganization[];
  /** Demo productions for context switcher */
  demoProductions: DemoProduction[];
  /** Demo teams for context switcher */
  demoTeams: DemoTeam[];
  /** Demo workspaces for context switcher */
  demoWorkspaces: DemoWorkspace[];
  /** Action commands for command palette */
  actionCommands: ActionCommand[];
  /** Contextual commands for command palette */
  contextualCommands: ContextualCommand[];
  /** Footer columns for public pages */
  footerColumns: FooterColumnConfig[];
  /** Public navigation component */
  PublicNavigation: ComponentType;
  /** Demo notifications */
  notifications?: Notification[];
}

/**
 * Props for the base app layout component
 */
export interface BaseAppLayoutProps {
  children: ReactNode;
  variant?: "public" | "authenticated";
  contextLevels?: ContextLevel[];
  userMenu?: ReactNode;
  showFooter?: boolean;
  background?: "black" | "white";
  className?: string;
  rawContent?: boolean;
  currentPath?: string;
}

/**
 * Hook result from useBaseAppLayout
 */
export interface BaseAppLayoutHookResult {
  // Router and navigation
  router: ReturnType<typeof useRouter>;
  pathname: string;
  params: ReturnType<typeof useParams>;
  handleContextNavigation: (href: string) => void;
  
  // User and auth
  user: ReturnType<typeof useAuth>["user"];
  userRoles: string[];
  
  // Recent pages and favorites
  recentPages: ReturnType<typeof useRecentPages>;
  favorites: ReturnType<typeof useFavorites>["favorites"];
  
  // Production context
  productionId: string | undefined;
  isProductionContext: boolean;
  currentProduction: DemoProduction | undefined;
  
  // Navigation
  getContextualNavigation: () => SidebarNavSection[];
  mobileNavItems: Array<{ id: string } & BottomNavItem>;
  
  // Command palette
  commandPaletteOpen: boolean;
  closeCommandPalette: () => void;
  commandCategories: ReturnType<typeof useCommandPalette>["categories"];
  recentItems: ReturnType<typeof useCommandPalette>["recentItems"];
  handleCommandSelect: ReturnType<typeof useCommandPalette>["handleSelect"];
  
  // Quick actions
  quickActions: QuickAction[];
  
  // Context
  contextBreadcrumbs: BreadcrumbContextItem[];
  buildBreadcrumbContext: () => BreadcrumbContextItem[];
  contextOptions: ContextOptions;
  handleContextSwitch: (type: BreadcrumbContextItem["type"], id: string) => void;
  handleSignOut: () => void;
}

/**
 * Hook that provides all the common logic for app layouts.
 * This extracts the shared functionality from AtlvsAppLayout, CompvssAppLayout, and GvtewayAppLayout.
 */
export function useBaseAppLayout(
  config: BaseAppLayoutConfig,
  props: BaseAppLayoutProps
): BaseAppLayoutHookResult {
  const {
    appId,
    sidebarNavigation,
    productionNavigation,
    quickActions,
    bottomNavigation,
    demoOrganizations,
    demoProductions,
    demoTeams,
    demoWorkspaces,
    actionCommands,
    contextualCommands: configContextualCommands,
  } = config;

  const {
    variant = "authenticated",
    contextLevels = [],
    currentPath,
  } = props;

  const router = useRouter();
  const pathname = usePathname() || currentPath || "/";
  const params = useParams();

  // Get user roles from auth context
  const { user } = useAuth();
  const userRoles = useMemo(() => {
    return (user as { roles?: string[] })?.roles || [];
  }, [user]);

  // Track recent pages using shared hook
  const recentPages = useRecentPages(appId, pathname, sidebarNavigation);

  // Manage favorites
  const { favorites } = useFavorites({
    storageKey: appId,
    maxFavorites: 10,
  });

  // Handle navigation
  const handleContextNavigation = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  // Keyboard shortcuts for top 5 navigation items
  const topNavItems = useMemo(() => {
    const items: { href: string; label: string }[] = [];
    for (const section of sidebarNavigation) {
      for (const item of section.items) {
        if (item.primary && items.length < 5) {
          items.push({ href: item.href, label: item.label });
        }
      }
    }
    return items;
  }, [sidebarNavigation]);

  useKeyboardShortcuts({
    shortcuts: topNavItems.map((item, index) => ({
      keys: `cmd+${index + 1}`,
      action: () => router.push(item.href),
      description: `Go to ${item.label}`,
    })),
    enabled: variant === "authenticated",
  });

  // Context breadcrumbs from props
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

  // Production context
  const productionId = params?.productionId as string | undefined;
  const isProductionContext = Boolean(productionId);

  // Build command palette items
  const navigationCommands = useMemo(() => 
    buildNavigationCommands(sidebarNavigation as Parameters<typeof buildNavigationCommands>[0]),
    [sidebarNavigation]
  );

  const builtActionCommands = useMemo(() => 
    buildActionCommands(actionCommands),
    [actionCommands]
  );

  // Contextual commands with production ID substitution
  const contextualCommands = useMemo(() => 
    configContextualCommands.map(cmd => ({
      ...cmd,
      href: cmd.href.replace('${productionId}', productionId || ''),
    })),
    [configContextualCommands, productionId]
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
    actionItems: builtActionCommands,
    contextualCommands,
    currentPath: pathname,
    enableFrecency: true,
    onNavigate: (href) => router.push(href),
  });

  // Mobile navigation items
  const mobileNavItems = useMemo(() => 
    bottomNavigation.map((item, index) => ({
      id: `nav-${index}`,
      ...item,
    })),
    [bottomNavigation]
  );

  // Current production
  const currentProduction = isProductionContext
    ? demoProductions.find((p) => p.id === productionId)
    : undefined;

  // Get appropriate navigation based on context
  const navigation = isProductionContext && productionNavigation
    ? productionNavigation
    : sidebarNavigation;

  // Prefix hrefs with production context if needed
  const getContextualNavigation = useCallback(() => {
    if (!isProductionContext || !productionId) {
      return navigation;
    }
    
    return navigation.map((section) => ({
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
  }, [navigation, isProductionContext, productionId]);

  // Handle sign out
  const handleSignOut = useCallback(() => {
    router.push("/auth/signin");
  }, [router]);

  // Handle context switch
  const handleContextSwitch = useCallback((type: BreadcrumbContextItem["type"], id: string) => {
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
  }, [router, isProductionContext, productionId]);

  // Build breadcrumb context
  const buildBreadcrumbContext = useCallback((): BreadcrumbContextItem[] => {
    const context: BreadcrumbContextItem[] = [];
    
    const currentOrg = demoOrganizations.find(o => o.current);
    if (currentOrg) {
      context.push({
        id: currentOrg.id,
        name: currentOrg.name,
        type: "organization",
        href: "/dashboard",
      });
    }
    
    if (isProductionContext && currentProduction) {
      context.push({
        id: currentProduction.id,
        name: currentProduction.name,
        type: "project",
        href: `/p/${currentProduction.id}/overview`,
      });
      
      const currentTeam = demoTeams.find(t => t.current);
      if (currentTeam) {
        context.push({
          id: currentTeam.id,
          name: currentTeam.name,
          type: "team",
          href: `/p/${currentProduction.id}/team/${currentTeam.id}`,
        });
      }
      
      const currentWorkspace = demoWorkspaces.find(w => w.current);
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
  }, [demoOrganizations, demoTeams, demoWorkspaces, isProductionContext, currentProduction]);

  // Context options for dropdowns
  const contextOptions: ContextOptions = useMemo(() => ({
    organizations: demoOrganizations,
    projects: demoProductions.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      current: p.id === currentProduction?.id,
    })),
    teams: demoTeams,
    workspaces: demoWorkspaces,
  }), [demoOrganizations, demoProductions, demoTeams, demoWorkspaces, currentProduction]);

  return {
    router,
    pathname,
    params,
    handleContextNavigation,
    user,
    userRoles,
    recentPages,
    favorites,
    productionId,
    isProductionContext,
    currentProduction,
    getContextualNavigation,
    mobileNavItems,
    quickActions: quickActions.slice(0, 3),
    commandPaletteOpen,
    closeCommandPalette,
    commandCategories,
    recentItems,
    handleCommandSelect,
    contextBreadcrumbs,
    buildBreadcrumbContext,
    contextOptions,
    handleContextSwitch,
    handleSignOut,
  };
}

// Re-export types for consumers
export type { SidebarNavSection, ContextLevel, BreadcrumbContextItem, ContextOptions };
