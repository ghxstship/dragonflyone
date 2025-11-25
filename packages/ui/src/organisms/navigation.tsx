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

export const Navigation = forwardRef<HTMLElement, NavigationProps>(
  function Navigation({ logo, children, cta, fixed, inverted, className, ...props }, ref) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
      <>
        <nav
          ref={ref}
          className={clsx(
            "w-full border-b-2 transition-colors",
            fixed && "fixed top-0 left-0 right-0 z-[1200]",
            inverted ? "bg-black border-white" : "bg-white border-black",
            className
          )}
          {...props}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 md:h-20">
              {logo ? (
                <div className="flex-shrink-0">
                  {logo}
                </div>
              ) : null}

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
                {children}
              </div>

              {cta ? (
                <div className="hidden md:block flex-shrink-0">
                  {cta}
                </div>
              ) : null}

              {/* Mobile Menu Button */}
              <button
                type="button"
                className={clsx(
                  "md:hidden p-2",
                  inverted ? "text-white" : "text-black"
                )}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

        {/* Mobile Navigation */}
        {mobileOpen ? (
          <div
            className={clsx(
              "md:hidden fixed inset-0 z-[1100] pt-16",
              inverted ? "bg-black" : "bg-white"
            )}
          >
            <div className="flex flex-col gap-4 p-8">
              {children}
              {cta ? <div className="mt-4">{cta}</div> : null}
            </div>
          </div>
        ) : null}
      </>
    );
  }
);

export type NavLinkProps = HTMLAttributes<HTMLAnchorElement> & {
  href: string;
  active?: boolean;
  inverted?: boolean;
};

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  function NavLink({ href, active, inverted, className, children, ...props }, ref) {
    return (
      <a
        ref={ref}
        href={href}
        className={clsx(
          "font-heading text-[1rem] uppercase tracking-wider transition-colors",
          "hover:opacity-70",
          active && "border-b-2",
          inverted ? "text-white border-white" : "text-black border-black",
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);
