"use client";

import React, { forwardRef, ReactNode, useEffect } from "react";
import {
  Home,
  Calendar,
  FileText,
  CreditCard,
  MessageSquare,
  LogOut,
  ChevronRight,
  User,
  AlertTriangle,
  WifiOff,
  ShieldX,
  type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import { Stack } from "../foundations/layout.js";
import { Spinner } from "../atoms/spinner.js";
import { Body, H2 } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";

// =============================================================================
// CLIENT PORTAL SHELL
// Client-facing portal layout with organization branding
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface ClientPortalNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface ClientPortalShellProps {
  /** Organization name */
  organizationName: string;
  /** Organization logo URL */
  organizationLogo?: string;
  /** Client name */
  clientName: string;
  /** Client email */
  clientEmail?: string;
  /** Current active route ID */
  activeRoute?: string;
  /** Navigation handler */
  onNavigate?: (route: string) => void;
  /** Logout handler */
  onLogout?: () => void;
  /** Main content */
  children: ReactNode;
  /** Custom className */
  className?: string;
  /** Custom navigation items */
  navigationItems?: ClientPortalNavItem[];
  /** Dark/light theme */
  inverted?: boolean;
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
  /** Footer links */
  footerLinks?: Array<{ label: string; onClick?: () => void; href?: string }>;
  /** Copyright text */
  copyright?: string;
  /** Skip to main content label */
  skipToMainLabel?: string;
  /** Main content id for skip link */
  mainContentId?: string;
}

const defaultNavItems: ClientPortalNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/client-portal" },
  { id: "events", label: "My Events", icon: Calendar, href: "/client-portal/events" },
  { id: "documents", label: "Documents", icon: FileText, href: "/client-portal/documents" },
  { id: "invoices", label: "Invoices", icon: CreditCard, href: "/client-portal/invoices" },
  { id: "messages", label: "Messages", icon: MessageSquare, href: "/client-portal/messages" },
];

/**
 * ClientPortalShell - Client-facing portal layout
 * 
 * Features:
 * - Organization branding with logo
 * - Client user info display
 * - Responsive sidebar/mobile navigation
 * - Loading, error, offline, restricted state variants
 * - Customizable navigation items
 * - Skip to main content accessibility link
 * - Dark-first design
 * 
 * Use cases:
 * - Client portals
 * - Customer dashboards
 * - External user interfaces
 * - White-label applications
 */
export const ClientPortalShell = forwardRef<HTMLDivElement, ClientPortalShellProps>(
  function ClientPortalShell(
    {
      organizationName,
      organizationLogo,
      clientName,
      clientEmail,
      activeRoute = "dashboard",
      onNavigate,
      onLogout,
      children,
      className,
      navigationItems = defaultNavItems,
      inverted = true,
      loading = false,
      loadingMessage = "Loading...",
      error = null,
      onRetry,
      offline = false,
      restricted = false,
      restrictedMessage = "You don't have permission to access this portal",
      restrictedAction,
      footerLinks = [
        { label: "Privacy Policy" },
        { label: "Terms of Service" },
        { label: "Contact Support" },
      ],
      copyright,
      skipToMainLabel = "Skip to main content",
      mainContentId = "main-content",
    },
    ref
  ) {
    const bgClass = inverted ? "bg-surface-inverse text-text-primary" : "bg-muted text-text-primary";
    const headerBgClass = inverted ? "bg-surface-elevated border-border" : "bg-surface-primary border-border";
    const cardBgClass = inverted ? "bg-surface-elevated border-border" : "bg-surface-primary border-border";
    const mutedTextClass = inverted ? "text-text-muted" : "text-text-muted";

    // Close mobile menu on escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          // Could be used for mobile menu if implemented
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, []);

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
            <Body className={mutedTextClass}>{message}</Body>
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
      <div ref={ref} className={clsx("min-h-screen flex flex-col", bgClass, className)}>
        {/* Skip to main content link */}
        <a
          href={`#${mainContentId}`}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {skipToMainLabel}
        </a>

        {/* Header */}
        <header className={clsx("border-b-2 sticky top-0 z-sticky-header", headerBgClass)}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo / Organization */}
              <div className="flex items-center gap-3">
                {organizationLogo ? (
                  <div className="h-8 w-8 rounded-badge overflow-hidden">
                    <img
                      src={organizationLogo}
                      alt={organizationName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-8 w-8 bg-primary rounded-badge flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {organizationName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className={clsx("text-sm font-semibold", inverted ? "text-text-primary" : "text-text-primary")}>
                    {organizationName}
                  </p>
                  <p className={clsx("text-xs", mutedTextClass)}>Client Portal</p>
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className={clsx("text-sm font-medium", inverted ? "text-text-primary" : "text-text-primary")}>
                    {clientName}
                  </p>
                  {clientEmail && (
                    <p className={clsx("text-xs", mutedTextClass)}>{clientEmail}</p>
                  )}
                </div>
                <div className={clsx(
                  "h-9 w-9 rounded-full flex items-center justify-center",
                  inverted ? "bg-surface-elevated" : "bg-muted"
                )}>
                  <User className={clsx("h-5 w-5", mutedTextClass)} />
                </div>
                <button
                  onClick={onLogout}
                  className={clsx(
                    "p-2 rounded-button transition-colors",
                    inverted
                      ? "hover:bg-surface-elevated text-text-muted hover:text-text-primary"
                      : "hover:bg-muted text-text-disabled hover:text-text-primary"
                  )}
                  title="Sign Out"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <div className="flex gap-6">
            {/* Sidebar Navigation */}
            <aside className="w-56 flex-shrink-0 hidden lg:block">
              <nav
                className={clsx("border-2 rounded-card p-2 sticky top-24", cardBgClass)}
                aria-label="Portal navigation"
              >
                <ul className="space-y-1" role="list">
                  {navigationItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => !item.disabled && onNavigate?.(item.href)}
                        disabled={item.disabled}
                        className={clsx(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-button transition-colors text-left",
                          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                          item.disabled && "opacity-50 cursor-not-allowed",
                          activeRoute === item.id
                            ? "bg-primary/10 text-primary"
                            : inverted
                              ? "hover:bg-surface-elevated text-text-muted hover:text-text-primary"
                              : "hover:bg-muted text-text-disabled hover:text-text-primary"
                        )}
                        aria-current={activeRoute === item.id ? "page" : undefined}
                      >
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                        <span className="text-sm flex-1">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className={clsx(
                            "px-1.5 py-0.5 text-xs rounded-badge font-medium",
                            inverted ? "bg-surface-elevated text-text-secondary" : "bg-muted text-text-disabled"
                          )}>
                            {item.badge}
                          </span>
                        )}
                        {activeRoute === item.id && (
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Mobile Navigation */}
            <nav className="lg:hidden mb-4 overflow-x-auto -mx-4 px-4" aria-label="Portal navigation">
              <div className="flex gap-2 min-w-max">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => !item.disabled && onNavigate?.(item.href)}
                    disabled={item.disabled}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-2 rounded-button transition-colors whitespace-nowrap",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      item.disabled && "opacity-50 cursor-not-allowed",
                      activeRoute === item.id
                        ? "bg-primary text-white"
                        : inverted
                          ? "bg-surface-elevated border-2 border-border hover:bg-surface-inverse"
                          : "bg-surface-primary border-2 border-border hover:bg-muted"
                    )}
                    aria-current={activeRoute === item.id ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={clsx(
                        "px-1.5 py-0.5 text-xs rounded-badge font-medium",
                        activeRoute === item.id
                          ? "bg-white/20 text-white"
                          : inverted ? "bg-surface-elevated text-text-secondary" : "bg-muted text-text-disabled"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </nav>

            {/* Main Content */}
            <main
              id={mainContentId}
              className="flex-1 min-w-0"
              tabIndex={-1}
              role="main"
              aria-label="Portal content"
            >
              {mainContent}
            </main>
          </div>
        </div>

        {/* Footer */}
        <footer className={clsx("mt-auto border-t-2 py-6", headerBgClass)}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className={clsx("text-xs", mutedTextClass)}>
                {copyright || `© ${new Date().getFullYear()} ${organizationName}. All rights reserved.`}
              </p>
              <div className="flex items-center gap-4">
                {footerLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={link.onClick}
                    className={clsx(
                      "text-xs transition-colors",
                      inverted
                        ? "text-text-muted hover:text-white"
                        : "text-text-disabled hover:text-text-primary"
                    )}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }
);

export default ClientPortalShell;
