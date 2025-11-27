"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { ContextBreadcrumb } from "../molecules/context-breadcrumb.js";
import type { ContextLevel } from "../molecules/context-breadcrumb.js";

/**
 * UnifiedHeader - Combines context breadcrumb navigation with app header
 * Provides Vercel-style navigation with organization/project/activation switching
 */

export type NavItem = {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
};

export type UnifiedHeaderProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  /** Application logo */
  logo: ReactNode;
  /** Context levels for breadcrumb navigation */
  contextLevels?: ContextLevel[];
  /** Secondary navigation items (right side) */
  navItems?: NavItem[];
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

export const UnifiedHeader = forwardRef<HTMLElement, UnifiedHeaderProps>(
  function UnifiedHeader(
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
            "sticky top-0 z-50 border-b-2",
            inverted
              ? "bg-black border-grey-800"
              : "bg-white border-grey-200",
            className
          )}
          {...props}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-4">
              {/* Left: Logo + Context Breadcrumb */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Logo */}
                <div className="flex-shrink-0">{logo}</div>

                {/* Context Breadcrumb (hidden on mobile) */}
                {contextLevels.length > 0 && (
                  <div className="hidden md:flex items-center">
                    <span className={clsx(
                      "mx-3 text-body-sm",
                      inverted ? "text-grey-600" : "text-grey-300"
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
                        "flex items-center gap-2 px-3 py-2 text-body-sm font-medium rounded transition-colors",
                        isActive(item.href)
                          ? inverted
                            ? "bg-grey-800 text-white"
                            : "bg-grey-100 text-black"
                          : inverted
                            ? "text-grey-400 hover:text-white hover:bg-grey-800"
                            : "text-grey-600 hover:text-black hover:bg-grey-100"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className={clsx(
                          "px-1.5 py-0.5 text-micro font-mono rounded",
                          inverted ? "bg-grey-700 text-grey-300" : "bg-grey-200 text-grey-600"
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
                      "hidden sm:flex items-center px-4 py-2 text-body-sm font-medium transition-colors",
                      inverted
                        ? "bg-white text-black hover:bg-grey-100"
                        : "bg-black text-white hover:bg-grey-900"
                    )}
                  >
                    {primaryCta.label}
                  </a>
                )}

                {/* User Menu */}
                {userMenu && (
                  <div className="flex-shrink-0">
                    {userMenu}
                  </div>
                )}

                {/* Mobile Menu Button */}
                <button
                  type="button"
                  onClick={handleMobileToggle}
                  className={clsx(
                    "md:hidden p-2 rounded transition-colors",
                    inverted
                      ? "text-grey-400 hover:text-white hover:bg-grey-800"
                      : "text-grey-600 hover:text-black hover:bg-grey-100"
                  )}
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileMenuOpen}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
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
              "fixed inset-0 z-40 md:hidden",
              inverted ? "bg-black/95" : "bg-white/95"
            )}
          >
            <div className="flex flex-col h-full pt-20 px-6 pb-6">
              {/* Mobile Context Breadcrumb */}
              {contextLevels.length > 0 && (
                <div className={clsx(
                  "pb-4 mb-4 border-b",
                  inverted ? "border-grey-800" : "border-grey-200"
                )}>
                  <ContextBreadcrumb
                    levels={contextLevels}
                    inverted={inverted}
                    separator="/"
                  />
                </div>
              )}

              {/* Mobile Nav Items */}
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={handleMobileClose}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3 text-body-lg font-medium rounded transition-colors",
                      isActive(item.href)
                        ? inverted
                          ? "bg-grey-800 text-white"
                          : "bg-grey-100 text-black"
                        : inverted
                          ? "text-grey-400 hover:text-white"
                          : "text-grey-600 hover:text-black"
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={clsx(
                        "ml-auto px-2 py-0.5 text-mono-sm rounded",
                        inverted ? "bg-grey-700 text-grey-300" : "bg-grey-200 text-grey-600"
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
                  onClick={(e) => {
                    primaryCta.onClick?.();
                    handleMobileClose();
                  }}
                  className={clsx(
                    "flex items-center justify-center px-6 py-4 text-body-lg font-medium transition-colors",
                    inverted
                      ? "bg-white text-black"
                      : "bg-black text-white"
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

export default UnifiedHeader;
