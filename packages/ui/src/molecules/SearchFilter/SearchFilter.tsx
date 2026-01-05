"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, ChevronUp, ChevronDown, Check } from "lucide-react";
import { 
  searchFilterVariants,
  searchFilterSearchContainerVariants,
  searchFilterSearchInputVariants,
  searchFilterSearchIconVariants,
  searchFilterClearButtonVariants,
  searchFilterFiltersContainerVariants,
  searchFilterFilterGroupVariants,
  searchFilterFilterTriggerVariants,
  searchFilterFilterLabelVariants,
  searchFilterFilterCountVariants,
  searchFilterFilterDropdownVariants,
  searchFilterFilterOptionVariants,
  searchFilterFilterOptionLabelVariants,
  searchFilterFilterOptionCountVariants,
  searchFilterActionsContainerVariants,
  searchFilterActionButtonVariants 
} from "./SearchFilter.variants.js";
import type { 
  SearchFilterProps, 
  FilterGroup,
  FilterPreset 
} from "./SearchFilter.types.js";

/**
 * SearchFilter component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Search and filter interface with dropdowns
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <SearchFilter
 *   placeholder="Search..."
 *   filters={filterGroups}
 *   activeFilters={activeFilters}
 *   onSearchChange={setSearchValue}
 *   onFilterChange={setFilters}
 *   inverted={false}
 * />
 * ```
 */
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
  presets = [],
  onPresetSelect,
  inverted = false,
  className,
}: SearchFilterProps) {
  // State
  const [searchInputValue, setSearchInputValue] = useState(searchValue);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement>>({});

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange?.(searchInputValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchInputValue, debounceMs, onSearchChange]);

  // Sync search value with prop
  useEffect(() => {
    setSearchInputValue(searchValue);
  }, [searchValue]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchInputValue(value);
  }, []);

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    setSearchInputValue("");
    onSearchChange?.("");
  }, [onSearchChange]);

  // Handle dropdown toggle
  const handleDropdownToggle = useCallback((groupKey: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  }, []);

  // Handle filter option click
  const handleFilterOptionClick = useCallback((groupKey: string, optionValue: string, multiple: boolean) => {
    if (multiple) {
      const currentValues = (activeFilters[groupKey] as string[]) || [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onFilterChange?.(groupKey, newValues);
    } else {
      onFilterChange?.(groupKey, optionValue);
      setOpenDropdowns(prev => ({
        ...prev,
        [groupKey]: false,
      }));
    }
  }, [activeFilters, onFilterChange]);

  // Handle clear all filters
  const handleClearAll = useCallback(() => {
    onClearAll?.();
    setOpenDropdowns({});
  }, [onClearAll]);

  // Handle preset selection
  const handlePresetSelect = useCallback((preset: FilterPreset) => {
    onPresetSelect?.(preset);
    setSearchInputValue(preset.searchValue || "");
  }, [onPresetSelect]);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(dropdownRefs.current).forEach(([key, ref]) => {
        if (ref && !ref.contains(event.target as Node)) {
          setOpenDropdowns(prev => ({
            ...prev,
            [key]: false,
          }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get active filter count
  const getActiveFilterCount = (groupKey: string, group: FilterGroup) => {
    const value = activeFilters[groupKey];
    if (!value) return 0;
    
    if (group.multiple) {
      return (value as string[]).length;
    }
    
    return 1;
  };

  // Check if option is selected
  const isOptionSelected = (groupKey: string, optionValue: string, multiple: boolean) => {
    const value = activeFilters[groupKey];
    if (!value) return false;
    
    if (multiple) {
      return (value as string[]).includes(optionValue);
    }
    
    return value === optionValue;
  };

  return (
    <div className={searchFilterVariants({ compact, inverted, className })}>
      {/* Search Input */}
      <div className={searchFilterSearchContainerVariants({ compact, inverted })}>
        <div className="relative">
          <input
            type="text"
            placeholder={placeholder}
            value={searchInputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={searchFilterSearchInputVariants({ compact, inverted })}
          />
          
          {/* Search Icon */}
          <div className={searchFilterSearchIconVariants({ inverted })}>
            <Search className="w-4 h-4" />
          </div>
          
          {/* Clear Button */}
          {searchInputValue && (
            <button
              onClick={handleSearchClear}
              className={searchFilterClearButtonVariants({ inverted })}
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {filters.length > 0 && (
        <div className={searchFilterFiltersContainerVariants({ compact, inverted })}>
          {filters.map((group) => (
            <div
              key={group.key}
              ref={(el) => {
                if (el) dropdownRefs.current[group.key] = el;
              }}
              className={searchFilterFilterGroupVariants({ inverted })}
            >
              {/* Filter Trigger */}
              <button
                onClick={() => handleDropdownToggle(group.key)}
                className={searchFilterFilterTriggerVariants({ inverted })}
                aria-expanded={openDropdowns[group.key]}
                aria-haspopup="listbox"
              >
                <span className={searchFilterFilterLabelVariants({ inverted })}>
                  {group.label}
                </span>
                
                {/* Active Count */}
                {showCounts && getActiveFilterCount(group.key, group) > 0 && (
                  <span className={searchFilterFilterCountVariants({ inverted })}>
                    {getActiveFilterCount(group.key, group)}
                  </span>
                )}
                
                {/* Dropdown Arrow */}
                <div className="ml-2">
                  {openDropdowns[group.key] ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Dropdown */}
              <div className={searchFilterFilterDropdownVariants({ 
                open: openDropdowns[group.key], 
                inverted 
              })}>
                <div className="py-1">
                  {group.options.map((option) => {
                    const isSelected = isOptionSelected(group.key, option.value, group.multiple || false);
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleFilterOptionClick(group.key, option.value, group.multiple || false)}
                        className={searchFilterFilterOptionVariants({ inverted })}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <span className={searchFilterFilterOptionLabelVariants({ inverted })}>
                          {option.label}
                        </span>
                        
                        {/* Selection Indicator */}
                        {isSelected && (
                          <Check className="w-4 h-4 text-brand-primary" />
                        )}
                        
                        {/* Count Badge */}
                        {showCounts && option.count && (
                          <span className={searchFilterFilterOptionCountVariants({ inverted })}>
                            {option.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {(presets.length > 0 || Object.keys(activeFilters).length > 0) && (
        <div className={searchFilterActionsContainerVariants({ inverted })}>
          {/* Presets */}
          {presets.length > 0 && (
            <select
              onChange={(e) => {
                const preset = presets.find(p => p.id === e.target.value);
                if (preset) handlePresetSelect(preset);
              }}
              className={searchFilterActionButtonVariants({ inverted })}
            >
              <option value="">Load Preset</option>
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          )}
          
          {/* Clear All */}
          {Object.keys(activeFilters).length > 0 && (
            <button
              onClick={handleClearAll}
              className={searchFilterActionButtonVariants({ inverted })}
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
}
