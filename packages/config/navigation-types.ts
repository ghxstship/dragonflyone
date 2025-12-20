/**
 * Unified Navigation Types for GHXSTSHIP Platform
 * 
 * This module provides standardized navigation types used across all apps
 * (ATLVS, COMPVSS, GVTEWAY) with support for:
 * - Role and permission-based filtering
 * - Badge notifications
 * - Favorites/pinning
 * - Collapsible sections
 * - Keyboard navigation
 * - Frecency-based ordering
 */

import type { PlatformRole, EventRole, Permission } from './roles';

// =============================================================================
// BADGE TYPES
// =============================================================================

export type NavBadgeVariant = 'count' | 'dot' | 'new' | 'alert';

export interface NavBadge {
  value?: string | number;
  variant: NavBadgeVariant;
  /** Optional tooltip/title for the badge */
  tooltip?: string;
}

// =============================================================================
// NAVIGATION ITEM TYPES
// =============================================================================

export interface UnifiedNavItem {
  /** Unique identifier for the item */
  id: string;
  /** Display label */
  label: string;
  /** Navigation path */
  href: string;
  /** Icon name (Lucide icon) */
  icon?: string;
  /** Badge for notifications/counts */
  badge?: NavBadge;
  /** Is this a primary/featured item in the section */
  primary?: boolean;
  /** Platform roles allowed to see this item (empty = all) */
  allowedRoles?: (PlatformRole | EventRole | string)[];
  /** Permissions required to see this item */
  requiredPermissions?: Permission[];
  /** Context level where this item appears */
  contextLevel?: 'platform' | 'event' | 'both';
  /** Apps where this item is visible */
  apps?: ('atlvs' | 'compvss' | 'gvteway')[];
  /** Child items for nested navigation */
  children?: UnifiedNavItem[];
  /** Default collapsed state for children */
  defaultCollapsed?: boolean;
  /** Can this item be pinned to favorites */
  pinnable?: boolean;
  /** Custom sort order (lower = higher priority) */
  order?: number;
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Accessibility description */
  description?: string;
  /** Is this item disabled */
  disabled?: boolean;
  /** Tooltip when disabled */
  disabledReason?: string;
}

export interface NavSubsection {
  /** Subsection identifier */
  id: string;
  /** Subsection label */
  label: string;
  /** Items in this subsection */
  items: UnifiedNavItem[];
  /** Roles allowed to see this subsection */
  allowedRoles?: (PlatformRole | EventRole | string)[];
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

export interface NavSection {
  /** Section identifier */
  id: string;
  /** Section display name */
  section: string;
  /** Section icon */
  icon?: string;
  /** Primary navigation items */
  items: UnifiedNavItem[];
  /** Grouped subsections */
  subsections?: NavSubsection[];
  /** Roles allowed to see this section */
  allowedRoles?: (PlatformRole | EventRole | string)[];
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Badge for section-level notifications */
  badge?: NavBadge;
  /** Custom sort order */
  order?: number;
}

// =============================================================================
// NAVIGATION STATE TYPES
// =============================================================================

export interface NavigationState {
  /** Currently expanded section IDs */
  expandedSections: Set<string>;
  /** Pinned/favorite item IDs */
  pinnedItems: string[];
  /** Recently visited items (ordered by recency) */
  recentItems: string[];
  /** Frecency scores for items (id -> score) */
  frecencyScores: Map<string, number>;
  /** User's custom section order */
  sectionOrder?: string[];
  /** Is sidebar collapsed */
  sidebarCollapsed: boolean;
  /** Search query */
  searchQuery: string;
  /** Focused item index for keyboard nav */
  focusedIndex: number;
}

export interface NavigationActions {
  /** Toggle section expansion */
  toggleSection: (sectionId: string) => void;
  /** Expand all sections */
  expandAll: () => void;
  /** Collapse all sections */
  collapseAll: () => void;
  /** Pin/unpin an item */
  togglePin: (itemId: string) => void;
  /** Record a navigation event (for frecency) */
  recordNavigation: (itemId: string) => void;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Move focus up/down for keyboard nav */
  moveFocus: (direction: 'up' | 'down') => void;
  /** Select the focused item */
  selectFocused: () => void;
  /** Toggle sidebar collapsed state */
  toggleSidebar: () => void;
  /** Reorder sections */
  reorderSections: (fromIndex: number, toIndex: number) => void;
}

// =============================================================================
// FRECENCY CALCULATION
// =============================================================================

export interface FrecencyEntry {
  itemId: string;
  lastVisited: number; // timestamp
  visitCount: number;
  score: number;
}

/**
 * Calculate frecency score for an item
 * Combines frequency (how often) and recency (how recently)
 */
export function calculateFrecencyScore(
  lastVisited: number,
  visitCount: number,
  now: number = Date.now()
): number {
  const hoursSinceVisit = (now - lastVisited) / (1000 * 60 * 60);
  
  // Decay factor based on recency
  // Items visited recently get higher scores
  let recencyMultiplier: number;
  if (hoursSinceVisit < 1) {
    recencyMultiplier = 100;
  } else if (hoursSinceVisit < 24) {
    recencyMultiplier = 70;
  } else if (hoursSinceVisit < 24 * 7) {
    recencyMultiplier = 50;
  } else if (hoursSinceVisit < 24 * 30) {
    recencyMultiplier = 30;
  } else {
    recencyMultiplier = 10;
  }
  
  // Combine visit count with recency
  return visitCount * recencyMultiplier;
}

/**
 * Sort items by frecency score
 */
export function sortByFrecency<T extends { id: string }>(
  items: T[],
  frecencyData: Map<string, FrecencyEntry>
): T[] {
  return [...items].sort((a, b) => {
    const scoreA = frecencyData.get(a.id)?.score ?? 0;
    const scoreB = frecencyData.get(b.id)?.score ?? 0;
    return scoreB - scoreA;
  });
}

// =============================================================================
// NAVIGATION FILTERING
// =============================================================================

/**
 * Filter navigation items based on user roles and permissions
 */
export function filterNavItem(
  item: UnifiedNavItem,
  userRoles: (PlatformRole | EventRole | string)[],
  userPermissions: Permission[]
): boolean {
  // Check role-based access
  if (item.allowedRoles && item.allowedRoles.length > 0) {
    const hasRole = item.allowedRoles.some(role => 
      userRoles.includes(role as PlatformRole | EventRole | string)
    );
    if (!hasRole) return false;
  }
  
  // Check permission-based access
  if (item.requiredPermissions && item.requiredPermissions.length > 0) {
    const hasAllPermissions = item.requiredPermissions.every(perm =>
      userPermissions.includes(perm)
    );
    if (!hasAllPermissions) return false;
  }
  
  return true;
}

/**
 * Filter a section and its items based on roles/permissions
 */
export function filterNavSection(
  section: NavSection,
  userRoles: (PlatformRole | EventRole | string)[],
  userPermissions: Permission[]
): NavSection | null {
  // Check section-level access
  if (section.allowedRoles && section.allowedRoles.length > 0) {
    const hasRole = section.allowedRoles.some(role =>
      userRoles.includes(role as PlatformRole | EventRole | string)
    );
    if (!hasRole) return null;
  }
  
  // Filter items
  const filteredItems = section.items.filter(item =>
    filterNavItem(item, userRoles, userPermissions)
  );
  
  // Filter subsections
  const filteredSubsections = section.subsections?.map(sub => {
    if (sub.allowedRoles && sub.allowedRoles.length > 0) {
      const hasRole = sub.allowedRoles.some(role =>
        userRoles.includes(role as PlatformRole | EventRole | string)
      );
      if (!hasRole) return null;
    }
    
    const filteredSubItems = sub.items.filter(item =>
      filterNavItem(item, userRoles, userPermissions)
    );
    
    if (filteredSubItems.length === 0) return null;
    
    return { ...sub, items: filteredSubItems };
  }).filter((sub): sub is NavSubsection => sub !== null);
  
  // Return null if no items remain
  if (filteredItems.length === 0 && (!filteredSubsections || filteredSubsections.length === 0)) {
    return null;
  }
  
  return {
    ...section,
    items: filteredItems,
    subsections: filteredSubsections,
  };
}

/**
 * Filter all navigation sections
 */
export function filterNavigation(
  sections: NavSection[],
  userRoles: (PlatformRole | EventRole | string)[],
  userPermissions: Permission[]
): NavSection[] {
  return sections
    .map(section => filterNavSection(section, userRoles, userPermissions))
    .filter((section): section is NavSection => section !== null);
}

// =============================================================================
// SEARCH HELPERS
// =============================================================================

/**
 * Search within navigation items
 */
export function searchNavigation(
  sections: NavSection[],
  query: string
): UnifiedNavItem[] {
  if (!query.trim()) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const results: UnifiedNavItem[] = [];
  
  for (const section of sections) {
    // Search items
    for (const item of section.items) {
      if (
        item.label.toLowerCase().includes(normalizedQuery) ||
        item.description?.toLowerCase().includes(normalizedQuery)
      ) {
        results.push(item);
      }
      
      // Search children
      if (item.children) {
        for (const child of item.children) {
          if (
            child.label.toLowerCase().includes(normalizedQuery) ||
            child.description?.toLowerCase().includes(normalizedQuery)
          ) {
            results.push(child);
          }
        }
      }
    }
    
    // Search subsections
    if (section.subsections) {
      for (const sub of section.subsections) {
        for (const item of sub.items) {
          if (
            item.label.toLowerCase().includes(normalizedQuery) ||
            item.description?.toLowerCase().includes(normalizedQuery)
          ) {
            results.push(item);
          }
        }
      }
    }
  }
  
  return results;
}

// =============================================================================
// KEYBOARD NAVIGATION HELPERS
// =============================================================================

/**
 * Get all navigable items in flat order for keyboard navigation
 */
export function getFlatNavigableItems(
  sections: NavSection[],
  expandedSections: Set<string>
): UnifiedNavItem[] {
  const items: UnifiedNavItem[] = [];
  
  for (const section of sections) {
    const isExpanded = expandedSections.has(section.id);
    
    if (isExpanded) {
      items.push(...section.items);
      
      if (section.subsections) {
        for (const sub of section.subsections) {
          items.push(...sub.items);
        }
      }
    }
  }
  
  return items.filter(item => !item.disabled);
}

// =============================================================================
// STORAGE HELPERS
// =============================================================================

export interface NavigationStorageData {
  expandedSections: string[];
  pinnedItems: string[];
  sidebarCollapsed: boolean;
  sectionOrder?: string[];
  frecencyData: Array<{ id: string; lastVisited: number; visitCount: number }>;
}

/**
 * Save navigation state to localStorage
 */
export function saveNavigationState(
  storageKey: string,
  data: Partial<NavigationStorageData>
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = localStorage.getItem(storageKey);
    const current = existing ? JSON.parse(existing) : {};
    const merged = { ...current, ...data };
    localStorage.setItem(storageKey, JSON.stringify(merged));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Load navigation state from localStorage
 */
export function loadNavigationState(
  storageKey: string
): NavigationStorageData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// =============================================================================
// MIGRATION HELPERS
// =============================================================================

/**
 * Convert legacy SidebarNavItem to UnifiedNavItem
 */
export function migrateLegacyNavItem(
  legacyItem: {
    label: string;
    href: string;
    icon?: string;
    badge?: string | number;
    primary?: boolean;
    allowedRoles?: string[];
  },
  sectionId: string,
  index: number
): UnifiedNavItem {
  return {
    id: `${sectionId}-${legacyItem.href.replace(/\//g, '-').replace(/^-/, '')}`,
    label: legacyItem.label,
    href: legacyItem.href,
    icon: legacyItem.icon,
    badge: legacyItem.badge !== undefined 
      ? { value: legacyItem.badge, variant: 'count' as NavBadgeVariant }
      : undefined,
    primary: legacyItem.primary,
    allowedRoles: legacyItem.allowedRoles,
    pinnable: true,
    order: index,
  };
}

/**
 * Convert legacy SidebarNavSection to NavSection
 */
export function migrateLegacyNavSection(
  legacySection: {
    section: string;
    icon?: string;
    items: Array<{
      label: string;
      href: string;
      icon?: string;
      badge?: string | number;
      primary?: boolean;
      allowedRoles?: string[];
    }>;
    subsections?: Array<{
      label: string;
      items: Array<{
        label: string;
        href: string;
        icon?: string;
        badge?: string | number;
        primary?: boolean;
        allowedRoles?: string[];
      }>;
      allowedRoles?: string[];
    }>;
    allowedRoles?: string[];
  },
  index: number
): NavSection {
  const sectionId = legacySection.section.toLowerCase().replace(/\s+/g, '-');
  
  return {
    id: sectionId,
    section: legacySection.section,
    icon: legacySection.icon,
    items: legacySection.items.map((item, i) => 
      migrateLegacyNavItem(item, sectionId, i)
    ),
    subsections: legacySection.subsections?.map((sub, subIndex) => ({
      id: `${sectionId}-sub-${subIndex}`,
      label: sub.label,
      items: sub.items.map((item, i) => 
        migrateLegacyNavItem(item, `${sectionId}-sub-${subIndex}`, i)
      ),
      allowedRoles: sub.allowedRoles,
    })),
    allowedRoles: legacySection.allowedRoles,
    order: index,
  };
}
