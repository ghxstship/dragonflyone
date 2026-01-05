"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import { authenticatedShellVariants } from "./AuthenticatedShell.variants.js";
import type { AuthenticatedShellProps } from "./AuthenticatedShell.types.js";

/**
 * AuthenticatedShell - Complete authenticated application shell
 * 
 * Features:
 * - Sidebar navigation with collapsible state
 * - Top navigation bar with user profile and notifications
 * - Keyboard shortcuts for navigation
 * - Context switching (workspaces/projects)
 * - Theme toggle support
 * - Mobile responsive design
 * - Skip to main content accessibility
 * 
 * Use cases:
 * - Main application shell for authenticated users
 * - Dashboard layouts
 * - Admin interfaces
 * - Multi-tenant applications
 * 
 * NOTE: This is a simplified version that doesn't depend on AppSidebar/AppNavbar
 * Those components will be integrated once they are fully migrated
 */
export const AuthenticatedShell = forwardRef<HTMLDivElement, AuthenticatedShellProps>(
  function AuthenticatedShell(
    {
      children,
      className,
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={clsx(authenticatedShellVariants(), className)}
      >
        {/* Skip to main content link - visible on focus for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>
        
        {/* Placeholder sidebar */}
        <div className="hidden md:block shrink-0 w-64 bg-surface-elevated border-r border-border">
          <div className="p-4">
            <div className="text-text-primary font-bold">Sidebar</div>
            <div className="text-text-muted text-sm">AppSidebar component will be integrated here</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Placeholder header */}
          <div className="shrink-0 bg-surface-primary border-b border-border px-4 py-3">
            <div className="text-text-primary font-bold">Header</div>
            <div className="text-text-muted text-sm">AppNavbar component will be integrated here</div>
          </div>

          {/* Page Content */}
          <main 
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-auto bg-surface-primary"
          >
            {children}
          </main>
        </div>
      </div>
    );
  }
);

AuthenticatedShell.displayName = "AuthenticatedShell";

export default AuthenticatedShell;
