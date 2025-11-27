"use client";

import { usePathname } from "next/navigation";
import { compvssNavigation, compvssLandingNavigation } from "../data/compvss";
import { AppNavigation, UnifiedHeader, Link } from "@ghxstship/ui";
import type { ContextLevel } from "@ghxstship/ui";

// =============================================================================
// CREATOR NAVIGATION (COMPVSS is B2B - all users are "creators"/production users)
// =============================================================================

/**
 * CreatorNavigationPublic - Public marketing/landing pages
 * Uses AppNavigation with anchor links for landing page sections
 */
export function CreatorNavigationPublic() {
  const pathname = usePathname();

  return (
    <AppNavigation
      logo="COMPVSS"
      navItems={compvssLandingNavigation}
      pathname={pathname}
      primaryCta={{ label: "Get Started", href: "/auth/signup" }}
      secondaryCta={{ label: "Sign In", href: "/auth/signin" }}
      colorScheme="black"
    />
  );
}

/**
 * CreatorNavigationAuthenticated - All authenticated COMPVSS pages
 * Uses UnifiedHeader with context breadcrumbs for project/production navigation
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
    { label: "Crew", href: "/crew" },
    { label: "Schedule", href: "/schedule" },
  ];

  return (
    <UnifiedHeader
      logo={
        <Link href="/dashboard" className="font-display text-h5-md uppercase tracking-tight text-white">
          COMPVSS
        </Link>
      }
      contextLevels={contextLevels}
      navItems={navItems}
      pathname={pathname}
      primaryCta={{ label: "New Project", href: "/projects/new" }}
      userMenu={userMenu}
      inverted
    />
  );
}
