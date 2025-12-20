"use client";

/**
 * Enhanced Navigation Hook
 * 
 * Provides comprehensive navigation state management with:
 * - Collapsible sections with persistent state
 * - Favorites/pinning system
 * - Frecency-based ordering
 * - Keyboard navigation
 * - Search within navigation
 * - Badge support
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  NavSection,
  UnifiedNavItem,
  NavigationState,
  NavigationActions,
  FrecencyEntry,
} from '../navigation-types';
import {
  calculateFrecencyScore,
  filterNavigation,
  searchNavigation,
  getFlatNavigableItems,
  saveNavigationState,
  loadNavigationState,
} from '../navigation-types';
import type { PlatformRole, EventRole, Permission } from '../roles';

// =============================================================================
// TYPES
// =============================================================================

export interface UseEnhancedNavigationOptions {
  /** Navigation sections */
  sections: NavSection[];
  /** Current active path */
  currentPath: string;
  /** User's roles */
  userRoles?: (PlatformRole | EventRole | string)[];
  /** User's permissions */
  userPermissions?: Permission[];
  /** Storage key for persistence */
  storageKey?: string;
  /** Enable frecency-based ordering */
  enableFrecency?: boolean;
  /** Maximum recent items to track */
  maxRecentItems?: number;
  /** Maximum favorites */
  maxFavorites?: number;
  /** Callback when navigating */
  onNavigate?: (href: string) => void;
}

export interface UseEnhancedNavigationResult {
  /** Filtered navigation sections */
  filteredSections: NavSection[];
  /** Search results (empty if no search) */
  searchResults: UnifiedNavItem[];
  /** Pinned/favorite items */
  pinnedItems: UnifiedNavItem[];
  /** Recent items sorted by frecency */
  recentItems: UnifiedNavItem[];
  /** Navigation state */
  state: NavigationState;
  /** Navigation actions */
  actions: NavigationActions;
  /** Is currently searching */
  isSearching: boolean;
  /** Keyboard navigation props for the sidebar */
  keyboardProps: {
    onKeyDown: (e: React.KeyboardEvent) => void;
    role: string;
    'aria-label': string;
  };
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useEnhancedNavigation({
  sections,
  currentPath,
  userRoles = [],
  userPermissions = [],
  storageKey = 'ghxstship-nav',
  enableFrecency = true,
  maxRecentItems = 10,
  maxFavorites = 20,
  onNavigate,
}: UseEnhancedNavigationOptions): UseEnhancedNavigationResult {
  // State
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [pinnedItemIds, setPinnedItemIds] = useState<string[]>([]);
  const [frecencyData, setFrecencyData] = useState<Map<string, FrecencyEntry>>(new Map());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  
  // Load state from localStorage on mount
  useEffect(() => {
    const stored = loadNavigationState(storageKey);
    if (stored) {
      if (stored.expandedSections) {
        setExpandedSections(new Set(stored.expandedSections));
      }
      if (stored.pinnedItems) {
        setPinnedItemIds(stored.pinnedItems);
      }
      if (stored.sidebarCollapsed !== undefined) {
        setSidebarCollapsed(stored.sidebarCollapsed);
      }
      if (stored.sectionOrder) {
        setSectionOrder(stored.sectionOrder);
      }
      if (stored.frecencyData) {
        const map = new Map<string, FrecencyEntry>();
        stored.frecencyData.forEach(entry => {
          map.set(entry.id, {
            itemId: entry.id,
            lastVisited: entry.lastVisited,
            visitCount: entry.visitCount,
            score: calculateFrecencyScore(entry.lastVisited, entry.visitCount),
          });
        });
        setFrecencyData(map);
      }
    }
  }, [storageKey]);
  
  // Filter sections based on roles and permissions
  const filteredSections = useMemo(() => {
    const filtered = filterNavigation(sections, userRoles, userPermissions);
    
    // Apply custom section order if set
    if (sectionOrder.length > 0) {
      return [...filtered].sort((a, b) => {
        const indexA = sectionOrder.indexOf(a.id);
        const indexB = sectionOrder.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }
    
    return filtered;
  }, [sections, userRoles, userPermissions, sectionOrder]);
  
  // Get all items flat for lookups
  const allItems = useMemo(() => {
    const items: UnifiedNavItem[] = [];
    for (const section of filteredSections) {
      items.push(...section.items);
      if (section.subsections) {
        for (const sub of section.subsections) {
          items.push(...sub.items);
        }
      }
    }
    return items;
  }, [filteredSections]);
  
  // Pinned items (resolved from IDs)
  const pinnedItems = useMemo(() => {
    return pinnedItemIds
      .map(id => allItems.find(item => item.id === id))
      .filter((item): item is UnifiedNavItem => item !== undefined);
  }, [pinnedItemIds, allItems]);
  
  // Recent items (sorted by frecency)
  const recentItems = useMemo(() => {
    if (!enableFrecency) return [];
    
    const itemsWithScores = allItems
      .filter(item => frecencyData.has(item.id))
      .map(item => ({
        item,
        score: frecencyData.get(item.id)?.score ?? 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecentItems)
      .map(({ item }) => item);
    
    return itemsWithScores;
  }, [allItems, frecencyData, enableFrecency, maxRecentItems]);
  
  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchNavigation(filteredSections, searchQuery);
  }, [filteredSections, searchQuery]);
  
  // Is currently searching
  const isSearching = searchQuery.trim().length > 0;
  
  // Navigable items for keyboard nav
  const navigableItems = useMemo(() => {
    if (isSearching) return searchResults;
    return getFlatNavigableItems(filteredSections, expandedSections);
  }, [filteredSections, expandedSections, isSearching, searchResults]);
  
  // Auto-expand section containing current path
  useEffect(() => {
    for (const section of filteredSections) {
      const hasActiveItem = section.items.some(
        item => currentPath === item.href || currentPath.startsWith(item.href + '/')
      );
      const hasActiveSubsection = section.subsections?.some(sub =>
        sub.items.some(
          item => currentPath === item.href || currentPath.startsWith(item.href + '/')
        )
      );
      
      if (hasActiveItem || hasActiveSubsection) {
        setExpandedSections(prev => new Set([...prev, section.id]));
      }
    }
  }, [currentPath, filteredSections]);
  
  // Record navigation for frecency
  const recordNavigation = useCallback((itemId: string) => {
    if (!enableFrecency) return;
    
    setFrecencyData(prev => {
      const existing = prev.get(itemId);
      const now = Date.now();
      const visitCount = (existing?.visitCount ?? 0) + 1;
      const entry: FrecencyEntry = {
        itemId,
        lastVisited: now,
        visitCount,
        score: calculateFrecencyScore(now, visitCount, now),
      };
      
      const next = new Map(prev);
      next.set(itemId, entry);
      
      // Persist to storage
      const frecencyArray = Array.from(next.values()).map(e => ({
        id: e.itemId,
        lastVisited: e.lastVisited,
        visitCount: e.visitCount,
      }));
      saveNavigationState(storageKey, { frecencyData: frecencyArray });
      
      return next;
    });
  }, [enableFrecency, storageKey]);
  
  // Actions
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      saveNavigationState(storageKey, { expandedSections: Array.from(next) });
      return next;
    });
  }, [storageKey]);
  
  const expandAll = useCallback(() => {
    const allIds = filteredSections.map(s => s.id);
    setExpandedSections(new Set(allIds));
    saveNavigationState(storageKey, { expandedSections: allIds });
  }, [filteredSections, storageKey]);
  
  const collapseAll = useCallback(() => {
    setExpandedSections(new Set());
    saveNavigationState(storageKey, { expandedSections: [] });
  }, [storageKey]);
  
  const togglePin = useCallback((itemId: string) => {
    setPinnedItemIds(prev => {
      let next: string[];
      if (prev.includes(itemId)) {
        next = prev.filter(id => id !== itemId);
      } else {
        if (prev.length >= maxFavorites) {
          // Remove oldest if at limit
          next = [...prev.slice(1), itemId];
        } else {
          next = [...prev, itemId];
        }
      }
      saveNavigationState(storageKey, { pinnedItems: next });
      return next;
    });
  }, [maxFavorites, storageKey]);
  
  const moveFocus = useCallback((direction: 'up' | 'down') => {
    setFocusedIndex(prev => {
      const maxIndex = navigableItems.length - 1;
      if (direction === 'up') {
        return prev <= 0 ? maxIndex : prev - 1;
      } else {
        return prev >= maxIndex ? 0 : prev + 1;
      }
    });
  }, [navigableItems.length]);
  
  const selectFocused = useCallback(() => {
    if (focusedIndex >= 0 && focusedIndex < navigableItems.length) {
      const item = navigableItems[focusedIndex];
      if (item && onNavigate) {
        recordNavigation(item.id);
        onNavigate(item.href);
      }
    }
  }, [focusedIndex, navigableItems, onNavigate, recordNavigation]);
  
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      saveNavigationState(storageKey, { sidebarCollapsed: next });
      return next;
    });
  }, [storageKey]);
  
  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    const sectionIds = filteredSections.map(s => s.id);
    const [moved] = sectionIds.splice(fromIndex, 1);
    sectionIds.splice(toIndex, 0, moved);
    setSectionOrder(sectionIds);
    saveNavigationState(storageKey, { sectionOrder: sectionIds });
  }, [filteredSections, storageKey]);
  
  // Keyboard event handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        moveFocus('up');
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveFocus('down');
        break;
      case 'Enter':
        e.preventDefault();
        selectFocused();
        break;
      case 'Escape':
        e.preventDefault();
        setSearchQuery('');
        setFocusedIndex(-1);
        break;
    }
  }, [moveFocus, selectFocused]);
  
  // State object
  const state: NavigationState = {
    expandedSections,
    pinnedItems: pinnedItemIds,
    recentItems: recentItems.map(i => i.id),
    frecencyScores: new Map(
      Array.from(frecencyData.entries()).map(([id, entry]) => [id, entry.score])
    ),
    sectionOrder,
    sidebarCollapsed,
    searchQuery,
    focusedIndex,
  };
  
  // Actions object
  const actions: NavigationActions = {
    toggleSection,
    expandAll,
    collapseAll,
    togglePin,
    recordNavigation,
    setSearchQuery,
    moveFocus,
    selectFocused,
    toggleSidebar,
    reorderSections,
  };
  
  // Keyboard props for the sidebar
  const keyboardProps = {
    onKeyDown: handleKeyDown,
    role: 'navigation',
    'aria-label': 'Main navigation',
  };
  
  return {
    filteredSections,
    searchResults,
    pinnedItems,
    recentItems,
    state,
    actions,
    isSearching,
    keyboardProps,
  };
}

// =============================================================================
// BADGE HOOK
// =============================================================================

export interface UseBadgeOptions {
  /** API endpoint to fetch badge counts */
  endpoint?: string;
  /** Polling interval in ms (0 to disable) */
  pollingInterval?: number;
  /** Manual badge data */
  staticBadges?: Record<string, number | string>;
}

export function useNavigationBadges({
  endpoint,
  pollingInterval = 0,
  staticBadges = {},
}: UseBadgeOptions = {}): Map<string, number | string> {
  const [badges, setBadges] = useState<Map<string, number | string>>(
    new Map(Object.entries(staticBadges))
  );
  
  // Fetch badges from API
  useEffect(() => {
    if (!endpoint) return;
    
    const fetchBadges = async () => {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setBadges(new Map(Object.entries(data)));
        }
      } catch {
        // Ignore fetch errors
      }
    };
    
    fetchBadges();
    
    if (pollingInterval > 0) {
      const interval = setInterval(fetchBadges, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [endpoint, pollingInterval]);
  
  // Merge static badges
  useEffect(() => {
    if (Object.keys(staticBadges).length > 0) {
      setBadges(prev => {
        const next = new Map(prev);
        Object.entries(staticBadges).forEach(([key, value]) => {
          next.set(key, value);
        });
        return next;
      });
    }
  }, [staticBadges]);
  
  return badges;
}

export default useEnhancedNavigation;
