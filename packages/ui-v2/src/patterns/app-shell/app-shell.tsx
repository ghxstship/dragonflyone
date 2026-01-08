/**
 * AppShell Pattern
 * Complete application layout structure with sidebar, header, and main content
 */

'use client';

import React, { forwardRef, ReactNode } from 'react';
import { Box } from '../../primitives/box';
import { cn } from '../../utils/cn';

export interface AppShellProps {
  /**
   * Sidebar content (typically Sidebar component)
   */
  sidebar?: ReactNode;

  /**
   * Header content (typically PageHeader component)
   */
  header?: ReactNode;

  /**
   * Footer content (typically PageFooter component)
   */
  footer?: ReactNode;

  /**
   * Main content
   */
  children: ReactNode;

  /**
   * Whether sidebar is fixed
   */
  sidebarFixed?: boolean;

  /**
   * Whether header is fixed
   */
  headerFixed?: boolean;

  /**
   * Additional class names
   */
  className?: string;
}

export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(
  function AppShell(
    {
      sidebar,
      header,
      footer,
      children,
      sidebarFixed = true,
      headerFixed = true,
      className,
    },
    ref
  ) {
    return (
      <Box
        ref={ref}
        className={cn('flex h-screen w-screen overflow-hidden', className)}
      >
        {/* Sidebar */}
        {sidebar && (
          <aside
            className={cn(
              'flex-shrink-0',
              sidebarFixed && 'sticky top-0 h-screen overflow-y-auto'
            )}
          >
            {sidebar}
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          {header && (
            <header
              className={cn(
                'flex-shrink-0 bg-surface-primary border-b border-border-primary',
                headerFixed && 'sticky top-0 z-header'
              )}
            >
              {header}
            </header>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-surface-primary">
            {children}
          </main>

          {/* Footer */}
          {footer && (
            <footer className="flex-shrink-0 bg-surface-secondary border-t border-border-primary">
              {footer}
            </footer>
          )}
        </div>
      </Box>
    );
  }
);
