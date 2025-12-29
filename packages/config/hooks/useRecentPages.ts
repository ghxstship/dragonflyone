"use client";

import { useState, useEffect } from "react";

/**
 * Navigation item structure for recent pages
 */
export interface RecentPageItem {
  label: string;
  href: string;
  icon: string;
}

/**
 * Navigation section structure for finding page labels in recent pages.
 * Supports both `label` and `section` property names for compatibility.
 */
export interface RecentPagesNavSection {
  label?: string;
  section?: string;
  items: Array<{ label: string; href: string }>;
  subsections?: Array<{
    label?: string;
    section?: string;
    items: Array<{ label: string; href: string }>;
  }>;
}

const MAX_RECENT_PAGES = 5;

/**
 * Shared hook for tracking recently visited pages across all GHXSTSHIP apps.
 * Stores recent pages in localStorage with app-specific keys.
 * 
 * @param appName - The app identifier (atlvs, compvss, gvteway)
 * @param currentPath - The current page path
 * @param navigation - The app's sidebar navigation sections for label lookup
 * @returns Array of recent page items
 * 
 * @example
 * ```tsx
 * const recentPages = useRecentPages('atlvs', pathname, atlvsSidebarNavigation);
 * ```
 */
export function useRecentPages(
  appName: "atlvs" | "compvss" | "gvteway",
  currentPath: string,
  navigation: RecentPagesNavSection[]
): RecentPageItem[] {
  const storageKey = `${appName}-recent-pages`;
  const [recentPages, setRecentPages] = useState<RecentPageItem[]>([]);

  // Load recent pages from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setRecentPages(JSON.parse(stored));
        } catch {
          // Ignore parse errors - will start fresh
        }
      }
    }
  }, [storageKey]);

  // Track page visits
  useEffect(() => {
    if (typeof window === "undefined" || !currentPath || currentPath === "/") return;
    
    // Don't track auth pages
    if (currentPath.startsWith("/auth") || currentPath.startsWith("/login")) return;

    // Find page label from navigation data
    const findPageLabel = (path: string): string | null => {
      for (const section of navigation) {
        for (const item of section.items) {
          if (item.href === path) return item.label;
        }
        if (section.subsections) {
          for (const sub of section.subsections) {
            for (const item of sub.items) {
              if (item.href === path) return item.label;
            }
          }
        }
      }
      // Generate label from path if not found in navigation
      const segments = path.split("/").filter(Boolean);
      const lastSegment = segments[segments.length - 1] || "Page";
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, " ");
    };

    const label = findPageLabel(currentPath);
    if (!label) return;

    setRecentPages((prev) => {
      // Remove if already exists (to move to front)
      const filtered = prev.filter((p) => p.href !== currentPath);
      // Add to front and limit to max
      const updated = [
        { label, href: currentPath, icon: "Clock" },
        ...filtered,
      ].slice(0, MAX_RECENT_PAGES);
      // Persist to localStorage
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [currentPath, navigation, storageKey]);

  return recentPages;
}

/**
 * Clear recent pages for a specific app
 */
export function clearRecentPages(appName: "atlvs" | "compvss" | "gvteway"): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(`${appName}-recent-pages`);
  }
}
