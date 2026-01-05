import type { HTMLAttributes, ReactNode } from "react";

export interface PageTransitionProps extends HTMLAttributes<HTMLDivElement> {
  /** Content to animate */
  children: ReactNode;
  /** Animation type */
  type?: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom" | "wipe";
  /** Animation duration in ms */
  duration?: number;
  /** Animation delay in ms */
  delay?: number;
  /** Trigger animation on mount */
  animateOnMount?: boolean;
  /** Whether element is visible */
  show?: boolean;
  /** Easing function */
  easing?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear";
}

export interface StaggeredTransitionProps extends HTMLAttributes<HTMLDivElement> {
  /** Children to stagger */
  children: ReactNode[];
  /** Animation type for each child */
  type?: PageTransitionProps["type"];
  /** Base duration for each animation */
  duration?: number;
  /** Delay between each child animation */
  staggerDelay?: number;
  /** Initial delay before first animation */
  initialDelay?: number;
}

export interface ScrollRevealProps extends HTMLAttributes<HTMLDivElement> {
  /** Content to reveal */
  children: ReactNode;
  /** Animation type */
  type?: PageTransitionProps["type"];
  /** Animation duration */
  duration?: number;
  /** Threshold for intersection observer (0-1) */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
  /** Only animate once */
  once?: boolean;
}

export interface PageTransitionVariants {
  /** Animation type */
  type?: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom" | "wipe";
  /** Animation duration */
  duration?: number;
  /** Animation delay */
  delay?: number;
  /** Easing function */
  easing?: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear";
  /** Additional CSS classes */
  className?: string;
}
