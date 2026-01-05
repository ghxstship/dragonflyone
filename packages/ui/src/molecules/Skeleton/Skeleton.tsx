"use client";

import { 
  skeletonVariants,
  skeletonCardVariants,
  skeletonTableVariants,
  skeletonTableHeaderVariants,
  skeletonTableRowVariants,
  skeletonTableRowContentVariants 
} from "./Skeleton.variants.js";
import type { 
  SkeletonProps,
  SkeletonCardProps,
  SkeletonTableProps 
} from "./Skeleton.types.js";

/**
 * Skeleton component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Skeleton loading states
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <Skeleton width="100%" height="1rem" inverted={false} />
 * <SkeletonCard inverted={false} />
 * <SkeletonTable rows={5} inverted={false} />
 * ```
 */
export function Skeleton({ 
  width = "100%", 
  height = "1rem", 
  inverted = false,
  className 
}: SkeletonProps) {
  return (
    <div
      className={skeletonVariants({ inverted, className })}
      style={{ width, height }}
    />
  );
}

/**
 * SkeletonCard component - Card skeleton with title and lines
 */
export function SkeletonCard({ 
  inverted = false,
  className 
}: SkeletonCardProps) {
  return (
    <div className={skeletonCardVariants({ inverted, className })}>
      <Skeleton height="1.5rem" width="60%" inverted={inverted} className="mb-4" />
      <Skeleton height="0.875rem" width="40%" inverted={inverted} className="mb-6" />
      <Skeleton height="0.875rem" width="100%" inverted={inverted} className="mb-2" />
      <Skeleton height="0.875rem" width="90%" inverted={inverted} className="mb-2" />
      <Skeleton height="0.875rem" width="80%" inverted={inverted} />
    </div>
  );
}

/**
 * SkeletonTable component - Table skeleton with header and rows
 */
export function SkeletonTable({ 
  rows = 5,
  inverted = false,
  className 
}: SkeletonTableProps) {
  return (
    <div className={skeletonTableVariants({ inverted, className })}>
      {/* Header */}
      <div className={skeletonTableHeaderVariants({ inverted })}>
        <div className={skeletonTableRowContentVariants({ inverted })}>
          <Skeleton height="1rem" width="20%" inverted={inverted} />
          <Skeleton height="1rem" width="30%" inverted={inverted} />
          <Skeleton height="1rem" width="25%" inverted={inverted} />
          <Skeleton height="1rem" width="15%" inverted={inverted} />
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={skeletonTableRowVariants({ inverted })}>
          <div className={skeletonTableRowContentVariants({ inverted })}>
            <Skeleton height="1rem" width="20%" inverted={inverted} />
            <Skeleton height="1rem" width="30%" inverted={inverted} />
            <Skeleton height="1rem" width="25%" inverted={inverted} />
            <Skeleton height="1rem" width="15%" inverted={inverted} />
          </div>
        </div>
      ))}
    </div>
  );
}
