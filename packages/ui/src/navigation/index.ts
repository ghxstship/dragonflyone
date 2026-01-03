/**
 * Navigation Module
 * Shared navigation types, utilities, and components
 */

// MegaMenu Component System
export {
  MegaMenu,
  MegaMenuRoot,
  MegaMenuItem,
  MegaMenuTrigger,
  MegaMenuContent,
  MegaMenuLink,
  MegaMenuSection,
  MegaMenuItemLink,
  MegaMenuFooter,
  MegaMenuIndicator,
} from './mega-menu.js';

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
  // Phase 8: Cross-App Integration
  APP_CONFIG,
  generateDeepLink,
  parseDeepLink,
  getProductionCrossAppLinks,
  getEventCrossAppLinks,
  navigateCrossApp,
  isCrossAppLink,
  // Phase 8: Role-Based Filtering
  getEffectivePlatformRoles,
  getEffectiveEventRoles,
  filterByRole,
  // Phase 8: Unified Search
  unifiedSearch,
  getUnifiedQuickActions,
} from './utils.js';

// Phase 8: Cross-App Types
export type {
  AppConfig,
  DeepLinkParams,
  CrossAppLink,
  UnifiedSearchResult,
  UnifiedSearchConfig,
} from './utils.js';
