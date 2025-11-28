"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { ContextBreadcrumb } from "../molecules/context-breadcrumb.js";
import type { ContextLevel } from "../molecules/context-breadcrumb.js";

/**
 * UnifiedHeader - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Strong 2px bottom border
 * - Bold navigation with hover lift
 * - Primary CTA with hard offset shadow
 * - Clear visual hierarchy
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
            "sticky top-0 z-modal border-b-2",
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
                <div className="shrink-0">{logo}</div>

                {/* Context Breadcrumb (hidden on mobile) */}
                {contextLevels.length > 0 && (
                  <div className="hidden md:flex items-center">
                    <span className={clsx(
                      "mx-3 text-sm",
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
                        "flex items-center gap-2 px-3 py-2 text-sm font-medium",
                        "rounded-[var(--radius-button)] border-2",
                        "transition-all duration-100 ease-[var(--ease-bounce)]",
                        isActive(item.href)
                          ? inverted
                            ? "bg-white text-black border-white shadow-[2px_2px_0_hsl(239,84%,67%)]"
                            : "bg-black text-white border-black shadow-[2px_2px_0_hsl(239,84%,67%)]"
                          : inverted
                            ? clsx(
                                "text-grey-400 border-transparent",
                                "hover:text-white hover:bg-grey-800 hover:border-grey-700",
                                "hover:-translate-x-0.5 hover:-translate-y-0.5"
                              )
                            : clsx(
                                "text-grey-600 border-transparent",
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
                          inverted ? "bg-grey-700 text-grey-300 border-grey-600" : "bg-grey-200 text-grey-600 border-grey-300"
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
                        ? "bg-white text-black border-white shadow-[3px_3px_0_hsl(239,84%,67%)] hover:shadow-[4px_4px_0_hsl(239,84%,67%)]"
                        : "bg-black text-white border-black shadow-[3px_3px_0_hsl(239,84%,67%)] hover:shadow-[4px_4px_0_hsl(239,84%,67%)]"
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
                      ? "text-grey-400 border-grey-700 hover:text-white hover:bg-grey-800 hover:shadow-[2px_2px_0_rgba(255,255,255,0.1)]"
                      : "text-grey-600 border-grey-300 hover:text-black hover:bg-grey-100 hover:shadow-[2px_2px_0_rgba(0,0,0,0.1)]"
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
              "fixed inset-0 z-modal-backdrop md:hidden animate-fade-in",
              inverted ? "bg-black/95" : "bg-white/95"
            )}
          >
            <div className="flex flex-col h-full pt-20 px-6 pb-6">
              {/* Mobile Context Breadcrumb */}
              {contextLevels.length > 0 && (
                <div className={clsx(
                  "pb-4 mb-4 border-b-2",
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
                          ? "bg-white text-black border-white shadow-[3px_3px_0_hsl(239,84%,67%)]"
                          : "bg-black text-white border-black shadow-[3px_3px_0_hsl(239,84%,67%)]"
                        : inverted
                          ? "text-grey-400 border-grey-700 hover:text-white hover:bg-grey-800"
                          : "text-grey-600 border-grey-200 hover:text-black hover:bg-grey-100"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={clsx(
                        "ml-auto px-2 py-0.5 text-sm font-mono rounded-[var(--radius-badge)] border",
                        inverted ? "bg-grey-700 text-grey-300 border-grey-600" : "bg-grey-200 text-grey-600 border-grey-300"
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
                      ? "bg-white text-black border-white shadow-[4px_4px_0_hsl(239,84%,67%)]"
                      : "bg-black text-white border-black shadow-[4px_4px_0_hsl(239,84%,67%)]"
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
