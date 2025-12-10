"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

// =============================================================================
// TYPES
// =============================================================================

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  href?: string;
  action?: () => void;
  category?: string;
  keywords?: string[];
  /** Path patterns this command is relevant for (for contextual commands) */
  contextPaths?: string[];
}

/** Frecency data for a command (frequency + recency) */
export interface FrecencyData {
  id: string;
  count: number;
  lastUsed: number;
}

export interface CommandCategory {
  id: string;
  label: string;
  items: CommandItem[];
}

export interface UseCommandPaletteOptions {
  /** Navigation items to include */
  navigationItems?: CommandItem[];
  /** Action items (create, export, etc.) */
  actionItems?: CommandItem[];
  /** Recent items to show by default */
  recentItems?: CommandItem[];
  /** Custom categories */
  categories?: CommandCategory[];
  /** Navigation handler */
  onNavigate?: (href: string) => void;
  /** Whether the palette is enabled */
  enabled?: boolean;
  /** Current path for contextual command prioritization */
  currentPath?: string;
  /** Contextual commands specific to certain pages */
  contextualCommands?: CommandItem[];
  /** Enable frecency scoring for command prioritization */
  enableFrecency?: boolean;
}

export interface UseCommandPaletteReturn {
  /** Whether the palette is open */
  isOpen: boolean;
  /** Open the palette */
  open: () => void;
  /** Close the palette */
  close: () => void;
  /** Toggle the palette */
  toggle: () => void;
  /** All command categories */
  categories: CommandCategory[];
  /** Recent items */
  recentItems: CommandItem[];
  /** Handle item selection */
  handleSelect: (item: CommandItem) => void;
  /** Add to recent items */
  addToRecent: (item: CommandItem) => void;
}

// =============================================================================
// HOOK
// =============================================================================

const MAX_RECENT_ITEMS = 5;
const RECENT_STORAGE_KEY = "ghxstship-command-recent";
const FRECENCY_STORAGE_KEY = "ghxstship-command-frecency";

// Frecency scoring constants
const FRECENCY_DECAY_DAYS = 30; // How many days until usage decays significantly
const FRECENCY_COUNT_WEIGHT = 10; // Weight for usage count
const FRECENCY_RECENCY_WEIGHT = 100; // Weight for recency

/**
 * Calculate frecency score for a command
 * Higher score = more frequently and recently used
 */
function calculateFrecencyScore(data: FrecencyData): number {
  const now = Date.now();
  const daysSinceLastUse = (now - data.lastUsed) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, FRECENCY_RECENCY_WEIGHT - (daysSinceLastUse / FRECENCY_DECAY_DAYS) * FRECENCY_RECENCY_WEIGHT);
  const countScore = Math.min(data.count * FRECENCY_COUNT_WEIGHT, FRECENCY_COUNT_WEIGHT * 10); // Cap at 10x
  return recencyScore + countScore;
}

/**
 * Check if a command is contextually relevant to the current path
 */
function isContextuallyRelevant(command: CommandItem, currentPath: string): boolean {
  if (!command.contextPaths || command.contextPaths.length === 0) return false;
  return command.contextPaths.some(pattern => {
    // Support simple glob patterns
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(currentPath);
    }
    return currentPath.startsWith(pattern);
  });
}

export function useCommandPalette({
  navigationItems = [],
  actionItems = [],
  recentItems: initialRecentItems = [],
  categories: customCategories = [],
  onNavigate,
  enabled = true,
  currentPath = "",
  contextualCommands = [],
  enableFrecency = true,
}: UseCommandPaletteOptions = {}): UseCommandPaletteReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [recentItems, setRecentItems] = useState<CommandItem[]>(initialRecentItems);
  const [frecencyData, setFrecencyData] = useState<Map<string, FrecencyData>>(new Map());

  // Load recent items from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentItems(parsed.slice(0, MAX_RECENT_ITEMS));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Load frecency data from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined" || !enableFrecency) return;
    try {
      const stored = localStorage.getItem(FRECENCY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFrecencyData(new Map(parsed.map((d: FrecencyData) => [d.id, d])));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [enableFrecency]);

  // Save recent items to localStorage
  const saveRecent = useCallback((items: CommandItem[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENT_ITEMS)));
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Add item to recent
  const addToRecent = useCallback((item: CommandItem) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      const updated = [item, ...filtered].slice(0, MAX_RECENT_ITEMS);
      saveRecent(updated);
      return updated;
    });
  }, [saveRecent]);

  // Sort items by frecency score
  const sortByFrecency = useCallback((items: CommandItem[]): CommandItem[] => {
    if (!enableFrecency || frecencyData.size === 0) return items;
    
    return [...items].sort((a, b) => {
      const aData = frecencyData.get(a.id);
      const bData = frecencyData.get(b.id);
      const aScore = aData ? calculateFrecencyScore(aData) : 0;
      const bScore = bData ? calculateFrecencyScore(bData) : 0;
      return bScore - aScore; // Higher score first
    });
  }, [enableFrecency, frecencyData]);

  // Filter contextual commands for current path
  const relevantContextualCommands = useMemo(() => {
    if (!currentPath || contextualCommands.length === 0) return [];
    return contextualCommands.filter(cmd => isContextuallyRelevant(cmd, currentPath));
  }, [currentPath, contextualCommands]);

  // Build categories
  const categories = useMemo(() => {
    const result: CommandCategory[] = [];

    // Add contextual commands category if relevant commands exist
    if (relevantContextualCommands.length > 0) {
      result.push({
        id: "contextual",
        label: "Suggested",
        items: relevantContextualCommands,
      });
    }

    // Add navigation category if items exist (sorted by frecency)
    if (navigationItems.length > 0) {
      result.push({
        id: "navigation",
        label: "Navigation",
        items: sortByFrecency(navigationItems),
      });
    }

    // Add actions category if items exist (sorted by frecency)
    if (actionItems.length > 0) {
      result.push({
        id: "actions",
        label: "Actions",
        items: sortByFrecency(actionItems),
      });
    }

    // Add custom categories
    result.push(...customCategories);

    return result;
  }, [navigationItems, actionItems, customCategories, relevantContextualCommands, sortByFrecency]);

  // Update frecency data for an item
  const updateFrecency = useCallback((itemId: string) => {
    if (!enableFrecency) return;
    
    setFrecencyData(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(itemId);
      const now = Date.now();
      
      if (existing) {
        newMap.set(itemId, {
          ...existing,
          count: existing.count + 1,
          lastUsed: now,
        });
      } else {
        newMap.set(itemId, {
          id: itemId,
          count: 1,
          lastUsed: now,
        });
      }
      
      // Persist to localStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(FRECENCY_STORAGE_KEY, JSON.stringify([...newMap.values()]));
        } catch {
          // Ignore localStorage errors
        }
      }
      
      return newMap;
    });
  }, [enableFrecency]);

  // Handle item selection
  const handleSelect = useCallback((item: CommandItem) => {
    addToRecent(item);
    updateFrecency(item.id);
    
    if (item.action) {
      item.action();
    } else if (item.href && onNavigate) {
      onNavigate(item.href);
    }
    
    setIsOpen(false);
  }, [addToRecent, updateFrecency, onNavigate]);

  // Open/close handlers
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Global keyboard shortcut
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, isOpen, toggle, close]);

  return {
    isOpen,
    open,
    close,
    toggle,
    categories,
    recentItems,
    handleSelect,
    addToRecent,
  };
}

// =============================================================================
// UTILITY: Build navigation commands from sidebar navigation
// =============================================================================

export interface SidebarNavItem {
  label: string;
  href?: string;
  icon?: string;
}

export interface SidebarNavSection {
  section?: string;
  title?: string;
  icon?: string;
  items: SidebarNavItem[];
  subsections?: Array<{
    label: string;
    items: SidebarNavItem[];
  }>;
}

export function buildNavigationCommands(
  navigation: SidebarNavSection[],
  basePath = ""
): CommandItem[] {
  const commands: CommandItem[] = [];

  navigation.forEach((section) => {
    const sectionLabel = section.section || section.title || "Navigation";
    
    // Add main items
    section.items.forEach((item) => {
      if (item.href) {
        commands.push({
          id: `nav-${item.href}`,
          label: item.label,
          description: `Go to ${item.label}`,
          icon: item.icon,
          href: basePath + item.href,
          category: sectionLabel,
          keywords: [item.label.toLowerCase(), sectionLabel.toLowerCase()],
        });
      }
    });

    // Add subsection items
    section.subsections?.forEach((subsection) => {
      subsection.items.forEach((item) => {
        if (item.href) {
          commands.push({
            id: `nav-${item.href}`,
            label: item.label,
            description: `Go to ${item.label} in ${subsection.label}`,
            icon: item.icon,
            href: basePath + item.href,
            category: sectionLabel,
            keywords: [item.label.toLowerCase(), subsection.label.toLowerCase(), sectionLabel.toLowerCase()],
          });
        }
      });
    });
  });

  return commands;
}

// =============================================================================
// UTILITY: Build action commands
// =============================================================================

export interface QuickAction {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action?: () => void;
}

export function buildActionCommands(actions: QuickAction[]): CommandItem[] {
  return actions.map((action, index) => ({
    id: `action-${index}-${action.label.toLowerCase().replace(/\s+/g, "-")}`,
    label: action.label,
    description: action.href ? `Navigate to ${action.label}` : `Execute ${action.label}`,
    icon: action.icon,
    shortcut: action.shortcut,
    href: action.href,
    action: action.action,
    category: "Actions",
    keywords: [action.label.toLowerCase()],
  }));
}

export default useCommandPalette;
