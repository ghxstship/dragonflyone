import type {
  NavItem,
  NavSection,
  NavigationContext,
  PlatformRole,
  EventRole,
  Permission,
  NavigationConfig,
  AppName,
} from './types.js';

/**
 * Navigation Utility Functions
 * Filtering, visibility, and path matching utilities
 */

// =============================================================================
// ROLE & PERMISSION CHECKS
// =============================================================================

/**
 * Check if user has any of the required platform roles
 */
export function hasRequiredPlatformRole(
  userRoles: PlatformRole[],
  requiredRoles?: PlatformRole[]
): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Check if user has any of the required event roles
 */
export function hasRequiredEventRole(
  userRoles: EventRole[],
  requiredRoles?: EventRole[]
): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Check if user has all required permissions
 */
export function hasRequiredPermissions(
  userPermissions: Permission[],
  requiredPermissions?: Permission[]
): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions.every(perm => userPermissions.includes(perm));
}

/**
 * Check if a nav item should be visible to the user
 */
export function isNavItemVisible(
  item: NavItem,
  context: NavigationContext,
  platformRoles: PlatformRole[],
  eventRoles: EventRole[],
  permissions: Permission[]
): boolean {
  // Check context level
  if (item.contextLevel !== 'both') {
    if (item.contextLevel !== context.level) return false;
  }

  // Check platform roles
  if (!hasRequiredPlatformRole(platformRoles, item.platformRoles)) {
    return false;
  }

  // Check event roles (only if in event context)
  if (context.level === 'event') {
    if (!hasRequiredEventRole(eventRoles, item.eventRoles)) {
      return false;
    }
  }

  // Check permissions
  if (!hasRequiredPermissions(permissions, item.permissions)) {
    return false;
  }

  return true;
}

// =============================================================================
// NAVIGATION FILTERING
// =============================================================================

/**
 * Filter nav items based on user roles and permissions
 */
export function filterNavItems(
  items: NavItem[],
  context: NavigationContext,
  platformRoles: PlatformRole[],
  eventRoles: EventRole[],
  permissions: Permission[]
): NavItem[] {
  return items
    .filter(item => isNavItemVisible(item, context, platformRoles, eventRoles, permissions))
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: filterNavItems(item.children, context, platformRoles, eventRoles, permissions),
        };
      }
      return item;
    })
    .filter(item => {
      // Remove items with no visible children (if they have children)
      if (item.children && item.children.length === 0 && !item.href) {
        return false;
      }
      return true;
    });
}

/**
 * Filter nav sections based on user roles and permissions
 */
export function filterNavSections(
  sections: NavSection[],
  context: NavigationContext,
  platformRoles: PlatformRole[],
  eventRoles: EventRole[],
  permissions: Permission[]
): NavSection[] {
  return sections
    .map(section => ({
      ...section,
      items: filterNavItems(section.items, context, platformRoles, eventRoles, permissions),
    }))
    .filter(section => section.items.length > 0);
}

/**
 * Get navigation for current context
 */
export function getNavigationForContext(
  config: NavigationConfig,
  context: NavigationContext,
  platformRoles: PlatformRole[],
  eventRoles: EventRole[],
  permissions: Permission[]
): NavSection[] {
  const sections = context.level === 'platform' 
    ? config.platformNav 
    : config.eventNav;
  
  return filterNavSections(sections, context, platformRoles, eventRoles, permissions);
}

// =============================================================================
// PATH MATCHING
// =============================================================================

/**
 * Check if a path matches a nav item
 */
export function isPathActive(itemHref: string | undefined, currentPath: string): boolean {
  if (!itemHref) return false;
  
  // Exact match
  if (itemHref === currentPath) return true;
  
  // Check if current path starts with item href (for nested routes)
  // But not for root paths
  if (itemHref !== '/' && currentPath.startsWith(itemHref + '/')) {
    return true;
  }
  
  return false;
}

/**
 * Check if any child of a nav item is active
 */
export function hasActiveChild(item: NavItem, currentPath: string): boolean {
  if (!item.children) return false;
  
  return item.children.some((child: NavItem) => 
    isPathActive(child.href, currentPath) || hasActiveChild(child, currentPath)
  );
}

/**
 * Find the active nav item for a given path
 */
export function findActiveNavItem(
  items: NavItem[],
  currentPath: string
): NavItem | undefined {
  for (const item of items) {
    if (isPathActive(item.href, currentPath)) {
      return item;
    }
    if (item.children) {
      const activeChild = findActiveNavItem(item.children, currentPath);
      if (activeChild) return activeChild;
    }
  }
  return undefined;
}

// =============================================================================
// BREADCRUMB GENERATION
// =============================================================================

/**
 * Generate breadcrumbs from navigation config and current path
 */
export function generateBreadcrumbs(
  config: NavigationConfig,
  context: NavigationContext,
  currentPath: string
): Array<{ label: string; href?: string; current?: boolean }> {
  const breadcrumbs: Array<{ label: string; href?: string; current?: boolean }> = [];
  
  // Add app root
  breadcrumbs.push({
    label: config.app.toUpperCase(),
    href: '/dashboard',
  });
  
  // Add context if in event level
  if (context.level === 'event' && context.productionName) {
    breadcrumbs.push({
      label: context.productionName,
      href: `/p/${context.productionId}`,
    });
  }
  
  // Find matching nav items and build path
  const sections = context.level === 'platform' 
    ? config.platformNav 
    : config.eventNav;
  
  for (const section of sections) {
    const activeItem = findActiveNavItem(section.items, currentPath);
    if (activeItem) {
      // Add section if it has a title
      if (section.title) {
        breadcrumbs.push({
          label: section.title,
        });
      }
      
      // Add the active item
      breadcrumbs.push({
        label: activeItem.label,
        href: activeItem.href,
        current: true,
      });
      
      break;
    }
  }
  
  return breadcrumbs;
}

// =============================================================================
// URL GENERATION
// =============================================================================

/**
 * Generate URL with production context
 */
export function getProductionUrl(
  path: string,
  productionId: string | undefined
): string {
  if (!productionId) return path;
  
  // If path already includes production context, return as-is
  if (path.startsWith('/p/')) return path;
  
  // Prepend production context
  return `/p/${productionId}${path}`;
}

/**
 * Generate URL with event context (for GVTEWAY)
 */
export function getEventUrl(
  path: string,
  eventId: string | undefined
): string {
  if (!eventId) return path;
  
  // If path already includes event context, return as-is
  if (path.startsWith('/e/')) return path;
  
  // Prepend event context
  return `/e/${eventId}${path}`;
}

/**
 * Strip context prefix from path
 */
export function stripContextPrefix(path: string): string {
  // Remove /p/[id] or /e/[id] prefix
  return path.replace(/^\/(p|e)\/[^/]+/, '');
}

// =============================================================================
// SEARCH & COMMAND PALETTE
// =============================================================================

/**
 * Flatten nav items for search
 */
export function flattenNavItems(
  items: NavItem[],
  parentPath: string[] = []
): Array<NavItem & { path: string[] }> {
  const result: Array<NavItem & { path: string[] }> = [];
  
  for (const item of items) {
    const currentPath = [...parentPath, item.label];
    
    if (item.href) {
      result.push({ ...item, path: currentPath });
    }
    
    if (item.children) {
      result.push(...flattenNavItems(item.children, currentPath));
    }
  }
  
  return result;
}

/**
 * Search nav items by query
 */
export function searchNavItems(
  items: NavItem[],
  query: string,
  context: NavigationContext,
  platformRoles: PlatformRole[],
  eventRoles: EventRole[],
  permissions: Permission[]
): NavItem[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];
  
  const flatItems = flattenNavItems(
    filterNavItems(items, context, platformRoles, eventRoles, permissions)
  );
  
  return flatItems
    .filter(item => {
      const labelMatch = item.label.toLowerCase().includes(normalizedQuery);
      const descMatch = item.description?.toLowerCase().includes(normalizedQuery);
      const pathMatch = item.path.some((p: string) => p.toLowerCase().includes(normalizedQuery));
      return labelMatch || descMatch || pathMatch;
    })
    .slice(0, 10); // Limit results
}

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

/**
 * Parse keyboard shortcut string
 */
export function parseShortcut(shortcut: string): {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
} {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  
  return {
    key,
    meta: parts.includes('cmd') || parts.includes('meta'),
    ctrl: parts.includes('ctrl'),
    alt: parts.includes('alt') || parts.includes('opt'),
    shift: parts.includes('shift'),
  };
}

/**
 * Check if keyboard event matches shortcut
 */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: string
): boolean {
  const parsed = parseShortcut(shortcut);
  
  if (event.key.toLowerCase() !== parsed.key) return false;
  if (parsed.meta && !event.metaKey) return false;
  if (parsed.ctrl && !event.ctrlKey) return false;
  if (parsed.alt && !event.altKey) return false;
  if (parsed.shift && !event.shiftKey) return false;
  
  return true;
}

// =============================================================================
// CROSS-APP INTEGRATION - PHASE 8
// =============================================================================

/**
 * App configuration for cross-app navigation
 */
export interface AppConfig {
  name: AppName;
  displayName: string;
  baseUrl: string;
  description: string;
}

/**
 * Deep link parameters for cross-app navigation
 */
export interface DeepLinkParams {
  app: AppName;
  path: string;
  productionId?: string;
  eventId?: string;
  params?: Record<string, string>;
}

/**
 * Cross-app link definition
 */
export interface CrossAppLink {
  app: AppName;
  label: string;
  path: string;
  description?: string;
  icon?: string;
}

/**
 * Unified search result from any app
 */
export interface UnifiedSearchResult {
  id: string;
  app: AppName;
  type: 'page' | 'production' | 'event' | 'crew' | 'document' | 'action';
  title: string;
  description?: string;
  href: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

/**
 * App configuration - URLs configured via environment variables
 */
export const APP_CONFIG: Record<AppName, AppConfig> = {
  atlvs: {
    name: 'atlvs',
    displayName: 'ATLVS',
    baseUrl: typeof process !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_ATLVS_URL || 'http://localhost:3001')
      : 'http://localhost:3001',
    description: 'Production Planning & Management',
  },
  compvss: {
    name: 'compvss',
    displayName: 'COMPVSS',
    baseUrl: typeof process !== 'undefined'
      ? (process.env.NEXT_PUBLIC_COMPVSS_URL || 'http://localhost:3002')
      : 'http://localhost:3002',
    description: 'Crew & Operations Management',
  },
  gvteway: {
    name: 'gvteway',
    displayName: 'GVTEWAY',
    baseUrl: typeof process !== 'undefined'
      ? (process.env.NEXT_PUBLIC_GVTEWAY_URL || 'http://localhost:3003')
      : 'http://localhost:3003',
    description: 'Fan Experience Platform',
  },
};

/**
 * Generate a deep link URL for cross-app navigation
 */
export function generateDeepLink(params: DeepLinkParams): string {
  const { app, path, productionId, eventId, params: queryParams } = params;
  const config = APP_CONFIG[app];
  
  let url = config.baseUrl;
  
  // Build the path with context
  if (productionId && (app === 'atlvs' || app === 'compvss')) {
    url += `/p/${productionId}${path.startsWith('/') ? path : `/${path}`}`;
  } else if (eventId && app === 'gvteway') {
    url += `/e/${eventId}${path.startsWith('/') ? path : `/${path}`}`;
  } else {
    url += path.startsWith('/') ? path : `/${path}`;
  }
  
  // Add query parameters
  if (queryParams && Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams(queryParams);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
}

/**
 * Parse a deep link URL to extract app and context information
 */
export function parseDeepLink(url: string): DeepLinkParams | null {
  try {
    const parsed = new URL(url);
    
    // Determine which app based on hostname or port
    let app: AppName | null = null;
    for (const [name, config] of Object.entries(APP_CONFIG)) {
      if (parsed.origin === config.baseUrl || parsed.hostname.includes(name)) {
        app = name as AppName;
        break;
      }
    }
    
    if (!app) return null;
    
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    let productionId: string | undefined;
    let eventId: string | undefined;
    let path = parsed.pathname;
    
    // Extract production/event context
    if (pathParts[0] === 'p' && pathParts[1]) {
      productionId = pathParts[1];
      path = '/' + pathParts.slice(2).join('/');
    } else if (pathParts[0] === 'e' && pathParts[1]) {
      eventId = pathParts[1];
      path = '/' + pathParts.slice(2).join('/');
    }
    
    // Extract query params
    const params: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return {
      app,
      path,
      productionId,
      eventId,
      params: Object.keys(params).length > 0 ? params : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Get cross-app links for a production context
 */
export function getProductionCrossAppLinks(productionId: string): CrossAppLink[] {
  return [
    {
      app: 'atlvs',
      label: 'Production Planning',
      path: `/p/${productionId}/overview`,
      description: 'View production details and planning',
      icon: 'LayoutDashboard',
    },
    {
      app: 'atlvs',
      label: 'Finance',
      path: `/p/${productionId}/finance`,
      description: 'Budgets, expenses, and sponsors',
      icon: 'DollarSign',
    },
    {
      app: 'compvss',
      label: 'Crew Management',
      path: `/p/${productionId}/crew`,
      description: 'Crew assignments and schedules',
      icon: 'Users',
    },
    {
      app: 'compvss',
      label: 'Operations',
      path: `/p/${productionId}/operations`,
      description: 'Stage management and logistics',
      icon: 'Settings',
    },
  ];
}

/**
 * Get cross-app links for an event context
 */
export function getEventCrossAppLinks(eventId: string, productionId?: string): CrossAppLink[] {
  const links: CrossAppLink[] = [
    {
      app: 'gvteway',
      label: 'Fan Experience',
      path: `/e/${eventId}`,
      description: 'Event landing page for fans',
      icon: 'Ticket',
    },
    {
      app: 'gvteway',
      label: 'Event Program',
      path: `/e/${eventId}/program`,
      description: 'Schedule and set times',
      icon: 'Calendar',
    },
  ];
  
  if (productionId) {
    links.push(
      {
        app: 'atlvs',
        label: 'Production Details',
        path: `/p/${productionId}/overview`,
        description: 'Production planning and management',
        icon: 'LayoutDashboard',
      },
      {
        app: 'compvss',
        label: 'Crew Operations',
        path: `/p/${productionId}/overview`,
        description: 'Crew and operations status',
        icon: 'Users',
      }
    );
  }
  
  return links;
}

/**
 * Navigate to another app (opens in new tab by default)
 */
export function navigateCrossApp(
  params: DeepLinkParams,
  options: { newTab?: boolean } = { newTab: true }
): void {
  const url = generateDeepLink(params);
  
  if (typeof window !== 'undefined') {
    if (options.newTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  }
}

/**
 * Check if a URL is a cross-app link
 */
export function isCrossAppLink(url: string, currentApp: AppName): boolean {
  const parsed = parseDeepLink(url);
  return parsed !== null && parsed.app !== currentApp;
}

// =============================================================================
// ROLE-BASED NAVIGATION FILTERING
// =============================================================================

/**
 * Role hierarchy for permission inheritance
 */
const PLATFORM_ROLE_HIERARCHY: Record<PlatformRole, PlatformRole[]> = {
  super_admin: ['super_admin', 'org_admin', 'finance_director', 'production_manager', 'sales_director', 'operations_director', 'marketing_director', 'hr_director', 'member'],
  org_admin: ['org_admin', 'finance_director', 'production_manager', 'sales_director', 'operations_director', 'marketing_director', 'hr_director', 'member'],
  finance_director: ['finance_director', 'member'],
  production_manager: ['production_manager', 'member'],
  sales_director: ['sales_director', 'member'],
  operations_director: ['operations_director', 'member'],
  marketing_director: ['marketing_director', 'member'],
  hr_director: ['hr_director', 'member'],
  member: ['member'],
};

const EVENT_ROLE_HIERARCHY: Record<EventRole, EventRole[]> = {
  executive_producer: ['executive_producer', 'production_manager', 'finance_manager', 'operations_manager', 'marketing_manager', 'department_head', 'crew_lead', 'crew_member', 'vendor', 'stakeholder', 'viewer'],
  production_manager: ['production_manager', 'department_head', 'crew_lead', 'crew_member', 'viewer'],
  finance_manager: ['finance_manager', 'viewer'],
  operations_manager: ['operations_manager', 'department_head', 'crew_lead', 'crew_member', 'viewer'],
  marketing_manager: ['marketing_manager', 'viewer'],
  department_head: ['department_head', 'crew_lead', 'crew_member', 'viewer'],
  crew_lead: ['crew_lead', 'crew_member', 'viewer'],
  crew_member: ['crew_member', 'viewer'],
  vendor: ['vendor', 'viewer'],
  stakeholder: ['stakeholder', 'viewer'],
  viewer: ['viewer'],
};

/**
 * Get effective roles including inherited roles
 */
export function getEffectivePlatformRoles(roles: PlatformRole[]): PlatformRole[] {
  const effective = new Set<PlatformRole>();
  for (const role of roles) {
    const inherited = PLATFORM_ROLE_HIERARCHY[role] || [role];
    inherited.forEach(r => effective.add(r));
  }
  return Array.from(effective);
}

/**
 * Get effective event roles including inherited roles
 */
export function getEffectiveEventRoles(roles: EventRole[]): EventRole[] {
  const effective = new Set<EventRole>();
  for (const role of roles) {
    const inherited = EVENT_ROLE_HIERARCHY[role] || [role];
    inherited.forEach(r => effective.add(r));
  }
  return Array.from(effective);
}

/**
 * Filter navigation by role with hierarchy support
 * This is the main filterByRole implementation for Phase 8
 */
export function filterByRole(
  items: NavItem[],
  context: NavigationContext,
  platformRoles: PlatformRole[],
  eventRoles: EventRole[],
  permissions: Permission[],
  options: {
    includeHierarchy?: boolean;
    currentApp?: AppName;
  } = {}
): NavItem[] {
  const { includeHierarchy = true, currentApp } = options;
  
  // Get effective roles with hierarchy
  const effectivePlatformRoles = includeHierarchy 
    ? getEffectivePlatformRoles(platformRoles)
    : platformRoles;
  const effectiveEventRoles = includeHierarchy
    ? getEffectiveEventRoles(eventRoles)
    : eventRoles;
  
  return items
    .filter(item => {
      // Filter by app if specified
      if (currentApp && item.apps && !item.apps.includes(currentApp)) {
        return false;
      }
      
      return isNavItemVisible(
        item,
        context,
        effectivePlatformRoles,
        effectiveEventRoles,
        permissions
      );
    })
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: filterByRole(
            item.children,
            context,
            platformRoles,
            eventRoles,
            permissions,
            options
          ),
        };
      }
      return item;
    })
    .filter(item => {
      // Remove items with no visible children (if they have children)
      if (item.children && item.children.length === 0 && !item.href) {
        return false;
      }
      return true;
    });
}

// =============================================================================
// UNIFIED SEARCH ACROSS APPS
// =============================================================================

/**
 * Search configuration for unified search
 */
export interface UnifiedSearchConfig {
  apps: AppName[];
  context: NavigationContext;
  platformRoles: PlatformRole[];
  eventRoles: EventRole[];
  permissions: Permission[];
  configs: Record<AppName, NavigationConfig>;
}

/**
 * Perform unified search across all apps
 * Returns results from navigation items across all configured apps
 */
export function unifiedSearch(
  query: string,
  config: UnifiedSearchConfig
): UnifiedSearchResult[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];
  
  const results: UnifiedSearchResult[] = [];
  
  for (const app of config.apps) {
    const appConfig = config.configs[app];
    if (!appConfig) continue;
    
    // Get all nav items for this app
    const allItems = [
      ...appConfig.platformNav.flatMap(s => s.items),
      ...appConfig.eventNav.flatMap(s => s.items),
      ...(appConfig.quickActions || []),
    ];
    
    // Filter by role and search
    const filteredItems = filterByRole(
      allItems,
      config.context,
      config.platformRoles,
      config.eventRoles,
      config.permissions,
      { currentApp: app }
    );
    
    // Flatten and search
    const flatItems = flattenNavItems(filteredItems);
    
    for (const item of flatItems) {
      const labelMatch = item.label.toLowerCase().includes(normalizedQuery);
      const descMatch = item.description?.toLowerCase().includes(normalizedQuery);
      const pathMatch = item.path.some(p => p.toLowerCase().includes(normalizedQuery));
      
      if (labelMatch || descMatch || pathMatch) {
        results.push({
          id: `${app}-${item.id}`,
          app,
          type: 'page',
          title: item.label,
          description: item.description || item.path.join(' > '),
          href: generateDeepLink({
            app,
            path: item.href || '/',
            productionId: config.context.productionId,
            eventId: config.context.eventId,
          }),
          icon: item.icon,
        });
      }
    }
  }
  
  // Sort by relevance (exact matches first)
  results.sort((a, b) => {
    const aExact = a.title.toLowerCase() === normalizedQuery;
    const bExact = b.title.toLowerCase() === normalizedQuery;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    const aStarts = a.title.toLowerCase().startsWith(normalizedQuery);
    const bStarts = b.title.toLowerCase().startsWith(normalizedQuery);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    
    return 0;
  });
  
  return results.slice(0, 20); // Limit results
}

/**
 * Get quick actions available across all apps for the current user
 */
export function getUnifiedQuickActions(
  config: UnifiedSearchConfig
): UnifiedSearchResult[] {
  const actions: UnifiedSearchResult[] = [];
  
  for (const app of config.apps) {
    const appConfig = config.configs[app];
    if (!appConfig?.quickActions) continue;
    
    const filteredActions = filterByRole(
      appConfig.quickActions,
      config.context,
      config.platformRoles,
      config.eventRoles,
      config.permissions,
      { currentApp: app }
    );
    
    for (const action of filteredActions) {
      if (action.href) {
        actions.push({
          id: `${app}-action-${action.id}`,
          app,
          type: 'action',
          title: action.label,
          description: action.description,
          href: generateDeepLink({
            app,
            path: action.href,
            productionId: config.context.productionId,
            eventId: config.context.eventId,
          }),
          icon: action.icon,
        });
      }
    }
  }
  
  return actions;
}
