import type { HTMLAttributes, ReactNode } from "react";

export interface VirtualizedListProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Array of items to render */
  items: T[];
  /** Height of each item in pixels */
  itemHeight: number;
  /** Height of the container (viewport) */
  containerHeight: number;
  /** Number of items to render outside visible area (buffer) */
  overscan?: number;
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Key extractor function */
  getKey: (item: T, index: number) => string | number;
  /** Empty state component */
  emptyState?: ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Loading component */
  loadingComponent?: ReactNode;
  /** Callback when scrolling near the end */
  onEndReached?: () => void;
  /** Threshold for onEndReached (0-1) */
  endReachedThreshold?: number;
  /** Inverted colors for dark backgrounds */
  inverted?: boolean;
}
