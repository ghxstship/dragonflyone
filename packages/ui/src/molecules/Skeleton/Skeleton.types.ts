/**
 * Skeleton component props
 */
export interface SkeletonProps {
  width?: string;
  height?: string;
  inverted?: boolean;
  className?: string;
}

/**
 * SkeletonCard component props
 */
export interface SkeletonCardProps {
  inverted?: boolean;
  className?: string;
}

/**
 * SkeletonTable component props
 */
export interface SkeletonTableProps {
  rows?: number;
  inverted?: boolean;
  className?: string;
}
