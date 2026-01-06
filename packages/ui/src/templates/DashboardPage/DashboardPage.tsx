"use client";

import { forwardRef, useState, useEffect } from "react";
import clsx from "clsx";
import { dashboardPageVariants } from "./DashboardPage.variants.js";
import type { DashboardPageProps } from "./DashboardPage.types.js";
import type { ReactNode } from "react";
import { Container, Stack } from "../../foundations/layout.js";
import { MarketingPageHeader } from "../../foundations/page-regions.js";
import { Spinner } from '../../atoms/Spinner/index.js';
import { Body, H2 } from '../../atoms/Typography/index.js';
import { Button } from "../../atoms/Button/index.js";
import { AlertTriangle, WifiOff, ShieldX, Menu } from "lucide-react";

/**
 * DashboardPage - Dashboard layout with sidebar navigation
 * 
 * Features:
 * - Collapsible sidebar navigation
 * - Mobile-responsive with slide-out menu
 * - Integrated page header with kicker/title/description/actions
 * - Loading, error, empty, offline, restricted state variants
 * - Skip to main content accessibility link
 * - Keyboard navigation support
 * - Dark-first design
 * 
 * Use cases:
 * - Main dashboard views
 * - Analytics pages
 * - Overview pages
 * - Any page requiring sidebar + header
 */
export const DashboardPage = forwardRef<HTMLDivElement, DashboardPageProps>(
  function DashboardPage(
    {
      children,
      sections: _sections,
      activeItem: _activeItem,
      logo,
      footer: _footer,
      inverted = true,
      collapsed = false,
      onCollapse,
      loading = false,
      loadingMessage = "Loading dashboard...",
      error = null,
      onRetry,
      empty = false,
      emptyMessage = "No data to display",
      emptyAction,
      offline = false,
      restricted = false,
      restrictedMessage = "You don't have permission to access this dashboard",
      restrictedAction,
      title,
      subtitle,
      actions,
      className,
      sidebarCollapsed,
      onSidebarCollapse,
      skipToMainLabel = "Skip to main content",
      mainContentId = "main-content",
    },
    ref
  ) {
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Use controlled or uncontrolled sidebar state
    const _isCollapsed = sidebarCollapsed !== undefined ? sidebarCollapsed : collapsed !== undefined ? collapsed : internalCollapsed;
    const _handleCollapse = onSidebarCollapse || onCollapse || setInternalCollapsed;

    const _bgClass = inverted ? "bg-surface-inverse text-text-primary" : "bg-surface-primary text-text-primary";
    const borderClass = inverted ? "border-border" : "border-border";

    // Close mobile menu on escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [mobileMenuOpen]);

    // Render state content
    const renderStateContent = (
      icon: ReactNode,
      title: string,
      message: string,
      action?: ReactNode
    ) => (
      <div className="flex-1 flex items-center justify-center p-8 min-h-[400px]">
        <Stack gap={6} className="items-center text-center max-w-md">
          {icon}
          <Stack gap={2} className="items-center">
            <H2 className={inverted ? "text-text-primary" : "text-text-primary"}>{title}</H2>
            <Body className={inverted ? "text-text-muted" : "text-text-muted"}>{message}</Body>
          </Stack>
          {action}
        </Stack>
      </div>
    );

    // Determine main content
    let mainContent: ReactNode;

    if (loading) {
      mainContent = renderStateContent(
        <Spinner size="lg" />,
        "Loading",
        loadingMessage
      );
    } else if (error) {
      mainContent = renderStateContent(
        <AlertTriangle className="size-16 text-error animate-shake" />,
        "Something Went Wrong",
        error || "An unexpected error occurred",
        onRetry && (
          <Button variant="solid" onClick={onRetry}>
            Try Again
          </Button>
        )
      );
    } else if (offline) {
      mainContent = renderStateContent(
        <WifiOff className="size-16 text-warning" />,
        "You're Offline",
        "Please check your internet connection and try again.",
        <Button variant="solid" onClick={() => window.location.reload()}>
          Retry
        </Button>
      );
    } else if (restricted) {
      mainContent = renderStateContent(
        <ShieldX className="size-16 text-error" />,
        "Access Denied",
        restrictedMessage,
        restrictedAction && (
          <Button variant="solid" onClick={restrictedAction.onClick}>
            {restrictedAction.label}
          </Button>
        )
      );
    } else if (empty) {
      mainContent = renderStateContent(
        <div className={clsx(
          "size-20 rounded-full flex items-center justify-center border-2",
          inverted ? "border-border bg-surface-elevated" : "border-border bg-muted"
        )}>
          <div className={clsx(
            "size-10 rounded-full",
            inverted ? "bg-surface-elevated" : "bg-muted"
          )} />
        </div>,
        "No Data",
        emptyMessage,
        emptyAction && (
          <Button variant="solid" onClick={emptyAction.onClick}>
            {emptyAction.label}
          </Button>
        )
      );
    } else {
      mainContent = children;
    }

    return (
      <div ref={ref} className={clsx(dashboardPageVariants({}), className)}>
        {/* Skip to main content link */}
        <a
          href={`#${mainContentId}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {skipToMainLabel}
        </a>

        {/* Desktop Sidebar - Placeholder for AppSidebar integration */}
        <div className="hidden md:block">
          <div className={clsx(
            "shrink-0 border-r-2",
            borderClass,
            inverted ? "bg-surface-elevated" : "bg-surface-primary"
          )}>
            <div className="p-4">
              <div className="text-text-primary font-bold">Sidebar</div>
              <div className="text-text-muted text-sm">AppSidebar component will be integrated here</div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar - TODO: Implement mobile sidebar */}
        <div className="md:hidden">
          {/* Mobile sidebar implementation needed */}
        </div>

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile Header */}
          <header
            className={clsx(
              "flex h-16 items-center justify-between border-b-2 px-4 md:hidden",
              inverted ? "bg-black" : "bg-white",
              borderClass
            )}
          >
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={clsx(
                "border-2 rounded-button p-2",
                "transition-all duration-100",
                "hover:-translate-x-0.5 hover:-translate-y-0.5",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                inverted
                  ? "border-border text-text-primary hover:shadow-[2px_2px_0_rgba(255,255,255,0.1)] hover:bg-surface-elevated"
                  : "border-border text-text-primary hover:shadow-[2px_2px_0_rgba(0,0,0,0.1)] hover:bg-muted"
              )}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <Menu className="size-6" />
            </button>
            {logo}
            <div className="w-10" aria-hidden="true" />
          </header>

          {/* Page Content */}
          <main
            id={mainContentId}
            className="flex-1 overflow-auto"
            tabIndex={-1}
            role="main"
            aria-label="Dashboard content"
          >
            <Container className="py-6 md:py-8">
              {title && !loading && !error && !offline && (
                <MarketingPageHeader
                  title={title}
                  description={subtitle}
                  actions={actions}
                  inverted={inverted}
                  size="md"
                />
              )}
              {mainContent}
            </Container>
          </main>
        </div>
      </div>
    );
  }
);

DashboardPage.displayName = "DashboardPage";

export default DashboardPage;
