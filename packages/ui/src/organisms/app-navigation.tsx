"use client";

import { forwardRef, useState } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { Stack } from "../foundations/layout.js";
import { Box } from "../foundations/semantic.js";
import { Body } from "../atoms/typography.js";
import { Button } from "../atoms/button.js";
import { Link } from "../atoms/link.js";

export type NavItem = {
  label: string;
  href: string;
};

export type AppNavigationProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** Application name displayed as logo */
  logo: string;
  /** Navigation items */
  navItems: NavItem[];
  /** Primary CTA button */
  primaryCta?: { label: string; href: string };
  /** Secondary CTA button */
  secondaryCta?: { label: string; href: string };
  /** Current pathname for active state detection */
  pathname?: string;
  /** Color scheme */
  colorScheme?: "ink" | "black";
  /** Custom logo component */
  logoComponent?: ReactNode;
  /** Callback when mobile menu state changes */
  onMobileMenuChange?: (isOpen: boolean) => void;
};

/**
 * AppNavigation - Unified navigation component for ATLVS, COMPVSS, and GVTEWAY
 * Features sticky header, mobile hamburger menu, and active link detection
 */
export const AppNavigation = forwardRef<HTMLElement, AppNavigationProps>(
  function AppNavigation(
    {
      logo,
      navItems,
      primaryCta,
      secondaryCta,
      pathname = "",
      colorScheme = "ink",
      logoComponent,
      onMobileMenuChange,
      className,
      ...props
    },
    ref
  ) {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
      const newState = !isOpen;
      setIsOpen(newState);
      onMobileMenuChange?.(newState);
    };

    const handleClose = () => {
      setIsOpen(false);
      onMobileMenuChange?.(false);
    };

    const isActive = (href: string) => 
      pathname === href || pathname.startsWith(href + "/");

    const bgClass = colorScheme === "black" ? "bg-black/90" : "bg-ink-950/90";
    const borderClass = colorScheme === "black" ? "border-grey-800" : "border-ink-800";
    const textClass = colorScheme === "black" ? "text-grey-300" : "text-ink-300";
    const overlayBgClass = colorScheme === "black" ? "bg-black/95" : "bg-ink-950/95";

    return (
      <>
        <header
          ref={ref}
          className={clsx(
            "sticky top-0 z-modal border-b backdrop-blur",
            bgClass,
            borderClass,
            className
          )}
          {...props}
        >
          <Stack
            direction="horizontal"
            className="mx-auto max-w-6xl items-center justify-between px-spacing-6 py-spacing-6 lg:px-spacing-8"
          >
            {/* Logo */}
            {logoComponent || (
              <Link href="/" className="font-display text-h2-md uppercase tracking-tight text-white">
                {logo}
              </Link>
            )}

            {/* Desktop Navigation */}
            <nav className="hidden md:flex">
              <Stack
                direction="horizontal"
                gap={8}
                className={clsx("text-mono-sm uppercase tracking-kicker", textClass)}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={clsx(
                      "transition",
                      isActive(item.href)
                        ? "text-white border-b-2 border-white"
                        : "hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
            </nav>

            {/* Desktop CTAs + Mobile Toggle */}
            <Stack direction="horizontal" gap={3} className="items-center">
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className="hidden md:inline-flex border border-white px-spacing-6 py-spacing-2 text-mono-xs uppercase tracking-kicker transition hover:-translate-y-0.5 hover:bg-white hover:text-black"
                >
                  {primaryCta.label}
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className={clsx(
                    "hidden md:inline-flex border px-spacing-6 py-spacing-2 text-mono-xs uppercase tracking-kicker transition hover:border-white hover:text-white",
                    colorScheme === "black" ? "border-grey-700 text-grey-400" : "border-ink-700 text-ink-400"
                  )}
                >
                  {secondaryCta.label}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                className="md:hidden"
                aria-label={isOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={isOpen}
                onClick={handleToggle}
              >
                <Body className="sr-only">{isOpen ? "Close navigation" : "Open navigation"}</Body>
                <Stack className="h-spacing-5 w-spacing-6 gap-gap-xs">
                  {[0, 1, 2].map((idx) => (
                    <Box
                      key={idx}
                      className={clsx(
                        "block h-[2px] w-full bg-white transition-transform",
                        isOpen && idx === 1 ? "opacity-0" : "opacity-100",
                        isOpen && idx !== 1
                          ? idx === 0
                            ? "translate-y-[7px] rotate-45"
                            : "-translate-y-[7px] -rotate-45"
                          : ""
                      )}
                    />
                  ))}
                </Stack>
              </Button>
            </Stack>
          </Stack>
        </header>

        {/* Mobile Navigation Overlay */}
        {isOpen && (
          <Stack
            className={clsx(
              "fixed inset-0 z-modal-backdrop p-spacing-6 animate-in fade-in md:hidden",
              overlayBgClass
            )}
          >
            <Stack className="h-full justify-between pt-spacing-16">
              <Stack gap={6}>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={clsx(
                      "block border-b pb-spacing-4 text-h4-md uppercase tracking-kicker",
                      borderClass,
                      isActive(item.href) ? "text-white" : textClass
                    )}
                    onClick={handleClose}
                  >
                    {item.label}
                  </Link>
                ))}
              </Stack>
              <Stack gap={4}>
                {primaryCta && (
                  <Link
                    href={primaryCta.href}
                    className="block w-full border border-white px-spacing-6 py-spacing-4 text-center text-mono-xs uppercase tracking-kicker text-white"
                    onClick={handleClose}
                  >
                    {primaryCta.label}
                  </Link>
                )}
                {secondaryCta && (
                  <Link
                    href={secondaryCta.href}
                    className={clsx(
                      "block w-full border px-spacing-6 py-spacing-4 text-center text-mono-xs uppercase tracking-kicker",
                      colorScheme === "black" ? "border-grey-700 text-grey-400" : "border-ink-700 text-ink-400"
                    )}
                    onClick={handleClose}
                  >
                    {secondaryCta.label}
                  </Link>
                )}
              </Stack>
            </Stack>
          </Stack>
        )}
      </>
    );
  }
);
