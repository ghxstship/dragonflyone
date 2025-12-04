/**
 * Navigation Module
 * Shared navigation types, utilities, and components
 */

// Types
export type {
  NavigationContextLevel,
  AppName,
  NavigationContext,
  PlatformRole,
  EventRole,
  PermissionScope,
  PermissionResource,
  Permission,
  NavBadge,
  NavItem,
  NavSection,
  NavigationConfig,
  SidebarProps,
  ContextSwitcherProps,
  BreadcrumbItem,
  BreadcrumbProps,
  CommandPaletteProps,
  NavigationState,
  NavigationActions,
} from './types.js';

// Utilities
export {
  hasRequiredPlatformRole,
  hasRequiredEventRole,
  hasRequiredPermissions,
  isNavItemVisible,
  filterNavItems,
  filterNavSections,
  getNavigationForContext,
  isPathActive,
  hasActiveChild,
  findActiveNavItem,
  generateBreadcrumbs,
  getProductionUrl,
  getEventUrl,
  stripContextPrefix,
  flattenNavItems,
  searchNavItems,
  parseShortcut,
  matchesShortcut,
} from './utils.js';
