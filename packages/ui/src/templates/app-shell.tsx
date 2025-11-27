"use client";

import { forwardRef, useState, ReactNode } from "react";
import clsx from "clsx";
import { Sidebar, MobileSidebar } from "../organisms/sidebar.js";
import type { SidebarSection } from "../organisms/sidebar.js";

export type AppShellProps = {
  children: ReactNode;
  navigation: SidebarSection[];
  currentPath: string;
  logo?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  inverted?: boolean;
  className?: string;
};

export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(
  function AppShell(
    {
      children,
      navigation,
      currentPath,
      logo,
      header,
      footer,
      inverted = true,
      className,
    },
    ref
  ) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
      <div
        ref={ref}
        className={clsx(
          "flex min-h-screen",
          inverted ? "bg-ink-950 text-white" : "bg-surface-primary text-text-primary",
          className
        )}
      >
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            sections={navigation}
            currentPath={currentPath}
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
            logo={logo}
            footer={footer}
            inverted={inverted}
          />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          sections={navigation}
          currentPath={currentPath}
          logo={logo}
          footer={footer}
          inverted={inverted}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className={clsx(
            "md:hidden flex items-center justify-between h-spacing-16 px-spacing-4 border-b-2",
            inverted ? "bg-surface-inverse border-border-secondary" : "bg-surface-primary border-border-secondary"
          )}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={clsx(
                "p-spacing-2",
                inverted ? "text-white" : "text-black"
              )}
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {logo}
            <div className="w-spacing-10" /> {/* Spacer for centering */}
          </header>

          {/* Optional Desktop Header */}
          {header && (
            <div className={clsx(
              "hidden md:block border-b-2",
              inverted ? "border-grey-800" : "border-grey-200"
            )}>
              {header}
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }
);
