"use client";

import { forwardRef, useRef, useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { Box } from "../foundations/semantic.js";

export type ScrollableTableWrapperProps = HTMLAttributes<HTMLDivElement> & {
  /** Content to wrap (typically a Table component) */
  children: ReactNode;
  /** Show scroll hint text on mobile */
  showHint?: boolean;
  /** Custom hint text */
  hintText?: string;
};

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
      <Box ref={ref} className={clsx("relative", className)} {...props}>
        {/* Left scroll indicator */}
        {canScrollLeft && (
          <Box
            className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-ink-950 to-transparent z-10"
            aria-hidden="true"
          />
        )}

        {/* Right scroll indicator */}
        {canScrollRight && (
          <Box
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-ink-950 to-transparent z-10"
            aria-hidden="true"
          />
        )}

        {/* Scrollable container */}
        <Box
          ref={scrollRef}
          className="overflow-x-auto"
        >
          {children}
        </Box>

        {/* Mobile scroll hint */}
        {showHint && isScrollable && (
          <Box className="mt-spacing-2 text-center md:hidden">
            <Box className="inline-flex items-center gap-spacing-2 text-mono-xs uppercase tracking-kicker text-ink-500">
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
            </Box>
          </Box>
        )}
      </Box>
    );
  }
);
