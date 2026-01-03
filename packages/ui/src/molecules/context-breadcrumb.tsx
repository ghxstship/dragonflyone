"use client";

import { forwardRef, useState, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode, KeyboardEvent } from "react";

/**
 * ContextBreadcrumb - Bold Contemporary Pop Art Adventure
 * 
 * Vercel-style hierarchical navigation breadcrumb with:
 * - Bold 2px borders on dropdowns
 * - Hard offset shadows
 * - Hover lift effects
 * - Snappy animations
 */

// Types
export interface ContextItem {
  id: string;
  name: string;
  slug: string;
  icon?: ReactNode;
  badge?: string;
  color?: string;
}

export interface ContextLevel {
  label: string;
  current: ContextItem | null;
  items: ContextItem[];
  onSelect: (item: ContextItem) => void;
  onSearch?: (query: string) => Promise<ContextItem[]>;
  onCreate?: () => void;
  createLabel?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
}

export interface ContextBreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Array of context levels (e.g., [organization, project, activation]) */
  levels: ContextLevel[];
  /** Logo/home element */
  logo?: ReactNode;
  /** Separator between breadcrumb items */
  separator?: ReactNode;
  /** Inverted color scheme (dark background) */
  inverted?: boolean;
  /** Maximum visible levels on mobile (rest collapse to menu) */
  maxMobileLevels?: number;
}

// Dropdown component for each context level
interface ContextDropdownProps {
  level: ContextLevel;
  inverted?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function ContextDropdown({ level, inverted, isOpen, onToggle, onClose }: ContextDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<ContextItem[]>(level.items);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items when search query changes
  // eslint-disable-next-line react-hooks/exhaustive-deps -- level.items and level.onSearch are the relevant deps
  useEffect(() => {
    const filterItems = async () => {
      if (level.onSearch && searchQuery.trim()) {
        const results = await level.onSearch(searchQuery);
        setFilteredItems(results);
      } else if (searchQuery.trim()) {
        const filtered = level.items.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredItems(filtered);
      } else {
        setFilteredItems(level.items);
      }
      setHighlightedIndex(0);
    };
    
    filterItems();
  }, [searchQuery, level.items, level.onSearch]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery("");
      setFilteredItems(level.items);
    }
  }, [isOpen, level.items]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredItems[highlightedIndex]) {
          level.onSelect(filteredItems[highlightedIndex]);
          onClose();
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  }, [filteredItems, highlightedIndex, level, onClose]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-item]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={onToggle}
        className={clsx(
          "flex items-center gap-gap-xs px-spacing-3 py-spacing-1 text-body-sm font-weight-medium transition-colors rounded-sm",
          inverted
            ? "hover:bg-surface-elevated text-text-primary"
            : "hover:bg-muted text-text-primary",
          isOpen && (inverted ? "bg-surface-elevated" : "bg-muted")
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {level.current?.icon && (
          <span className="flex-shrink-0 w-spacing-5 h-spacing-5 flex items-center justify-center">
            {level.current.icon}
          </span>
        )}
        <span className="truncate max-w-40">
          {level.current?.name || level.label}
        </span>
        {level.current?.badge && (
          <span className={clsx(
            "px-spacing-1 py-spacing-0.5 text-micro font-mono rounded-sm",
            inverted ? "bg-surface-elevated text-text-secondary" : "bg-muted text-text-disabled"
          )}>
            {level.current.badge}
          </span>
        )}
        <svg
          className={clsx(
            "w-spacing-4 h-spacing-4 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={clsx(
            "absolute top-full left-0 z-dropdown mt-spacing-1 min-w-container-lg max-w-container-xl rounded-sm border-2 shadow-hard",
            inverted
              ? "bg-surface-inverse border-border"
              : "bg-surface-primary border-border-primary"
          )}
        >
          {/* Search Input */}
          <div className={clsx(
            "p-spacing-2 border-b",
            inverted ? "border-border" : "border-border"
          )}>
            <div className="relative">
              <svg
                className={clsx(
                  "absolute left-spacing-3 top-1/2 -translate-y-1/2 w-spacing-4 h-spacing-4",
                  inverted ? "text-text-muted" : "text-text-muted"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={level.searchPlaceholder || `Find ${level.label}...`}
                className={clsx(
                  "w-full pl-spacing-9 pr-spacing-3 py-spacing-2 text-body-sm rounded-sm outline-none",
                  inverted
                    ? "bg-surface-elevated text-text-primary placeholder:text-text-disabled focus:ring-1 focus:ring-border"
                    : "bg-muted text-text-primary placeholder:text-text-disabled focus:ring-1 focus:ring-border"
                )}
              />
            </div>
          </div>

          {/* Items List */}
          <div
            ref={listRef}
            className="max-h-container-lg overflow-y-auto py-spacing-1"
            role="listbox"
          >
            {level.isLoading ? (
              <div className={clsx(
                "px-spacing-4 py-spacing-8 text-center text-body-sm",
                inverted ? "text-text-muted" : "text-text-muted"
              )}>
                Loading...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className={clsx(
                "px-spacing-4 py-spacing-8 text-center text-body-sm",
                inverted ? "text-text-muted" : "text-text-muted"
              )}>
                No results found
              </div>
            ) : (
              <>
                {/* Section Label */}
                <div className={clsx(
                  "px-spacing-3 py-spacing-1 text-micro font-mono uppercase tracking-wider",
                  inverted ? "text-text-muted" : "text-text-muted"
                )}>
                  {level.label}s
                </div>
                
                {filteredItems.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    data-item
                    onClick={() => {
                      level.onSelect(item);
                      onClose();
                    }}
                    className={clsx(
                      "w-full flex items-center gap-gap-sm px-spacing-3 py-spacing-2 text-left transition-colors",
                      index === highlightedIndex
                        ? inverted ? "bg-surface-elevated" : "bg-muted"
                        : "",
                      level.current?.id === item.id
                        ? inverted ? "text-text-primary" : "text-text-primary"
                        : inverted ? "text-text-secondary hover:text-text-primary hover:bg-surface-elevated" : "text-text-disabled hover:text-text-primary hover:bg-muted"
                    )}
                    role="option"
                    aria-selected={level.current?.id === item.id}
                  >
                    {item.icon ? (
                      <span className="flex-shrink-0 w-spacing-5 h-spacing-5 flex items-center justify-center">
                        {item.icon}
                      </span>
                    ) : (
                      <span
                        className={clsx(
                          "flex-shrink-0 w-spacing-5 h-spacing-5 rounded-full",
                          !item.color && (inverted ? "bg-surface-elevated" : "bg-muted")
                        )}
                        style={item.color ? { backgroundColor: item.color } : undefined}
                      />
                    )}
                    <span className="flex-1 truncate text-body-sm">{item.name}</span>
                    {level.current?.id === item.id && (
                      <svg
                        className={clsx("w-spacing-4 h-spacing-4", inverted ? "text-text-primary" : "text-text-primary")}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Create Action */}
          {level.onCreate && (
            <div className={clsx(
              "border-t p-spacing-2",
              inverted ? "border-border" : "border-border"
            )}>
              <button
                type="button"
                onClick={() => {
                  level.onCreate?.();
                  onClose();
                }}
                className={clsx(
                  "w-full flex items-center gap-gap-xs px-spacing-3 py-spacing-2 text-body-sm rounded-sm transition-colors",
                  inverted
                    ? "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                    : "text-text-disabled hover:bg-muted hover:text-text-primary"
                )}
              >
                <svg
                  className="w-spacing-4 h-spacing-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>{level.createLabel || `Create ${level.label}`}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main ContextBreadcrumb component
export const ContextBreadcrumb = forwardRef<HTMLElement, ContextBreadcrumbProps>(
  function ContextBreadcrumb(
    {
      levels,
      logo,
      separator = "/",
      inverted = false,
      maxMobileLevels: _maxMobileLevels = 2,
      className,
      ...props
    },
    ref
  ) {
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpenDropdownIndex(null);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter levels that have a current selection (for display)
    const activeLevels = levels.filter((level, index) => 
      index === 0 || level.current !== null
    );

    return (
      <nav
        ref={ref}
        aria-label="Context breadcrumb"
        className={clsx(
          "flex items-center",
          className
        )}
        {...props}
      >
        <div ref={containerRef} className="flex items-center gap-gap-xs">
          {/* Logo */}
          {logo && (
            <>
              <div className="flex-shrink-0">{logo}</div>
              <span className={clsx(
                "mx-spacing-2 text-body-sm",
                inverted ? "text-text-disabled" : "text-text-secondary"
              )}>
                {separator}
              </span>
            </>
          )}

          {/* Breadcrumb Levels */}
          {activeLevels.map((level, index) => (
            <div key={level.label} className="flex items-center">
              {index > 0 && (
                <span className={clsx(
                  "mx-2 text-body-sm",
                  inverted ? "text-text-disabled" : "text-text-secondary"
                )}>
                  {separator}
                </span>
              )}
              <ContextDropdown
                level={level}
                inverted={inverted}
                isOpen={openDropdownIndex === index}
                onToggle={() => setOpenDropdownIndex(
                  openDropdownIndex === index ? null : index
                )}
                onClose={() => setOpenDropdownIndex(null)}
              />
            </div>
          ))}
        </div>
      </nav>
    );
  }
);

export default ContextBreadcrumb;
