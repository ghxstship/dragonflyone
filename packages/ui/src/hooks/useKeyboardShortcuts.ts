"use client";

import { useEffect, useCallback, useRef } from "react";

// =============================================================================
// TYPES
// =============================================================================

export interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string;
  /** Display label for the shortcut */
  label: string;
  /** Description of what the shortcut does */
  description?: string;
  /** Key combination (e.g., "cmd+k", "shift+cmd+e") */
  keys: string;
  /** Callback when shortcut is triggered */
  handler: () => void;
  /** Category for grouping in help modal */
  category?: string;
  /** Whether the shortcut is enabled */
  enabled?: boolean;
  /** Prevent default browser behavior */
  preventDefault?: boolean;
  /** Only trigger when specific element is focused */
  scope?: "global" | "input" | "list";
}

export interface ShortcutCategory {
  id: string;
  label: string;
  shortcuts: KeyboardShortcut[];
}

export interface UseKeyboardShortcutsOptions {
  /** Shortcuts to register */
  shortcuts: KeyboardShortcut[];
  /** Whether shortcuts are enabled globally */
  enabled?: boolean;
}

export interface UseKeyboardShortcutsReturn {
  /** All registered shortcuts grouped by category */
  categories: ShortcutCategory[];
  /** Check if a specific shortcut is registered */
  isRegistered: (id: string) => boolean;
  /** Manually trigger a shortcut */
  trigger: (id: string) => void;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Parse a key combination string into its components
 */
function parseKeys(keys: string): { key: string; modifiers: Set<string> } {
  const parts = keys.toLowerCase().split("+").map((p) => p.trim());
  const modifiers = new Set<string>();
  let key = "";

  for (const part of parts) {
    if (["cmd", "meta", "command"].includes(part)) {
      modifiers.add("meta");
    } else if (["ctrl", "control"].includes(part)) {
      modifiers.add("ctrl");
    } else if (["shift"].includes(part)) {
      modifiers.add("shift");
    } else if (["alt", "option"].includes(part)) {
      modifiers.add("alt");
    } else {
      key = part;
    }
  }

  return { key, modifiers };
}

/**
 * Check if a keyboard event matches a shortcut
 */
function matchesShortcut(event: KeyboardEvent, keys: string): boolean {
  const { key, modifiers } = parseKeys(keys);
  
  // Check modifiers
  if (modifiers.has("meta") !== event.metaKey) return false;
  if (modifiers.has("ctrl") !== event.ctrlKey) return false;
  if (modifiers.has("shift") !== event.shiftKey) return false;
  if (modifiers.has("alt") !== event.altKey) return false;
  
  // Check key
  const eventKey = event.key.toLowerCase();
  
  // Handle special keys
  if (key === "escape" && eventKey === "escape") return true;
  if (key === "enter" && eventKey === "enter") return true;
  if (key === "backspace" && eventKey === "backspace") return true;
  if (key === "delete" && (eventKey === "delete" || eventKey === "backspace")) return true;
  if (key === "space" && eventKey === " ") return true;
  if (key === "up" && eventKey === "arrowup") return true;
  if (key === "down" && eventKey === "arrowdown") return true;
  if (key === "left" && eventKey === "arrowleft") return true;
  if (key === "right" && eventKey === "arrowright") return true;
  if (key === "/" && eventKey === "/") return true;
  
  // Handle regular keys
  return eventKey === key;
}

/**
 * Check if the event target is an input element
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

/**
 * Format a key combination for display
 */
export function formatShortcut(keys: string): string {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");
  
  return keys
    .split("+")
    .map((part) => {
      const p = part.trim().toLowerCase();
      if (["cmd", "meta", "command"].includes(p)) return isMac ? "⌘" : "Ctrl";
      if (["ctrl", "control"].includes(p)) return isMac ? "⌃" : "Ctrl";
      if (["shift"].includes(p)) return isMac ? "⇧" : "Shift";
      if (["alt", "option"].includes(p)) return isMac ? "⌥" : "Alt";
      if (p === "escape") return "Esc";
      if (p === "enter") return "↵";
      if (p === "backspace" || p === "delete") return isMac ? "⌫" : "Del";
      if (p === "space") return "Space";
      if (p === "up") return "↑";
      if (p === "down") return "↓";
      if (p === "left") return "←";
      if (p === "right") return "→";
      return p.toUpperCase();
    })
    .join(isMac ? "" : "+");
}

// =============================================================================
// HOOK
// =============================================================================

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions): UseKeyboardShortcutsReturn {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  // Handle keyboard events
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const activeShortcuts = shortcutsRef.current.filter((s) => s.enabled !== false);
      
      for (const shortcut of activeShortcuts) {
        if (!matchesShortcut(event, shortcut.keys)) continue;
        
        // Check scope
        if (shortcut.scope === "input" && !isInputElement(event.target)) continue;
        if (shortcut.scope === "global" && isInputElement(event.target)) {
          // Allow some shortcuts even in inputs
          const { modifiers } = parseKeys(shortcut.keys);
          if (!modifiers.has("meta") && !modifiers.has("ctrl")) continue;
        }
        
        // Trigger the shortcut
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.handler();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);

  // Group shortcuts by category
  const categories = useCallback((): ShortcutCategory[] => {
    const categoryMap = new Map<string, KeyboardShortcut[]>();
    
    for (const shortcut of shortcuts) {
      const category = shortcut.category || "General";
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(shortcut);
    }
    
    return Array.from(categoryMap.entries()).map(([id, items]) => ({
      id,
      label: id,
      shortcuts: items,
    }));
  }, [shortcuts])();

  // Check if a shortcut is registered
  const isRegistered = useCallback((id: string): boolean => {
    return shortcuts.some((s) => s.id === id);
  }, [shortcuts]);

  // Manually trigger a shortcut
  const trigger = useCallback((id: string): void => {
    const shortcut = shortcuts.find((s) => s.id === id);
    if (shortcut && shortcut.enabled !== false) {
      shortcut.handler();
    }
  }, [shortcuts]);

  return {
    categories,
    isRegistered,
    trigger,
  };
}

// =============================================================================
// DEFAULT SHORTCUTS
// =============================================================================

export const defaultShortcuts: Omit<KeyboardShortcut, "handler">[] = [
  // Navigation
  { id: "command-palette", label: "Command Palette", keys: "cmd+k", category: "Navigation", description: "Open command palette" },
  { id: "shortcuts-help", label: "Keyboard Shortcuts", keys: "cmd+/", category: "Navigation", description: "Show keyboard shortcuts" },
  { id: "search", label: "Search", keys: "cmd+f", category: "Navigation", description: "Focus search" },
  { id: "advanced-search", label: "Advanced Search", keys: "shift+cmd+f", category: "Navigation", description: "Open advanced search" },
  
  // Actions
  { id: "new-record", label: "New Record", keys: "cmd+n", category: "Actions", description: "Create new record" },
  { id: "save", label: "Save", keys: "cmd+s", category: "Actions", description: "Save current record" },
  { id: "edit", label: "Edit", keys: "cmd+e", category: "Actions", description: "Edit current record" },
  { id: "delete", label: "Delete", keys: "cmd+backspace", category: "Actions", description: "Delete selected" },
  { id: "export", label: "Export", keys: "shift+cmd+e", category: "Actions", description: "Export current view" },
  { id: "import", label: "Import", keys: "shift+cmd+i", category: "Actions", description: "Import data" },
  
  // List Navigation
  { id: "list-up", label: "Move Up", keys: "k", category: "List Navigation", description: "Move selection up", scope: "list" },
  { id: "list-down", label: "Move Down", keys: "j", category: "List Navigation", description: "Move selection down", scope: "list" },
  { id: "list-open", label: "Open Item", keys: "enter", category: "List Navigation", description: "Open selected item", scope: "list" },
  
  // Modal
  { id: "close-modal", label: "Close", keys: "escape", category: "Modal", description: "Close modal or drawer" },
];

export default useKeyboardShortcuts;
