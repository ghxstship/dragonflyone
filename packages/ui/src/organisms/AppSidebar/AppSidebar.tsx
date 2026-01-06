"use client";

import { forwardRef, useState, useCallback } from "react";
import clsx from "clsx";
import { ChevronDown, ChevronRight } from "lucide-react";
import { appSidebarVariants, sidebarItemVariants, sidebarSectionVariants } from "./AppSidebar.variants.js";
import type { AppSidebarProps, SidebarItem } from "./AppSidebar.types.js";

/**
 * AppSidebar component - Main navigation sidebar for applications
 * 
 * @example
 * ```tsx
 * <AppSidebar
 *   sections={sidebarSections}
 *   collapsed={false}
 *   onItemClick={(item) => console.log(item)}
 * />
 * ```
 */
export const AppSidebar = forwardRef<HTMLElement, AppSidebarProps>(
  function AppSidebar({
    sections,
    activeItem,
    collapsed = false,
    onItemClick,
    logo,
    footer,
    inverted = false,
    sticky = true,
    className,
    ...props
  }, ref) {
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

    const handleSectionToggle = useCallback((sectionId: string) => {
      setCollapsedSections(prev => {
        const newSet = new Set(prev);
        if (newSet.has(sectionId)) {
          newSet.delete(sectionId);
        } else {
          newSet.add(sectionId);
        }
        return newSet;
      });
    }, []);

    const handleItemClick = useCallback((item: SidebarItem) => {
      if (!item.disabled) {
        onItemClick?.(item);
      }
    }, [onItemClick]);

    const renderSidebarItem = (item: SidebarItem, level: number = 0) => (
      <div key={item.id}>
        <button
          onClick={() => item.children ? handleSectionToggle(item.id) : handleItemClick(item)}
          disabled={item.disabled}
          className={clsx(
            sidebarItemVariants({
              active: item.active || item.id === activeItem,
              disabled: item.disabled,
              collapsed,
              
            }),
            item.children && "font-semibold"
          )}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
        >
          {item.icon && (
            <span className="flex-shrink-0 w-4 h-4">
              {item.icon}
            </span>
          )}
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
              {item.children && (
                <span className="ml-2">
                  {collapsedSections.has(item.id) ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </span>
              )}
            </>
          )}
        </button>
        
        {item.children && !collapsed && !collapsedSections.has(item.id) && (
          <div className="mt-1">
            {item.children.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );

    return (
      <aside
        ref={ref}
        className={clsx(appSidebarVariants({ collapsed, sticky, className }))}
        style={{
          width: collapsed ? "64px" : "256px",
        }}
        {...props}
      >
        {/* Logo */}
        {logo && (
          <div className={clsx("p-4 border-b", collapsed ? "justify-center" : "")}>
            {logo}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {sections.map((section) => (
            <div key={section.id} className={sidebarSectionVariants({ collapsed })}>
              {/* Section Title */}
              {!collapsed && section.title && (
                <h3 className="text-xs font-semibold text-text-disabled uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => renderSidebarItem(item))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {footer && (
          <div className={clsx("p-4 border-t", collapsed ? "justify-center" : "")}>
            {footer}
          </div>
        )}
      </aside>
    );
  }
);

export default AppSidebar;
