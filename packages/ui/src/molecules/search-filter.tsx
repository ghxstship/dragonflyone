"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import clsx from "clsx";
import { Search, X, ChevronUp, ChevronDown, Check } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, string | string[]>;
  searchValue?: string;
}

export interface SearchFilterProps {
  /** Search placeholder text */
  placeholder?: string;
  /** Search value */
  searchValue?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Filter groups */
  filters?: FilterGroup[];
  /** Active filter values */
  activeFilters?: Record<string, string | string[]>;
  /** Filter change handler */
  onFilterChange?: (key: string, value: string | string[]) => void;
  /** Clear all filters handler */
  onClearAll?: () => void;
  /** Debounce delay for search (ms) */
  debounceMs?: number;
  /** Show filter count badges */
  showCounts?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Saved filter presets */
  presets?: FilterPreset[];
  /** Preset selection handler */
  onPresetSelect?: (preset: FilterPreset) => void;
  /** Save current filters as preset */
  onSavePreset?: (name: string) => void;
  /** Show search suggestions */
  suggestions?: string[];
  /** Suggestion selection handler */
  onSuggestionSelect?: (suggestion: string) => void;
  /** Inverted theme (dark background) */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

export function SearchFilter({
  placeholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearAll,
  debounceMs = 300,
  showCounts = true,
  compact = false,
  inverted = false,
  className = "",
}: SearchFilterProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close filter dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setExpandedFilter(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync external search value
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onSearchChange?.(value);
      }, debounceMs);
    },
    [onSearchChange, debounceMs]
  );

  const handleFilterToggle = (groupKey: string, optionValue: string, multiple: boolean) => {
    if (!onFilterChange) return;

    const currentValue = activeFilters[groupKey];

    if (multiple) {
      const currentArray = Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : [];
      const newArray = currentArray.includes(optionValue)
        ? currentArray.filter((v) => v !== optionValue)
        : [...currentArray, optionValue];
      onFilterChange(groupKey, newArray);
    } else {
      onFilterChange(groupKey, currentValue === optionValue ? "" : optionValue);
    }
  };

  const getActiveCount = (): number => {
    return Object.values(activeFilters).reduce((count, value) => {
      if (Array.isArray(value)) return count + value.length;
      return count + (value ? 1 : 0);
    }, 0);
  };

  const isOptionActive = (groupKey: string, optionValue: string): boolean => {
    const value = activeFilters[groupKey];
    if (Array.isArray(value)) return value.includes(optionValue);
    return value === optionValue;
  };

  const activeCount = getActiveCount();

  return (
    <div className={clsx("flex flex-col", compact ? "gap-gap-sm" : "gap-gap-md", className)}>
      {/* Search and Filter Bar */}
      <div className="flex gap-gap-sm flex-wrap">
        {/* Search Input */}
        <div className="flex-1 min-w-card-sm relative">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className={clsx(
              "w-full font-body border-2 outline-none transition-colors duration-fast",
              inverted
                ? "bg-ink-900 text-white border-grey-700 focus:border-grey-500"
                : "bg-white text-black border-black focus:border-grey-700",
              compact ? "py-spacing-2 px-spacing-3 pl-spacing-10 text-body-sm" : "py-spacing-3 px-spacing-4 pl-spacing-12 text-body-md"
            )}
          />
          {/* Search Icon */}
          <span
            className={clsx(
              "absolute top-1/2 -translate-y-1/2 text-grey-500",
              compact ? "left-spacing-3 text-body-sm" : "left-spacing-4 text-body-md"
            )}
          >
            <Search className={compact ? "size-4" : "size-5"} />
          </span>
          {/* Clear Search */}
          {localSearch && (
            <button
              onClick={() => handleSearchChange("")}
              className={clsx(
                "absolute top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-grey-500 p-spacing-1 hover:text-grey-700",
                compact ? "right-spacing-2 text-body-sm" : "right-spacing-3 text-body-md"
              )}
              aria-label="Clear search"
            >
              <X className={compact ? "size-4" : "size-5"} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div ref={filterRef} className="flex gap-gap-xs flex-wrap">
          {filters.map((group) => {
            const isExpanded = expandedFilter === group.key;
            const groupActiveCount = Array.isArray(activeFilters[group.key])
              ? (activeFilters[group.key] as string[]).length
              : activeFilters[group.key]
              ? 1
              : 0;

            return (
              <div key={group.key} className="relative">
                <button
                  onClick={() => setExpandedFilter(isExpanded ? null : group.key)}
                  className={clsx(
                    "flex items-center gap-gap-xs font-code tracking-wide uppercase border-2 cursor-pointer transition-colors duration-fast whitespace-nowrap",
                    inverted ? "border-grey-600" : "border-black",
                    compact ? "px-spacing-3 py-spacing-2 text-mono-sm" : "px-spacing-4 py-spacing-3 text-mono-md",
                    groupActiveCount > 0
                      ? inverted ? "bg-white text-black" : "bg-black text-white"
                      : inverted ? "bg-transparent text-grey-300 hover:bg-grey-800" : "bg-white text-black hover:bg-grey-100"
                  )}
                >
                  {group.label}
                  {showCounts && groupActiveCount > 0 && (
                    <span className={clsx(
                      "px-spacing-1 py-spacing-0.5 text-mono-xs font-weight-bold",
                      inverted ? "bg-black text-white" : "bg-white text-black"
                    )}>
                      {groupActiveCount}
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                </button>

                {/* Dropdown */}
                {isExpanded && (
                  <div className={clsx(
                    "absolute top-full left-0 mt-spacing-1 min-w-container-sm max-h-container-lg overflow-y-auto border-2 z-dropdown",
                    inverted ? "bg-ink-900 border-grey-600" : "bg-white border-black"
                  )}>
                    {group.options.map((option) => {
                      const isActive = isOptionActive(group.key, option.value);

                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterToggle(group.key, option.value, group.multiple || false)
                          }
                          className={clsx(
                            "flex justify-between items-center w-full px-spacing-4 py-spacing-3 font-body text-body-sm border-none border-b cursor-pointer text-left transition-colors duration-fast",
                            inverted
                              ? clsx("text-grey-200 border-grey-700", isActive ? "bg-grey-800" : "hover:bg-grey-800")
                              : clsx("text-black border-grey-200", isActive ? "bg-grey-100" : "bg-white hover:bg-grey-50")
                          )}
                        >
                          <span className="flex items-center gap-gap-xs">
                            {group.multiple && (
                              <span
                                className={clsx(
                                  "w-spacing-4 h-spacing-4 border-2 flex items-center justify-center text-micro",
                                  inverted
                                    ? clsx("border-grey-500", isActive ? "bg-white text-black" : "bg-transparent")
                                    : clsx("border-black", isActive ? "bg-black text-white" : "bg-white")
                                )}
                              >
                                {isActive && <Check className="size-3" />}
                              </span>
                            )}
                            {option.label}
                          </span>
                          {showCounts && option.count !== undefined && (
                            <span className={clsx("font-code text-mono-xs", inverted ? "text-grey-400" : "text-grey-500")}>
                              {option.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeCount > 0 && (
        <div className="flex items-center gap-gap-xs flex-wrap">
          <span className={clsx("font-code text-mono-sm tracking-wide", inverted ? "text-grey-400" : "text-grey-600")}>
            ACTIVE FILTERS:
          </span>

          {filters.map((group) => {
            const value = activeFilters[group.key];
            const values = Array.isArray(value) ? value : value ? [value] : [];

            return values.map((v) => {
              const option = group.options.find((o) => o.value === v);
              if (!option) return null;

              return (
                <button
                  key={`${group.key}-${v}`}
                  onClick={() => handleFilterToggle(group.key, v, group.multiple || false)}
                  className={clsx(
                    "flex items-center gap-gap-xs px-spacing-2 py-spacing-1 font-code text-mono-xs tracking-wide border cursor-pointer transition-colors duration-fast",
                    inverted
                      ? "bg-grey-800 text-grey-300 border-grey-600 hover:bg-grey-700"
                      : "bg-grey-100 text-grey-700 border-grey-300 hover:bg-grey-200"
                  )}
                >
                  {option.label}
                  <X className="size-3" />
                </button>
              );
            });
          })}

          <button
            onClick={onClearAll}
            className={clsx(
              "px-spacing-2 py-spacing-1 font-code text-mono-xs tracking-wide bg-transparent border-none cursor-pointer underline",
              inverted ? "text-grey-400 hover:text-white" : "text-grey-600 hover:text-black"
            )}
          >
            CLEAR ALL
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchFilter;
