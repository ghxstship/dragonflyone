"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { atlvsLandingNavigation } from "../data/atlvs";
import { UnifiedHeader, Link, Stack, Box, Body, Button } from "@ghxstship/ui";
import type { ContextLevel } from "@ghxstship/ui";
import clsx from "clsx";

// =============================================================================
// CREATOR NAVIGATION (ATLVS is B2B - all users are "creators"/business users)
// =============================================================================

/**
 * CreatorNavigationPublic - Public marketing/landing pages
 * Custom ATLVS navigation with Miami Pink accent color
 */
export function CreatorNavigationPublic() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => 
    pathname === href || pathname.startsWith(href + "/");

  const handleToggle = () => setIsOpen(!isOpen);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <header className="sticky top-0 z-modal border-b border-ink-800 bg-ink-950/90 backdrop-blur">
        <Stack
          direction="horizontal"
          className="mx-auto max-w-6xl items-center justify-between px-6 py-6 lg:px-8"
        >
          {/* Logo */}
          <Link href="/" className="font-display text-h2-md uppercase tracking-tight text-white">
            ATLVS
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex">
            <Stack
              direction="horizontal"
              gap={8}
              className="text-mono-sm uppercase tracking-kicker text-ink-300"
            >
              {atlvsLandingNavigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={clsx(
                    "transition",
                    isActive(item.href)
                      ? "border-b-2 border-white text-white"
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
            <Link href="/auth/signup" className="hidden md:block">
              <button className="inline-flex items-center justify-center gap-2 border-2 border-white bg-white px-4 py-2 font-heading text-sm font-bold uppercase tracking-wider text-black shadow-[3px_3px_0_#FF006E] transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#FF006E] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#FF006E]">
                Get Started
              </button>
            </Link>
            <Link href="/auth/signin" className="hidden md:block">
              <Button variant="outlineInk" size="sm">
                Sign In
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="md:hidden"
              aria-label={isOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={isOpen}
              onClick={handleToggle}
            >
              <Body className="sr-only">{isOpen ? "Close navigation" : "Open navigation"}</Body>
              <Stack className="h-5 w-6 gap-1">
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
        <Stack className="fixed inset-0 z-modal-backdrop bg-ink-950/95 p-6 animate-in fade-in md:hidden">
          <Stack className="h-full justify-between pt-16">
            <Stack gap={6}>
              {atlvsLandingNavigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={clsx(
                    "block border-b border-ink-800 pb-4 text-h4-md uppercase tracking-kicker",
                    isActive(item.href) ? "text-white" : "text-ink-300"
                  )}
                  onClick={handleClose}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
            <Stack gap={4}>
              <Link href="/auth/signup" onClick={handleClose} className="block">
                <button className="inline-flex w-full items-center justify-center gap-2 border-2 border-white bg-white px-6 py-3 font-heading text-sm font-bold uppercase tracking-wider text-black shadow-[4px_4px_0_#FF006E] transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#FF006E] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#FF006E]">
                  Get Started
                </button>
              </Link>
              <Link href="/auth/signin" onClick={handleClose} className="block">
                <Button variant="outlineInk" size="md" fullWidth>
                  Sign In
                </Button>
              </Link>
            </Stack>
          </Stack>
        </Stack>
      )}
    </>
  );
}

/**
 * CreatorNavigationAuthenticated - All authenticated ATLVS pages
 * Uses UnifiedHeader with context breadcrumbs for org/project navigation
 */
export function CreatorNavigationAuthenticated({
  contextLevels = [],
  userMenu,
}: {
  contextLevels?: ContextLevel[];
  userMenu?: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Projects", href: "/projects" },
    { label: "Finance", href: "/finance" },
    { label: "Assets", href: "/assets" },
  ];

  return (
    <UnifiedHeader
      logo={
        <Link href="/dashboard" className="font-display text-h5-md uppercase tracking-tight text-white">
          ATLVS
        </Link>
      }
      contextLevels={contextLevels}
      navItems={navItems}
      pathname={pathname}
      primaryCta={{ label: "New Deal", href: "/deals/new" }}
      userMenu={userMenu}
      inverted
    />
  );
}
