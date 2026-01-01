"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { atlvsLandingNavigation } from "../data/atlvs";
import {
  productsNavigation,
  solutionsNavigation,
  resourcesNavigation,
} from "../data/public-navigation";
import {
  Body,
  Box,
  Button,
  Grid,
  Header,
  Link,
  Nav,
  Stack,
  Text,
  PublicNavbar,
} from '@ghxstship/ui';
import type { ContextLevel } from "@ghxstship/ui";
import clsx from "clsx";
import { ChevronDown, ChevronRight, Briefcase, Users, Ticket } from "lucide-react";

// =============================================================================
// CREATOR NAVIGATION (ATLVS is B2B - all users are "creators"/business users)
// =============================================================================

/**
 * CreatorNavigationPublic - Public marketing/landing pages
 * Custom ATLVS navigation with Miami Pink accent color and mega-menu dropdowns
 */
export function CreatorNavigationPublic() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);

  const isActive = (href: string) => 
    pathname === href || pathname.startsWith(href + "/");

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setMobileSubmenu(null);
  };
  const handleClose = () => {
    setIsOpen(false);
    setMobileSubmenu(null);
  };

  const handleMouseEnter = (menu: string) => setActiveMenu(menu);
  const handleMouseLeave = () => setActiveMenu(null);

  const productIcons = {
    command: Briefcase,
    users: Users,
    ticket: Ticket,
  };

  return (
    <>
      <Header className="sticky top-0 z-modal border-b border-ink-800 bg-ink-950/90 backdrop-blur">
        <Stack
          direction="horizontal"
          className="mx-auto max-w-7xl items-center justify-between px-4 py-4 sm:px-4 sm:px-6 lg:px-8"
        >
          {/* Logo */}
          <Link href="/" className="font-display text-h3-md uppercase text-white sm:text-h2-md">
            ATLVS
          </Link>

          {/* Desktop Navigation with Mega-Menus */}
          <Nav className="hidden lg:flex items-center gap-1">
            {/* Products Dropdown */}
            <Box
              className="relative"
              onMouseEnter={() => handleMouseEnter("products")}
              onMouseLeave={handleMouseLeave}
            >
              <Button variant="ghost" size="sm" inverted className="font-mono text-mono-sm uppercase tracking-kicker text-ink-300 hover:text-white">
                Products
                <ChevronDown className={clsx("h-4 w-4 chevron-toggle", activeMenu === "products" && "open")} />
              </Button>

              {activeMenu === "products" && (
                <Box className="absolute left-0 top-full pt-2 z-50">
                  <Box className="border-2 border-ink-800 bg-ink-950 shadow-xl min-w-dropdown-md p-6">
                    <Grid cols={3} gap={6}>
                      {productsNavigation.products.map((product) => {
                        const IconComponent = productIcons[product.icon as keyof typeof productIcons] || Briefcase;
                        return (
                          <Link
                            key={product.href}
                            href={product.href}
                            className="group p-4 border-2 border-transparent hover:border-ink-700 bg-ink-900/50 hover:bg-ink-900 transition-all"
                          >
                            <Stack direction="horizontal" gap={3} className="items-start">
                              <Box className="p-2 border-2 border-ink-700 bg-ink-800 shrink-0">
                                <IconComponent className="h-5 w-5 text-brand-pink" />
                              </Box>
                              <Stack gap={1}>
                                <Text className="font-display text-h6-md uppercase text-white">{product.label}</Text>
                                <Text className="font-mono text-mono-xs uppercase tracking-kicker text-brand-pink">{product.tagline}</Text>
                                <Body className="text-body-sm text-on-dark-muted mt-1">{product.description}</Body>
                              </Stack>
                            </Stack>
                          </Link>
                        );
                      })}
                    </Grid>

                    <Box className="mt-6 pt-4 border-t border-ink-800">
                      <Text className="font-mono text-mono-xs uppercase tracking-kicker text-on-dark-disabled mb-2">Platform</Text>
                      <Stack direction="horizontal" gap={6}>
                        {productsNavigation.quickLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="font-mono text-mono-sm nav-link-inverted"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Solutions Dropdown */}
            <Box
              className="relative"
              onMouseEnter={() => handleMouseEnter("solutions")}
              onMouseLeave={handleMouseLeave}
            >
              <Button variant="ghost" size="sm" inverted className="font-mono text-mono-sm uppercase tracking-kicker text-ink-300 hover:text-white">
                Solutions
                <ChevronDown className={clsx("h-4 w-4 chevron-toggle", activeMenu === "solutions" && "open")} />
              </Button>

              {activeMenu === "solutions" && (
                <Box className="absolute left-0 top-full pt-2 z-50">
                  <Box className="border-2 border-ink-800 bg-ink-950 shadow-xl min-w-dropdown-lg p-6">
                    <Text className="font-mono text-mono-xs uppercase tracking-kicker text-on-dark-disabled mb-4">Solutions by Role</Text>
                    <Grid cols={3} className="gap-x-8 gap-y-4">
                      {solutionsNavigation.groups.map((group) => (
                        <Stack key={group.title} gap={2}>
                          <Text className="font-display text-h6-md uppercase text-white">{group.title}</Text>
                          <Stack gap={1}>
                            {group.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="font-mono text-mono-sm text-on-dark-muted hover:text-white block"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </Stack>
                        </Stack>
                      ))}
                    </Grid>

                    <Box className="mt-6 pt-4 border-t border-ink-800">
                      <Text className="font-mono text-mono-xs uppercase tracking-kicker text-on-dark-disabled mb-2">By Vertical</Text>
                      <Stack direction="horizontal" gap={6}>
                        {solutionsNavigation.verticals.map((vertical) => (
                          <Link
                            key={vertical.href}
                            href={vertical.href}
                            className="font-mono text-mono-sm text-on-dark-muted hover:text-white"
                          >
                            {vertical.label}
                          </Link>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Resources Dropdown */}
            <Box
              className="relative"
              onMouseEnter={() => handleMouseEnter("resources")}
              onMouseLeave={handleMouseLeave}
            >
              <Button variant="ghost" size="sm" inverted className="font-mono text-mono-sm uppercase tracking-kicker text-ink-300 hover:text-white">
                Resources
                <ChevronDown className={clsx("h-4 w-4 chevron-toggle", activeMenu === "resources" && "open")} />
              </Button>

              {activeMenu === "resources" && (
                <Box className="absolute left-0 top-full pt-2 z-50">
                  <Box className="border-2 border-ink-800 bg-ink-950 shadow-xl min-w-dropdown-sm p-6">
                    <Grid cols={3} gap={8}>
                      {resourcesNavigation.groups.map((group) => (
                        <Stack key={group.title} gap={3}>
                          <Text className="font-display text-h6-md uppercase text-white">{group.title}</Text>
                          <Stack gap={2}>
                            {group.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="font-mono text-mono-sm text-on-dark-muted hover:text-white block"
                              >
                                {item.label}
                              </Link>
                            ))}
                          </Stack>
                        </Stack>
                      ))}
                    </Grid>

                    <Box className="mt-6 pt-4 border-t border-ink-800">
                      <Text className="font-mono text-mono-xs uppercase tracking-kicker text-on-dark-disabled mb-2">Featured</Text>
                      <Stack direction="horizontal" gap={6}>
                        {resourcesNavigation.featured.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="font-mono text-mono-sm text-brand-pink hover:text-white"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Pricing (no dropdown) */}
            <Link href="/pricing">
              <Button variant="ghost" size="sm" inverted className="font-mono text-mono-sm uppercase tracking-kicker text-ink-300 hover:text-white">
                Pricing
              </Button>
            </Link>
          </Nav>

          {/* Tablet/Simple Navigation (hidden on lg+) */}
          <Nav className="hidden md:flex lg:hidden">
            <Stack
              direction="horizontal"
              gap={6}
              className="font-mono text-mono-sm uppercase tracking-kicker text-ink-300"
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
          </Nav>

          {/* Desktop CTAs + Mobile Toggle */}
          <Stack direction="horizontal" gap={3} className="items-center">
            <Link href="/auth/signup" className="hidden md:block">
              <Button variant="solid" size="sm" inverted>
                Get Started
              </Button>
            </Link>
            <Link href="/auth/signin" className="hidden md:block">
              <Button variant="outline" size="sm" inverted>
                Sign In
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              inverted
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
                      "block h-0.5 w-full bg-white transition-transform",
                      isOpen && idx === 1 ? "opacity-0" : "opacity-100",
                      isOpen && idx !== 1
                        ? idx === 0
                          ? "translate-y-2 rotate-45"
                          : "-translate-y-2 -rotate-45"
                        : ""
                    )}
                  />
                ))}
              </Stack>
            </Button>
          </Stack>
        </Stack>
      </Header>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <Stack className="fixed inset-0 z-modal-backdrop bg-ink-950/95 p-4 animate-in fade-in sm:p-6 md:hidden overflow-y-auto">
          <Stack className="min-h-full justify-between pt-20 pb-8">
            <Stack gap={4}>
              {/* Products */}
              <Box className="border-b border-ink-800 pb-4">
                <Button
                  variant="ghost"
                  inverted
                  fullWidth
                  onClick={() => setMobileSubmenu(mobileSubmenu === "products" ? null : "products")}
                  className="justify-between text-h4-md uppercase tracking-kicker"
                >
                  Products
                  <ChevronRight className={clsx("h-5 w-5 chevron-toggle-90", mobileSubmenu === "products" && "open")} />
                </Button>
                {mobileSubmenu === "products" && (
                  <Stack gap={2} className="mt-4 pl-4">
                    {productsNavigation.products.map((product) => (
                      <Link
                        key={product.href}
                        href={product.href}
                        onClick={handleClose}
                        className="text-body-md text-on-dark-secondary hover:text-white"
                      >
                        {product.label}
                        <Text className="font-mono text-mono-xs text-on-dark-disabled ml-2">{product.tagline}</Text>
                      </Link>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Solutions */}
              <Box className="border-b border-ink-800 pb-4">
                <Button
                  variant="ghost"
                  inverted
                  fullWidth
                  onClick={() => setMobileSubmenu(mobileSubmenu === "solutions" ? null : "solutions")}
                  className="justify-between text-h4-md uppercase tracking-kicker"
                >
                  Solutions
                  <ChevronRight className={clsx("h-5 w-5 chevron-toggle-90", mobileSubmenu === "solutions" && "open")} />
                </Button>
                {mobileSubmenu === "solutions" && (
                  <Stack gap={4} className="mt-4 pl-4">
                    {solutionsNavigation.groups.map((group) => (
                      <Stack key={group.title} gap={2}>
                        <Text className="font-mono text-mono-xs uppercase tracking-kicker text-on-dark-disabled">{group.title}</Text>
                        <Stack gap={1}>
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={handleClose}
                              className="text-body-sm text-on-dark-secondary hover:text-white"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Resources */}
              <Box className="border-b border-ink-800 pb-4">
                <Button
                  variant="ghost"
                  inverted
                  fullWidth
                  onClick={() => setMobileSubmenu(mobileSubmenu === "resources" ? null : "resources")}
                  className="justify-between text-h4-md uppercase tracking-kicker"
                >
                  Resources
                  <ChevronRight className={clsx("h-5 w-5 chevron-toggle-90", mobileSubmenu === "resources" && "open")} />
                </Button>
                {mobileSubmenu === "resources" && (
                  <Stack gap={4} className="mt-4 pl-4">
                    {resourcesNavigation.groups.map((group) => (
                      <Stack key={group.title} gap={2}>
                        <Text className="font-mono text-mono-xs uppercase tracking-kicker text-on-dark-disabled">{group.title}</Text>
                        <Stack gap={1}>
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={handleClose}
                              className="text-body-sm text-on-dark-secondary hover:text-white"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Pricing */}
              <Link
                href="/pricing"
                onClick={handleClose}
                className="block border-b border-ink-800 pb-4 text-h4-md uppercase tracking-kicker text-white"
              >
                Pricing
              </Link>
            </Stack>

            <Stack gap={4} className="mt-8">
              <Link href="/auth/signup" onClick={handleClose} className="block">
                <Button variant="solid" size="md" inverted fullWidth>
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/signin" onClick={handleClose} className="block">
                <Button variant="outline" size="md" inverted fullWidth>
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
    <PublicNavbar
      logo={
        <Link href="/dashboard" className="font-display text-h5-md uppercase text-white">
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
