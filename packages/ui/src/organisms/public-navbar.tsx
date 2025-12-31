"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { ContextBreadcrumb } from "../molecules/context-breadcrumb.js";
import type { ContextLevel } from "../molecules/context-breadcrumb.js";

/**
 * PublicNavbar - Bold Contemporary Pop Art Adventure
 * 
 * Top navigation bar for public/marketing pages (non-authenticated).
 * 
 * Features:
 * - Strong 2px bottom border
 * - Bold navigation with hover lift
 * - Primary CTA with hard offset shadow
 * - Clear visual hierarchy
 * - Context breadcrumb support
 * 
 * Use cases:
 * - Landing pages
 * - Marketing pages
 * - Public-facing authenticated pages (e.g., creator dashboard header)
 * 
 * For authenticated app shell navigation, use AppNavbar instead.
 */

export type PublicNavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
};

export type PublicNavbarProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  /** Application logo */
  logo: ReactNode;
  /** Context levels for breadcrumb navigation */
  contextLevels?: ContextLevel[];
  /** Secondary navigation items (right side) */
  navItems?: PublicNavItem[];
  /** Primary CTA button */
  primaryCta?: { label: string; href: string; onClick?: () => void };
  /** User menu content */
  userMenu?: ReactNode;
  /** Current pathname for active state */
  pathname?: string;
  /** Inverted color scheme (dark background) */
  inverted?: boolean;
  /** Callback when mobile menu state changes */
  onMobileMenuChange?: (isOpen: boolean) => void;
  /** Custom actions slot (between breadcrumb and nav) */
  actions?: ReactNode;
};

export const PublicNavbar = forwardRef<HTMLElement, PublicNavbarProps>(
  function PublicNavbar(
    {
      logo,
      contextLevels = [],
      navItems = [],
      primaryCta,
      userMenu,
      pathname = "",
      inverted = true,
      onMobileMenuChange,
      actions,
      className,
      ...props
    },
    ref
  ) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleMobileToggle = () => {
      const newState = !mobileMenuOpen;
      setMobileMenuOpen(newState);
      onMobileMenuChange?.(newState);
    };

    const handleMobileClose = () => {
      setMobileMenuOpen(false);
      onMobileMenuChange?.(false);
    };

    const isActive = (href: string) =>
      pathname === href || pathname.startsWith(href + "/");

    return (
      <>
        <header
          ref={ref}
          className={clsx(
            "sticky top-0 z-modal border-b-2",
            inverted
              ? "border-ink-800 bg-ink-950"
              : "border-grey-200 bg-white",
            className
          )}
          {...props}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-4">
              {/* Left: Logo + Context Breadcrumb */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Logo */}
                <div className="shrink-0">{logo}</div>

                {/* Context Breadcrumb (hidden on mobile) */}
                {contextLevels.length > 0 && (
                  <div className="hidden md:flex items-center">
                    <span className={clsx(
                      "mx-3 text-sm",
                      inverted ? "text-on-dark-disabled" : "text-on-light-secondary"
                    )}>
                      /
                    </span>
                    <ContextBreadcrumb
                      levels={contextLevels}
                      inverted={inverted}
                      separator="/"
                    />
                  </div>
                )}
              </div>

              {/* Center: Actions (optional) */}
              {actions && (
                <div className="hidden lg:flex items-center">
                  {actions}
                </div>
              )}

              {/* Right: Nav Items + CTA + User Menu */}
              <div className="flex items-center gap-2">
                {/* Desktop Nav Items */}
                <nav className="hidden md:flex items-center gap-1">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 text-sm font-medium",
                        "rounded-[var(--radius-button)] border-2",
                        "transition-all duration-100 ease-[var(--ease-bounce)]",
                        isActive(item.href)
                          ? inverted
                            ? "bg-white text-black border-white shadow-[2px_2px_0_hsl(var(--primary))]"
                            : "bg-black text-white border-black shadow-[2px_2px_0_hsl(var(--primary))]"
                          : inverted
                            ? clsx(
                                "text-on-dark-muted border-transparent",
                                "hover:text-white hover:bg-grey-800 hover:border-grey-700",
                                "hover:-translate-x-0.5 hover:-translate-y-0.5"
                              )
                            : clsx(
                                "text-on-dark-disabled border-transparent",
                                "hover:text-black hover:bg-grey-100 hover:border-grey-200",
                                "hover:-translate-x-0.5 hover:-translate-y-0.5"
                              )
                      )}
                    >
                      {item.icon}
                      <span className="uppercase tracking-wider">{item.label}</span>
                      {item.badge && (
                        <span className={clsx(
                          "px-1.5 py-0.5 text-xs font-mono rounded-[var(--radius-badge)] border",
                          inverted ? "bg-grey-700 text-on-dark-secondary border-grey-600" : "bg-grey-200 text-on-dark-disabled border-grey-300"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </a>
                  ))}
                </nav>

                {/* Primary CTA */}
                {primaryCta && (
                  <a
                    href={primaryCta.href}
                    onClick={primaryCta.onClick}
                    className={clsx(
                      "hidden sm:flex items-center px-4 py-2 text-sm font-bold uppercase tracking-wider",
                      "border-2 rounded-[var(--radius-button)]",
                      "transition-all duration-100 ease-[var(--ease-bounce)]",
                      "hover:-translate-x-0.5 hover:-translate-y-0.5",
                      "active:translate-x-0 active:translate-y-0",
                      inverted
                        ? "bg-white text-black border-white shadow-[3px_3px_0_hsl(var(--primary))] hover:shadow-[4px_4px_0_hsl(var(--primary))]"
                        : "bg-black text-white border-black shadow-[3px_3px_0_hsl(var(--primary))] hover:shadow-[4px_4px_0_hsl(var(--primary))]"
                    )}
                  >
                    {primaryCta.label}
                  </a>
                )}

                {/* User Menu */}
                {userMenu && (
                  <div className="shrink-0">
                    {userMenu}
                  </div>
                )}

                {/* Mobile Menu Button */}
                <button
                  type="button"
                  onClick={handleMobileToggle}
                  className={clsx(
                    "md:hidden p-2 border-2 rounded-[var(--radius-button)]",
                    "transition-all duration-100",
                    "hover:-translate-x-0.5 hover:-translate-y-0.5",
                    inverted
                      ? "text-on-dark-muted border-grey-700 hover:text-white hover:bg-grey-800 hover:shadow-[2px_2px_0_rgba(255,255,255,0.1)]"
                      : "text-on-dark-disabled border-grey-300 hover:text-black hover:bg-grey-100 hover:shadow-[2px_2px_0_rgba(0,0,0,0.1)]"
                  )}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileMenuOpen}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    {mobileMenuOpen ? (
                      <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className={clsx(
              "fixed inset-0 z-modal-backdrop animate-fade-in md:hidden",
              inverted ? "bg-ink-950/95" : "bg-white/95"
            )}
          >
            <div className="flex flex-col h-full pt-20 px-6 pb-6">
              {/* Mobile Context Breadcrumb */}
              {contextLevels.length > 0 && (
                <div className={clsx(
                  "mb-4 border-b-2 pb-4",
                  inverted ? "border-ink-800" : "border-grey-200"
                )}>
                  <ContextBreadcrumb
                    levels={contextLevels}
                    inverted={inverted}
                    separator="/"
                  />
                </div>
              )}

              {/* Mobile Nav Items */}
              <nav className="flex-1 space-y-2">
                {navItems.map((item, index) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={handleMobileClose}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3 text-lg font-bold uppercase tracking-wider",
                      "border-2 rounded-[var(--radius-button)]",
                      "transition-all duration-100",
                      "animate-slide-up-bounce",
                      isActive(item.href)
                        ? inverted
                          ? "bg-white text-black border-white shadow-[3px_3px_0_hsl(var(--primary))]"
                          : "bg-black text-white border-black shadow-[3px_3px_0_hsl(var(--primary))]"
                        : inverted
                          ? "text-on-dark-muted border-grey-700 hover:text-white hover:bg-grey-800"
                          : "text-on-dark-disabled border-grey-200 hover:text-black hover:bg-grey-100"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={clsx(
                        "ml-auto px-2 py-0.5 text-sm font-mono rounded-[var(--radius-badge)] border",
                        inverted ? "bg-grey-700 text-on-dark-secondary border-grey-600" : "bg-grey-200 text-on-dark-disabled border-grey-300"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </a>
                ))}
              </nav>

              {/* Mobile CTA */}
              {primaryCta && (
                <a
                  href={primaryCta.href}
                  onClick={(_e) => {
                    primaryCta.onClick?.();
                    handleMobileClose();
                  }}
                  className={clsx(
                    "flex items-center justify-center px-6 py-4 text-lg font-bold uppercase tracking-wider",
                    "border-2 rounded-[var(--radius-button)]",
                    "transition-all duration-100",
                    "hover:-translate-x-0.5 hover:-translate-y-0.5",
                    inverted
                      ? "bg-white text-black border-white shadow-[4px_4px_0_hsl(var(--primary))]"
                      : "bg-black text-white border-black shadow-[4px_4px_0_hsl(var(--primary))]"
                  )}
                >
                  {primaryCta.label}
                </a>
              )}
            </div>
          </div>
        )}
      </>
    );
  }
);

export default PublicNavbar;
