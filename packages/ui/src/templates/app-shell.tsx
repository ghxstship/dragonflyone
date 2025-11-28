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

/**
 * AppShell component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold sidebar integration
 * - Clean content area
 * - Mobile-first responsive design
 */
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
          inverted ? "bg-ink-950 text-white" : "bg-white text-black",
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
            "md:hidden flex items-center justify-between h-16 px-4 border-b-2",
            inverted ? "bg-black border-grey-800" : "bg-white border-grey-200"
          )}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={clsx(
                "p-2 border-2 rounded-[var(--radius-button)]",
                "transition-all duration-100",
                "hover:-translate-x-0.5 hover:-translate-y-0.5",
                inverted 
                  ? "text-white border-grey-700 hover:bg-grey-800 hover:shadow-[2px_2px_0_rgba(255,255,255,0.1)]" 
                  : "text-black border-grey-300 hover:bg-grey-100 hover:shadow-[2px_2px_0_rgba(0,0,0,0.1)]"
              )}
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="square" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {logo}
            <div className="w-10" /> {/* Spacer for centering */}
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
