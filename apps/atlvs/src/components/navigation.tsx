"use client";

import { usePathname } from "next/navigation";
import { atlvsNavigation, atlvsLandingNavigation } from "../data/atlvs";
import { AppNavigation, UnifiedHeader, Link } from "@ghxstship/ui";
import type { ContextLevel } from "@ghxstship/ui";

// =============================================================================
// CREATOR NAVIGATION (ATLVS is B2B - all users are "creators"/business users)
// =============================================================================

/**
 * CreatorNavigationPublic - Public marketing/landing pages
 * Uses AppNavigation with anchor links for landing page sections
 */
export function CreatorNavigationPublic() {
  const pathname = usePathname();

  return (
    <AppNavigation
      logo="ATLVS"
      navItems={atlvsLandingNavigation}
      pathname={pathname}
      primaryCta={{ label: "Get Started", href: "/auth/signup" }}
      secondaryCta={{ label: "Sign In", href: "/auth/signin" }}
      colorScheme="ink"
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
        <Link href="/dashboard" className="font-display text-2xl uppercase tracking-tight text-white">
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
