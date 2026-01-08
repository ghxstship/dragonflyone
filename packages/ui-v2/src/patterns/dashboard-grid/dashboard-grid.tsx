/**
 * DashboardGrid Pattern
 * Responsive grid layout for dashboard widgets
 */

import React, { forwardRef, ReactNode } from 'react';
import { Grid } from '../../primitives/grid';
import { cn } from '../../utils/cn';

export interface DashboardGridProps {
  /**
   * Grid children (widgets)
   */
  children: ReactNode;

  /**
   * Number of columns
   */
  columns?: 1 | 2 | 3 | 4 | 6 | 12;

  /**
   * Gap between widgets
   */
  gap?: '2' | '4' | '6' | '8';

  /**
   * Whether grid should be responsive
   */
  responsive?: boolean;

  /**
   * Additional class names
   */
  className?: string;
}

export const DashboardGrid = forwardRef<HTMLDivElement, DashboardGridProps>(
  function DashboardGrid(
    { children, columns = 3, gap = '6', responsive = true, className },
    ref
  ) {
    const responsiveClasses = responsive
      ? cn(
          // Mobile: 1 column
          'grid-cols-1',
          // Tablet: 2 columns for 3+ column layouts
          columns >= 3 && 'md:grid-cols-2',
          // Desktop: full columns
          columns === 2 && 'lg:grid-cols-2',
          columns === 3 && 'lg:grid-cols-3',
          columns === 4 && 'lg:grid-cols-4',
          columns === 6 && 'lg:grid-cols-6',
          columns === 12 && 'lg:grid-cols-12'
        )
      : `grid-cols-${columns}`;

    return (
      <Grid
        ref={ref}
        gap={gap}
        className={cn(responsiveClasses, className)}
      >
        {children}
      </Grid>
    );
  }
);
