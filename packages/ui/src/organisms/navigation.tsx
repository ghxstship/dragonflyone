"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

export type NavigationProps = HTMLAttributes<HTMLElement> & {
  logo?: ReactNode;
  children?: ReactNode;
  cta?: ReactNode;
  fixed?: boolean;
  inverted?: boolean;
};

/**
 * Navigation component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold 2px bottom border
 * - Slide-in mobile menu
 * - Bold mobile menu button with hover lift
 */
export const Navigation = forwardRef<HTMLElement, NavigationProps>(
  function Navigation({ logo, children, cta, fixed, inverted, className, ...props }, ref) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
      <>
        <nav
          ref={ref}
          className={clsx(
            "w-full border-b-2 transition-colors",
            fixed && "fixed top-0 left-0 right-0 z-fixed",
            inverted ? "bg-black border-grey-800" : "bg-white border-black",
            className
          )}
          {...props}
        >
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16 md:h-20">
              {logo && (
                <div className="shrink-0">
                  {logo}
                </div>
              )}

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
                {children}
              </div>

              {cta && (
                <div className="hidden md:block shrink-0">
                  {cta}
                </div>
              )}

              {/* Mobile Menu Button - Bold Contemporary Style */}
              <button
                type="button"
                className={clsx(
                  "md:hidden p-2 border-2 rounded-[var(--radius-button)]",
                  "transition-all duration-100 ease-[var(--ease-bounce)]",
                  "hover:-translate-x-0.5 hover:-translate-y-0.5",
                  inverted 
                    ? "text-white border-grey-700 hover:border-grey-500 shadow-[2px_2px_0_rgba(255,255,255,0.1)] hover:shadow-[3px_3px_0_rgba(255,255,255,0.15)]" 
                    : "text-black border-black shadow-[2px_2px_0_rgba(0,0,0,0.1)] hover:shadow-[3px_3px_0_rgba(0,0,0,0.15)]"
                )}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  {mobileOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation - Slide In */}
        {mobileOpen && (
          <div
            className={clsx(
              "md:hidden fixed inset-0 z-sticky pt-16 animate-fade-in",
              inverted ? "bg-black" : "bg-white"
            )}
          >
            <div className="flex flex-col gap-6 p-8">
              {children}
              {cta && <div className="mt-4">{cta}</div>}
            </div>
          </div>
        )}
      </>
    );
  }
);

export type NavLinkProps = HTMLAttributes<HTMLAnchorElement> & {
  href: string;
  active?: boolean;
  inverted?: boolean;
};

/**
 * NavLink component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold typography
 * - Active state with thick underline
 * - Hover lift effect
 */
export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  function NavLink({ href, active, inverted, className, children, ...props }, ref) {
    return (
      <a
        ref={ref}
        href={href}
        className={clsx(
          "font-heading text-sm uppercase tracking-wider font-bold",
          "transition-all duration-100 ease-[var(--ease-bounce)]",
          "hover:-translate-y-0.5",
          active && "border-b-2",
          inverted 
            ? clsx("text-white", active ? "border-white" : "hover:text-grey-300") 
            : clsx("text-black", active ? "border-black" : "hover:text-grey-600"),
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);
