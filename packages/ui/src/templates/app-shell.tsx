"use client";

import { forwardRef, useState, ReactNode, useEffect } from "react";
import clsx from "clsx";
import { Sidebar, MobileSidebar } from "../organisms/sidebar.js";
import type { SidebarSection } from "../organisms/sidebar.js";
import { Stack } from "../foundations/layout.js";
import { Spinner } from "../atoms/spinner.js";
import { Body, H2 } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { AlertTriangle, WifiOff, ShieldX, Menu } from "lucide-react";

// =============================================================================
// APP SHELL
// Base application wrapper with sidebar navigation
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface AppShellProps {
  children: ReactNode;
  /** Sidebar navigation sections */
  navigation: SidebarSection[];
  /** Current active path for highlighting */
  currentPath: string;
  /** Logo element for sidebar */
  logo?: ReactNode;
  /** Desktop header content */
  header?: ReactNode;
  /** Sidebar footer content */
  footer?: ReactNode;
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
 * AppShell - Base application wrapper with sidebar navigation
 * 
 * Features:
 * - Responsive sidebar (collapsible on desktop, slide-out on mobile)
 * - Skip to main content accessibility link
 * - Loading, error, offline, restricted state variants
 * - Keyboard navigation support
 * - Dark-first design
 * 
 * Use cases:
 * - Dashboard applications
 * - Admin panels
 * - Internal tools
 * - Any app requiring persistent navigation
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
      loading = false,
      loadingMessage = "Loading...",
      error = null,
      onRetry,
      offline = false,
      restricted = false,
      restrictedMessage = "You don't have permission to access this area",
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

    const bgClass = inverted ? "bg-ink-950 text-white" : "bg-white text-black";
    const borderClass = inverted ? "border-grey-800" : "border-grey-200";

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
      <div className="flex-1 flex items-center justify-center p-8">
        <Stack gap={6} className="items-center text-center max-w-md">
          {icon}
          <Stack gap={2} className="items-center">
            <H2 className={inverted ? "text-white" : "text-ink-900"}>{title}</H2>
            <Body className={inverted ? "text-grey-400" : "text-grey-600"}>{message}</Body>
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
          <header
            className={clsx(
              "md:hidden flex items-center justify-between h-16 px-4 border-b-2",
              inverted ? "bg-black" : "bg-white",
              borderClass
            )}
          >
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={clsx(
                "p-2 border-2 rounded-button",
                "transition-all duration-100",
                "hover:-translate-x-0.5 hover:-translate-y-0.5",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                inverted
                  ? "text-white border-grey-700 hover:bg-grey-800 hover:shadow-[2px_2px_0_rgba(255,255,255,0.1)]"
                  : "text-black border-grey-300 hover:bg-grey-100 hover:shadow-[2px_2px_0_rgba(0,0,0,0.1)]"
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

          {/* Optional Desktop Header */}
          {header && (
            <div className={clsx("hidden md:block border-b-2", borderClass)}>
              {header}
            </div>
          )}

          {/* Page Content */}
          <main
            id={mainContentId}
            className="flex-1 overflow-auto"
            tabIndex={-1}
            role="main"
            aria-label="Main content"
          >
            {mainContent}
          </main>
        </div>
      </div>
    );
  }
);
