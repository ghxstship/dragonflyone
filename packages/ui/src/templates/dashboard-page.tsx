"use client";

import { forwardRef, ReactNode, useState } from "react";
import clsx from "clsx";
import { Sidebar, MobileSidebar } from "../organisms/sidebar.js";
import type { SidebarSection } from "../organisms/sidebar.js";
import { Container } from "../foundations/layout.js";
import { PageHeader } from "../foundations/page-regions.js";

export interface DashboardPageProps {
  children: ReactNode;
  /** Sidebar navigation sections */
  navigation: SidebarSection[];
  /** Current active path for highlighting */
  currentPath: string;
  /** Logo element for sidebar */
  logo?: ReactNode;
  /** Sidebar footer content */
  sidebarFooter?: ReactNode;
  /** Page header props */
  header?: {
    kicker?: string;
    title: string;
    description?: string;
    actions?: ReactNode;
  };
  /** Dark/light theme */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * DashboardPage template - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Collapsible sidebar navigation
 * - Mobile-responsive with slide-out menu
 * - Integrated page header
 * - Dark-first design
 */
export const DashboardPage = forwardRef<HTMLDivElement, DashboardPageProps>(
  function DashboardPage(
    {
      children,
      navigation,
      currentPath,
      logo,
      sidebarFooter,
      header,
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
            footer={sidebarFooter}
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
          footer={sidebarFooter}
          inverted={inverted}
        />

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile Header */}
          <header
            className={clsx(
              "flex h-16 items-center justify-between border-b-2 px-4 md:hidden",
              inverted ? "border-grey-800 bg-black" : "border-grey-200 bg-white"
            )}
          >
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={clsx(
                "border-2 rounded-[var(--radius-button)] p-2",
                "transition-all duration-100",
                "hover:-translate-x-0.5 hover:-translate-y-0.5",
                inverted
                  ? "border-grey-700 text-white hover:shadow-[2px_2px_0_rgba(255,255,255,0.1)] hover:bg-grey-800"
                  : "border-grey-300 text-black hover:shadow-[2px_2px_0_rgba(0,0,0,0.1)] hover:bg-grey-100"
              )}
              aria-label="Open menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path strokeLinecap="square" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {logo}
            <div className="w-10" /> {/* Spacer for centering */}
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <Container className="py-6 md:py-8">
              {header && (
                <PageHeader
                  kicker={header.kicker}
                  title={header.title}
                  description={header.description}
                  actions={header.actions}
                  inverted={inverted}
                  size="md"
                />
              )}
              {children}
            </Container>
          </main>
        </div>
      </div>
    );
  }
);

export default DashboardPage;
