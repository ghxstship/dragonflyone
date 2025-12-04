import type {
  NavItem,
  NavSection,
  NavigationContext,
  PlatformRole,
  EventRole,
  Permission,
  NavigationConfig,
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
