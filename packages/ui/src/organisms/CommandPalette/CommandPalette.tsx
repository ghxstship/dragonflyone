"use client";

import { forwardRef, useState, useEffect, useCallback, useMemo } from "react";
import clsx from "clsx";
import { Command, ArrowUp, ArrowDown, X } from "lucide-react";
import type { 
  CommandPaletteProps, 
  CommandItem 
} from "./CommandPalette.types.js";

// =============================================================================
// KEYBOARD SHORTCUT DISPLAY
// =============================================================================

function ShortcutKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className={clsx(
        "inline-flex items-center justify-center px-2 py-1 text-xs font-mono border-2 rounded-badge",
        "bg-[var(--color-surface-elevated)] border-[var(--color-border-default)] text-[var(--color-text-primary)]"
      )}
    >
      {children}
    </kbd>
  );
}

// =============================================================================
// COMMAND PALETTE COMPONENT
// =============================================================================

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  (
    {
      open,
      onClose,
      items = [],
      categories,
      onSelect,
      onNavigate,
      recentItems = [],
      placeholder = "Type a command or search...",
      className,
      ...props
    },
    ref
  ) => {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Combine all items
    const allItems = useMemo(() => {
      const combined = [...items];
      
      // Add items from categories
      categories?.forEach(category => {
        combined.push(...category.items);
      });
      
      // Add recent items at the beginning if no query
      if (!query.trim() && recentItems.length > 0) {
        recentItems.forEach(item => {
          if (!combined.find(existing => existing.id === item.id)) {
            combined.unshift(item);
          }
        });
      }
      
      return combined;
    }, [items, categories, recentItems, query]);

    // Filter items based on query
    const filteredItems = useMemo(() => {
      if (!query.trim()) return allItems;
      
      const lowercaseQuery = query.toLowerCase();
      return allItems.filter((item) => 
        item.label.toLowerCase().includes(lowercaseQuery) ||
        item.description?.toLowerCase().includes(lowercaseQuery) ||
        item.keywords?.some(keyword => keyword.toLowerCase().includes(lowercaseQuery))
      );
    }, [allItems, query]);

    // Extract unique categories
    const categoriesSet = useMemo(() => {
      const uniqueCategories = new Set(
        filteredItems.map(item => item.category).filter((cat): cat is string => Boolean(cat))
      );
      return uniqueCategories;
    }, [filteredItems]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredItems.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(prev => prev === 0 ? filteredItems.length - 1 : prev - 1);
          break;
        case "Enter":
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            const item = filteredItems[selectedIndex];
            if (item.action) {
              item.action();
            } else if (item.href && onNavigate) {
              onNavigate(item.href);
            }
            onSelect?.(item);
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    }, [filteredItems, selectedIndex, onNavigate, onSelect, onClose]);

    // Add keyboard event listener
    useEffect(() => {
      if (open) {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
      }
    }, [open, handleKeyDown]);

    // Reset selection when query changes
    useEffect(() => {
      setSelectedIndex(0);
    }, [query]);

    // Group items by category
    const groupedItems = useMemo(() => {
      const groups: Record<string, CommandItem[]> = {};
      
      filteredItems.forEach(item => {
        const category = item.category || "Other";
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
      });
      
      return groups;
    }, [filteredItems]);

    // Header content
    const headerContent = (
      <div className="flex items-center gap-3 flex-1">
        <Command className={clsx(
          "w-5 h-5",
          "text-[var(--color-text-secondary)]"
        )} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={clsx(
            "flex-1 bg-transparent border-none outline-none text-sm placeholder-text-text-muted",
            "text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)]"
          )}
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className={clsx(
              "p-1 rounded-badge hover:bg-surface-elevated transition-colors",
              "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );

    // Footer content
    const footerContent = (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <ShortcutKey>
            <ArrowUp size={10} />
          </ShortcutKey>
          <ShortcutKey>
            <ArrowDown size={10} />
          </ShortcutKey>
          <span className={clsx(
            "text-xs",
            "text-[var(--color-text-secondary)]"
          )}>
            to navigate
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ShortcutKey>
            <Command size={10} />
          </ShortcutKey>
          <ShortcutKey>K</ShortcutKey>
        </div>
      </div>
    );

    if (!open) return null;

    return (
      <div
        ref={ref}
        className={clsx(
          "fixed inset-0 z-50 flex items-start justify-center pt-[20vh]",
          "bg-black/50 backdrop-blur-sm",
          "transition-opacity duration-200",
          className
        )}
        onClick={onClose}
        {...props}
      >
        <div
          className={clsx(
            "relative bg-surface-primary border-2 border-border rounded-[var(--radius-modal)]",
            "shadow-xl max-w-2xl w-full mx-4 max-h-[60vh] overflow-hidden",
            "transform transition-transform duration-200 scale-100 opacity-100"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b-2 border-border bg-surface-elevated">
            {headerContent}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Results */}
            <div className="max-h-[400px] overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div
                  className={clsx(
                    "px-4 py-8 text-center text-sm",
                    "text-[var(--color-text-muted)]"
                  )}
                >
                  No results found for &quot;{query}&quot;
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from(categoriesSet).map(category => (
                    <div key={category}>
                      <div
                        className={clsx(
                          "px-3 py-2 text-xs font-mono uppercase tracking-wider border-b border-border",
                          "text-[var(--color-text-secondary)]"
                        )}
                      >
                        {category}
                      </div>
                      <div className="py-1">
                        {groupedItems[category]?.map((item, index) => (
                          <button
                            key={`${item.id}-${index}`}
                            onClick={() => {
                              if (item.action) {
                                item.action();
                              } else if (item.href && onNavigate) {
                                onNavigate(item.href);
                              }
                              onSelect?.(item);
                              onClose();
                            }}
                            className={clsx(
                              "w-full px-3 py-2 text-left flex items-center gap-3 rounded-button transition-colors",
                              "hover:bg-surface-elevated border-2 border-transparent",
                              selectedIndex === filteredItems.indexOf(item) && "bg-surface-elevated border-border"
                            )}
                          >
                            {item.icon && (
                              <div className={clsx(
                                "w-4 h-4 flex-shrink-0",
                                "text-[var(--color-text-secondary)]"
                              )}>
                                {item.icon}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className={clsx(
                                "text-sm font-medium truncate",
                                "text-[var(--color-text-primary)]"
                              )}>
                                {item.label}
                              </div>
                              {item.description && (
                                <div className={clsx(
                                  "text-xs truncate",
                                  "text-[var(--color-text-secondary)]"
                                )}>
                                  {item.description}
                                </div>
                              )}
                            </div>
                            {item.shortcut && (
                              <ShortcutKey>
                                {item.shortcut}
                              </ShortcutKey>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t-2 border-border bg-surface-elevated">
            {footerContent}
          </div>
        </div>
      </div>
    );
  }
);

CommandPalette.displayName = "CommandPalette";

export default CommandPalette;