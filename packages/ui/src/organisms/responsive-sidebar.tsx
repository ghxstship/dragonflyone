"use client";

import { forwardRef, useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

// Enhanced navigation types supporting subsections
export type NavItem = {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  primary?: boolean;
};

export type NavSubsection = {
  label: string;
  items: NavItem[];
};

export type NavSection = {
  section: string;
  icon?: string;
  items: NavItem[];
  subsections?: NavSubsection[];
};

export type ResponsiveSidebarProps = HTMLAttributes<HTMLElement> & {
  sections: NavSection[];
  currentPath?: string;
  logo?: ReactNode;
  footer?: ReactNode;
  inverted?: boolean;
  quickActions?: Array<{ label: string; href: string; icon?: string; shortcut?: string }>;
  onNavigate?: (href: string) => void;
};

// Icon component - integrates with Lucide or custom icons
function NavIcon({ name, className }: { name: string; className?: string }) {
  // Simplified icon rendering - in production, integrate with your icon library
  return (
    <span className={clsx("flex items-center justify-center", className)} aria-hidden="true">
      <span className="text-mono-xs">{name.substring(0, 2).toUpperCase()}</span>
    </span>
  );
}

export const ResponsiveSidebar = forwardRef<HTMLElement, ResponsiveSidebarProps>(
  function ResponsiveSidebar(
    {
      sections,
      currentPath = "",
      logo,
      footer,
      inverted = true,
      quickActions,
      onNavigate,
      className,
      ...props
    },
    ref
  ) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [isMobile, setIsMobile] = useState(false);

    // Responsive detection
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
        if (window.innerWidth >= 768) {
          setMobileOpen(false);
        }
      };
      
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Auto-expand section containing current path
    useEffect(() => {
      sections.forEach((section) => {
        const hasActiveItem = section.items.some(
          (item) => currentPath === item.href || currentPath.startsWith(item.href + "/")
        );
        const hasActiveSubsection = section.subsections?.some((sub) =>
          sub.items.some(
            (item) => currentPath === item.href || currentPath.startsWith(item.href + "/")
          )
        );
        if (hasActiveItem || hasActiveSubsection) {
          setExpandedSections((prev) => new Set([...prev, section.section]));
        }
      });
    }, [currentPath, sections]);

    const toggleSection = useCallback((sectionName: string) => {
      setExpandedSections((prev) => {
        const next = new Set(prev);
        if (next.has(sectionName)) {
          next.delete(sectionName);
        } else {
          next.add(sectionName);
        }
        return next;
      });
    }, []);

    const handleNavigate = useCallback(
      (href: string) => {
        if (onNavigate) {
          onNavigate(href);
        }
        if (isMobile) {
          setMobileOpen(false);
        }
      },
      [onNavigate, isMobile]
    );

    const isItemActive = (href: string) =>
      currentPath === href || currentPath.startsWith(href + "/");

    const renderNavItem = (item: NavItem, indent = false) => {
      const active = isItemActive(item.href);
      return (
        <a
          key={item.href}
          href={item.href}
          onClick={(e) => {
            if (onNavigate) {
              e.preventDefault();
              handleNavigate(item.href);
            }
          }}
          className={clsx(
            "flex items-center gap-spacing-3 py-spacing-2 text-body-sm transition-all duration-150",
            indent ? "pl-spacing-md pr-spacing-sm" : "px-spacing-sm",
            collapsed && !isMobile && "justify-center px-spacing-2",
            active
              ? inverted
                ? "bg-white text-black font-weight-medium"
                : "bg-black text-white font-weight-medium"
              : inverted
                ? "text-grey-300 hover:bg-grey-900 hover:text-white"
                : "text-grey-600 hover:bg-grey-100 hover:text-black",
            item.primary && !active && "font-weight-medium"
          )}
          title={collapsed && !isMobile ? item.label : undefined}
        >
          {item.icon && <NavIcon name={item.icon} className="w-spacing-sm h-spacing-sm flex-shrink-0" />}
          {(!collapsed || isMobile) && (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span
                  className={clsx(
                    "px-spacing-xs py-spacing-xs text-mono-xs rounded-full flex-shrink-0",
                    inverted ? "bg-grey-800 text-white" : "bg-grey-200 text-black"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </>
          )}
        </a>
      );
    };

    const renderSection = (section: NavSection) => {
      const isExpanded = expandedSections.has(section.section);
      const hasSubsections = section.subsections && section.subsections.length > 0;

      return (
        <div key={section.section} className="mb-spacing-md">
          {/* Section Header */}
          <button
            type="button"
            onClick={() => hasSubsections && toggleSection(section.section)}
            className={clsx(
              "w-full flex items-center gap-gap-xs px-spacing-sm py-spacing-2 text-mono-xs uppercase tracking-widest transition-colors",
              collapsed && !isMobile && "justify-center px-spacing-2",
              inverted
                ? "text-grey-500 hover:text-grey-300"
                : "text-grey-400 hover:text-grey-600",
              hasSubsections && "cursor-pointer"
            )}
          >
            {section.icon && <NavIcon name={section.icon} className="w-spacing-md h-spacing-md" />}
            {(!collapsed || isMobile) && (
              <>
                <span className="flex-1 text-left">{section.section}</span>
                {hasSubsections && (
                  <svg
                    className={clsx(
                      "w-spacing-4 h-spacing-4 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </>
            )}
          </button>

          {/* Primary Items - Always visible */}
          <div className="space-y-spacing-0.5">
            {section.items.map((item) => renderNavItem(item))}
          </div>

          {/* Subsections - Collapsible */}
          {hasSubsections && isExpanded && (!collapsed || isMobile) && (
            <div className="mt-spacing-md space-y-spacing-sm">
              {section.subsections!.map((subsection) => (
                <div key={subsection.label}>
                  <div
                    className={clsx(
                      "px-spacing-sm py-spacing-xs text-micro font-mono uppercase tracking-wider",
                      inverted ? "text-grey-600" : "text-grey-400"
                    )}
                  >
                    {subsection.label}
                  </div>
                  <div className="space-y-spacing-0.5">
                    {subsection.items.map((item) => renderNavItem(item, true))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    const sidebarContent = (
      <>
        {/* Logo/Header */}
        {logo && (
          <div
            className={clsx(
              "flex items-center h-spacing-lg px-spacing-sm border-b-2 flex-shrink-0",
              inverted ? "border-grey-800" : "border-grey-200"
            )}
          >
            {logo}
          </div>
        )}

        {/* Quick Actions (Desktop only) */}
        {quickActions && quickActions.length > 0 && !collapsed && !isMobile && (
          <div
            className={clsx(
              "px-spacing-sm py-spacing-sm border-b-2 flex-shrink-0",
              inverted ? "border-grey-800" : "border-grey-200"
            )}
          >
            <div className="flex flex-wrap gap-gap-xs">
              {quickActions.slice(0, 3).map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      handleNavigate(action.href);
                    }
                  }}
                  className={clsx(
                    "flex items-center gap-gap-xs px-spacing-2 py-spacing-1 text-mono-xs rounded-sm transition-colors",
                    inverted
                      ? "bg-grey-900 text-grey-300 hover:bg-grey-800 hover:text-white"
                      : "bg-grey-100 text-grey-600 hover:bg-grey-200 hover:text-black"
                  )}
                  title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
                >
                  {action.icon && <NavIcon name={action.icon} className="w-spacing-3 h-spacing-3" />}
                  <span>{action.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-spacing-4 scrollbar-thin">
          {sections.map(renderSection)}
        </nav>

        {/* Collapse Toggle (Desktop only) */}
        {!isMobile && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={clsx(
              "flex items-center justify-center h-spacing-12 border-t-2 transition-colors flex-shrink-0",
              inverted
                ? "border-grey-800 text-grey-400 hover:text-white hover:bg-grey-900"
                : "border-grey-200 text-grey-500 hover:text-black hover:bg-grey-100"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={clsx("transition-transform", collapsed && "rotate-180")}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* Footer */}
        {footer && (
          <div
            className={clsx(
              "px-spacing-4 py-spacing-4 border-t-2 flex-shrink-0",
              inverted ? "border-grey-800" : "border-grey-200"
            )}
          >
            {footer}
          </div>
        )}
      </>
    );

    return (
      <>
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className={clsx(
            "fixed top-spacing-4 left-spacing-4 z-fixed p-spacing-2 rounded-sm md:hidden",
            inverted ? "bg-black text-white" : "bg-white text-black",
            "shadow-lg"
          )}
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-modal-backdrop bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={clsx(
            "fixed inset-y-0 left-0 z-modal flex flex-col w-spacing-72 transform transition-transform duration-300 md:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
            inverted ? "bg-black border-grey-800 text-white" : "bg-white border-grey-200 text-black"
          )}
        >
          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className={clsx(
              "absolute top-spacing-4 right-spacing-4 p-spacing-2",
              inverted ? "text-grey-400 hover:text-white" : "text-grey-500 hover:text-black"
            )}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          {sidebarContent}
        </aside>

        {/* Desktop Sidebar */}
        <aside
          ref={ref}
          className={clsx(
            "hidden md:flex flex-col h-screen border-r-2 transition-all duration-300",
            collapsed ? "w-16" : "w-64",
            inverted ? "bg-black border-grey-800 text-white" : "bg-white border-grey-200 text-black",
            className
          )}
          {...props}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }
);

// Bottom navigation for mobile
export type BottomNavItem = {
  label: string;
  href: string;
  icon: string;
};

export type BottomNavigationProps = HTMLAttributes<HTMLElement> & {
  items: BottomNavItem[];
  currentPath?: string;
  inverted?: boolean;
  onNavigate?: (href: string) => void;
};

export const BottomNavigation = forwardRef<HTMLElement, BottomNavigationProps>(
  function BottomNavigation(
    { items, currentPath = "", inverted = true, onNavigate, className, ...props },
    ref
  ) {
    return (
      <nav
        ref={ref}
        className={clsx(
          "fixed bottom-0 left-0 right-0 z-sticky md:hidden border-t-2",
          inverted ? "bg-black border-grey-800" : "bg-white border-grey-200",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-around h-spacing-16 px-spacing-2 safe-area-inset-bottom">
          {items.slice(0, 5).map((item) => {
            const active = currentPath === item.href || currentPath.startsWith(item.href + "/");
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate(item.href);
                  }
                }}
                className={clsx(
                  "flex flex-col items-center justify-center gap-gap-xs px-spacing-3 py-spacing-2 rounded-sm transition-colors min-w-spacing-16",
                  active
                    ? inverted
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : inverted
                      ? "text-grey-400 hover:text-white"
                      : "text-grey-500 hover:text-black"
                )}
              >
                <NavIcon name={item.icon} className="w-spacing-6 h-spacing-6" />
                <span className="text-micro truncate max-w-full">{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    );
  }
);

export default ResponsiveSidebar;
