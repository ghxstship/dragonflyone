"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import clsx from "clsx";

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
    <div className={clsx("flex flex-col", compact ? "gap-3" : "gap-4", className)}>
      {/* Search and Filter Bar */}
      <div className="flex gap-3 flex-wrap">
        {/* Search Input */}
        <div className="flex-1 min-w-[300px] relative">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className={clsx(
              "w-full font-body bg-white border-2 border-black outline-none transition-colors duration-fast focus:border-grey-700",
              compact ? "py-2 px-3 pl-10 text-body-sm" : "py-3 px-4 pl-12 text-body-md"
            )}
          />
          {/* Search Icon */}
          <span
            className={clsx(
              "absolute top-1/2 -translate-y-1/2 text-grey-500",
              compact ? "left-3 text-sm" : "left-4 text-base"
            )}
          >
            🔍
          </span>
          {/* Clear Search */}
          {localSearch && (
            <button
              onClick={() => handleSearchChange("")}
              className={clsx(
                "absolute top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-grey-500 p-1 hover:text-grey-700",
                compact ? "right-2 text-sm" : "right-3 text-base"
              )}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div ref={filterRef} className="flex gap-2 flex-wrap">
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
                    "flex items-center gap-2 font-code tracking-wide uppercase border-2 border-black cursor-pointer transition-colors duration-fast whitespace-nowrap",
                    compact ? "px-3 py-2 text-mono-sm" : "px-4 py-3 text-mono-md",
                    groupActiveCount > 0
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-grey-100"
                  )}
                >
                  {group.label}
                  {showCounts && groupActiveCount > 0 && (
                    <span className="bg-white text-black px-1.5 py-0.5 text-mono-xs font-bold">
                      {groupActiveCount}
                    </span>
                  )}
                  <span className="text-[10px]">{isExpanded ? "▲" : "▼"}</span>
                </button>

                {/* Dropdown */}
                {isExpanded && (
                  <div className="absolute top-full left-0 mt-1 min-w-[200px] max-h-[300px] overflow-y-auto bg-white border-2 border-black z-dropdown">
                    {group.options.map((option) => {
                      const isActive = isOptionActive(group.key, option.value);

                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterToggle(group.key, option.value, group.multiple || false)
                          }
                          className={clsx(
                            "flex justify-between items-center w-full px-4 py-3 font-body text-body-sm text-black border-none border-b border-grey-200 cursor-pointer text-left transition-colors duration-fast",
                            isActive ? "bg-grey-100" : "bg-white hover:bg-grey-50"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            {group.multiple && (
                              <span
                                className={clsx(
                                  "w-4 h-4 border-2 border-black flex items-center justify-center text-[10px]",
                                  isActive ? "bg-black text-white" : "bg-white"
                                )}
                              >
                                {isActive && "✓"}
                              </span>
                            )}
                            {option.label}
                          </span>
                          {showCounts && option.count !== undefined && (
                            <span className="font-code text-mono-xs text-grey-500">
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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-code text-mono-sm text-grey-600 tracking-wide">
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
                  className="flex items-center gap-1.5 px-2 py-1 font-code text-mono-xs tracking-wide bg-grey-100 text-grey-700 border border-grey-300 cursor-pointer transition-colors duration-fast hover:bg-grey-200"
                >
                  {option.label}
                  <span className="text-grey-500">✕</span>
                </button>
              );
            });
          })}

          <button
            onClick={onClearAll}
            className="px-2 py-1 font-code text-mono-xs tracking-wide bg-transparent text-grey-600 border-none cursor-pointer underline hover:text-black"
          >
            CLEAR ALL
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchFilter;
