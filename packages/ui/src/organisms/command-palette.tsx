"use client";

import { forwardRef, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import clsx from "clsx";
import { Search, Command, ArrowRight, CornerDownLeft, ArrowUp, ArrowDown, X } from "lucide-react";
import { OverlayLayout } from "../templates/overlay-layout.js";

// =============================================================================
// TYPES
// =============================================================================

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
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

export interface CommandPaletteProps {
  /** Whether the palette is open */
  open: boolean;
  /** Callback when palette should close */
  onClose: () => void;
  /** Categories of commands */
  categories?: CommandCategory[];
  /** Flat list of commands (alternative to categories) */
  items?: CommandItem[];
  /** Placeholder text for search */
  placeholder?: string;
  /** Callback when an item is selected */
  onSelect?: (item: CommandItem) => void;
  /** Navigation callback */
  onNavigate?: (href: string) => void;
  /** Recent items to show by default */
  recentItems?: CommandItem[];
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}

// =============================================================================
// KEYBOARD SHORTCUT DISPLAY
// =============================================================================

function ShortcutKey({ children, inverted = true }: { children: ReactNode; inverted?: boolean }) {
  return (
    <kbd
      className={clsx(
        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-mono font-medium rounded border-2",
        inverted
          ? "bg-surface-elevated border-border text-on-dark-secondary"
          : "bg-muted border-border text-on-light-secondary"
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
  function CommandPalette(
    {
      open,
      onClose,
      categories = [],
      items = [],
      placeholder = "Search commands...",
      onSelect,
      onNavigate,
      recentItems = [],
      inverted = true,
      className,
    },
    ref
  ) {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Combine categories and flat items
    const allItems = useMemo(() => {
      const fromCategories = categories.flatMap((cat) =>
        cat.items.map((item) => ({ ...item, category: cat.label }))
      );
      return [...fromCategories, ...items];
    }, [categories, items]);

    // Filter items based on query
    const filteredItems = useMemo(() => {
      if (!query.trim()) {
        // Show recent items when no query
        return recentItems.length > 0 ? recentItems : allItems.slice(0, 10);
      }

      const lowerQuery = query.toLowerCase();
      return allItems.filter((item) => {
        const matchLabel = item.label.toLowerCase().includes(lowerQuery);
        const matchDescription = item.description?.toLowerCase().includes(lowerQuery);
        const matchKeywords = item.keywords?.some((k) =>
          k.toLowerCase().includes(lowerQuery)
        );
        const matchCategory = item.category?.toLowerCase().includes(lowerQuery);
        return matchLabel || matchDescription || matchKeywords || matchCategory;
      });
    }, [query, allItems, recentItems]);

    // Group filtered items by category
    const groupedItems = useMemo(() => {
      const groups: Record<string, CommandItem[]> = {};
      filteredItems.forEach((item) => {
        const category = item.category || "Actions";
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
      });
      return groups;
    }, [filteredItems]);

    // Reset selection when query changes
    useEffect(() => {
      setSelectedIndex(0);
    }, [query]);

    // Reset state when closing
    useEffect(() => {
      if (!open) {
        setQuery("");
        setSelectedIndex(0);
      }
    }, [open]);

    // Handle item selection
    const handleSelect = useCallback(
      (item: CommandItem) => {
        if (item.action) {
          item.action();
        } else if (item.href && onNavigate) {
          onNavigate(item.href);
        }
        onSelect?.(item);
        onClose();
      },
      [onSelect, onNavigate, onClose]
    );

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev < filteredItems.length - 1 ? prev + 1 : 0
            );
            break;
          case "ArrowUp":
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredItems.length - 1
            );
            break;
          case "Enter":
            e.preventDefault();
            if (filteredItems[selectedIndex]) {
              handleSelect(filteredItems[selectedIndex]);
            }
            break;
          case "Escape":
            e.preventDefault();
            onClose();
            break;
        }
      },
      [filteredItems, selectedIndex, onClose, handleSelect]
    );

    // Global keyboard shortcut to open
    useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          if (open) {
            onClose();
          }
        }
      };

      document.addEventListener("keydown", handleGlobalKeyDown);
      return () => document.removeEventListener("keydown", handleGlobalKeyDown);
    }, [open, onClose]);

    let flatIndex = 0;

    // Custom header with search input
    const headerContent = (
      <div
        className={clsx(
          "flex items-center gap-3 px-4 py-3 border-b-2",
          inverted ? "border-border" : "border-border"
        )}
      >
        <Search
          size={20}
          className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={clsx(
            "flex-1 bg-transparent text-base outline-none placeholder:text-on-dark-muted",
            inverted ? "text-on-dark-primary" : "text-on-light-primary"
          )}
          autoFocus
        />
        <button
          type="button"
          onClick={onClose}
          className={clsx(
            "p-1 rounded transition-colors",
            inverted
              ? "text-on-dark-muted hover:text-on-dark-primary hover:bg-surface-elevated"
              : "text-on-light-muted hover:text-on-light-primary hover:bg-muted"
          )}
        >
          <X size={16} />
        </button>
      </div>
    );

    // Footer with keyboard hints
    const footerContent = (
      <div
        className={clsx(
          "flex items-center justify-between px-4 py-2 text-xs",
          inverted ? "text-on-dark-disabled" : "text-on-light-disabled"
        )}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <ShortcutKey inverted={inverted}>
              <ArrowUp size={10} />
            </ShortcutKey>
            <ShortcutKey inverted={inverted}>
              <ArrowDown size={10} />
            </ShortcutKey>
            <span className="ml-1">Navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <ShortcutKey inverted={inverted}>
              <CornerDownLeft size={10} />
            </ShortcutKey>
            <span className="ml-1">Select</span>
          </span>
          <span className="flex items-center gap-1">
            <ShortcutKey inverted={inverted}>Esc</ShortcutKey>
            <span className="ml-1">Close</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ShortcutKey inverted={inverted}>
            <Command size={10} />
          </ShortcutKey>
          <ShortcutKey inverted={inverted}>K</ShortcutKey>
        </div>
      </div>
    );

    return (
      <OverlayLayout
        ref={ref}
        type="modal"
        size="md"
        open={open}
        onClose={onClose}
        closeOnEscape
        closeOnBackdrop
        preventScroll
        animation="scale"
        inverted={inverted}
        showClose={false}
        headerContent={headerContent}
        footerContent={footerContent}
        className={className}
        ariaLabel="Command palette"
        backdropBlur
        contentClassName="p-0"
        mobileType="fullscreen"
      >
        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div
              className={clsx(
                "px-4 py-8 text-center text-sm",
                inverted ? "text-on-dark-muted" : "text-on-light-muted"
              )}
            >
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div key={category} className="mb-2">
                <div
                  className={clsx(
                    "px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
                    inverted ? "text-on-dark-disabled" : "text-on-light-disabled"
                  )}
                >
                  {category}
                </div>
                {categoryItems.map((item) => {
                  const currentIndex = flatIndex++;
                  const isSelected = currentIndex === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={clsx(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                        isSelected
                          ? inverted
                            ? "bg-surface-elevated text-on-dark-primary"
                            : "bg-muted text-on-light-primary"
                          : inverted
                          ? "text-on-dark-secondary hover:bg-surface-elevated hover:text-on-dark-primary"
                          : "text-on-light-secondary hover:bg-muted hover:text-on-light-primary"
                      )}
                    >
                      {item.icon && (
                        <span
                          className={clsx(
                            "shrink-0",
                            isSelected
                              ? inverted
                                ? "text-primary-400"
                                : "text-primary-600"
                              : inverted
                              ? "text-on-dark-disabled"
                              : "text-on-light-disabled"
                          )}
                        >
                          {item.icon}
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <div
                          className={clsx(
                            "text-sm font-medium truncate",
                            isSelected
                              ? inverted
                                ? "text-white"
                                : "text-on-light-primary"
                              : ""
                          )}
                        >
                          {item.label}
                        </div>
                        {item.description && (
                          <div
                            className={clsx(
                              "text-xs truncate",
                              inverted ? "text-on-dark-disabled" : "text-on-light-disabled"
                            )}
                          >
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.shortcut && (
                        <ShortcutKey inverted={inverted}>
                          {item.shortcut}
                        </ShortcutKey>
                      )}
                      {isSelected && (
                        <ArrowRight
                          size={14}
                          className={
                            inverted ? "text-on-dark-disabled" : "text-on-light-disabled"
                          }
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </OverlayLayout>
    );
  }
);

export default CommandPalette;
