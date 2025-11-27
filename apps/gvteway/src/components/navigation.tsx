"use client";

import { usePathname } from "next/navigation";
import { gvtewayNavigation, gvtewayCreatorNavigation } from "../data/gvteway";
import { AppNavigation, UnifiedHeader, Link } from "@ghxstship/ui";
import type { ContextLevel } from "@ghxstship/ui";

// =============================================================================
// CONSUMER NAVIGATION
// =============================================================================

/**
 * ConsumerNavigationPublic - Public consumer-facing pages (/, /events, etc.)
 * Features "Create" button routing to /creators for event organizers
 */
export function ConsumerNavigationPublic() {
  const pathname = usePathname();

  return (
    <AppNavigation
      logo="GVTEWAY"
      navItems={gvtewayNavigation}
      pathname={pathname}
      primaryCta={{ label: "Create", href: "/creators" }}
      secondaryCta={{ label: "Sign In", href: "/auth/signin" }}
      colorScheme="black"
    />
  );
}

/**
 * ConsumerNavigationAuthenticated - Logged-in consumer pages (tickets, profile, etc.)
 * Uses UnifiedHeader with user context for ticket/booking management
 */
export function ConsumerNavigationAuthenticated({
  contextLevels = [],
  userMenu,
}: {
  contextLevels?: ContextLevel[];
  userMenu?: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { label: "Discover", href: "/events" },
    { label: "My Tickets", href: "/tickets" },
    { label: "Favorites", href: "/favorites" },
    { label: "Following", href: "/following" },
  ];

  return (
    <UnifiedHeader
      logo={
        <Link href="/" className="font-display text-2xl uppercase tracking-tight text-white">
          GVTEWAY
        </Link>
      }
      contextLevels={contextLevels}
      navItems={navItems}
      pathname={pathname}
      primaryCta={{ label: "Find Events", href: "/events" }}
      userMenu={userMenu}
      inverted
    />
  );
}

// =============================================================================
// CREATOR NAVIGATION
// =============================================================================

/**
 * CreatorNavigationPublic - /creators SaaS landing page
 * Marketing page for event organizers before signup
 */
export function CreatorNavigationPublic() {
  const pathname = usePathname();

  return (
    <AppNavigation
      logo="GVTEWAY"
      navItems={gvtewayCreatorNavigation}
      pathname={pathname}
      primaryCta={{ label: "Start Free", href: "/auth/signup?type=creator" }}
      secondaryCta={{ label: "Sign In", href: "/auth/signin" }}
      colorScheme="ink"
    />
  );
}

/**
 * CreatorNavigationAuthenticated - Creator dashboard pages
 * Uses UnifiedHeader with context breadcrumbs for event/venue management
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
    { label: "Events", href: "/events/manage" },
    { label: "Venues", href: "/venues/manage" },
    { label: "Analytics", href: "/analytics" },
  ];

  return (
    <UnifiedHeader
      logo={
        <Link href="/dashboard" className="font-display text-2xl uppercase tracking-tight text-white">
          GVTEWAY
        </Link>
      }
      contextLevels={contextLevels}
      navItems={navItems}
      pathname={pathname}
      primaryCta={{ label: "Create Event", href: "/events/create" }}
      userMenu={userMenu}
      inverted
    />
  );
}
