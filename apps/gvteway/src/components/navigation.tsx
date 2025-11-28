"use client";

import { usePathname } from "next/navigation";
import { gvtewayNavigation, gvtewayCreatorNavigation, gvtewayMembershipNavigation } from "../data/gvteway";
import { AppNavigation, UnifiedHeader, Link } from "@ghxstship/ui";
import type { ContextLevel } from "@ghxstship/ui";

// =============================================================================
// MEMBERSHIP NAVIGATION (Landing Page)
// =============================================================================

/**
 * MembershipNavigationPublic - Membership landing page navigation
 * Minimal, floating navigation for the exclusive membership landing page
 */
export function MembershipNavigationPublic() {
  const pathname = usePathname();

  return (
    <AppNavigation
      logo="GVTEWAY"
      navItems={gvtewayMembershipNavigation}
      pathname={pathname}
      primaryCta={{ label: "Apply Now", href: "/apply" }}
      secondaryCta={{ label: "Sign In", href: "/auth/signin" }}
      colorScheme="black"
    />
  );
}

// =============================================================================
// CONSUMER NAVIGATION
// =============================================================================

/**
 * ConsumerNavigationPublic - Public consumer-facing pages (/experiences, /events, etc.)
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
 * ConsumerNavigationAuthenticated - Logged-in member pages (experiences, profile, etc.)
 * Uses UnifiedHeader with user context for member experience management
 */
export function ConsumerNavigationAuthenticated({
  contextLevels = [],
  userMenu,
}: {
  contextLevels?: ContextLevel[];
  userMenu?: React.ReactNode;
}) {
  const pathname = usePathname();

  // Member-focused navigation
  const navItems = [
    { label: "Experiences", href: "/experiences" },
    { label: "My Access", href: "/tickets" },
    { label: "Community", href: "/community" },
    { label: "Membership", href: "/membership" },
  ];

  return (
    <UnifiedHeader
      logo={
        <Link href="/experiences" className="font-display text-h5-md uppercase tracking-tight text-white">
          GVTEWAY
        </Link>
      }
      contextLevels={contextLevels}
      navItems={navItems}
      pathname={pathname}
      primaryCta={{ label: "Browse Experiences", href: "/experiences" }}
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
        <Link href="/dashboard" className="font-display text-h5-md uppercase tracking-tight text-white">
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
