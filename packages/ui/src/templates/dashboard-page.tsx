"use client";

import { forwardRef, ReactNode, useState, useEffect } from "react";
import clsx from "clsx";
import { AppSidebar, MobileAppSidebar } from "../organisms/app-sidebar.js";
import type { SidebarNavSection } from "../organisms/app-sidebar.js";
import { Container, Stack } from "../foundations/layout.js";
import { MarketingPageHeader } from "../foundations/page-regions.js";
import { Spinner } from "../atoms/spinner.js";
import { Body, H2 } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { AlertTriangle, WifiOff, ShieldX, Menu } from "lucide-react";

// =============================================================================
// DASHBOARD PAGE
// Dashboard layout with sidebar navigation and page header
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface DashboardPageProps {
  children: ReactNode;
  /** Sidebar navigation sections */
  navigation: SidebarNavSection[];
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
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Error state */
  error?: Error | null;
  /** Error retry handler */
  onRetry?: () => void;
  /** Empty state */
  empty?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state action */
  emptyAction?: { label: string; onClick: () => void };
  /** Offline state */
  offline?: boolean;
  /** Restricted/access denied state */
  restricted?: boolean;
  /** Restricted message */
  restrictedMessage?: string;
  /** Restricted action */
  restrictedAction?: { label: string; onClick: () => void };
  /** Sidebar collapsed state (controlled) */
  sidebarCollapsed?: boolean;
  /** Sidebar collapse handler */
  onSidebarCollapse?: (collapsed: boolean) => void;
  /** Skip to main content label */
  skipToMainLabel?: string;
  /** Main content id for skip link */
  mainContentId?: string;
}

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
      navigation,
      currentPath,
      logo,
      sidebarFooter,
      header,
      inverted = true,
      className,
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
      sidebarCollapsed: controlledCollapsed,
      onSidebarCollapse,
      skipToMainLabel = "Skip to main content",
      mainContentId = "main-content",
    },
    ref
  ) {
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Use controlled or uncontrolled sidebar state
    const sidebarCollapsed = controlledCollapsed ?? internalCollapsed;
    const setSidebarCollapsed = onSidebarCollapse ?? setInternalCollapsed;

    const bgClass = inverted ? "bg-surface-inverse text-text-primary" : "bg-surface-primary text-text-primary";
    const borderClass = inverted ? "border-border" : "border-border";

    // Close mobile menu on route change
    useEffect(() => {
      setMobileMenuOpen(false);
    }, [currentPath]);

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
        error.message || "An unexpected error occurred",
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
      <div ref={ref} className={clsx("flex min-h-screen", bgClass, className)}>
        {/* Skip to main content link */}
        <a
          href={`#${mainContentId}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {skipToMainLabel}
        </a>

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar
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
        <MobileAppSidebar
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
              {header && !loading && !error && !offline && !restricted && (
                <MarketingPageHeader
                  kicker={header.kicker}
                  title={header.title}
                  description={header.description}
                  actions={header.actions}
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

export default DashboardPage;
