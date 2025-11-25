"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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
  const inputPadding = compact ? "0.5rem 0.75rem" : "0.75rem 1rem";

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? "0.75rem" : "1rem",
      }}
    >
      {/* Search and Filter Bar */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        {/* Search Input */}
        <div
          style={{
            flex: "1 1 300px",
            position: "relative",
          }}
        >
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%",
              padding: inputPadding,
              paddingLeft: compact ? "2.5rem" : "3rem",
              fontFamily: typography.body,
              fontSize: compact ? fontSizes.bodySM : fontSizes.bodyMD,
              backgroundColor: colors.white,
              border: `${borderWidths.medium} solid ${colors.black}`,
              outline: "none",
              transition: transitions.fast,
            }}
          />
          {/* Search Icon */}
          <span
            style={{
              position: "absolute",
              left: compact ? "0.75rem" : "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: colors.grey500,
              fontSize: compact ? "14px" : "16px",
            }}
          >
            🔍
          </span>
          {/* Clear Search */}
          {localSearch && (
            <button
              onClick={() => handleSearchChange("")}
              style={{
                position: "absolute",
                right: compact ? "0.5rem" : "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                color: colors.grey500,
                fontSize: compact ? "14px" : "16px",
                padding: "0.25rem",
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div
          ref={filterRef}
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          {filters.map((group) => {
            const isExpanded = expandedFilter === group.key;
            const groupActiveCount = Array.isArray(activeFilters[group.key])
              ? (activeFilters[group.key] as string[]).length
              : activeFilters[group.key]
              ? 1
              : 0;

            return (
              <div key={group.key} style={{ position: "relative" }}>
                <button
                  onClick={() => setExpandedFilter(isExpanded ? null : group.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: inputPadding,
                    fontFamily: typography.mono,
                    fontSize: compact ? fontSizes.monoSM : fontSizes.monoMD,
                    letterSpacing: letterSpacing.wide,
                    textTransform: "uppercase",
                    backgroundColor: groupActiveCount > 0 ? colors.black : colors.white,
                    color: groupActiveCount > 0 ? colors.white : colors.black,
                    border: `${borderWidths.medium} solid ${colors.black}`,
                    cursor: "pointer",
                    transition: transitions.fast,
                    whiteSpace: "nowrap",
                  }}
                >
                  {group.label}
                  {showCounts && groupActiveCount > 0 && (
                    <span
                      style={{
                        backgroundColor: colors.white,
                        color: colors.black,
                        padding: "0.125rem 0.375rem",
                        fontSize: fontSizes.monoXS,
                        fontWeight: 700,
                      }}
                    >
                      {groupActiveCount}
                    </span>
                  )}
                  <span style={{ fontSize: "10px" }}>{isExpanded ? "▲" : "▼"}</span>
                </button>

                {/* Dropdown */}
                {isExpanded && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "4px",
                      minWidth: "200px",
                      maxHeight: "300px",
                      overflowY: "auto",
                      backgroundColor: colors.white,
                      border: `${borderWidths.medium} solid ${colors.black}`,
                      zIndex: 100,
                    }}
                  >
                    {group.options.map((option) => {
                      const isActive = isOptionActive(group.key, option.value);

                      return (
                        <button
                          key={option.value}
                          onClick={() =>
                            handleFilterToggle(group.key, option.value, group.multiple || false)
                          }
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            padding: "0.75rem 1rem",
                            fontFamily: typography.body,
                            fontSize: fontSizes.bodySM,
                            backgroundColor: isActive ? colors.grey100 : colors.white,
                            color: colors.black,
                            border: "none",
                            borderBottom: `1px solid ${colors.grey200}`,
                            cursor: "pointer",
                            textAlign: "left",
                            transition: transitions.fast,
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {group.multiple && (
                              <span
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  border: `2px solid ${colors.black}`,
                                  backgroundColor: isActive ? colors.black : colors.white,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: colors.white,
                                  fontSize: "10px",
                                }}
                              >
                                {isActive && "✓"}
                              </span>
                            )}
                            {option.label}
                          </span>
                          {showCounts && option.count !== undefined && (
                            <span
                              style={{
                                fontFamily: typography.mono,
                                fontSize: fontSizes.monoXS,
                                color: colors.grey500,
                              }}
                            >
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: typography.mono,
              fontSize: fontSizes.monoSM,
              color: colors.grey600,
              letterSpacing: letterSpacing.wide,
            }}
          >
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.25rem 0.5rem",
                    fontFamily: typography.mono,
                    fontSize: fontSizes.monoXS,
                    letterSpacing: letterSpacing.wide,
                    backgroundColor: colors.grey100,
                    color: colors.grey700,
                    border: `1px solid ${colors.grey300}`,
                    cursor: "pointer",
                    transition: transitions.fast,
                  }}
                >
                  {option.label}
                  <span style={{ color: colors.grey500 }}>✕</span>
                </button>
              );
            });
          })}

          <button
            onClick={onClearAll}
            style={{
              padding: "0.25rem 0.5rem",
              fontFamily: typography.mono,
              fontSize: fontSizes.monoXS,
              letterSpacing: letterSpacing.wide,
              backgroundColor: "transparent",
              color: colors.grey600,
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            CLEAR ALL
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchFilter;
