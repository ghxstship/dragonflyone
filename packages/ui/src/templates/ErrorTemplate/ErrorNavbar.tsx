"use client";

import { forwardRef } from "react";
import { PublicNavbar } from "../../organisms/PublicNavbar/index.js";
import { Link } from "../../atoms/Link/index.js";

export interface ErrorNavbarProps {
  appName: string;
  homePath: string;
  showDashboard?: boolean;
  dashboardPath?: string;
  showSearch?: boolean;
  searchPath?: string;
  inverted?: boolean;
}

/**
 * ErrorNavbar - Simplified navigation for error pages
 * 
 * Provides consistent, minimal navigation across all error states.
 * Removes complex features like mega-menus, user menus, and context breadcrumbs.
 * Focuses on essential navigation: Home, Dashboard (if applicable), Search.
 */
export const ErrorNavbar = forwardRef<HTMLElement, ErrorNavbarProps>(
  function ErrorNavbar(
    {
      appName,
      homePath,
      showDashboard = false,
      dashboardPath = "/dashboard",
      showSearch = false,
      searchPath = "/search",
      inverted = true,
      ...props
    },
    ref
  ) {
    // Build minimal navigation items for error context
    const navItems = [];
    
    if (showDashboard) {
      navItems.push({ label: "Dashboard", href: dashboardPath });
    }
    
    if (showSearch) {
      navItems.push({ label: "Search", href: searchPath });
    }

    return (
      <PublicNavbar
        ref={ref}
        logo={
          <Link href={homePath} className="font-display text-h5-md uppercase text-text-primary">
            {appName}
          </Link>
        }
        navItems={navItems}
        pathname="" // No active state needed for error pages
        inverted={inverted}
        // Remove user menu and complex features for error context
        userMenu={undefined}
        contextLevels={[]}
        primaryCta={undefined}
        {...props}
      />
    );
  }
);

ErrorNavbar.displayName = "ErrorNavbar";
