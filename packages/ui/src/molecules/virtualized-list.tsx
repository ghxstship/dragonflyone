"use client";

import { forwardRef, useRef, useState, useEffect, useCallback, useMemo } from "react";
import clsx from "clsx";
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

/**
 * VirtualizedList - Efficient rendering for large data sets
 * 
 * Features:
 * - Only renders visible items + overscan buffer
 * - Smooth scrolling with proper positioning
 * - Infinite scroll support via onEndReached
 * - Loading and empty states
 */
function VirtualizedListInner<T>(
  {
    items,
    itemHeight,
    containerHeight,
    overscan = 3,
    renderItem,
    getKey,
    emptyState,
    isLoading = false,
    loadingComponent,
    onEndReached,
    endReachedThreshold = 0.8,
    inverted = false,
    className,
    ...props
  }: VirtualizedListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [hasCalledEndReached, setHasCalledEndReached] = useState(false);

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    return items.slice(startIndex, endIndex + 1).map((item, i) => ({
      item,
      index: startIndex + i,
    }));
  }, [items, visibleRange]);

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      setScrollTop(target.scrollTop);

      // Check if near end for infinite scroll
      if (onEndReached && !hasCalledEndReached) {
        const scrollPercentage = (target.scrollTop + containerHeight) / totalHeight;
        if (scrollPercentage >= endReachedThreshold) {
          setHasCalledEndReached(true);
          onEndReached();
        }
      }
    },
    [onEndReached, hasCalledEndReached, containerHeight, totalHeight, endReachedThreshold]
  );

  // Reset end reached flag when items change
  useEffect(() => {
    setHasCalledEndReached(false);
  }, [items.length]);

  // Combine refs
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [ref]
  );

  // Empty state
  if (!isLoading && items.length === 0 && emptyState) {
    return (
      <div
        ref={setRefs}
        className={clsx(
          "flex items-center justify-center",
          inverted ? "text-on-dark-muted" : "text-on-light-muted",
          className
        )}
        style={{ height: containerHeight }}
        {...props}
      >
        {emptyState}
      </div>
    );
  }

  return (
    <div
      ref={setRefs}
      className={clsx(
        "overflow-auto",
        inverted ? "bg-ink-950" : "bg-white",
        className
      )}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      {...props}
    >
      {/* Spacer for total height */}
      <div style={{ height: totalHeight, position: "relative" }}>
        {/* Visible items */}
        {visibleItems.map(({ item, index }) => (
          <div
            key={getKey(item, index)}
            style={{
              position: "absolute",
              top: index * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Loading indicator at bottom */}
      {isLoading && loadingComponent && (
        <div className="flex items-center justify-center py-4">
          {loadingComponent}
        </div>
      )}
    </div>
  );
}

// Export with forwardRef
export const VirtualizedList = forwardRef(VirtualizedListInner) as <T>(
  props: VirtualizedListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

export default VirtualizedList;
