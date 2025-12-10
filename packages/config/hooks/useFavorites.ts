'use client';

import { useState, useEffect, useCallback } from 'react';

// =============================================================================
// FAVORITES HOOK
// Manages user favorites in localStorage with app-specific storage keys
// =============================================================================

export interface FavoriteItem {
  label: string;
  href: string;
  icon?: string;
  addedAt?: string;
}

export interface UseFavoritesOptions {
  /** Storage key prefix (e.g., 'atlvs', 'compvss', 'gvteway') */
  storageKey: string;
  /** Maximum number of favorites to store */
  maxFavorites?: number;
}

export interface UseFavoritesReturn {
  /** Current list of favorites */
  favorites: FavoriteItem[];
  /** Add an item to favorites */
  addFavorite: (item: FavoriteItem) => void;
  /** Remove an item from favorites by href */
  removeFavorite: (href: string) => void;
  /** Toggle an item in favorites */
  toggleFavorite: (item: FavoriteItem) => void;
  /** Check if an item is in favorites */
  isFavorite: (href: string) => boolean;
  /** Reorder favorites */
  reorderFavorites: (fromIndex: number, toIndex: number) => void;
  /** Clear all favorites */
  clearFavorites: () => void;
}

/**
 * Hook for managing user favorites with localStorage persistence
 * 
 * @example
 * ```tsx
 * const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites({
 *   storageKey: 'atlvs',
 *   maxFavorites: 10,
 * });
 * 
 * // Add a favorite
 * addFavorite({ label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' });
 * 
 * // Check if favorited
 * const isDashboardFavorite = isFavorite('/dashboard');
 * 
 * // Remove a favorite
 * removeFavorite('/dashboard');
 * ```
 */
export function useFavorites({
  storageKey,
  maxFavorites = 10,
}: UseFavoritesOptions): UseFavoritesReturn {
  const fullStorageKey = `${storageKey}-favorites`;
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(fullStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch {
      // Ignore parse errors, start with empty favorites
    }
  }, [fullStorageKey]);

  // Persist favorites to localStorage
  const persistFavorites = useCallback((newFavorites: FavoriteItem[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(fullStorageKey, JSON.stringify(newFavorites));
    } catch {
      // Ignore storage errors (e.g., quota exceeded)
    }
  }, [fullStorageKey]);

  // Add a favorite
  const addFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => {
      // Don't add duplicates
      if (prev.some((f) => f.href === item.href)) {
        return prev;
      }
      
      const newItem: FavoriteItem = {
        ...item,
        addedAt: new Date().toISOString(),
      };
      
      // Limit to maxFavorites
      const updated = [newItem, ...prev].slice(0, maxFavorites);
      persistFavorites(updated);
      return updated;
    });
  }, [maxFavorites, persistFavorites]);

  // Remove a favorite
  const removeFavorite = useCallback((href: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.href !== href);
      persistFavorites(updated);
      return updated;
    });
  }, [persistFavorites]);

  // Toggle a favorite
  const toggleFavorite = useCallback((item: FavoriteItem) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.href === item.href);
      
      if (exists) {
        const updated = prev.filter((f) => f.href !== item.href);
        persistFavorites(updated);
        return updated;
      } else {
        const newItem: FavoriteItem = {
          ...item,
          addedAt: new Date().toISOString(),
        };
        const updated = [newItem, ...prev].slice(0, maxFavorites);
        persistFavorites(updated);
        return updated;
      }
    });
  }, [maxFavorites, persistFavorites]);

  // Check if an item is a favorite
  const isFavorite = useCallback((href: string) => {
    return favorites.some((f) => f.href === href);
  }, [favorites]);

  // Reorder favorites (for drag-and-drop)
  const reorderFavorites = useCallback((fromIndex: number, toIndex: number) => {
    setFavorites((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length) return prev;
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      
      persistFavorites(updated);
      return updated;
    });
  }, [persistFavorites]);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(fullStorageKey);
    }
  }, [fullStorageKey]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    reorderFavorites,
    clearFavorites,
  };
}

// =============================================================================
// KEYBOARD SHORTCUTS HOOK
// Manages keyboard shortcuts for navigation
// =============================================================================

export interface KeyboardShortcut {
  /** Key combination (e.g., 'cmd+1', 'ctrl+shift+p') */
  keys: string;
  /** Action to perform */
  action: () => void;
  /** Description for help display */
  description?: string;
  /** Whether the shortcut is enabled */
  enabled?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  /** List of shortcuts to register */
  shortcuts: KeyboardShortcut[];
  /** Whether shortcuts are globally enabled */
  enabled?: boolean;
}

/**
 * Hook for managing keyboard shortcuts
 * 
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     { keys: 'cmd+1', action: () => router.push('/dashboard'), description: 'Go to Dashboard' },
 *     { keys: 'cmd+2', action: () => router.push('/projects'), description: 'Go to Projects' },
 *   ],
 * });
 * ```
 */
export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const keys = shortcut.keys.toLowerCase().split('+');
        const needsCmd = keys.includes('cmd') || keys.includes('meta');
        const needsCtrl = keys.includes('ctrl');
        const needsShift = keys.includes('shift');
        const needsAlt = keys.includes('alt');
        
        // Get the main key (last non-modifier key)
        const mainKey = keys.filter(
          (k) => !['cmd', 'meta', 'ctrl', 'shift', 'alt'].includes(k)
        )[0];

        const cmdMatch = needsCmd ? (event.metaKey || event.ctrlKey) : !event.metaKey;
        const ctrlMatch = needsCtrl ? event.ctrlKey : (needsCmd ? true : !event.ctrlKey);
        const shiftMatch = needsShift ? event.shiftKey : !event.shiftKey;
        const altMatch = needsAlt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === mainKey;

        if (cmdMatch && ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}
