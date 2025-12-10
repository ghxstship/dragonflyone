"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// =============================================================================
// TYPES
// =============================================================================

export interface UseTabStateOptions {
  /** Query parameter name for the tab state (default: "tab") */
  paramName?: string;
  /** Default tab value if none in URL */
  defaultTab: string;
  /** Valid tab values (for validation) */
  validTabs?: string[];
  /** Whether to replace or push history state (default: replace) */
  replaceState?: boolean;
}

export interface UseTabStateReturn<T extends string = string> {
  /** Current active tab */
  activeTab: T;
  /** Set the active tab (updates URL) */
  setActiveTab: (tab: T) => void;
  /** Check if a specific tab is active */
  isActive: (tab: T) => boolean;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

/**
 * useTabState - URL-synced tab state management
 * 
 * Provides tab state that persists in URL query parameters, enabling:
 * - Deep-linking to specific tabs
 * - Browser back/forward navigation
 * - Shareable tab URLs
 * 
 * @example
 * ```tsx
 * const { activeTab, setActiveTab, isActive } = useTabState({
 *   defaultTab: 'overview',
 *   validTabs: ['overview', 'details', 'settings'],
 * });
 * 
 * return (
 *   <Tabs>
 *     <TabsList>
 *       <Tab active={isActive('overview')} onClick={() => setActiveTab('overview')}>
 *         Overview
 *       </Tab>
 *       <Tab active={isActive('details')} onClick={() => setActiveTab('details')}>
 *         Details
 *       </Tab>
 *     </TabsList>
 *     <TabPanel active={isActive('overview')}>Overview content</TabPanel>
 *     <TabPanel active={isActive('details')}>Details content</TabPanel>
 *   </Tabs>
 * );
 * ```
 */
export function useTabState<T extends string = string>({
  paramName = "tab",
  defaultTab,
  validTabs,
  replaceState = true,
}: UseTabStateOptions): UseTabStateReturn<T> {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Get initial tab from URL or default
  const getInitialTab = useCallback((): T => {
    const urlTab = searchParams.get(paramName);
    if (urlTab) {
      // Validate if validTabs provided
      if (validTabs && !validTabs.includes(urlTab)) {
        return defaultTab as T;
      }
      return urlTab as T;
    }
    return defaultTab as T;
  }, [searchParams, paramName, defaultTab, validTabs]);

  const [activeTab, setActiveTabState] = useState<T>(getInitialTab);

  // Sync state with URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlTab = searchParams.get(paramName);
    if (urlTab) {
      if (!validTabs || validTabs.includes(urlTab)) {
        setActiveTabState(urlTab as T);
      }
    } else {
      setActiveTabState(defaultTab as T);
    }
  }, [searchParams, paramName, defaultTab, validTabs]);

  // Update URL when tab changes
  const setActiveTab = useCallback((tab: T) => {
    // Validate if validTabs provided
    if (validTabs && !validTabs.includes(tab)) {
      return;
    }

    setActiveTabState(tab);

    // Build new URL with updated tab parameter
    const params = new URLSearchParams(searchParams.toString());
    
    if (tab === defaultTab) {
      // Remove param if it's the default (cleaner URLs)
      params.delete(paramName);
    } else {
      params.set(paramName, tab);
    }

    const newUrl = params.toString() 
      ? `${pathname}?${params.toString()}`
      : pathname;

    if (replaceState) {
      router.replace(newUrl, { scroll: false });
    } else {
      router.push(newUrl, { scroll: false });
    }
  }, [searchParams, pathname, router, paramName, defaultTab, validTabs, replaceState]);

  // Helper to check if a tab is active
  const isActive = useCallback((tab: T): boolean => {
    return activeTab === tab;
  }, [activeTab]);

  return {
    activeTab,
    setActiveTab,
    isActive,
  };
}

// =============================================================================
// SIMPLE VERSION (no URL sync, just localStorage)
// =============================================================================

export interface UseLocalTabStateOptions {
  /** Storage key for persisting tab state */
  storageKey: string;
  /** Default tab value */
  defaultTab: string;
}

/**
 * useLocalTabState - localStorage-persisted tab state
 * 
 * For cases where URL sync isn't needed but persistence is desired.
 */
export function useLocalTabState<T extends string = string>({
  storageKey,
  defaultTab,
}: UseLocalTabStateOptions): UseTabStateReturn<T> {
  const [activeTab, setActiveTabState] = useState<T>(defaultTab as T);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setActiveTabState(stored as T);
      }
    }
  }, [storageKey]);

  // Persist to localStorage
  const setActiveTab = useCallback((tab: T) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, tab);
    }
  }, [storageKey]);

  const isActive = useCallback((tab: T): boolean => {
    return activeTab === tab;
  }, [activeTab]);

  return {
    activeTab,
    setActiveTab,
    isActive,
  };
}

export default useTabState;
