import type { HTMLAttributes, ReactNode } from "react";

/**
 * Scroll reveal animation type
 */
export type ScrollRevealAnimation = 
  | "fade" 
  | "slide-up" 
  | "slide-down" 
  | "slide-left" 
  | "slide-right" 
  | "scale" 
  | "rotate";

/**
 * Scroll reveal easing function
 */
export type ScrollRevealEasing = 
  | "linear" 
  | "ease" 
  | "ease-in" 
  | "ease-out" 
  | "ease-in-out";

/**
 * ScrollReveal component props
 */
export interface ScrollRevealProps extends HTMLAttributes<HTMLDivElement> {
  /** Content to reveal on scroll */
  children: ReactNode;
  /** Animation type */
  animation?: ScrollRevealAnimation;
  /** Animation duration in ms */
  duration?: number;
  /** Delay before animation starts in ms */
  delay?: number;
  /** Threshold for triggering animation (0-1) */
  threshold?: number;
  /** Whether to animate only once */
  once?: boolean;
  /** Distance for slide animations in pixels */
  distance?: number;
  /** Easing function */
  easing?: ScrollRevealEasing;
  /** Whether element is disabled */
  disabled?: boolean;
  /** Theme inversion */
  inverted?: boolean;
}
