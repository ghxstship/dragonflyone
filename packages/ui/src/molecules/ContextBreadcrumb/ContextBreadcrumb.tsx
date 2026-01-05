"use client";

import { forwardRef, useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Search, Plus } from "lucide-react";
import { 
  contextBreadcrumbVariants,
  contextBreadcrumbLevelVariants,
  contextBreadcrumbDropdownVariants,
  contextBreadcrumbTriggerVariants,
  contextBreadcrumbMenuVariants,
  contextBreadcrumbMenuItemVariants,
  contextBreadcrumbSeparatorVariants 
} from "./ContextBreadcrumb.variants.js";
import type { 
  ContextBreadcrumbProps, 
  ContextLevel 
} from "./ContextBreadcrumb.types.js";

/**
 * ContextBreadcrumb component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Vercel-style hierarchical navigation breadcrumb
 * - Bold 2px borders on dropdowns
 * - Hard offset shadows
 * - Hover lift effects
 * - Snappy animations
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <ContextBreadcrumb
 *   levels={[
 *     {
 *       label: "Organization",
 *       current: { id: "org-1", name: "Acme Corp", slug: "acme-corp" },
 *       items: [{ id: "org-1", name: "Acme Corp", slug: "acme-corp" }],
 *       onSelect: (item) => console.log('Selected:', item)
 *     }
 *   ]}
 * />
 * ```
 */
export const ContextBreadcrumb = forwardRef<HTMLElement, ContextBreadcrumbProps>(
  function ContextBreadcrumb({
    levels,
    logo,
    separator,
    inverted = false,
    className,
    ...props
  }, ref) {
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
    const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
    const dropdownRefs = useRef<Record<string, HTMLDivElement>>({});

    // Handle dropdown toggle
    const toggleDropdown = useCallback((levelIndex: string) => {
      setOpenDropdowns(prev => ({
        ...prev,
        [levelIndex]: !prev[levelIndex]
      }));
    }, []);

    // Handle search
    const handleSearch = useCallback(async (levelIndex: string, query: string) => {
      setSearchQueries(prev => ({
        ...prev,
        [levelIndex]: query
      }));
      
      const level = levels[parseInt(levelIndex)];
                      if (level?.onSearch && query) {
                        await level.onSearch(query);
                      }
    }, [levels]);

    // Handle click outside to close dropdowns
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        Object.entries(dropdownRefs.current).forEach(([key, ref]) => {
          if (ref && !ref.contains(event.target as Node)) {
            setOpenDropdowns(prev => ({
              ...prev,
              [key]: false
            }));
          }
        });
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Escape') {
        setOpenDropdowns({});
      }
    }, []);

    // Filter items based on search
    const getFilteredItems = useCallback((level: ContextLevel, levelIndex: string) => {
      const query = searchQueries[levelIndex];
      if (!query) return level.items;
      
      return level.items.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
    }, [searchQueries]);

    return (
      <nav
        ref={ref}
        className={contextBreadcrumbVariants({ inverted, className })}
        onKeyDown={handleKeyDown}
        aria-label="Breadcrumb navigation"
        {...props}
      >
        {/* Logo/Home */}
        {logo && (
          <div className="flex-shrink-0">
            {logo}
          </div>
        )}

        {/* Breadcrumb Levels */}
        <div className="flex items-center gap-2">
          {levels.map((level, index) => (
            <div key={index} className={contextBreadcrumbLevelVariants({ inverted })}>
              {/* Dropdown */}
              <div 
                ref={el => {
                  if (el) dropdownRefs.current[index.toString()] = el;
                }}
                className={contextBreadcrumbDropdownVariants({ 
                  isOpen: openDropdowns[index.toString()], 
                  inverted 
                })}
              >
                {/* Trigger */}
                <button
                  onClick={() => toggleDropdown(index.toString())}
                  className={contextBreadcrumbTriggerVariants({ 
                    active: !!level.current, 
                    inverted 
                  })}
                  aria-expanded={openDropdowns[index.toString()]}
                  aria-haspopup="listbox"
                >
                  {level.current?.icon && (
                    <span className="w-4 h-4">{level.current.icon}</span>
                  )}
                  <span>{level.current?.name || level.label}</span>
                  {level.current?.badge && (
                    <span className="px-2 py-0.5 text-xs bg-brand-primary text-white rounded-badge">
                      {level.current.badge}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    openDropdowns[index.toString()] ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                <div className={contextBreadcrumbMenuVariants({ 
                  isOpen: openDropdowns[index.toString()], 
                  inverted 
                })}>
                  {/* Search */}
                  {level.onSearch && (
                    <div className="p-3 border-b-2 border-border">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                          type="text"
                          placeholder={level.searchPlaceholder || `Search ${level.label}...`}
                          value={searchQueries[index.toString()] || ''}
                          onChange={(e) => handleSearch(index.toString(), e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 border-2 rounded-button bg-surface-primary border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand-primary)] ${
                            inverted ? "bg-surface-primary-inverse border-border-inverse text-text-inverse placeholder:text-text-muted-inverse" : ""
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div className="max-h-64 overflow-y-auto">
                    {getFilteredItems(level, index.toString()).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          level.onSelect(item);
                          setOpenDropdowns({});
                        }}
                        className={contextBreadcrumbMenuItemVariants({ inverted })}
                      >
                        {item.icon && (
                          <span className="w-4 h-4">{item.icon}</span>
                        )}
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs bg-surface-elevated border-border rounded-badge">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Create New */}
                    {level.onCreate && (
                      <div
                        onClick={() => {
                          level.onCreate?.();
                          setOpenDropdowns({});
                        }}
                        className={`flex items-center gap-3 px-4 py-3 border-t-2 border-border cursor-pointer transition-colors duration-[var(--duration-fast)] ease-[var(--easing-easeOut)] hover:bg-surface-hover ${
                          inverted ? "border-border-inverse hover:bg-surface-hover-inverse" : ""
                        }`}
                      >
                        <Plus className="w-4 h-4 text-brand-primary" />
                        <span className="text-brand-primary font-medium">
                          {level.createLabel || `Create ${level.label}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Separator */}
              {index < levels.length - 1 && (
                <div className={contextBreadcrumbSeparatorVariants({ inverted })}>
                  {separator || <ChevronDown className="w-4 h-4 rotate-270" />}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    );
  }
);

ContextBreadcrumb.displayName = "ContextBreadcrumb";
