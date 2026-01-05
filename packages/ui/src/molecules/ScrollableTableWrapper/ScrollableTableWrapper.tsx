"use client";

import { forwardRef, useRef, useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { scrollableTableWrapperVariants } from "./ScrollableTableWrapper.variants.js";
import type { ScrollableTableWrapperProps } from "./ScrollableTableWrapper.types.js";

/**
 * ScrollableTableWrapper - Wraps tables with scroll indicators for better UX
 * Shows gradient shadows on edges when content is scrollable
 * Displays a hint on mobile to indicate horizontal scrolling
 */
export const ScrollableTableWrapper = forwardRef<HTMLDivElement, ScrollableTableWrapperProps>(
  function ScrollableTableWrapper({ 
    children, 
    showHint = true, 
    hintText = "Scroll horizontally to see more",
    className, 
    ...props 
  }, ref) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [isScrollable, setIsScrollable] = useState(false);

    const checkScroll = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;

      const hasOverflow = el.scrollWidth > el.clientWidth;
      setIsScrollable(hasOverflow);
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }, []);

    useEffect(() => {
      checkScroll();
      const el = scrollRef.current;
      if (!el) return;

      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);

      // Use ResizeObserver for content changes
      const resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(el);

      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
        resizeObserver.disconnect();
      };
    }, [checkScroll]);

    return (
      <div 
        ref={ref} 
        className={clsx(
          scrollableTableWrapperVariants({ showHint }),
          className
        )} 
        {...props}
      >
        {/* Left scroll indicator */}
        {canScrollLeft && (
          <div
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-content-overlay"
            aria-hidden="true"
          />
        )}

        {/* Right scroll indicator */}
        {canScrollRight && (
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-content-overlay"
            aria-hidden="true"
          />
        )}

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="overflow-x-auto"
        >
          {children}
        </div>

        {/* Mobile scroll hint */}
        {showHint && isScrollable && (
          <div className="mt-spacing-2 text-center md:hidden">
            <div className="inline-flex items-center gap-spacing-2 text-mono-xs uppercase tracking-kicker text-muted-foreground">
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              {hintText}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ScrollableTableWrapper.displayName = "ScrollableTableWrapper";
