"use client";

import { usePathname } from "next/navigation";
import {
  Button,
  Link,
  PublicNavbar,
} from '@ghxstship/ui';
import type { ContextLevel } from "@ghxstship/ui";

/**
 * CreatorNavigationPublic - Public marketing/landing pages
 * Uses PublicNavbar with ATLVS branding and all required navigation items
 */
export function CreatorNavigationPublic() {
  const pathname = usePathname();

  // Navigation items for PublicNavbar
  const navItems = [
    { label: "Products", href: "/products" },
    { label: "Solutions", href: "/solutions" },
    { label: "Resources", href: "/resources" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <PublicNavbar
      logo={
        <Link href="/" className="font-display text-h2-md uppercase text-text-primary">
          ATLVS
        </Link>
      }
      navItems={navItems}
      pathname={pathname}
      primaryCta={{
        label: "Get Started",
        href: "/auth/signup"
      }}
      // Add Sign In as a secondary action
      actions={
        <Link href="/auth/signin" className="hidden md:block">
          <Button variant="outline" size="sm" inverted>
            Sign In
          </Button>
        </Link>
      }
      inverted={true}
    />
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
  // TODO: Implement contextLevels functionality in future iteration
  void contextLevels;
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
        <Link href="/dashboard" className="font-display text-h5-md uppercase text-text-primary">
          ATLVS
        </Link>
      }
      navItems={navItems}
      pathname={pathname}
      primaryCta={{ label: "New Deal", href: "/deals/new" }}
      userMenu={userMenu}
      inverted
    />
  );
}
