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

export function useCommandPalette({
  navigationItems = [],
  actionItems = [],
  recentItems: initialRecentItems = [],
  categories: customCategories = [],
  onNavigate,
  enabled = true,
}: UseCommandPaletteOptions = {}): UseCommandPaletteReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [recentItems, setRecentItems] = useState<CommandItem[]>(initialRecentItems);

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

  // Build categories
  const categories = useMemo(() => {
    const result: CommandCategory[] = [];

    // Add navigation category if items exist
    if (navigationItems.length > 0) {
      result.push({
        id: "navigation",
        label: "Navigation",
        items: navigationItems,
      });
    }

    // Add actions category if items exist
    if (actionItems.length > 0) {
      result.push({
        id: "actions",
        label: "Actions",
        items: actionItems,
      });
    }

    // Add custom categories
    result.push(...customCategories);

    return result;
  }, [navigationItems, actionItems, customCategories]);

  // Handle item selection
  const handleSelect = useCallback((item: CommandItem) => {
    addToRecent(item);
    
    if (item.action) {
      item.action();
    } else if (item.href && onNavigate) {
      onNavigate(item.href);
    }
    
    setIsOpen(false);
  }, [addToRecent, onNavigate]);

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
