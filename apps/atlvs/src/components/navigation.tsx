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
  Box,
  Button,
  Grid,
  Header,
  Link,
  Nav,
  Stack,
  Text,
  PublicNavbar,
  MegaMenu,
} from '@ghxstship/ui';
import type { ContextLevel } from "@ghxstship/ui";
import clsx from "clsx";
import { ChevronRight, Briefcase, Users, Ticket, Menu, X } from "lucide-react";

// Shared mobile navigation typography - single source of truth
const mobileNavTypography = "font-heading text-h4-md uppercase tracking-kicker";

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

  const productIcons = {
    command: Briefcase,
    users: Users,
    ticket: Ticket,
  };

  return (
    <>
      <Header className="sticky top-0 z-modal border-b border-ink-800 bg-ink-950/90 backdrop-blur">
        {/* Mobile Header - Simple left logo, right hamburger */}
        <Stack direction="horizontal" className="flex md:hidden items-center justify-between px-4 py-4">
          <Link href="/" className="font-display text-h3-md uppercase text-white">
            ATLVS
          </Link>
          <Button
            variant="outline"
            size="sm"
            inverted
            onClick={handleToggle}
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isOpen}
            className="p-2"
          >
            {isOpen ? (
              <X className="w-6 h-6" strokeWidth={2.5} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={2.5} />
            )}
          </Button>
        </Stack>

        {/* Desktop/Tablet Header */}
        <Stack
          direction="horizontal"
          className="hidden md:flex mx-auto max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
        >
          {/* Logo */}
          <Link href="/" className="font-display text-h2-md uppercase text-white">
            ATLVS
          </Link>

          {/* Desktop Navigation with Mega-Menus - Using Radix UI */}
          <MegaMenu.Root className="hidden lg:flex">
            {/* Products Dropdown */}
            <MegaMenu.Item>
              <MegaMenu.Trigger inverted>{productsNavigation.label}</MegaMenu.Trigger>
              <MegaMenu.Content size="lg" inverted>
                <Grid cols={2} gap={4}>
                  {productsNavigation.products.map((product) => {
                    const IconComponent = productIcons[product.icon as keyof typeof productIcons] || Briefcase;
                    return (
                      <MegaMenu.ItemLink
                        key={product.href}
                        href={product.href}
                        icon={<IconComponent className="h-5 w-5" />}
                        description={product.tagline}
                        inverted
                      >
                        {product.label}
                      </MegaMenu.ItemLink>
                    );
                  })}
                </Grid>

                <MegaMenu.Footer inverted>
                  <MegaMenu.Section title="Platform" inverted>
                    <Stack direction="horizontal" gap={4}>
                      {productsNavigation.quickLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="text-body-sm text-on-dark-muted hover:text-white transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </Stack>
                  </MegaMenu.Section>
                </MegaMenu.Footer>
              </MegaMenu.Content>
            </MegaMenu.Item>

            {/* Solutions Dropdown */}
            <MegaMenu.Item>
              <MegaMenu.Trigger inverted>{solutionsNavigation.label}</MegaMenu.Trigger>
              <MegaMenu.Content size="xl" inverted>
                <Text className="text-mono-xs font-weight-medium text-on-dark-disabled uppercase tracking-kicker mb-4">
                  Solutions by Role
                </Text>
                <Grid cols={3} gap={6}>
                  {solutionsNavigation.groups.map((group) => (
                    <MegaMenu.Section key={group.title} title={group.title} inverted>
                      <Stack gap={1}>
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="text-body-sm text-on-dark-muted hover:text-white transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </Stack>
                    </MegaMenu.Section>
                  ))}
                </Grid>

                <MegaMenu.Footer inverted>
                  <MegaMenu.Section title="By Vertical" inverted>
                    <Stack direction="horizontal" gap={4}>
                      {solutionsNavigation.verticals.map((vertical) => (
                        <Link
                          key={vertical.href}
                          href={vertical.href}
                          className="text-body-sm text-on-dark-muted hover:text-white transition-colors"
                        >
                          {vertical.label}
                        </Link>
                      ))}
                    </Stack>
                  </MegaMenu.Section>
                </MegaMenu.Footer>
              </MegaMenu.Content>
            </MegaMenu.Item>

            {/* Resources Dropdown */}
            <MegaMenu.Item>
              <MegaMenu.Trigger inverted>{resourcesNavigation.label}</MegaMenu.Trigger>
              <MegaMenu.Content size="lg" inverted>
                <Grid cols={3} gap={6}>
                  {resourcesNavigation.groups.map((group) => (
                    <MegaMenu.Section key={group.title} title={group.title} inverted>
                      <Stack gap={2}>
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="text-body-sm text-on-dark-muted hover:text-white transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </Stack>
                    </MegaMenu.Section>
                  ))}
                </Grid>

                <MegaMenu.Footer inverted>
                  <MegaMenu.Section title="Featured" inverted>
                    <Stack direction="horizontal" gap={4}>
                      {resourcesNavigation.featured.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="text-body-sm font-weight-medium text-brand-pink hover:text-white transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </Stack>
                  </MegaMenu.Section>
                </MegaMenu.Footer>
              </MegaMenu.Content>
            </MegaMenu.Item>

            {/* Pricing (no dropdown) */}
            <MegaMenu.Link href="/pricing" inverted>Pricing</MegaMenu.Link>
          </MegaMenu.Root>

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

          {/* Desktop CTAs */}
          <Stack direction="horizontal" gap={3} className="items-center">
            <Link href="/auth/signup">
              <Button variant="solid" size="sm" inverted>
                Get Started
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="sm" inverted>
                Sign In
              </Button>
            </Link>
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
                  className={clsx("justify-between", mobileNavTypography)}
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
                  className={clsx("justify-between", mobileNavTypography)}
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
                  className={clsx("justify-between", mobileNavTypography)}
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
                className={clsx("block border-b border-ink-800 pb-4 text-white", mobileNavTypography)}
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
