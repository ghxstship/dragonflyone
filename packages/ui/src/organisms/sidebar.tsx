"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type SidebarSection = {
  section: string;
  items: SidebarItem[];
};

export type SidebarItem = {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  active?: boolean;
};

export type SidebarProps = HTMLAttributes<HTMLElement> & {
  sections: SidebarSection[];
  currentPath?: string;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  logo?: ReactNode;
  footer?: ReactNode;
  inverted?: boolean;
};

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  function Sidebar(
    {
      sections,
      currentPath = "",
      collapsed = false,
      onCollapse,
      logo,
      footer,
      inverted = true,
      className,
      ...props
    },
    ref
  ) {
    return (
      <aside
        ref={ref}
        className={clsx(
          "flex flex-col h-screen border-r-2 transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          inverted ? "bg-black border-grey-800 text-white" : "bg-white border-grey-200 text-black",
          className
        )}
        {...props}
      >
        {/* Logo/Header */}
        {logo && (
          <div className={clsx(
            "flex items-center h-16 px-4 border-b-2",
            inverted ? "border-grey-800" : "border-grey-200"
          )}>
            {logo}
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto py-4">
          {sections.map((section) => (
            <div key={section.section} className="mb-6">
              {!collapsed && (
                <div className={clsx(
                  "px-4 mb-2 text-xs font-mono uppercase tracking-wider",
                  inverted ? "text-grey-500" : "text-grey-400"
                )}>
                  {section.section}
                </div>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className={clsx(
                          "flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                          collapsed && "justify-center",
                          isActive
                            ? inverted
                              ? "bg-white text-black"
                              : "bg-black text-white"
                            : inverted
                              ? "text-grey-300 hover:bg-grey-900 hover:text-white"
                              : "text-grey-600 hover:bg-grey-100 hover:text-black"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        {item.icon && (
                          <span className="w-5 h-5 flex items-center justify-center">
                            {/* Icon placeholder - integrate with your icon system */}
                            <span className="text-xs">{item.icon.charAt(0)}</span>
                          </span>
                        )}
                        {!collapsed && (
                          <>
                            <span className="flex-1 uppercase tracking-wider">{item.label}</span>
                            {item.badge && (
                              <span className={clsx(
                                "px-2 py-0.5 text-mono-xs font-code uppercase tracking-widest",
                                inverted ? "bg-grey-800 text-white" : "bg-grey-200 text-black"
                              )}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        {onCollapse && (
          <button
            type="button"
            onClick={() => onCollapse(!collapsed)}
            className={clsx(
              "flex items-center justify-center h-12 border-t-2 transition-colors",
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
          <div className={clsx(
            "px-4 py-4 border-t-2",
            inverted ? "border-grey-800" : "border-grey-200"
          )}>
            {footer}
          </div>
        )}
      </aside>
    );
  }
);

export type MobileSidebarProps = SidebarProps & {
  open: boolean;
  onClose: () => void;
};

export const MobileSidebar = forwardRef<HTMLElement, MobileSidebarProps>(
  function MobileSidebar({ open, onClose, ...props }, ref) {
    if (!open) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 md:hidden">
          <Sidebar ref={ref} {...props} collapsed={false} />
        </div>
      </>
    );
  }
);
