"use client";

import { useState, useEffect, useCallback } from "react";
import { breakpoints } from "../tokens.js";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface ResponsiveState {
  /** Current breakpoint name */
  breakpoint: Breakpoint;
  /** Screen width in pixels */
  width: number;
  /** Screen height in pixels */
  height: number;
  /** Is mobile device (< md) */
  isMobile: boolean;
  /** Is tablet device (md - lg) */
  isTablet: boolean;
  /** Is desktop device (> lg) */
  isDesktop: boolean;
  /** Is touch device */
  isTouch: boolean;
  /** Device orientation */
  orientation: "portrait" | "landscape";
  /** Is retina/high-DPI display */
  isRetina: boolean;
}

const breakpointValues: Record<Breakpoint, number> = {
  xs: 0,
  sm: parseInt(breakpoints.sm),
  md: parseInt(breakpoints.md),
  lg: parseInt(breakpoints.lg),
  xl: parseInt(breakpoints.xl),
  "2xl": parseInt(breakpoints["2xl"]),
};

function getBreakpoint(width: number): Breakpoint {
  if (width >= breakpointValues["2xl"]) return "2xl";
  if (width >= breakpointValues.xl) return "xl";
  if (width >= breakpointValues.lg) return "lg";
  if (width >= breakpointValues.md) return "md";
  if (width >= breakpointValues.sm) return "sm";
  return "xs";
}

function getResponsiveState(): ResponsiveState {
  if (typeof window === "undefined") {
    return {
      breakpoint: "lg",
      width: 1024,
      height: 768,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouch: false,
      orientation: "landscape",
      isRetina: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const breakpoint = getBreakpoint(width);

  return {
    breakpoint,
    width,
    height,
    isMobile: width < breakpointValues.md,
    isTablet: width >= breakpointValues.md && width < breakpointValues.lg,
    isDesktop: width >= breakpointValues.lg,
    isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    orientation: width > height ? "landscape" : "portrait",
    isRetina: window.devicePixelRatio > 1,
  };
}

/**
 * Hook for responsive design utilities
 * Provides current breakpoint, device type, and screen dimensions
 */
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(getResponsiveState);

  useEffect(() => {
    const handleResize = () => {
      setState(getResponsiveState());
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Initial state
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return state;
}

/**
 * Hook for media query matching
 * @param query - CSS media query string
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Hook for breakpoint-specific values
 * @param values - Object mapping breakpoints to values
 * @param defaultValue - Default value if no breakpoint matches
 */
export function useBreakpointValue<T>(
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T
): T {
  const { breakpoint } = useResponsive();

  // Find the value for current breakpoint or fall back to smaller breakpoints
  const breakpointOrder: Breakpoint[] = ["2xl", "xl", "lg", "md", "sm", "xs"];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp] as T;
    }
  }

  return defaultValue;
}

/**
 * Hook for responsive visibility
 * @param showOn - Array of breakpoints where element should be visible
 */
export function useResponsiveVisibility(showOn: Breakpoint[]): boolean {
  const { breakpoint } = useResponsive();
  return showOn.includes(breakpoint);
}

/**
 * Hook for responsive columns
 * Returns appropriate column count based on breakpoint
 */
export function useResponsiveColumns(config?: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
}): number {
  const defaults = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4,
    "2xl": 6,
  };

  const merged = { ...defaults, ...config };

  return useBreakpointValue(merged, 1);
}

/**
 * Hook for container width
 * Returns max-width value for current breakpoint
 */
export function useContainerWidth(): string {
  const { breakpoint } = useResponsive();

  const containerWidths: Record<Breakpoint, string> = {
    xs: "100%",
    sm: "540px",
    md: "720px",
    lg: "960px",
    xl: "1140px",
    "2xl": "1320px",
  };

  return containerWidths[breakpoint];
}

/**
 * Hook for scroll position
 */
type ScrollDirection = "up" | "down" | "none";

export function useScrollPosition(): { x: number; y: number; direction: ScrollDirection } {
  const [position, setPosition] = useState<{ x: number; y: number; direction: ScrollDirection }>({ 
    x: 0, 
    y: 0, 
    direction: "none" 
  });
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const direction: ScrollDirection = currentY > lastY ? "down" : currentY < lastY ? "up" : "none";

      setPosition({
        x: window.scrollX,
        y: currentY,
        direction,
      });
      setLastY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY]);

  return position;
}

/**
 * Hook for viewport intersection
 * Returns true when element is in viewport
 */
export function useInViewport(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
): boolean {
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return isInViewport;
}

export default useResponsive;
